import assert from 'node:assert/strict';
import test from 'node:test';

const [
  { PGliteEngine },
  { fields },
  { defineModel, SYSTEM_ACTOR },
  { ModelRegistry },
  { BaseRepository },
  { SchemaMigrator },
  { ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent },
] = await Promise.all([
  import('../src/engine.ts'),
  import('../src/fields.ts'),
  import('../src/model.ts'),
  import('../src/registry.ts'),
  import('../src/repository.ts'),
  import('../src/migrator.ts'),
  import('../src/auth_models.ts'),
]);

const { IrModelAccess } = await import('../../../addons/base/models/ir_model_access.ts');
const { IrRule } = await import('../../../addons/base/models/ir_rule.ts');

// These tests assert on audit-event triggers, not on access control. The
// default enforce mode would reject the user-actor writes (no grants exist for
// `audit.test`), so ACL is short-circuited here; audit events are written by the
// DB trigger and are unaffected by this flag.
process.env.ARSY_ACL_MODE = 'off';

const TenantRecord = defineModel({
  name: 'audit.test',
  tableName: 'audit_test',
  fields: {
    name: fields.char({ required: true }),
    password: fields.char(),
    note: fields.text(),
  },
});

async function createAuditedDatabase() {
  const engine = new PGliteEngine();
  await engine.connect();
  const registry = new ModelRegistry();
  const TenantRecord = defineModel({
    name: 'audit.test',
    tableName: 'audit_test',
    fields: {
      name: fields.char({ required: true }),
      password: fields.char(),
      note: fields.text(),
    },
  });
  const ResGroups = defineModel({
    name: 'res.groups',
    tableName: 'res_groups',
    displayName: 'Groups',
    fields: {
      id: fields.integer({ label: 'ID', primary: true }),
      name: fields.char({ label: 'Group Name', required: true }),
    },
  });
  const ResGroupsUsersRel = defineModel({
    name: 'res.groups.users.rel',
    tableName: 'res_groups_users_rel',
    displayName: 'Groups Users Relation',
    fields: {
      id: fields.integer({ label: 'ID', primary: true }),
      user_id: fields.many2one('res.users', { label: 'User', required: true }),
      group_id: fields.many2one('res.groups', { label: 'Group', required: true }),
    },
  });
  for (const model of [ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent, TenantRecord, IrModelAccess, IrRule, ResGroups, ResGroupsUsersRel]) {
    registry.register(model);
  }
  const migrator = new SchemaMigrator(engine, registry);
  await migrator.sync();
  return { engine, registry, migrator };
}

