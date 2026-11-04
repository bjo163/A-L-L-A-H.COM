import { PGliteEngine, QueryExecutor, dbEngine } from './engine';
import { AuditActor, ModelDefinition } from './model';
import { QueryBuilder, QueryOptions, TenantScope, isSystemScope, tenantCompanyId } from './query_builder';
import { logger } from '@allah/arsy-core';

/**
 * Assert that a caller-supplied executor is bound to a real database
 * transaction. Audit writes rely on `SET LOCAL`, which silently degrades to
 * session scope (and leaks across operations) when run outside a transaction,
 * so we fail closed rather than infer transactionality from object identity
 * (roadmap T12).
 */
export function assertTransactional(executor: QueryExecutor): void {
  if (executor.transactional !== true) {
    throw new Error(
      'Audit write requires a transactional executor; the provided executor is not '
        + 'bound to a transaction and SET LOCAL audit context would leak to session scope.',
    );
  }
}

const systemActorIds = new WeakMap<PGliteEngine, Promise<number>>();

export class BaseRepository<T = Record<string, unknown>> {
  private queryBuilder: QueryBuilder;

  constructor(
    public readonly model: ModelDefinition,
    private readonly engine: PGliteEngine = dbEngine,
    private readonly executor: QueryExecutor = engine
  ) {
    this.queryBuilder = new QueryBuilder(model);
  }

  private async resolveActor(actor: AuditActor): Promise<number> {
    if (actor.type === 'user') {
      if (!Number.isSafeInteger(actor.userId) || actor.userId < 1) {
        throw new Error('Audit actor must be a positive res.users ID.');
      }
      return actor.userId;
    }

    let actorId = systemActorIds.get(this.engine);
    if (!actorId) {
      actorId = this.executor.query<{ id: number }>(
        `SELECT id FROM "res_users" WHERE "role" = $1 AND "system_key" = $2 LIMIT 2;`,
        ['system', 'bot']
      ).then((rows) => {
        if (rows.length !== 1 || !Number.isSafeInteger(Number(rows[0].id))) {
          throw new Error('The system bot must exist before system-owned records can be written.');
        }
        return Number(rows[0].id);
      });
      systemActorIds.set(this.engine, actorId);
    }

    try {
      return await actorId;
    } catch (error) {
      systemActorIds.delete(this.engine);
      throw error;
    }
  }

  private async withAuditContext<R>(
    actor: AuditActor,
    actorId: number,
    operation: (executor: QueryExecutor) => Promise<R>
  ): Promise<R> {
    const run = async (executor: QueryExecutor): Promise<R> => {
      await executor.query(
        `SELECT
           set_config('arsy.audit_actor_id', $1, true),
           set_config('arsy.audit_reason_hash', $2, true),
           set_config('arsy.audit_request_id', $3, true),
           set_config('arsy.audit_global_access', $4, true);`,
        [
          String(actorId),
          actor.reasonHash ?? '',
          actor.requestId ?? '',
          actor.globalAccess === true ? 'true' : 'false',
        ]
      );
      try {
        return await operation(executor);
      } finally {
        await executor.query(
          `SELECT
             set_config('arsy.audit_actor_id', '', true),
             set_config('arsy.audit_reason_hash', '', true),
             set_config('arsy.audit_request_id', '', true),
             set_config('arsy.audit_global_access', 'false', true);`
        );
      }
    };

    // The engine is the only executor we know how to wrap in a fresh
    // transaction ourselves. Any caller-supplied executor must already be
    // transactional, or the SET LOCAL audit GUCs would leak to session scope
    // (roadmap T12: fail closed instead of inferring from identity).
    if (this.executor === this.engine) {
      return this.engine.transaction(run);
    }
    assertTransactional(this.executor);
    return run(this.executor);
  }

  async find(options: QueryOptions): Promise<T[]> {
    const { sql, params } = this.queryBuilder.buildSelect(options);
    const rows = await this.executor.query<T>(sql, params);

    // Apply transparent field translation if context.lang is provided
    if (options.lang && rows.length > 0) {
      const companyId = isSystemScope(options.scope) ? null : tenantCompanyId(options.scope);
      return this._applyTranslations(rows, options.lang, companyId);
    }

    return rows;
  }

