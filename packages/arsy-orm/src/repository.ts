import { PGliteEngine, QueryExecutor, dbEngine } from './engine';
import { AuditActor, ConstraintContext, ModelDefinition } from './model';
import { FieldDefinition } from './fields';
import { modelRegistry } from './registry';
import {
  QueryBuilder,
  QueryOptions,
  TenantScope,
  isSystemScope,
  tenantCompanyId,
  KeysetCursor,
  GroupAggregate,
  UnknownFieldError,
  SelectionValueError,
  DomainNode,
} from './query_builder';
import { AccessDeniedError, AclMode, composeRuleDomain, PersistedRule, resolveAclMode } from './access';
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

  /**
   * Current ACL rollout mode. `off` skips model checks entirely; `audit` runs
   * them and logs would-denies without blocking; `enforce` blocks. Defaults to
   * `audit` (ADR-3), flipped to `enforce` only by the owner after reviewing the
   * audit log — never implicitly.
   */
  aclMode(): AclMode {
    return resolveAclMode();
  }

  /**
   * Model-level permission check (ir.model.access). System actors and explicit
   * global-access actors (server-authorized admin, reason + target tenant
   * recorded elsewhere) bypass. In enforce mode a model with no matching grant
   * row is default-deny; in audit mode the operation proceeds and the denial is
   * only logged, never written to the append-only CRUD event table.
   */
  private async checkAccess(
    actor: AuditActor,
    mode: AclMode,
    operation: 'create' | 'read' | 'update' | 'delete',
    data?: Record<string, unknown>,
    recordId?: number
  ): Promise<void> {
    if (mode === 'off') return;
    // System and server-authorized global-access actors bypass ACL.
    if (actor.type === 'system' || actor.globalAccess === true) return;

    const permColumn = {
      create: 'perm_create',
      read: 'perm_read',
      update: 'perm_write',
      delete: 'perm_unlink',
    }[operation];

    // Grants are one row per (model, group). group_id 0 is the platform-wide base
    // grant that applies to every authenticated principal; any other row applies
    // only when the principal holds that group.
    const grants = await this.executor.query<{ perm: boolean; group_id: number }>(`
      SELECT ${permColumn} AS perm, "group_id"
      FROM "ir_model_access"
      WHERE "model_name" = $1
    `, [this.model.name]);

    if (grants.length === 0) {
      // Default-deny only bites in enforce mode; audit mode records the gap.
      if (mode === 'enforce') {
        throw new AccessDeniedError(this.model.name, operation, 'no access grant exists for this model');
      }
      logger.warn({ msg: 'acl_would_deny', model: this.model.name, operation, userId: actor.userId, reason: 'no_grant' });
      return;
    }

    const principalGroups = new Set((actor.groupIds ?? []).map(Number));
    const allowed = grants.some((grant) => {
      if (!grant.perm) return false;
      const group = Number(grant.group_id);
      // group_id 0 = base grant for all authenticated principals.
      return group === 0 || principalGroups.has(group);
    });

    if (!allowed) {
      if (mode === 'enforce') {
        throw new AccessDeniedError(this.model.name, operation, `no grant permits '${operation}'`);
      }
      logger.warn({
        msg: 'acl_would_deny',
        model: this.model.name,
        operation,
        userId: actor.userId,
        recordId,
        reason: 'insufficient_grant',
      });
    }
    // `data` is accepted for signature stability (future per-value rules) but is
    // never logged, keeping audit free of row values.
    void data;
  }

  /**
   * Compile the ir.rule predicate that narrows reads/writes for this model and
   * operation, given the acting principal. Returns a DomainNode to AND onto the
   * query (never a widening), or null when no rule applies. Fails closed: a rule
   * whose domain_force cannot be parsed throws so the caller rejects the query
   * instead of returning rows the policy should hide.
   */
  async resolveSecurityDomain(
    operation: 'read' | 'write' | 'create' | 'unlink',
    actor: AuditActor
  ): Promise<DomainNode | null> {
    if (actor.type === 'system' || actor.globalAccess === true) return null;
    const permColumn = {
      read: 'perm_read',
      write: 'perm_write',
      create: 'perm_create',
      unlink: 'perm_unlink',
    }[operation];
    const rows = await this.executor.query<{
      name: string;
      domain_force: string;
      group_ids: unknown;
      global: boolean;
    }>(`
      SELECT name, domain_force, group_ids, global
      FROM "ir_rule"
      WHERE model_name = $1 AND ${permColumn} = true
    `, [this.model.name]);

    const rules: PersistedRule[] = rows.map((r) => ({
      name: r.name,
      domain_force: r.domain_force,
      group_ids: r.group_ids,
      global: r.global,
    }));
    return composeRuleDomain(rules, actor.groupIds ?? []);
  }

  // Evaluate the model's single-row constraints before SQL emission. A throw
  // here aborts the enclosing transaction, so the invariant cannot be bypassed
  // by a caller that skips the route layer.
  private async runConstraints(row: Record<string, unknown>, ctx: ConstraintContext): Promise<void> {
    for (const constraint of this.model.constraints) {
      await constraint(row, ctx);
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
      let operationError: Error | undefined;
      try {
        return await operation(executor);
      } catch (error) {
        operationError = error instanceof Error ? error : new Error(String(error));
        throw error;
      } finally {
        try {
          await executor.query(
            `SELECT
               set_config('arsy.audit_actor_id', '', true),
               set_config('arsy.audit_reason_hash', '', true),
               set_config('arsy.audit_request_id', '', true),
               set_config('arsy.audit_global_access', 'false', true);`
          );
        } catch (cleanupError) {
          // Cleanup failure must never mask the original operation error. If the
          // transaction is already aborted, the cleanup queries fail with "current
          // transaction is aborted", which would otherwise hide the real error.
          if (operationError) {
            (operationError as any).cause = cleanupError;
          }
        }
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
    return this.applyPostReadPipeline(rows, options);
  }

  // Keyset (seek) page: stable `(column, id)` ordering, no O(offset) scan. The
  // caller feeds the last row's (columnValue, id) back as `after`.
  async findKeyset(
    options: QueryOptions,
    keyset: { column: string; after?: KeysetCursor }
  ): Promise<T[]> {
    const { sql, params } = this.queryBuilder.buildKeyset(options, keyset);
    const rows = await this.executor.query<T>(sql, params);
    return this.applyPostReadPipeline(rows, options);
  }

  private async applyPostReadPipeline(rows: T[], options: QueryOptions): Promise<T[]> {
    let result = rows;
    if (options.lang && result.length > 0) {
      const companyId = isSystemScope(options.scope) ? null : tenantCompanyId(options.scope);
      result = await this._applyTranslations(result, options.lang, companyId);
    }
    if (options.expand && options.expand.length > 0) {
      result = await this.applyExpand(result, options.expand, options.scope);
    }
    await this.applyComputed(result as unknown as Array<Record<string, unknown>>, options.scope);
    return result;
  }

  private validateSelectionFields(data: Record<string, unknown>): void {
    for (const [fieldName, fieldValue] of Object.entries(data)) {
      const fieldDef = this.model.fields[fieldName];
      if (!fieldDef || fieldDef.type !== 'selection' || !fieldDef.selection || fieldValue === null || fieldValue === undefined) {
        continue;
      }
      const valueStr = String(fieldValue);
      if (!(valueStr in fieldDef.selection)) {
        const allowed = Object.keys(fieldDef.selection);
        throw new SelectionValueError(this.model.name, fieldName, fieldValue, allowed);
      }
    }
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

  private scopeCompanyId(scope: TenantScope): number | null {
    return isSystemScope(scope) ? null : tenantCompanyId(scope);
  }

  async create(data: Record<string, unknown>, scope: TenantScope, actor: AuditActor): Promise<T> {
    this.validateSelectionFields(data);
    // Check access before creating
    await this.checkAccess(actor, this.aclMode(), 'create', data);
    const actorId = await this.resolveActor(actor);
    const companyId = this.scopeCompanyId(scope);
    const { sql, params } = this.queryBuilder.buildInsert(data, scope, actorId);
    const created = await this.withAuditContext(actor, actorId, async (executor) => {
      // Single-row invariants run inside the transaction, before SQL emission,
      // so a violation aborts the write and cannot be bypassed by a caller that
      // reaches the repository directly instead of the route layer.
      if (this.model.constraints.length > 0) {
        await this.runConstraints({ ...data, company_id: companyId }, { operation: 'create', companyId });
      }
      const rows = await executor.query<T>(sql, params);
      const row = rows[0];
      if (!row) throw new Error(`Failed to create a record in '${this.model.tableName}'.`);
      if (this.hasStoredCompute()) {
        const id = Number((row as unknown as Record<string, unknown>).id);
        await this.recomputeWithinTx(executor, [id], scope, actorId);
        const refreshed = await this.readWithinTx(executor, [id], scope);
        return refreshed[0] ?? row;
      }
      return row;
    });
    if (!created) throw new Error(`Failed to create a record in '${this.model.tableName}'.`);
    return created;
  }

  private async readWithinTx(executor: QueryExecutor, ids: number[], scope: TenantScope): Promise<T[]> {
    const { sql, params } = this.queryBuilder.buildSelect({
      scope,
      filters: [{ field: 'id', operator: 'IN', value: ids }],
    });
    return executor.query<T>(sql, params);
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
    for (const row of rows) {
      this.validateSelectionFields(row);
    }
    // Check access before creating
    await this.checkAccess(actor, this.aclMode(), 'create', rows[0]);
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildInsertMany(rows, scope, actorId);
    const created = await this.withAuditContext(actor, actorId, async (executor) => {
      const inserted = await executor.query<T>(sql, params);
      if (inserted.length !== rows.length) {
        throw new Error(`Batch insert into '${this.model.tableName}' expected ${rows.length} rows, got ${inserted.length}.`);
      }
      if (this.hasStoredCompute()) {
        const ids = this.distinctIds(inserted.map((row) => (row as unknown as Record<string, unknown>).id));
        await this.recomputeWithinTx(executor, ids, scope, actorId);
        return this.readWithinTx(executor, ids, scope);
      }
      return inserted;
    });
    return created;
  }

  async updateById(
    id: string | number,
    data: Record<string, unknown>,
    scope: TenantScope,
    actor: AuditActor,
    expected: Record<string, unknown> = {}
  ): Promise<T | null> {
    this.validateSelectionFields(data);
    // Check access before updating
    await this.checkAccess(actor, this.aclMode(), 'update', data, Number(id));
    const actorId = await this.resolveActor(actor);
    const companyId = this.scopeCompanyId(scope);
    const { sql, params } = this.queryBuilder.buildUpdate(id, data, scope, actorId, expected);
    return this.withAuditContext(actor, actorId, async (executor) => {
      if (this.model.constraints.length > 0) {
        const [existing] = await this.readWithinTx(executor, [Number(id)], scope);
        const merged = { ...(existing as Record<string, unknown> | undefined), ...data };
        await this.runConstraints(merged, {
          operation: 'write',
          existing: existing as Record<string, unknown> | undefined,
          companyId,
        });
      }
      const rows = await executor.query<T>(sql, params);
      const updated = rows[0] || null;
      if (updated && this.hasStoredCompute()) {
        const rowId = Number((updated as unknown as Record<string, unknown>).id);
        await this.recomputeWithinTx(executor, [rowId], scope, actorId);
        const refreshed = await this.readWithinTx(executor, [rowId], scope);
        return refreshed[0] ?? updated;
      }
      return updated;
    });
  }

  // Batched update: a set-based `UPDATE … FROM (VALUES …)` per column-shape
  // (roadmap T2.4b) inside one audit-context transaction. Row-level triggers fire
  // once per updated row, so every change still gets its audit + sync event.
  async updateMany(
    updates: Array<{ id: string | number; data: Record<string, unknown> }>,
    scope: TenantScope,
    actor: AuditActor
  ): Promise<T[]> {
    if (updates.length === 0) return [];
    for (const update of updates) {
      this.validateSelectionFields(update.data);
    }
    // Check access before updating - using first update as representative
    await this.checkAccess(actor, this.aclMode(), 'update', updates[0].data, Number(updates[0].id));
    const actorId = await this.resolveActor(actor);
    const statements = this.queryBuilder.buildUpdateMany(updates, scope, actorId);
    return this.withAuditContext(actor, actorId, async (executor) => {
      const out: T[] = [];
      const touched: number[] = [];
      for (const { sql, params } of statements) {
        const rows = await executor.query<T>(sql, params);
        for (const row of rows) {
          out.push(row);
          touched.push(Number((row as unknown as Record<string, unknown>).id));
        }
      }
      if (this.hasStoredCompute() && touched.length > 0) {
        await this.recomputeWithinTx(executor, touched, scope, actorId);
        return this.readWithinTx(executor, touched, scope);
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
      const updated = rows[0] || null;
      if (updated && this.hasStoredCompute()) {
        const idNum = Number((updated as unknown as Record<string, unknown>).id);
        await this.recomputeWithinTx(executor, [idNum], scope, actorId);
        const refreshed = await this.readWithinTx(executor, [idNum], scope);
        return refreshed[0] || null;
      }
      return updated;
    });
  }

  async deleteById(id: string | number, scope: TenantScope, actor: AuditActor): Promise<boolean> {
    // Check access before deleting
    await this.checkAccess(actor, this.aclMode(), 'delete', undefined, Number(id));
    const actorId = await this.resolveActor(actor);
    const companyId = this.scopeCompanyId(scope);
    const { sql, params } = this.queryBuilder.buildDelete(id, scope);
    return this.withAuditContext(actor, actorId, async (executor) => {
      if (this.model.constraints.length > 0) {
        const [existing] = await this.readWithinTx(executor, [Number(id)], scope);
        if (existing) {
          await this.runConstraints(existing as Record<string, unknown>, {
            operation: 'unlink',
            existing: existing as Record<string, unknown>,
            companyId,
          });
        }
      }
      const rows = await executor.query<{ id: number }>(sql, params);
      return rows.length > 0;
    });
  }

  // Archive is a soft state flip, not a physical delete. Returns the number of
  // rows whose state actually changed (re-archiving an archived row is a no-op).
  async archive(ids: Array<string | number>, scope: TenantScope, actor: AuditActor): Promise<number> {
    return this.setArchived(ids, false, scope, actor);
  }

  async unarchive(ids: Array<string | number>, scope: TenantScope, actor: AuditActor): Promise<number> {
    return this.setArchived(ids, true, scope, actor);
  }

  private async setArchived(
    ids: Array<string | number>,
    active: boolean,
    scope: TenantScope,
    actor: AuditActor
  ): Promise<number> {
    if (ids.length === 0) return 0;
    // Check access before archiving/unarchiving (treat as update)
    await this.checkAccess(actor, this.aclMode(), 'update', undefined, Number(ids[0]));
    const actorId = await this.resolveActor(actor);
    const { sql, params } = this.queryBuilder.buildArchive(ids, active, scope, actorId);
    return this.withAuditContext(actor, actorId, async (executor) => {
      const rows = await executor.query<{ id: number }>(sql, params);
      return rows.length;
    });
  }

  // Odoo-style search: rows for the page plus the total matching count, so list
  // routes stop fabricating `total = records.length`. `expand` / `fields` /
  // `includeArchived` are honored via the shared find()/count() builders.
  async search(options: QueryOptions): Promise<{ rows: T[]; total: number }> {
    const [rows, total] = await Promise.all([this.find(options), this.count(options)]);
    return { rows, total };
  }

  // Grouped aggregate read; groupBy/aggregate fields run through the same
  // allowlist as any other query, and the aggregate function set is fixed.
  async readGroup(
    options: QueryOptions,
    spec: { groupBy: string[]; aggregates: GroupAggregate[] }
  ): Promise<Record<string, unknown>[]> {
    const { sql, params } = this.queryBuilder.buildReadGroup(options, spec);
    return this.executor.query<Record<string, unknown>>(sql, params);
  }

  // Resolve the field used to render a record's display name (roadmap T2.2).
  private resolveDisplayField(): string {
    const spec = this.model.displayNameSpec;
    if (spec && spec in this.model.fields) return spec;
    if ('name' in this.model.fields) return 'name';
    const firstChar = Object.entries(this.model.fields).find(([, f]) => f.type === 'char');
    if (!firstChar) {
      throw new Error(`Model '${this.model.name}' has no display field for name_search.`);
    }
    return firstChar[0];
  }

  // name_search: id + display name for records whose display field matches the
  // term. The match value is fully parameterized (wildcards added here), so the
  // term itself never reaches the SQL text. ILIKE wildcards (%, _) in the term
  // are escaped so they match literally.
  async nameSearch(
    term: string,
    options: { scope: TenantScope; limit?: number; operator?: 'ILIKE' | '=' }
  ): Promise<Array<{ id: number; name: string }>> {
    const displayField = this.resolveDisplayField();
    const operator = options.operator ?? 'ILIKE';
    let value: string;
    if (operator === 'ILIKE') {
      // Escape ILIKE wildcards so user input matches literally
      const escaped = term.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
      value = `%${escaped}%`;
    } else {
      value = term;
    }
    const rows = await this.find({
      scope: options.scope,
      fields: ['id', displayField],
      filters: [{ field: displayField, operator, value }],
      orderBy: displayField,
      limit: options.limit ?? 80,
    });
    return rows.map((row) => {
      const record = row as unknown as Record<string, unknown>;
      return { id: Number(record.id), name: String(record[displayField] ?? '') };
    });
  }

  // fields_get: field metadata for the SDUI/views pipeline. Exposes type,
  // relation, and selection options; never exposes values or reserved columns.
  fieldsGet(): Record<string, Record<string, unknown>> {
    const out: Record<string, Record<string, unknown>> = {};
    for (const [fieldName, fieldDef] of Object.entries(this.model.fields)) {
      out[fieldName] = {
        type: fieldDef.type,
        string: fieldDef.label ?? fieldName,
        help: fieldDef.help ?? '',
        required: fieldDef.required ?? false,
        readonly: fieldDef.readonly ?? false,
        ...(fieldDef.relation ? { relation: fieldDef.relation } : {}),
        ...(fieldDef.selection ? { selection: Object.entries(fieldDef.selection) } : {}),
      };
    }
    return out;
  }

  // Batched relation traversal. Only relational fields are expandable; the
  // related model is looked up in the shared registry and every generated query
  // carries the parent's tenant scope.
  private async applyExpand(rows: T[], expandFields: string[], scope: TenantScope): Promise<T[]> {
    if (rows.length === 0) return rows;
    const recordRows = rows as unknown as Array<Record<string, unknown>>;
    for (const field of expandFields) {
      const fieldDef = (this.model.fields as Record<string, FieldDefinition>)[field];
      if (!fieldDef) throw new UnknownFieldError(this.model.name, field);
      if (fieldDef.type === 'many2one') {
        await this.expandMany2One(recordRows, field, fieldDef, scope);
      } else if (fieldDef.type === 'one2many') {
        await this.expandOne2Many(recordRows, field, fieldDef, scope);
      } else if (fieldDef.type === 'many2many') {
        await this.expandMany2Many(recordRows, field, fieldDef, scope);
      } else {
        throw new Error(`Cannot expand non-relational field '${this.model.name}.${field}'.`);
      }
    }
    return recordRows as unknown as T[];
  }

  private relatedBuilder(relation: string): { model: ModelDefinition; builder: QueryBuilder } {
    const related = modelRegistry.get(relation);
    if (!related) {
      throw new Error(`Expand target model '${relation}' is not registered.`);
    }
    return { model: related, builder: new QueryBuilder(related) };
  }

  private async expandMany2One(
    rows: Array<Record<string, unknown>>,
    field: string,
    fieldDef: FieldDefinition,
    scope: TenantScope
  ): Promise<void> {
    const ids = this.distinctIds(rows.map((row) => row[field]));
    if (ids.length === 0) {
      for (const row of rows) row[field] = null;
      return;
    }
    const { builder } = this.relatedBuilder(fieldDef.relation!);
    const { sql, params } = builder.buildSelect({
      scope,
      filters: [{ field: 'id', operator: 'IN', value: ids }],
    });
    const relatedRows = await this.executor.query<Record<string, unknown>>(sql, params);
    const byId = new Map(relatedRows.map((r) => [Number(r.id), r]));
    for (const row of rows) {
      const key = row[field];
      row[field] = key === null || key === undefined ? null : byId.get(Number(key)) ?? null;
    }
  }

  private async expandOne2Many(
    rows: Array<Record<string, unknown>>,
    field: string,
    fieldDef: FieldDefinition,
    scope: TenantScope
  ): Promise<void> {
    const parentIds = this.distinctIds(rows.map((row) => row.id));
    if (parentIds.length === 0) return;
    const { model: related, builder } = this.relatedBuilder(fieldDef.relation!);
    const inverse = this.findInverseField(related);
    const { sql, params } = builder.buildSelect({
      scope,
      filters: [{ field: inverse, operator: 'IN', value: parentIds }],
    });
    const children = await this.executor.query<Record<string, unknown>>(sql, params);
    const grouped = new Map<number, Record<string, unknown>[]>();
    for (const child of children) {
      const parentId = Number(child[inverse]);
      if (!grouped.has(parentId)) grouped.set(parentId, []);
      grouped.get(parentId)!.push(child);
    }
    for (const row of rows) row[field] = grouped.get(Number(row.id)) ?? [];
  }

  private async expandMany2Many(
    rows: Array<Record<string, unknown>>,
    field: string,
    fieldDef: FieldDefinition,
    scope: TenantScope
  ): Promise<void> {
    const { relationTable: table, column1, column2 } = fieldDef;
    if (!table || !column1 || !column2) {
      throw new Error(`many2many '${this.model.name}.${field}' is missing join-table wiring.`);
    }
    if (![table, column1, column2].every((name) => /^[a-z][a-z0-9_]{0,62}$/.test(name))) {
      throw new Error(`many2many '${this.model.name}.${field}' uses an unsafe join identifier.`);
    }
    const parentIds = this.distinctIds(rows.map((row) => row.id));
    if (parentIds.length === 0) return;
    const linkParams: unknown[] = [];
    const placeholders = parentIds.map((id) => {
      linkParams.push(id);
      return `$${linkParams.length}`;
    });
    const links = await this.executor.query<{ c1: number; c2: number }>(
      `SELECT "${column1}" AS c1, "${column2}" AS c2 FROM "${table}" WHERE "${column1}" IN (${placeholders.join(', ')})`,
      linkParams
    );
    const relatedIds = this.distinctIds(links.map((link) => link.c2));
    if (relatedIds.length === 0) {
      for (const row of rows) row[field] = [];
      return;
    }
    const { builder } = this.relatedBuilder(fieldDef.relation!);
    const { sql, params } = builder.buildSelect({
      scope,
      filters: [{ field: 'id', operator: 'IN', value: relatedIds }],
    });
    const relatedRows = await this.executor.query<Record<string, unknown>>(sql, params);
    const byId = new Map(relatedRows.map((r) => [Number(r.id), r]));
    const grouped = new Map<number, Record<string, unknown>[]>();
    for (const link of links) {
      const record = byId.get(Number(link.c2));
      if (!record) continue;
      if (!grouped.has(Number(link.c1))) grouped.set(Number(link.c1), []);
      grouped.get(Number(link.c1))!.push(record);
    }
    for (const row of rows) row[field] = grouped.get(Number(row.id)) ?? [];
  }

  private findInverseField(related: ModelDefinition): string {
    const entry = Object.entries(related.fields as Record<string, FieldDefinition>).find(
      ([, fieldDef]) => fieldDef.type === 'many2one' && fieldDef.relation === this.model.name
    );
    if (!entry) {
      throw new Error(`No inverse many2one on '${related.name}' for '${this.model.name}'.`);
    }
    return entry[0];
  }

  private distinctIds(values: unknown[]): number[] {
    const set = new Set<number>();
    for (const value of values) {
      if (value === null || value === undefined) continue;
      const num = Number(value);
      if (Number.isSafeInteger(num)) set.add(num);
    }
    return [...set];
  }

  // ---- Computed & related fields (roadmap T2.3) ----

  private computeFields(): Array<{ field: string; def: FieldDefinition }> {
    return Object.entries(this.model.fields as Record<string, FieldDefinition>).map(([field, def]) => ({ field, def }));
  }

  // Stored compute fields are the only ones needing a write-time recompute; a
  // model with none behaves exactly like before this feature (zero regression).
  private storedComputeHandlers(): Array<{ field: string; handler: NonNullable<ReturnType<ModelDefinition['getComputeHandler']>> }> {
    const out: Array<{ field: string; handler: NonNullable<ReturnType<ModelDefinition['getComputeHandler']>> }> = [];
    for (const { field, def } of this.computeFields()) {
      if (def.compute && def.store === true) {
        const handler = this.model.getComputeHandler(def.compute);
        if (handler) out.push({ field, handler });
      }
    }
    return out;
  }

  hasStoredCompute(): boolean {
    return this.storedComputeHandlers().length > 0;
  }

  // Fill non-stored compute fields (via their handler) and single-hop `related`
  // fields (by expanding the source m2o) into the fetched rows in place.
  private async applyComputed(rows: Array<Record<string, unknown>>, scope: TenantScope): Promise<void> {
    if (rows.length === 0) return;
    for (const { field, def } of this.computeFields()) {
      if (def.related) {
        await this.resolveRelated(rows, field, def.related, scope);
      } else if (def.compute && def.store !== true) {
        const handler = this.model.getComputeHandler(def.compute);
        if (handler) {
          for (const row of rows) row[field] = handler(row);
        }
      }
    }
  }

  // related is intentionally scoped to a single m2o hop ('<m2oField>.<valueField>')
  // resolved through the same expand traversal, so it stays tenant-scoped.
  private async resolveRelated(
    rows: Array<Record<string, unknown>>,
    field: string,
    path: string,
    scope: TenantScope
  ): Promise<void> {
    const parts = path.split('.');
    if (parts.length !== 2) {
      throw new Error(`related '${this.model.name}.${field}' must be a single-hop 'm2oField.valueField' path.`);
    }
    const [sourceField, valueField] = parts;
    const sourceDef = (this.model.fields as Record<string, FieldDefinition>)[sourceField];
    if (!sourceDef || sourceDef.type !== 'many2one') {
      throw new Error(`related '${this.model.name}.${field}' needs a many2one source '${sourceField}'.`);
    }
    await this.applyExpand(rows as unknown as T[], [sourceField], scope);
    for (const row of rows) {
      const resolved = row[sourceField];
      row[field] = resolved && typeof resolved === 'object' ? (resolved as Record<string, unknown>)[valueField] ?? null : null;
    }
  }

  // Fixed-point recompute of stored compute fields, capped at 2 rounds, run on
  // the caller's (already transactional) executor so it commits with the write.
  private async recomputeWithinTx(
    executor: QueryExecutor,
    ids: number[],
    scope: TenantScope,
    actorId: number
  ): Promise<void> {
    const handlers = this.storedComputeHandlers();
    if (handlers.length === 0) return;
    let pending = ids;
    for (let round = 0; round < 2 && pending.length > 0; round++) {
      const { sql, params } = this.queryBuilder.buildSelect({
        scope,
        filters: [{ field: 'id', operator: 'IN', value: pending }],
      });
      const rows = await executor.query<Record<string, unknown>>(sql, params);
      const updates: Array<{ id: number; data: Record<string, unknown> }> = [];
      for (const row of rows) {
        const data: Record<string, unknown> = {};
        for (const { field, handler } of handlers) {
          const next = handler(row);
          if (next !== row[field]) data[field] = next;
        }
        if (Object.keys(data).length > 0) updates.push({ id: Number(row.id), data });
      }
      if (updates.length === 0) break;
      for (const update of updates) {
        const { sql: upSql, params: upParams } = this.queryBuilder.buildUpdate(update.id, update.data, scope, actorId);
        await executor.query(upSql, upParams);
      }
      pending = updates.map((u) => u.id);
    }
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
    const idPlaceholders = recordIds.map((_: unknown, index: number) => '$' + (index + 4));
    const namePlaceholders = translatableFields.map(
      (_: unknown, index: number) => '$' + (index + 4 + recordIds.length)
    );

    const translationQuery =
      'SELECT res_id, name, value\n      FROM ir_translation\n      WHERE (company_id = 0 OR company_id = $1)\n        AND lang = $2\n        AND type = \'model\'\n        AND (model_name = $3 OR model_name IS NULL)\n        AND res_id IN (' +
      idPlaceholders.join(',') +
      ')\n        AND name IN (' +
      namePlaceholders.join(',') +
      ')';

    const translationParams = [companyId ?? 0, lang, modelName, ...recordIds, ...translatableFields];
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

/**
 * Context handed to a `withTransaction` callback: an already-transactional
 * executor plus a factory that binds repositories to it, so several model
 * writes commit or roll back as one unit while each still satisfies the
 * audit `assertTransactional` invariant (roadmap T2.2).
 */
export interface TransactionContext {
  executor: QueryExecutor;
  repositoryFor<R = Record<string, unknown>>(model: ModelDefinition): BaseRepository<R>;
}

export async function withTransaction<T>(
  run: (tx: TransactionContext) => Promise<T>,
  engine: PGliteEngine = dbEngine
): Promise<T> {
  return engine.transaction((executor) => {
    const context: TransactionContext = {
      executor,
      repositoryFor<R = Record<string, unknown>>(model: ModelDefinition): BaseRepository<R> {
        return new BaseRepository<R>(model, engine, executor);
      },
    };
    return run(context);
  });
}