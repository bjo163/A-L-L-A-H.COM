import { PGliteEngine, QueryExecutor } from './engine';
import { ModelRegistry, modelRegistry } from './registry';
import { FieldDefinition } from './fields';
import { ModelDefinition } from './model';
import { AuditEvent } from './auth_models';
import { RESERVED_COLUMN_SET, AUDIT_EXCLUDED_COLUMNS, sqlQuotedColumnList, sha256Hex } from './constants';
import { logger } from '@allah/arsy-core';

/**
 * A single ordered migration (roadmap T2.4c): a lexicographic `name` key and the
 * idempotent `sql` applied inside its own transaction. Addons declare these via
 * the manifest `migrations` key; the runner applies them in name order.
 */
export interface OrderedMigration {
  name: string;
  sql: string;
}

export class SchemaMigrator {
  // Human-readable record of columns this sync had to add, so incremental
  // schema changes are visible in the boot log instead of silent (roadmap T11).
  private driftReport: string[] = [];

  constructor(
    private readonly engine: PGliteEngine,
    private readonly registry: ModelRegistry = modelRegistry
  ) {}

  // Virtual relational fields (one2many/many2many) have no physical column of
  // their own — their data lives in the inverse table's foreign key — so
  // emitting a column for them only produces junk TEXT.
  private isVirtualRelation(field: FieldDefinition): boolean {
    return field.type === 'one2many' || field.type === 'many2many';
  }

  private sqlLiteral(value: unknown): string {
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return `'${String(value).replace(/'/g, "''")}'`;
  }

  private defaultValueFor(field: FieldDefinition): string {
    if (field.default !== undefined && typeof field.default !== 'function') {
      return this.sqlLiteral(field.default);
    }
    switch (field.type) {
      case 'boolean':
        return 'false';
      case 'integer':
      case 'float':
      case 'many2one':
        return '0';
      case 'json':
        return `'{}'::jsonb`;
      default:
        return `''`;
    }
  }

  private mapFieldToSqlType(field: FieldDefinition): string {
    switch (field.type) {
      case 'char':
        return 'VARCHAR(255)';
      case 'text':
        return 'TEXT';
      case 'integer':
      case 'many2one':
        return 'INTEGER';
      case 'float':
        return 'DOUBLE PRECISION';
      case 'boolean':
        return 'BOOLEAN';
      case 'datetime':
        return 'TIMESTAMPTZ';
      case 'selection':
        return 'VARCHAR(100)';
      case 'json':
        return 'JSONB';
      default:
        return 'TEXT';
    }
  }