  async count(options: QueryOptions): Promise<number> {
    const { sql, params } = this.queryBuilder.buildCount(options);
    const rows = await this.executor.query<{ count: number | string }>(sql, params);
    const count = Number(rows[0]?.count);
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error(`Invalid count returned for '${this.model.name}'.`);
    }
    return count;
  }

  async findById(id: string | number, scope: TenantScope, lang?: string): Promise<T | null> {
    const options: QueryOptions = {
      scope,
      lang,
      filters: [{ field: 'id', operator: '=', value: id }],
      limit: 1,
    };
    const rows = await this.find(options);
    return rows[0] || null;
  }

  async create(data: Record<string, unknown>, scope: TenantScope, actor: AuditActor): Promise<T> {
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildInsert(data, scope, actorId);
    const created = await this.withAuditContext(actor, actorId, async (executor) => {
      const rows = await executor.query<T>(sql, params);
      return rows[0];
    });
    if (!created) throw new Error(`Failed to create a record in '${this.model.tableName}'.`);
    return created;
  }

  // Batched insert: N rows in a single statement inside one audit-context
  // transaction, replacing per-row create() loops that each opened their own
  // transaction + trigger set (roadmap T14).
  async createMany(
    rows: Record<string, unknown>[],
    scope: TenantScope,
    actor: AuditActor
  ): Promise<T[]> {
    if (rows.length === 0) return [];
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildInsertMany(rows, scope, actorId);
    const created = await this.withAuditContext(actor, actorId, async (executor) => {
      return executor.query<T>(sql, params);
    });
    if (created.length !== rows.length) {
      throw new Error(`Batch insert into '${this.model.tableName}' expected ${rows.length} rows, got ${created.length}.`);
    }
    return created;
  }

  async updateById(
    id: string | number,
    data: Record<string, unknown>,
    scope: TenantScope,
    actor: AuditActor,
    expected: Record<string, unknown> = {}
  ): Promise<T | null> {
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildUpdate(id, data, scope, actorId, expected);
    return this.withAuditContext(actor, actorId, async (executor) => {
      const rows = await executor.query<T>(sql, params);
      return rows[0] || null;
    });
  }

  // Batched update: run many row updates inside a single audit-context
  // transaction instead of one transaction per updateById call (roadmap T14).
  async updateMany(
    updates: Array<{ id: string | number; data: Record<string, unknown> }>,
    scope: TenantScope,
    actor: AuditActor
  ): Promise<T[]> {
    if (updates.length === 0) return [];
    const actorId = await this.resolveActor(actor);
    return this.withAuditContext(actor, actorId, async (executor) => {
      const out: T[] = [];
      for (const { id, data } of updates) {
        const { sql, params } = this.queryBuilder.buildUpdate(id, data, scope, actorId);
        const rows = await executor.query<T>(sql, params);
        if (rows[0]) out.push(rows[0]);
      }
      return out;
    });
  }

  async incrementById(
    id: string | number,
    increments: Record<string, number>,
    data: Record<string, unknown>,
    scope: TenantScope,
    actor: AuditActor
  ): Promise<T | null> {
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildIncrementUpdate(
      id,
      increments,
      data,
      scope,
      actorId
    );
    return this.withAuditContext(actor, actorId, async (executor) => {
      const rows = await executor.query<T>(sql, params);
      return rows[0] || null;
    });
  }

  async deleteById(id: string | number, scope: TenantScope, actor: AuditActor): Promise<boolean> {
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildDelete(id, scope);
    return this.withAuditContext(actor, actorId, async (executor) => {
      const rows = await executor.query<{ id: number }>(sql, params);
      return rows.length > 0;
    });
  }

  private async _applyTranslations(
    rows: T[],
    lang: string,
    companyId: number | null
  ): Promise<T[]> {
    if (!this.model.fields) return rows;

    // Collect translatable fields for this model
    const translatableFields = Object.entries(this.model.fields)
      .filter(([_, field]) => (field as any).translate === true)
      .map(([fieldName]) => fieldName);

    if (translatableFields.length === 0) return rows;

    // Build translation query for all records at once
    const recordIds = rows.map(row => (row as any).id);
    const modelName = this.model.name;

    // Postgres binds numbered parameters; the previous '?' form was never a valid placeholder.
    const idPlaceholders = recordIds.map((_: unknown, index: number) => '$' + (index + 3));
    const namePlaceholders = translatableFields.map(
      (_: unknown, index: number) => '$' + (index + 3 + recordIds.length)
    );

    const translationQuery =
      'SELECT res_id, name, value\n      FROM ir_translation\n      WHERE (company_id = 0 OR company_id = $1)\n        AND lang = $2\n        AND type = \'model\'\n        AND res_id IN (' +
      idPlaceholders.join(',') +
      ')\n        AND name IN (' +
      namePlaceholders.join(',') +
      ')';

    const translationParams = [companyId ?? 0, lang, ...recordIds, ...translatableFields];
    const translations = await this.executor.query<{
      res_id: number;
      name: string;
      value: string;
    }>(translationQuery, translationParams);

    // Build translation map: recordId -> fieldName -> translatedValue
    const translationMap = new Map<number, Map<string, string>>();
    for (const t of translations) {
      if (!translationMap.has(t.res_id)) {
        translationMap.set(t.res_id, new Map());
      }
      translationMap.get(t.res_id)!.set(t.name, t.value);
    }

    // Apply translations to rows
    const result: T[] = [];
    for (const row of rows) {
      const rowClone: Record<string, unknown> = { ...(row as Record<string, unknown>) };
      const recordId = (row as any).id;
      const transMap = translationMap.get(recordId);

      if (transMap) {
        for (const fieldName of translatableFields) {
          const translated = transMap.get(fieldName);
          if (translated !== undefined) {
            rowClone[fieldName] = translated;
          }
        }
      }

      result.push(rowClone as T);
    }

    return result;
  }
}