test('model writes create immutable, redacted audit events with trusted actors', { timeout: 60_000 }, async () => {
  const { engine, registry } = await createAuditedDatabase();
  try {
    const userModel = registry.get('res.users');
    const recordModel = registry.get('audit.test');
    assert.ok(userModel);
    assert.ok(recordModel);
    const botRows = await engine.query('SELECT "id" FROM "res_users" WHERE "system_key" = $1;', ['bot']);
    const botId = Number(botRows[0].id);
    const owner = await new BaseRepository(userModel, engine).create(
      {
        company_id: -1,
        name: 'Owner',
        email: 'owner@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const ownerId = Number(owner.id);
    const reasonHash = 'a'.repeat(64);
    const actor = {
      type: 'user',
      userId: ownerId,
      reasonHash,
      requestId: 'audit-test-request',
      globalAccess: true,
    };
    const repository = new BaseRepository(recordModel, engine);

    const created = await repository.create(
      { name: 'private row', password: 'redact-me-pw', note: 'first version' },
      { companyId: -1 },
      actor
    );
    assert.equal(Number(created.create_uid), ownerId);
    assert.equal(Number(created.write_uid), ownerId);

    const updated = await repository.updateById(
      created.id,
      { note: 'second version' },
      { companyId: -1 },
      actor
    );
    assert.equal(Number(updated.create_uid), ownerId);
    assert.equal(Number(updated.write_uid), ownerId);

    const spoofedInsert = await engine.query(
      `INSERT INTO "audit_test" ("company_id", "name", "password", "create_uid", "write_uid")
       VALUES (-1, 'raw row', 'raw-insert-secret', $1, $1)
       RETURNING "id", "create_uid", "write_uid";`,
      [ownerId]
    );
    assert.equal(Number(spoofedInsert[0].create_uid), botId);
    assert.equal(Number(spoofedInsert[0].write_uid), botId);
    const spoofedUpdate = await engine.query(
      `UPDATE "audit_test" SET "create_uid" = $1, "write_uid" = $1 WHERE "id" = $2
       RETURNING "create_uid", "write_uid";`,
      [ownerId, spoofedInsert[0].id]
    );
    assert.equal(Number(spoofedUpdate[0].create_uid), botId);
    assert.equal(Number(spoofedUpdate[0].write_uid), botId);
    await engine.query(`DELETE FROM "audit_test" WHERE "id" = $1;`, [spoofedInsert[0].id]);

    assert.equal(await repository.deleteById(created.id, { companyId: -1 }, actor), true);

    const events = await engine.query(
      `SELECT "id", "company_id", "create_date", "actor_uid", "model_name", "record_id", "operation", "changed_fields",
              "reason_hash", "request_id", "global_access"
       FROM "arsy_audit_event" WHERE "model_name" = $1 ORDER BY "id";`,
      ['audit.test']
    );
    assert.equal(events.length, 6);
    assert.deepEqual(events.map((event) => event.operation), ['insert', 'update', 'insert', 'update', 'delete', 'delete']);
    assert.equal(Number(events[0].actor_uid), ownerId);
    assert.equal(Number(events[1].actor_uid), ownerId);
    assert.equal(Number(events[4].actor_uid), botId);
    assert.equal(Number(events[0].company_id), -1);
    assert.ok(events[0].create_date);
    assert.equal(Number(events[5].actor_uid), ownerId);
    assert.deepEqual(events[1].changed_fields, ['note']);
    assert.equal(events[0].reason_hash, reasonHash);
    assert.equal(events[0].request_id, 'audit-test-request');
    assert.equal(events[0].global_access, true);
    assert.doesNotMatch(JSON.stringify(events), /redact-me-pw|raw-insert-secret|first version|second version/);
    assert.ok(events[0].changed_fields.includes('password'));

    await assert.rejects(
      engine.query(`UPDATE "arsy_audit_event" SET "model_name" = 'changed' WHERE "id" = $1;`, [events[0].id]),
      /append-only/i
    );
    await assert.rejects(
      engine.query(`DELETE FROM "arsy_audit_event" WHERE "id" = $1;`, [events[0].id]),
      /append-only/i
    );
    await assert.rejects(engine.exec('TRUNCATE "arsy_audit_event";'), /append-only/i);

    const beforeRollback = await engine.query(
      `SELECT count(*)::INTEGER AS count FROM "arsy_audit_event" WHERE "model_name" = $1;`,
      ['audit.test']
    );
    await assert.rejects(
      engine.transaction(async (executor) => {
        await new BaseRepository(recordModel, engine, executor).create(
          { name: 'rolled back', password: 'rollback-secret' },
          { companyId: -1 },
          actor
        );
        throw new Error('force rollback');
      }),
      /force rollback/
    );
    const afterRollback = await engine.query(
      `SELECT count(*)::INTEGER AS count FROM "arsy_audit_event" WHERE "model_name" = $1;`,
      ['audit.test']
    );
    assert.equal(Number(afterRollback[0].count), Number(beforeRollback[0].count));
  } finally {
    await engine.close();
  }
});

test('updateMany emits one set-based UPDATE yet fires a row-level audit event per row', { timeout: 60_000 }, async () => {
  const { engine, registry } = await createAuditedDatabase();
  try {
    const userModel = registry.get('res.users');
    const recordModel = registry.get('audit.test');
    const owner = await new BaseRepository(userModel, engine).create(
      {
        company_id: -1,
        name: 'Owner',
        email: 'batch@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const ownerId = Number(owner.id);
    const actor = { type: 'user', userId: ownerId, reasonHash: 'b'.repeat(64), requestId: 'batch-update' };
    const repository = new BaseRepository(recordModel, engine);

    const rows = await repository.createMany(
      [
        { name: 'row one', note: 'n1' },
        { name: 'row two', note: 'n2' },
        { name: 'row three', note: 'n3' },
      ],
      { companyId: -1 },
      actor
    );
    const ids = rows.map((r) => Number(r.id));
    const insertUpdates = await engine.query(
      `SELECT count(*)::INTEGER AS c FROM "arsy_audit_event" WHERE "model_name" = $1 AND "operation" = 'insert';`,
      ['audit.test']
    );
    assert.equal(Number(insertUpdates[0].c), 3);

    // Two rows share the {note} shape; the third touches {name, note} — the
    // repository emits two set-based statements but PostgreSQL still fires the
    // AFTER-INSERT/UPDATE row trigger once for every changed row.
    const updated = await repository.updateMany(
      [
        { id: ids[0], data: { note: 'batch-a' } },
        { id: ids[1], data: { note: 'batch-b' } },
        { id: ids[2], data: { name: 'renamed', note: 'batch-c' } },
      ],
      { companyId: -1 },
      actor
    );
    assert.equal(updated.length, 3);
    assert.deepEqual(updated.map((r) => Number(r.write_uid)).sort(), [ownerId, ownerId, ownerId]);

    const updateEvents = await engine.query(
      `SELECT "record_id", "changed_fields", "actor_uid" FROM "arsy_audit_event"
       WHERE "model_name" = $1 AND "operation" = 'update' ORDER BY "record_id";`,
      ['audit.test']
    );
    assert.equal(updateEvents.length, 3, 'one update event per updated row');
    assert.deepEqual(updateEvents.map((e) => Number(e.actor_uid)), [ownerId, ownerId, ownerId]);
    const changesById = new Map(updateEvents.map((e) => [Number(e.record_id), e.changed_fields]));
    assert.deepEqual(changesById.get(ids[0]), ['note']);
    assert.deepEqual(changesById.get(ids[1]), ['note']);
    assert.deepEqual(changesById.get(ids[2]), ['name', 'note']);
    assert.doesNotMatch(JSON.stringify(updateEvents), /batch-a|batch-b|batch-c|renamed/);

    // Non-matching ids (wrong tenant) are silently skipped, exactly like the
    // single-row path, and produce no audit event.
    const skipped = await repository.updateMany(
      [{ id: 999999, data: { note: 'ghost' } }],
      { companyId: -1 },
      actor
    );
    assert.equal(skipped.length, 0);
    const stillThree = await engine.query(
      `SELECT count(*)::INTEGER AS c FROM "arsy_audit_event" WHERE "model_name" = $1 AND "operation" = 'update';`,
      ['audit.test']
    );
    assert.equal(Number(stillThree[0].c), 3);
  } finally {
    await engine.close();
  }
});

test('versioned schema migrations roll back writes and remain retryable', { timeout: 60_000 }, async () => {
  const { engine, migrator } = await createAuditedDatabase();
  try {
    await assert.rejects(
      migrator.runMigration('audit-history-retry-test', async (executor) => {
        await executor.query(`INSERT INTO "audit_test" ("company_id", "name") VALUES (-1, 'migration row');`);
        throw new Error('migration failure');
      }),
      /migration failure/
    );
    const uncommitted = await engine.query(
      `SELECT "name" FROM "arsy_schema_migrations" WHERE "name" = $1;`,
      ['audit-history-retry-test']
    );
    const absentRow = await engine.query(
      `SELECT "id" FROM "audit_test" WHERE "name" = $1;`,
      ['migration row']
    );
    assert.equal(uncommitted.length, 0);
    assert.equal(absentRow.length, 0);

    await migrator.runMigration('audit-history-retry-test', async (executor) => {
      await executor.query(`INSERT INTO "audit_test" ("company_id", "name") VALUES (-1, 'migration row');`);
    });
    const applied = await engine.query(
      `SELECT "name" FROM "arsy_schema_migrations" WHERE "name" = $1;`,
      ['audit-history-retry-test']
    );
    assert.equal(applied.length, 1);

    // A second boot re-ensures the ledger and backfills the ad-hoc, name-only
    // row to version 0 / 'legacy' idempotently (roadmap T2.4c).
    await migrator.runOrderedMigrations([]);
    const backfilled = await engine.query(
      `SELECT "version", "checksum" FROM "arsy_schema_migrations" WHERE "name" = $1;`,
      ['audit-history-retry-test']
    );
    assert.equal(Number(backfilled[0].version), 0);
    assert.equal(backfilled[0].checksum, 'legacy');
  } finally {
    await engine.close();
  }
});

test('ordered migrations apply lexicographically, are idempotent, and guard checksum drift', { timeout: 60_000 }, async () => {
  const { engine, migrator } = await createAuditedDatabase();
  try {
    const migrations = [
      // Deliberately out of order: the runner must apply b then a? No — a then b.
      { name: '0002_b', sql: 'CREATE TABLE mig_b ("id" INTEGER);' },
      { name: '0001_a', sql: 'CREATE TABLE mig_a ("id" INTEGER);' },
    ];

    const first = await migrator.runOrderedMigrations(migrations);
    assert.deepEqual(first.applied, ['0001_a', '0002_b'], 'applied in ascending name order');
    assert.equal(first.skipped, 0);

    // Both tables exist and the ledger carries a monotonically increasing version
    // and a sha256 checksum.
    await engine.query('SELECT 1 FROM mig_a;');
    await engine.query('SELECT 1 FROM mig_b;');
    const rows = await engine.query(
      `SELECT "name", "version", "checksum" FROM "arsy_schema_migrations" ORDER BY "version";`
    );
    assert.deepEqual(rows.map((r) => [r.name, Number(r.version)]), [['0001_a', 1], ['0002_b', 2]]);
    assert.match(rows[0].checksum, /^[0-9a-f]{64}$/);

    // Re-running the identical set is a pure no-op: nothing applied, both skipped.
    const second = await migrator.runOrderedMigrations(migrations);
    assert.deepEqual(second.applied, []);
    assert.equal(second.skipped, 2);

    // Editing an already-applied migration fails closed instead of silently
    // skipping the changed SQL.
    await assert.rejects(
      migrator.runOrderedMigrations([{ name: '0001_a', sql: 'CREATE TABLE mig_a ("other" INTEGER);' }]),
      /checksum drift/
    );

    // Duplicate names within one ordered set are rejected before any SQL runs.
    await assert.rejects(
      migrator.runOrderedMigrations([
        { name: 'dup', sql: 'SELECT 1;' },
        { name: 'dup', sql: 'SELECT 1;' },
      ]),
      /Duplicate migration name/
    );
  } finally {
    await engine.close();
  }
});

test('legacy UID fixtures are normalized and repeated startup is idempotent', { timeout: 60_000 }, async () => {
  const engine = new PGliteEngine();
  await engine.connect();
  const registry = new ModelRegistry();
  for (const model of [ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent, TenantRecord]) {
    registry.register(model);
  }
  try {
    await engine.exec(`
      CREATE TABLE "res_users" (
        "id" SERIAL PRIMARY KEY,
        "company_id" INTEGER,
        "create_uid" TEXT,
        "write_uid" TEXT,
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE,
        "password" VARCHAR(255) NOT NULL,
        "role" VARCHAR(100) NOT NULL
      );
      INSERT INTO "res_users" ("id", "company_id", "name", "email", "password", "role")
      VALUES (1, -1, 'Legacy User', 'legacy@example.test', '[MANAGED_BY_AUTH_USER]', 'user');
      SELECT setval(pg_get_serial_sequence('res_users', 'id'), 1, true);
      CREATE TABLE "audit_test" (
        "id" SERIAL PRIMARY KEY,
        "active" BOOLEAN DEFAULT true,
        "create_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "write_date" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        "create_uid" TEXT,
        "write_uid" TEXT,
        "company_id" INTEGER,
        "name" VARCHAR(255),
        "password" VARCHAR(255),
        "note" TEXT
      );
      INSERT INTO "audit_test" ("company_id", "name", "create_uid", "write_uid")
      VALUES
        (-1, 'valid', '1', '1'),
        (-1, 'empty', '', ''),
        (-1, 'corrupt', 'not-an-id', '9999');
    `);

    const migrator = new SchemaMigrator(engine, registry);
    await migrator.sync();
    const botRows = await engine.query('SELECT "id" FROM "res_users" WHERE "system_key" = $1;', ['bot']);
    const botId = Number(botRows[0].id);
    const migrated = await engine.query(
      `SELECT "name", "create_uid", "write_uid" FROM "audit_test" ORDER BY "id";`
    );
    assert.deepEqual(
      migrated.map((row) => [row.name, Number(row.create_uid), Number(row.write_uid)]),
      [
        ['valid', 1, 1],
        ['empty', botId, botId],
        ['corrupt', botId, botId],
      ]
    );

    await migrator.sync();
    const restarted = await engine.query(
      `SELECT "name", "create_uid", "write_uid" FROM "audit_test" ORDER BY "id";`
    );
    assert.deepEqual(restarted, migrated);
    await assert.rejects(
      engine.query(`UPDATE "res_users" SET "role" = 'owner' WHERE "id" = 1;`),
      /ck_res_users_role_allowed/i
    );
  } finally {
    await engine.close();
  }
});