  async sync(): Promise<void> {
    // res.users is guaranteed registered by the base addon / auth models over the
    // shared singleton registry; auto-registering it here previously masked
    // addon-wiring errors (roadmap T11).
    const models = this.registry.getAll();
    logger.info(`Starting schema sync for ${models.length} registered models...`);

    // Cold-boot cost was dominated by one information_schema.columns read per
    // model. Snapshot the whole public schema once into Sets, then emit DDL from
    // those Maps with no per-model catalog reads, all inside a single transaction
    // (roadmap T2.4a).
    const columnSet = await this.snapshotColumns();

    await this.engine.transaction(async (tx) => {
      for (const model of models) {
        const existing = columnSet.get(model.tableName);
        if (!existing) {
          const columnDefs = [
            'id SERIAL PRIMARY KEY',
            'active BOOLEAN DEFAULT true',
            'create_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
            'write_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
            'create_uid INTEGER',
            'write_uid INTEGER',
            'company_id INTEGER',
          ];
          for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
            if (RESERVED_COLUMN_SET.has(fieldName) || this.isVirtualRelation(fieldDef)) continue;
            columnDefs.push(this.columnDefinitionSql(fieldName, fieldDef));
          }
          await tx.exec(`CREATE TABLE IF NOT EXISTS "${model.tableName}" (\n  ${columnDefs.join(',\n  ')}\n);`);
          columnSet.set(
            model.tableName,
            new Set([
              'id', 'active', 'create_date', 'write_date', 'create_uid', 'write_uid', 'company_id',
              ...Object.keys(model.fields).filter(
                (fieldName) =>
                  !RESERVED_COLUMN_SET.has(fieldName) && !this.isVirtualRelation(model.fields[fieldName])
              ),
            ])
          );
        } else {
          const baseColumns: Array<[string, string]> = [
            ['active', 'BOOLEAN DEFAULT true'],
            ['create_date', 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'],
            ['write_date', 'TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP'],
            ['create_uid', 'INTEGER'],
            ['write_uid', 'INTEGER'],
            ['company_id', 'INTEGER'],
          ];
          for (const [columnName, sqlType] of baseColumns) {
            if (existing.has(columnName)) continue;
            await tx.exec(`ALTER TABLE "${model.tableName}" ADD COLUMN IF NOT EXISTS "${columnName}" ${sqlType};`);
            existing.add(columnName);
          }

          // Incremental column reconciliation with constraint parity: a field
          // added to an existing table must arrive with the same NOT NULL/UNIQUE
          // the initial CREATE TABLE applies. New columns are recorded as drift.
          for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
            if (RESERVED_COLUMN_SET.has(fieldName) || this.isVirtualRelation(fieldDef)) continue;
            if (existing.has(fieldName)) continue;
            await tx.exec(this.alterAddColumnSql(model.tableName, fieldName, fieldDef));
            existing.add(fieldName);
            this.driftReport.push(`${model.tableName}.${fieldName} ${this.columnDefinitionSql(fieldName, fieldDef)}`);
          }
        }

        // Multi-tenant company_id index + custom model indexes + unique field
        // indexes. `IF NOT EXISTS` makes these cheap no-ops on an unchanged schema.
        await tx.exec(
          `CREATE INDEX IF NOT EXISTS idx_${model.tableName}_company_id ON "${model.tableName}" (company_id);`
        );
        for (const idx of model.indexes) {
          const idxName = idx.name || `idx_${model.tableName}_${idx.fields.join('_')}`;
          const unique = idx.unique ? 'UNIQUE' : '';
          const fieldsSql = idx.fields.map((f) => `"${f}"`).join(', ');
          await tx.exec(`CREATE ${unique} INDEX IF NOT EXISTS ${idxName} ON "${model.tableName}" (${fieldsSql});`);
        }
        for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
          if (
            fieldDef.unique &&
            !model.indexes.some((index) => index.unique && index.fields.length === 1 && index.fields[0] === fieldName)
          ) {
            await tx.exec(
              `CREATE UNIQUE INDEX IF NOT EXISTS uq_${model.tableName}_${fieldName} ON "${model.tableName}" ("${fieldName}");`
            );
          }
        }
      }

      // many2many join tables are virtual on the model but physical here; created
      // after the per-model tables so their FK columns reference existing relations.
      await this.syncRelationTables(models, tx);
    });

    // Provisioning and audit enforcement run OUTSIDE the schema DDL transaction.
    // PGlite is a single connection: re-entering this.engine.query from within an
    // open transaction (provisionSystemBot does exactly that) would queue behind
    // the very transaction awaiting it and deadlock. enforceAuditConstraints opens
    // its own transaction, so the DDL above is already committed by then.
    const botColumn = await this.engine.query<{ column_name: string }>(
      `SELECT "column_name" FROM "information_schema"."columns"
       WHERE "table_name" = $1 AND "column_name" = $2;`,
      ['res_users', 'system_key']
    );
    if (botColumn.length === 1) {
      const botId = await this.provisionSystemBot();
      await this.enforceAuditConstraints(botId);
    }

    if (this.driftReport.length > 0) {
      logger.info(
        `Schema drift — ${this.driftReport.length} column(s) added: ${this.driftReport.join('; ')}`
      );
    }
    logger.info('Schema sync complete.');
  }

  // One catalog read for the whole schema: table -> Set(existing column names).
  private async snapshotColumns(): Promise<Map<string, Set<string>>> {
    const rows = await this.engine.query<{ table_name: string; column_name: string }>(
      `SELECT "table_name", "column_name" FROM "information_schema"."columns" WHERE "table_schema" = 'public';`
    );
    const map = new Map<string, Set<string>>();
    for (const row of rows) {
      let cols = map.get(row.table_name);
      if (!cols) {
        cols = new Set<string>();
        map.set(row.table_name, cols);
      }
      cols.add(row.column_name);
    }
    return map;
  }

  private columnDefinitionSql(fieldName: string, fieldDef: FieldDefinition): string {
    const sqlType = this.mapFieldToSqlType(fieldDef);
    const nullable = fieldDef.required ? 'NOT NULL' : '';
    const unique = fieldDef.unique ? 'UNIQUE' : '';
    return `${fieldName} ${sqlType} ${nullable} ${unique}`.trim();
  }

  private alterAddColumnSql(tableName: string, fieldName: string, fieldDef: FieldDefinition): string {
    const sqlType = this.mapFieldToSqlType(fieldDef);
    let clause = `ALTER TABLE "${tableName}" ADD COLUMN IF NOT EXISTS "${fieldName}" ${sqlType}`;
    if (fieldDef.required) clause += ` NOT NULL DEFAULT ${this.defaultValueFor(fieldDef)}`;
    if (fieldDef.unique) clause += ' UNIQUE';
    return `${clause};`;
  }

  // Identifier guard for join-table DDL: table/column names are interpolated
  // directly (they cannot be parameterized in DDL), so restrict them to a
  // conservative safe set before emitting any CREATE statement.
  private isSafeIdentifier(name: string): boolean {
    return /^[a-z][a-z0-9_]{0,62}$/.test(name);
  }

  private async syncRelationTables(models: ModelDefinition[], executor: QueryExecutor = this.engine): Promise<void> {
    const seen = new Set<string>();
    for (const model of models) {
      for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
        if (fieldDef.type !== 'many2many') continue;
        const table = fieldDef.relationTable;
        const column1 = fieldDef.column1;
        const column2 = fieldDef.column2;
        if (!table || !column1 || !column2) {
          throw new Error(
            `many2many field '${model.name}.${fieldName}' requires relation_table, column1 and column2.`
          );
        }
        if (![table, column1, column2].every((name) => this.isSafeIdentifier(name))) {
          throw new Error(
            `many2many join table '${table}' uses an unsafe identifier (${model.name}.${fieldName}).`
          );
        }
        if (seen.has(table)) continue;
        seen.add(table);
        await executor.exec(`
          CREATE TABLE IF NOT EXISTS "${table}" (
            "id" SERIAL PRIMARY KEY,
            "${column1}" INTEGER NOT NULL,
            "${column2}" INTEGER NOT NULL,
            UNIQUE ("${column1}", "${column2}")
          );
        `);
        await executor.exec(`
          CREATE INDEX IF NOT EXISTS idx_${table}_pair
          ON "${table}" ("${column1}", "${column2}");
        `);
      }
    }
  }

  async provisionSystemBot(): Promise<number> {
    const existing = await this.engine.query<{ id: number; role: string }>(
      `SELECT "id", "role" FROM "res_users" WHERE "system_key" = $1 LIMIT 2;`,
      ['bot']
    );
    if (existing.length > 1 || (existing.length === 1 && existing[0].role !== 'system')) {
      throw new Error('The system bot identity is duplicated or has an invalid role.');
    }
    if (existing.length === 1) return Number(existing[0].id);

    const inserted = await this.engine.query<{ id: number }>(
      `WITH next_id AS (
        SELECT nextval(pg_get_serial_sequence('res_users', 'id'))::INTEGER AS id
      )
      INSERT INTO "res_users" (
        "id", "company_id", "name", "email", "password", "role", "system_key"
      )
      SELECT "id", 0, 'Bot', $1, '[NO_LOGIN]', 'system', $2 FROM next_id
      ON CONFLICT ("system_key") DO NOTHING
      RETURNING "id";`,
      ['bot@system.invalid', 'bot']
    );
    if (inserted.length === 1) return Number(inserted[0].id);

    const raced = await this.engine.query<{ id: number; role: string }>(
      `SELECT "id", "role" FROM "res_users" WHERE "system_key" = $1 LIMIT 2;`,
      ['bot']
    );
    if (raced.length !== 1 || raced[0].role !== 'system') {
      throw new Error('Unable to provision the system bot identity.');
    }
    return Number(raced[0].id);
  }

  async runMigration(name: string, callback: (executor: QueryExecutor) => Promise<void>): Promise<void> {
    await this.ensureMigrationLedger();

    await this.engine.transaction(async (executor) => {
      const applied = await executor.query<{ name: string }>(
        `SELECT "name" FROM "arsy_schema_migrations" WHERE "name" = $1;`,
        [name]
      );
      if (applied.length > 0) return;
      await callback(executor);
      const recordMigrationSql = 'INSERT INTO "arsy_schema_migrations" ("name") VALUES ($1);';
      await executor.query(recordMigrationSql, [name]);
    });
  }

  // The ordered-migration ledger. `version` and `checksum` were added after the
  // first ledger rows existed, so legacy rows are backfilled once to
  // version 0 / 'legacy' idempotently (roadmap T2.4c). Runs on every boot before
  // any migration is applied, so an already-versioned row is never re-stamped.
  private async ensureMigrationLedger(executor: QueryExecutor = this.engine): Promise<void> {
    await executor.exec(`
      CREATE TABLE IF NOT EXISTS "arsy_schema_migrations" (
        "name" VARCHAR(200) PRIMARY KEY,
        "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE "arsy_schema_migrations" ADD COLUMN IF NOT EXISTS "version" INTEGER;
      ALTER TABLE "arsy_schema_migrations" ADD COLUMN IF NOT EXISTS "checksum" TEXT;
    `);
    await executor.query(
      `UPDATE "arsy_schema_migrations"
         SET "version" = COALESCE("version", 0),
             "checksum" = COALESCE("checksum", 'legacy')
       WHERE "version" IS NULL OR "checksum" IS NULL;`
    );
  }

  // Applies an addon-supplied, ordered set of migrations (roadmap T2.4c). The
  // `migrations` manifest key is applied in ascending lexicographic order; each
  // migration runs idempotently inside its own transaction and is recorded with a
  // checksum so a later edit to an already-applied migration fails closed instead
  // of silently skipping or re-running it.
  async runOrderedMigrations(
    migrations: OrderedMigration[]
  ): Promise<{ applied: string[]; skipped: number }> {
    await this.ensureMigrationLedger();
    const ordered = [...migrations].sort((a, b) =>
      a.name < b.name ? -1 : a.name > b.name ? 1 : 0
    );

    const seen = new Set<string>();
    const applied: string[] = [];
    let skipped = 0;
    for (const migration of ordered) {
      if (!migration.name || !migration.sql) {
        throw new Error('An ordered migration requires both a name and sql.');
      }
      if (seen.has(migration.name)) {
        throw new Error(`Duplicate migration name '${migration.name}' in the ordered set.`);
      }
      seen.add(migration.name);
      const checksum = sha256Hex(migration.sql);

      await this.engine.transaction(async (executor) => {
        const existing = await executor.query<{ checksum: string | null }>(
          `SELECT "checksum" FROM "arsy_schema_migrations" WHERE "name" = $1;`,
          [migration.name]
        );
        if (existing.length > 0) {
          const prior = existing[0].checksum;
          // 'legacy' rows (pre-versioning) carry no comparable checksum, so a
          // recorded skip is trusted; a real checksum must match byte-for-byte.
          if (prior && prior !== 'legacy' && prior !== checksum) {
            throw new Error(
              `Migration '${migration.name}' checksum drift: ledger has '${prior}', source has '${checksum}'. Refusing to continue.`
            );
          }
          skipped += 1;
          return;
        }
        const maxVersion = await executor.query<{ version: number | null }>(
          `SELECT MAX("version")::integer AS version FROM "arsy_schema_migrations";`
        );
        const version = (maxVersion[0]?.version ?? 0) + 1;
        await executor.exec(migration.sql);
        await executor.query(
          `INSERT INTO "arsy_schema_migrations" ("name", "version", "checksum") VALUES ($1, $2, $3);`,
          [migration.name, version, checksum]
        );
        applied.push(migration.name);
      });
    }
    return { applied, skipped };
  }

  async enforceAuditConstraints(
    systemUserId: number,
    transactionExecutor?: QueryExecutor
  ): Promise<void> {
    if (!Number.isSafeInteger(systemUserId) || systemUserId < 1) {
      throw new Error('The system bot must have a valid res.users ID before audit migration.');
    }

    const enforce = async (executor: QueryExecutor) => {
      // Cross-app sync outbox (roadmap F3). Opt-in per model by name; defaults to the
      // identity record so a res.users write emits exactly one outbox row. Every row is
      // tenant-tagged and append-only, mirroring the audit-event trigger family.
      const syncModels = new Set(
        (process.env.ARSY_SYNC_MODELS ?? 'res.users')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );

      await executor.exec(`
        CREATE TABLE IF NOT EXISTS "arsy_sync_outbox" (
          "id" BIGSERIAL PRIMARY KEY,
          "company_id" INTEGER NOT NULL,
          "model_name" TEXT NOT NULL,
          "record_id" TEXT NOT NULL,
          "operation" TEXT NOT NULL,
          "changed_fields" JSONB,
          "payload" JSONB,
          "emitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS "arsy_sync_delivery" (
          "id" BIGSERIAL PRIMARY KEY,
          "outbox_seq" BIGINT NOT NULL,
          "consumer" TEXT NOT NULL,
          "delivered_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "uq_arsy_sync_delivery_seq_consumer" UNIQUE ("outbox_seq", "consumer")
        );
      `);

      // Retention index for the append-only delivery ledger (roadmap T2.4d): a
      // partial index over rows that actually carry a delivery timestamp keeps
      // time-windowed drain/retention scans cheap as the ledger grows, so old
      // rows never need a compaction DELETE that would break append-only.
      await executor.exec(`
        CREATE INDEX IF NOT EXISTS idx_arsy_sync_delivery_delivered_at
          ON "arsy_sync_delivery" ("delivered_at")
         WHERE "delivered_at" IS NOT NULL;
      `);

      await executor.exec(`
        UPDATE "res_users" SET "role" = 'user' WHERE "role" IS NULL;
        ALTER TABLE "res_users" ALTER COLUMN "role" SET DEFAULT 'user';
        ALTER TABLE "res_users" ALTER COLUMN "role" SET NOT NULL;
      `);

      const roleConstraints = [
        [
          'ck_res_users_role_allowed',
          `CHECK ("role" IN ('user', 'superuser', 'system'))`,
        ],
        [
          'ck_res_users_system_identity',
          `CHECK ("role" <> 'system' OR COALESCE("system_key" = 'bot', false))`,
        ],
        [
          'ck_res_users_bot_role',
          `CHECK ("system_key" IS DISTINCT FROM 'bot' OR "role" = 'system')`,
        ],
        [
          'ck_res_users_bot_password',
          `CHECK ("role" <> 'system' OR "password" = '[NO_LOGIN]')`,
        ],
      ];
      for (const [constraintName, constraint] of roleConstraints) {
        const existing = await executor.query<{ constraint_name: string }>(
          `SELECT "conname" AS "constraint_name" FROM "pg_constraint"
           WHERE "conrelid" = 'res_users'::regclass AND "conname" = $1;`,
          [constraintName]
        );
        if (existing.length === 0) {
          await executor.exec(
            `ALTER TABLE "res_users" ADD CONSTRAINT "${constraintName}" ${constraint};`
          );
        }
      }

      await executor.exec(`
        CREATE OR REPLACE FUNCTION "arsy_set_audit_fields"() RETURNS trigger AS $$
        DECLARE
          bot_id INTEGER;
          actor_id INTEGER;
          actor_setting TEXT;
        BEGIN
          SELECT "id" INTO bot_id FROM "res_users" WHERE "system_key" = 'bot' AND "role" = 'system' LIMIT 1;
          IF bot_id IS NULL THEN
            RAISE EXCEPTION 'System bot is required for audit fields';
          END IF;
          actor_setting := NULLIF(current_setting('arsy.audit_actor_id', true), '');
          IF actor_setting IS NULL THEN
            actor_id := bot_id;
          ELSE
            actor_id := actor_setting::INTEGER;
            IF NOT EXISTS (SELECT 1 FROM "res_users" WHERE "id" = actor_id) THEN
              RAISE EXCEPTION 'Audit actor % does not exist', actor_id;
            END IF;
          END IF;
          IF TG_OP = 'INSERT' THEN
            NEW."create_uid" := actor_id;
            NEW."write_uid" := actor_id;
          ELSE
            NEW."create_uid" := OLD."create_uid";
            NEW."write_date" := CURRENT_TIMESTAMP;
            NEW."write_uid" := actor_id;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION "arsy_capture_audit_event"() RETURNS trigger AS $$
        DECLARE
          bot_id INTEGER;
          actor_id INTEGER;
          actor_setting TEXT;
          event_company_id INTEGER;
          event_record_id TEXT;
          changed TEXT[];
          old_data JSONB;
          new_data JSONB;
          operation TEXT := lower(TG_OP);
        BEGIN
          SELECT "id" INTO bot_id FROM "res_users" WHERE "system_key" = 'bot' AND "role" = 'system' LIMIT 1;
          actor_setting := NULLIF(current_setting('arsy.audit_actor_id', true), '');
          old_data := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
          new_data := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;

          IF actor_setting IS NOT NULL THEN
            actor_id := actor_setting::INTEGER;
          ELSIF TG_OP = 'DELETE' THEN
            actor_id := bot_id;
          ELSE
            actor_id := COALESCE(NULLIF(new_data ->> 'write_uid', '')::INTEGER, bot_id);
          END IF;

          IF TG_OP = 'DELETE' THEN
            event_company_id := COALESCE(NULLIF(old_data ->> 'company_id', '')::INTEGER, 0);
            event_record_id := old_data ->> 'id';
            SELECT COALESCE(array_agg("key" ORDER BY "key"), ARRAY[]::TEXT[])
              INTO changed
              FROM jsonb_object_keys(old_data) AS keys("key")
             WHERE "key" NOT IN (${sqlQuotedColumnList(AUDIT_EXCLUDED_COLUMNS)});
          ELSIF TG_OP = 'INSERT' THEN
            event_company_id := COALESCE(NEW."company_id", 0);
            event_record_id := NEW."id"::TEXT;
            SELECT COALESCE(array_agg("key" ORDER BY "key"), ARRAY[]::TEXT[])
              INTO changed
              FROM jsonb_object_keys(new_data) AS keys("key")
             WHERE "key" NOT IN (${sqlQuotedColumnList(AUDIT_EXCLUDED_COLUMNS)});
          ELSE
            event_company_id := COALESCE(NEW."company_id", 0);
            event_record_id := NEW."id"::TEXT;
            SELECT COALESCE(array_agg(new_fields."key" ORDER BY new_fields."key"), ARRAY[]::TEXT[])
              INTO changed
              FROM jsonb_each(new_data) AS new_fields("key", "value")
              JOIN jsonb_each(old_data) AS old_fields("key", "value") USING ("key")
             WHERE new_fields."value" IS DISTINCT FROM old_fields."value"
               AND new_fields."key" NOT IN (${sqlQuotedColumnList(AUDIT_EXCLUDED_COLUMNS)});
          END IF;

          INSERT INTO "arsy_audit_event" (
            "company_id", "actor_uid", "model_name", "record_id", "operation",
            "changed_fields", "reason_hash", "request_id", "global_access",
            "create_uid", "write_uid"
          ) VALUES (
            event_company_id, actor_id, TG_ARGV[0], event_record_id, operation,
            to_jsonb(changed),
            NULLIF(current_setting('arsy.audit_reason_hash', true), ''),
            NULLIF(current_setting('arsy.audit_request_id', true), ''),
            COALESCE(NULLIF(current_setting('arsy.audit_global_access', true), '')::BOOLEAN, false),
            actor_id, actor_id
          );
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION "arsy_reject_audit_event_mutation"() RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'Audit events are append-only';
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION "arsy_capture_sync_event"() RETURNS trigger AS $$
        DECLARE
          changed TEXT[];
          old_data JSONB;
          new_data JSONB;
          payload JSONB;
          op TEXT := lower(TG_OP);
          event_company_id INTEGER;
          event_record_id TEXT;
        BEGIN
          old_data := CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END;
          new_data := CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END;
          payload := COALESCE(new_data, old_data);

          IF TG_OP = 'DELETE' THEN
            event_company_id := COALESCE(NULLIF(old_data ->> 'company_id', '')::INTEGER, 0);
            event_record_id := old_data ->> 'id';
          ELSE
            event_company_id := COALESCE(NEW."company_id", 0);
            event_record_id := NEW."id"::TEXT;
          END IF;

          SELECT COALESCE(array_agg("key" ORDER BY "key"), ARRAY[]::TEXT[])
            INTO changed
            FROM jsonb_object_keys(payload) AS keys("key")
           WHERE "key" NOT IN (${sqlQuotedColumnList(AUDIT_EXCLUDED_COLUMNS)});

          INSERT INTO "arsy_sync_outbox" (
            "company_id", "model_name", "record_id", "operation", "changed_fields", "payload"
          ) VALUES (
            event_company_id, TG_ARGV[0], event_record_id, op, to_jsonb(changed), payload
          );
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE FUNCTION "arsy_reject_sync_mutation"() RETURNS trigger AS $$
        BEGIN
          RAISE EXCEPTION 'Sync outbox rows are append-only';
        END;
        $$ LANGUAGE plpgsql;
      `);

      const ensureForeignKey = async (
        tableName: string,
        columnName: string,
        referenceTable: string,
        referenceColumn: string,
        constraintName: string
      ) => {
        const constraints = await executor.query<{ constraint_name: string }>(
          `SELECT "constraint_name" FROM information_schema.table_constraints
           WHERE "table_name" = $1 AND "constraint_name" = $2;`,
          [tableName, constraintName]
        );
        if (constraints.length === 0) {
          await executor.exec(
            `ALTER TABLE "${tableName}" ADD CONSTRAINT "${constraintName}"
             FOREIGN KEY ("${columnName}") REFERENCES "${referenceTable}"("${referenceColumn}");`
          );
        }
      };

      for (const model of this.registry.getAll()) {
        const createUidBackfillSql = `UPDATE "${model.tableName}" SET "create_uid" = $1
          WHERE "create_uid" IS NULL OR BTRIM("create_uid"::text) = ''
            OR NOT EXISTS (
              SELECT 1 FROM "res_users" AS actor
              WHERE actor."id" = CASE
                WHEN BTRIM("${model.tableName}"."create_uid"::text) ~ '^[0-9]+$'
                THEN BTRIM("${model.tableName}"."create_uid"::text)::INTEGER
                ELSE NULL
              END
            );`;
        const writeUidBackfillSql = `UPDATE "${model.tableName}" SET "write_uid" = $1
          WHERE "write_uid" IS NULL OR BTRIM("write_uid"::text) = ''
            OR NOT EXISTS (
              SELECT 1 FROM "res_users" AS actor
              WHERE actor."id" = CASE
                WHEN BTRIM("${model.tableName}"."write_uid"::text) ~ '^[0-9]+$'
                THEN BTRIM("${model.tableName}"."write_uid"::text)::INTEGER
                ELSE NULL
              END
            );`;
        await executor.query(createUidBackfillSql, [systemUserId]);
        await executor.query(writeUidBackfillSql, [systemUserId]);

        for (const column of ['create_uid', 'write_uid']) {
          const typeRows = await executor.query<{ data_type: string }>(
            `SELECT data_type FROM information_schema.columns WHERE table_name = $1 AND column_name = $2;`,
            [model.tableName, column]
          );
          if (typeRows[0]?.data_type !== 'integer') {
            await executor.exec(
              `ALTER TABLE "${model.tableName}" ALTER COLUMN "${column}" TYPE INTEGER USING NULLIF(BTRIM("${column}"::text), '')::INTEGER;`
            );
          }

          await executor.exec(
            `ALTER TABLE "${model.tableName}" ALTER COLUMN "${column}" SET NOT NULL;`
          );
          await executor.exec(
            `ALTER TABLE "${model.tableName}" ALTER COLUMN "${column}" SET DEFAULT ${systemUserId};`
          );

          const constraintName = `fk_${model.tableName}_${column}_res_users`;
          const constraints = await executor.query<{ constraint_name: string }>(
            `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name = $1 AND constraint_name = $2;`,
            [model.tableName, constraintName]
          );
          if (constraints.length === 0) {
            await executor.exec(
              `ALTER TABLE "${model.tableName}" ADD CONSTRAINT "${constraintName}" FOREIGN KEY ("${column}") REFERENCES "res_users"("id");`
            );
          }
        }

        const triggerName = `trg_${model.tableName}_audit`;
        const triggers = await executor.query<{ tgname: string }>(
          `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
          [triggerName]
        );
        if (triggers.length === 0) {
          await executor.exec(
            `CREATE TRIGGER "${triggerName}" BEFORE INSERT OR UPDATE ON "${model.tableName}"
             FOR EACH ROW EXECUTE FUNCTION "arsy_set_audit_fields"();`
          );
        }

        if (model.tableName === AuditEvent.tableName) {
          await ensureForeignKey(
            model.tableName,
            'actor_uid',
            'res_users',
            'id',
            'fk_arsy_audit_event_actor_uid_res_users'
          );
          const mutationTrigger = await executor.query<{ tgname: string }>(
            `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
            ['trg_arsy_audit_event_immutable']
          );
          if (mutationTrigger.length === 0) {
            await executor.exec(
              `CREATE TRIGGER "trg_arsy_audit_event_immutable"
               BEFORE UPDATE OR DELETE ON "arsy_audit_event"
               FOR EACH ROW EXECUTE FUNCTION "arsy_reject_audit_event_mutation"();`
            );
          }
          const truncateTrigger = await executor.query<{ tgname: string }>(
            `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
            ['trg_arsy_audit_event_no_truncate']
          );
          if (truncateTrigger.length === 0) {
            await executor.exec(
              `CREATE TRIGGER "trg_arsy_audit_event_no_truncate"
               BEFORE TRUNCATE ON "arsy_audit_event"
               FOR EACH STATEMENT EXECUTE FUNCTION "arsy_reject_audit_event_mutation"();`
            );
          }
          await ensureForeignKey(
            'auth_setup',
            'owner_auth_user_id',
            'auth_user',
            'id',
            'fk_auth_setup_owner_auth_user'
          );
          continue;
        }

        const eventTriggerName = `trg_${model.tableName}_audit_event`;
        const eventTriggers = await executor.query<{ tgname: string }>(
          `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
          [eventTriggerName]
        );
        if (eventTriggers.length === 0) {
          const modelName = model.name.replace(/'/g, "''");
          await executor.exec(
            `CREATE TRIGGER "${eventTriggerName}" AFTER INSERT OR UPDATE OR DELETE ON "${model.tableName}"
             FOR EACH ROW EXECUTE FUNCTION "arsy_capture_audit_event"('${modelName}');`
          );
        }

        if (syncModels.has(model.name)) {
          const syncTriggerName = `trg_${model.tableName}_sync`;
          const syncTriggers = await executor.query<{ tgname: string }>(
            `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
            [syncTriggerName]
          );
          if (syncTriggers.length === 0) {
            const syncModelName = model.name.replace(/'/g, "''");
            await executor.exec(
              `CREATE TRIGGER "${syncTriggerName}" AFTER INSERT OR UPDATE OR DELETE ON "${model.tableName}"
               FOR EACH ROW EXECUTE FUNCTION "arsy_capture_sync_event"('${syncModelName}');`
            );
          }
        }
      }

      // The outbox and its delivery ledger are append-only, exactly like the audit log:
      // a crash-safe drain must add a delivery row rather than mutate or erase the event.
      for (const syncTable of ['arsy_sync_outbox', 'arsy_sync_delivery']) {
        const immutableName = `trg_${syncTable}_immutable`;
        const immutable = await executor.query<{ tgname: string }>(
          `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
          [immutableName]
        );
        if (immutable.length === 0) {
          await executor.exec(
            `CREATE TRIGGER "${immutableName}" BEFORE UPDATE OR DELETE ON "${syncTable}"
             FOR EACH ROW EXECUTE FUNCTION "arsy_reject_sync_mutation"();`
          );
        }
        const truncateName = `trg_${syncTable}_no_truncate`;
        const truncate = await executor.query<{ tgname: string }>(
          `SELECT "tgname" FROM "pg_trigger" WHERE "tgname" = $1 AND NOT "tgisinternal";`,
          [truncateName]
        );
        if (truncate.length === 0) {
          await executor.exec(
            `CREATE TRIGGER "${truncateName}" BEFORE TRUNCATE ON "${syncTable}"
             FOR EACH STATEMENT EXECUTE FUNCTION "arsy_reject_sync_mutation"();`
          );
        }
      }
    };

    if (transactionExecutor) {
      await enforce(transactionExecutor);
    } else {
      await this.engine.transaction(enforce);
    }
  }
}
