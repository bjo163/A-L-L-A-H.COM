import { ModelDefinition } from './model';
import { RESERVED_COLUMN_SET, isSafeIdentifier } from './constants';

const SUPPORTED_OPERATORS = new Set([
  '=',
  '!=',
  '>',
  '>=',
  '<',
  '<=',
  'LIKE',
  'ILIKE',
  'IN',
  'NOT IN',
]);

export type TenantScope =
  | { companyId: string | number }
  | { systemScope: true; companyId?: string | number };

export interface QueryFilter {
  field: string;
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN';
  value: unknown;
  connector?: 'AND' | 'OR';
}

/** A single `['field', op, value]` predicate — the leaf of a nested domain. */
export type DomainLeaf = [field: string, operator: QueryFilter['operator'], value: unknown];

/**
 * Odoo-polish prefix domain tree: `['&', a, b]` / `['|', a, b]` combine two
 * sub-nodes, `['!', a]` negates one, anything else is a `DomainLeaf`. Every leaf
 * routes through the same column allowlist + parameterized placeholder path as a
 * flat `QueryFilter`, so nesting never widens the injection surface.
 */
export type DomainNode =
  | DomainLeaf
  | ['&', DomainNode, DomainNode]
  | ['|', DomainNode, DomainNode]
  | ['!', DomainNode];

/** Stable tiebreaker cursor for keyset pagination over `(column, id)`. */
export interface KeysetCursor {
  columnValue: unknown;
  id: string | number;
}

/** A single `read_group` aggregate; numeric operators require a field at compile time. */
export type GroupAggregate =
  | { fn: 'count'; field?: string; alias: string }
  | { fn: 'sum' | 'avg' | 'min' | 'max'; field: string; alias: string };

export interface QueryOptions {
  scope: TenantScope;
  lang?: string;
  filters?: QueryFilter[];
  /** Nested prefix domain, AND-combined with any flat `filters`. */
  domain?: DomainNode;
  /**
   * Pre-composed record-rule predicate (ir.rule). Resolved by the caller from the
   * acting principal's groups and AND-narrowed onto every read, so a rule can only
   * ever reduce visibility, never widen it. Compiled through the same allowlisted
   * domain compiler, so an unparseable rule fails closed rather than leaking rows.
   */
  securityDomain?: DomainNode;
  /** Column projection; validated against reserved + model fields. Default `*`. */
  fields?: string[];
  /** Relation fields resolved after fetch (m2o inline, o2m/m2m batched); read by the repository. */
  expand?: string[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
  /** Include archived (`active = false`) rows; default false keeps the `active = true` filter. */
  includeArchived?: boolean;
  /**
   * Append a row-level lock to the select (single-statement scope). `true` is a
   * plain `FOR UPDATE`; `'skip_locked'` appends `FOR UPDATE SKIP LOCKED`, which
   * a concurrent claimer uses to pull the next unlocked rows instead of blocking
   * (roadmap T3.2 cron work queue).
   */
  forUpdate?: boolean | 'skip_locked';
}

export class TenantScopeRequiredError extends Error {
  constructor(modelName: string) {
    super(
      `Query on '${modelName}' has no tenant scope. Pass { companyId } or name { systemScope: true } explicitly.`
    );
    this.name = 'TenantScopeRequiredError';
  }
}

export class UnknownFieldError extends Error {
  constructor(modelName: string, field: string) {
    super(`Unknown field '${field}' on '${modelName}'.`);
    this.name = 'UnknownFieldError';
  }
}

export class UnsupportedOperatorError extends Error {
  constructor(operator: string) {
    super(`Unsupported filter operator '${operator}'.`);
    this.name = 'UnsupportedOperatorError';
  }
}

export class UnsafeIdentifierError extends Error {
  constructor(identifier: string, context: string) {
    super(`Unsafe SQL identifier '${identifier}' in ${context}. Identifiers must match /^[a-z][a-z0-9_]{0,62}$/.`);
    this.name = 'UnsafeIdentifierError';
  }
}

export class SelectionValueError extends Error {
  constructor(model: string, field: string, value: unknown, allowed: string[]) {
    super(`Invalid selection value '${String(value)}' for field '${field}' on model '${model}'. Allowed: ${allowed.join(', ')}.`);
    this.name = 'SelectionValueError';
  }
}

export function isSystemScope(scope: TenantScope | undefined): scope is { systemScope: true } {
  return scope !== undefined && (scope as { systemScope?: boolean }).systemScope === true;
}

export function tenantCompanyId(scope: TenantScope): number {
  if (isSystemScope(scope)) {
    throw new Error('systemScope carries no single tenant id.');
  }
  const companyId = Number(scope.companyId);
  // Personal tenants live in the negative namespace, so only 0 and NaN are unusable.
  if (!Number.isSafeInteger(companyId) || companyId === 0) {
    throw new Error(`Invalid tenant company_id '${String(scope.companyId)}'.`);
  }
  return companyId;
}

export class QueryBuilder {
  constructor(private readonly model: ModelDefinition) {}

  private assertColumn(modelName: string, field: string): void {
    if (!RESERVED_COLUMN_SET.has(field) && !(field in this.model.fields)) {
      throw new UnknownFieldError(modelName, field);
    }
  }

  private column(field: string): string {
    this.assertColumn(this.model.name, field);
    return `"${field}"`;
  }

  private scopeClause(scope: TenantScope | undefined, params: unknown[]): string[] {
    if (scope === undefined) throw new TenantScopeRequiredError(this.model.name);
    if (isSystemScope(scope)) return [];
    params.push(tenantCompanyId(scope));
    return [`"company_id" = $${params.length}`];
  }

  // Compile one `['field', op, value]` predicate into a parameterized clause.
  // Both the flat `filters` path and every nested `domain` leaf go through here,
  // so the column allowlist and placeholder numbering have exactly one owner.
  private compileLeaf(field: string, operator: QueryFilter['operator'], value: unknown, params: unknown[]): string {
    const column = this.column(field);
    const op = operator.toUpperCase();
    if (!SUPPORTED_OPERATORS.has(op)) throw new UnsupportedOperatorError(operator);
    if (op === 'IN' || op === 'NOT IN') {
      const values = Array.isArray(value) ? value : [value];
      if (values.length === 0) throw new Error(`'${field}' IN requires at least one value.`);
      const placeholders = values.map((v) => {
        params.push(v);
        return `$${params.length}`;
      });
      return `${column} ${op} (${placeholders.join(', ')})`;
    }
    if (value === null && op === '=') return `${column} IS NULL`;
    if (value === null && op === '!=') return `${column} IS NOT NULL`;
    params.push(value);
    return `${column} ${op} $${params.length}`;
  }

  // Recursive prefix-domain compiler. A node is logical only when its head is a
  // join/negation operator AND it has the right arity; anything else is a leaf.
  private compileDomain(node: DomainNode, params: unknown[]): string {
    const head = Array.isArray(node) ? node[0] : undefined;
    const isJoin = (head === '&' || head === '|') && node.length === 3;
    const isNot = head === '!' && node.length === 2;
    if (isJoin) {
      const parts = node as ['&' | '|', DomainNode, DomainNode];
      const left = this.compileDomain(parts[1], params);
      const right = this.compileDomain(parts[2], params);
      return `(${left} ${head === '&' ? 'AND' : 'OR'} ${right})`;
    }
    if (isNot) {
      const operand = this.compileDomain((node as ['!', DomainNode])[1], params);
      return `(NOT ${operand})`;
    }
    const leaf = node as DomainLeaf;
    return this.compileLeaf(leaf[0], leaf[1], leaf[2], params);
  }

  // Shared WHERE clause + params for every read builder. Pagination, projection
  // and ordering are layered on by each caller, never here, so `buildCount` can
  // reuse the exact same predicate set without a regex rewrite.
  private buildWhere(options: QueryOptions): { whereSql: string; params: unknown[] } {
    const params: unknown[] = [];
    // Archived rows are excluded by default; `includeArchived` opts out of the
    // `active = true` predicate without touching the tenant scope.
    const activeClause = options.includeArchived ? [] : ['"active" = true'];
    const whereClauses: string[] = [...activeClause, ...this.scopeClause(options.scope, params)];

    if (options.domain) {
      whereClauses.push(this.compileDomain(options.domain, params));
    }

    // Record rules narrow visibility: AND the resolved rule predicate after the
    // caller's own domain. A rule that references an unknown column throws here
    // (fail closed) instead of silently returning rows the policy should hide.
    if (options.securityDomain) {
      whereClauses.push(`(${this.compileDomain(options.securityDomain, params)})`);
    }

    if (options.filters) {
      const filterClauses = options.filters.map((filter) =>
        this.compileLeaf(filter.field, filter.operator, filter.value, params),
      );
      // Fold left-to-right with explicit parentheses, so SQL operator precedence
      // (AND binds tighter than OR) can never silently regroup a mixed chain —
      // the qorpus-search accident this replaces. A single clause needs no group.
      const combined = filterClauses.reduce((sql, clause, index) => {
        if (index === 0) return clause;
        const connector = options.filters?.[index].connector === 'OR' ? 'OR' : 'AND';
        return `(${sql} ${connector} ${clause})`;
      }, '');
      whereClauses.push(`(${combined})`);
    }

    return { whereSql: whereClauses.join(' AND '), params };
  }

  // Project only whitelisted columns; default remains `SELECT *`.
  private resolveProjection(fields?: string[]): string {
    if (!fields || fields.length === 0) return '*';
    return fields.map((field) => this.column(field)).join(', ');
  }

  buildSelect(options: QueryOptions): { sql: string; params: unknown[] } {
    const { whereSql, params } = this.buildWhere(options);
    let sql = `SELECT ${this.resolveProjection(options.fields)} FROM "${this.model.tableName}" WHERE ${whereSql}`;

    if (options.orderBy) {
      const dir = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
      sql += ` ORDER BY ${this.column(options.orderBy)} ${dir}`;
    }

    if (options.limit) {
      params.push(options.limit);
      sql += ` LIMIT $${params.length}`;
    }

    if (options.offset) {
      params.push(options.offset);
      sql += ` OFFSET $${params.length}`;
    }

    // Row-level lock goes last, after LIMIT/OFFSET, per PostgreSQL grammar.
    if (options.forUpdate === 'skip_locked') sql += ' FOR UPDATE SKIP LOCKED';
    else if (options.forUpdate) sql += ' FOR UPDATE';

    return { sql, params };
  }

  buildCount(options: QueryOptions): { sql: string; params: unknown[] } {
    // Built from the same clause arrays as buildSelect — no `SELECT *` regex
    // swap, so a column literally named `count` (or any projection) is safe.
    const { whereSql, params } = this.buildWhere({ ...options, filters: options.filters, domain: options.domain });
    return {
      sql: `SELECT COUNT(*)::integer AS count FROM "${this.model.tableName}" WHERE ${whereSql}`,
      params,
    };
  }

  // Grouped aggregate read (Odoo `read_group`). `groupBy` columns and every
  // aggregated field go through the same allowlist as the plain select; the
  // aggregate function set is fixed and sum/avg/min/max are only allowed over
  // numeric-typed fields, so no operator or column name is ever user-controlled.
  buildReadGroup(
    options: QueryOptions,
    spec: { groupBy: string[]; aggregates: GroupAggregate[] }
  ): { sql: string; params: unknown[] } {
    if (spec.groupBy.length === 0 && spec.aggregates.length === 0) {
      throw new Error('read_group requires at least one groupBy field or aggregate.');
    }
    const { whereSql, params } = this.buildWhere({
      scope: options.scope,
      filters: options.filters,
      domain: options.domain,
      securityDomain: options.securityDomain,
      includeArchived: options.includeArchived,
    });

    const selectParts: string[] = spec.groupBy.map((field) => this.column(field));
    for (const aggregate of spec.aggregates) {
      if (!isSafeIdentifier(aggregate.alias)) {
        throw new UnsafeIdentifierError(aggregate.alias, 'readGroup aggregate alias');
      }
      if (aggregate.fn === 'count') {
        selectParts.push(`COUNT(*)::integer AS "${aggregate.alias}"`);
        continue;
      }
      const fieldDef = this.model.fields[aggregate.field];
      if (!fieldDef || (fieldDef.type !== 'integer' && fieldDef.type !== 'float')) {
        throw new UnknownFieldError(this.model.name, aggregate.field);
      }
      const column = this.column(aggregate.field);
      selectParts.push(`${aggregate.fn.toUpperCase()}(${column})::numeric AS "${aggregate.alias}"`);
    }

    let sql = `SELECT ${selectParts.join(', ')} FROM "${this.model.tableName}" WHERE ${whereSql}`;
    if (spec.groupBy.length > 0) {
      sql += ` GROUP BY ${spec.groupBy.map((field) => this.column(field)).join(', ')}`;
      sql += ` ORDER BY ${spec.groupBy.map((field) => `${this.column(field)} ASC`).join(', ')}`;
    }
    if (options.limit) {
      params.push(options.limit);
      sql += ` LIMIT $${params.length}`;
    }
    return { sql, params };
  }

  // Keyset (seek) pagination over a stable `(column, id)` ordering. The offset
  // path in buildSelect is kept but legacy; this avoids O(offset) scans.
  buildKeyset(
    options: QueryOptions,
    keyset: { column: string; after?: KeysetCursor }
  ): { sql: string; params: unknown[] } {
    const { whereSql, params } = this.buildWhere(options);
    const column = this.column(keyset.column);
    let sql = `SELECT ${this.resolveProjection(options.fields)} FROM "${this.model.tableName}" WHERE ${whereSql}`;
    if (keyset.after) {
      params.push(keyset.after.columnValue, keyset.after.id);
      sql += ` AND (${column}, "id") > ($${params.length - 1}, $${params.length})`;
    }
    sql += ` ORDER BY ${column} ASC, "id" ASC`;
    const limit = options.limit && options.limit > 0 ? options.limit : 50;
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    return { sql, params };
  }

  private assertAuditActor(actorId: number): void {
    if (!Number.isSafeInteger(actorId) || actorId < 1) {
      throw new Error('Audit actor must be a positive res.users ID.');
    }
  }

  private assertWritableField(field: string, allowCompanyId = false): void {
    if (allowCompanyId && field === 'company_id') return;
    if (RESERVED_COLUMN_SET.has(field) || field === 'create_date' || field === 'write_date') {
      throw new Error(`Field '${field}' is managed by the ORM.`);
    }
    this.assertColumn(this.model.name, field);
  }

  // The single tenant predicate for write/delete paths. Unlike buildSelect (where
  // systemScope means "all tenants" and adds no filter), a mutation must always
  // pin a concrete company_id so a system-scoped write names its tenant. This
  // replaces the ~12-line block that was duplicated across the three builders.
  private mutationScopeClause(scope: TenantScope, params: unknown[]): string {
    const companyId = isSystemScope(scope)
      ? scope.companyId === undefined
        ? (() => {
            throw new Error(`System write on '${this.model.name}' must name a companyId.`);
          })()
        : Number(scope.companyId)
      : tenantCompanyId(scope);
    if (!Number.isSafeInteger(companyId) || (!isSystemScope(scope) && companyId === 0)) {
      throw new Error(`Invalid tenant company_id '${String(companyId)}'.`);
    }
    params.push(companyId);
    return `"company_id" = $${params.length}`;
  }

  buildInsert(
    data: Record<string, unknown>,
    scope: TenantScope,
    actorId: number
  ): { sql: string; params: unknown[] } {
    this.assertAuditActor(actorId);
    const columns: string[] = [];
    const placeholders: string[] = [];
    const params: unknown[] = [];
    const values: Array<[string, unknown]> = [];

    for (const [key, value] of Object.entries(data)) {
      if (key === 'company_id' && !isSystemScope(scope)) continue;
      this.assertWritableField(key, isSystemScope(scope));
      values.push([key, value]);
    }

    for (const [key, value] of values) {
      columns.push(`"${key}"`);
      params.push(value);
      placeholders.push(`$${params.length}`);
    }

    if (isSystemScope(scope)) {
      if (data.company_id === undefined) {
        throw new Error(`Insert into '${this.model.name}' with systemScope must supply an explicit company_id.`);
      }
    } else {
      columns.push('"company_id"');
      params.push(tenantCompanyId(scope));
      placeholders.push(`$${params.length}`);
    }

    columns.push('"create_uid"', '"write_uid"');
    params.push(actorId, actorId);
    placeholders.push(`$${params.length - 1}`, `$${params.length}`);

    const sql = `
      INSERT INTO "${this.model.tableName}" (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *;
    `;

    return { sql, params };
  }

  // Multi-row insert for batched writes (roadmap T14): one parameterized
  // statement, one audit trigger execution set, N rows. Every row must share the
  // same column shape; company_id is pinned to the tenant (tenant scope) or
  // supplied per row (system scope), and create_uid/write_uid come from the
  // actor exactly as in the single-row path.
  buildInsertMany(
    rows: Record<string, unknown>[],
    scope: TenantScope,
    actorId: number
  ): { sql: string; params: unknown[] } {
    this.assertAuditActor(actorId);
    if (rows.length === 0) {
      return { sql: '', params: [] };
    }

    const dataColumns = Object.keys(rows[0]).filter((key) => {
      if (key === 'company_id') return false;
      this.assertWritableField(key, isSystemScope(scope));
      return true;
    });
    const allowed = new Set<string>([...dataColumns, 'company_id']);

    const params: unknown[] = [];
    const tuples: string[] = [];
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!allowed.has(key)) {
          throw new UnknownFieldError(this.model.name, key);
        }
      }
      const placeholders: string[] = [];
      for (const key of dataColumns) {
        params.push(row[key] ?? null);
        placeholders.push(`$${params.length}`);
      }
      if (isSystemScope(scope)) {
        if (row.company_id === undefined) {
          throw new Error(`Insert into '${this.model.name}' with systemScope must supply an explicit company_id.`);
        }
        params.push(row.company_id);
      } else {
        params.push(tenantCompanyId(scope));
      }
      placeholders.push(`$${params.length}`);
      params.push(actorId, actorId);
      placeholders.push(`$${params.length - 1}`, `$${params.length}`);
      tuples.push(`(${placeholders.join(', ')})`);
    }

    const columns = [...dataColumns.map((c) => `"${c}"`), '"company_id"', '"create_uid"', '"write_uid"'];
    const sql = `
      INSERT INTO "${this.model.tableName}" (${columns.join(', ')})
      VALUES ${tuples.join(', ')}
      RETURNING *;
    `;
    return { sql, params };
  }

  buildUpdate(
    id: string | number,
    data: Record<string, unknown>,
    scope: TenantScope,
    actorId: number,
    expected: Record<string, unknown> = {}
  ): { sql: string; params: unknown[] } {
    this.assertAuditActor(actorId);
    const params: unknown[] = [];
    const assignments: string[] = [];
    const conditions = ['"active" = true'];

    for (const [field, value] of Object.entries(data)) {
      this.assertWritableField(field, isSystemScope(scope));
      params.push(value);
      assignments.push(`${this.column(field)} = $${params.length}`);
    }
    if (assignments.length === 0) {
      throw new Error('An update must include at least one field.');
    }
    params.push(id);
    conditions.push(`"id" = $${params.length}`);
    conditions.push(this.mutationScopeClause(scope, params));

    for (const [field, value] of Object.entries(expected)) {
      this.assertWritableField(field, isSystemScope(scope));
      params.push(value);
      conditions.push(`${this.column(field)} = $${params.length}`);
    }

    params.push(actorId);
    assignments.push(`"write_uid" = $${params.length}`);

    return {
      sql: `UPDATE "${this.model.tableName}" SET ${assignments.join(', ')}, "write_date" = CURRENT_TIMESTAMP WHERE ${conditions.join(' AND ')} RETURNING *;`,
      params,
    };
  }

  buildIncrementUpdate(
    id: string | number,
    increments: Record<string, number>,
    data: Record<string, unknown>,
    scope: TenantScope,
    actorId: number
  ): { sql: string; params: unknown[] } {
    this.assertAuditActor(actorId);
    const params: unknown[] = [];
    const assignments: string[] = [];

    for (const [field, value] of Object.entries(data)) {
      this.assertWritableField(field, isSystemScope(scope));
      params.push(value);
      assignments.push(`${this.column(field)} = $${params.length}`);
    }

    for (const [field, increment] of Object.entries(increments)) {
      this.assertWritableField(field, isSystemScope(scope));
      if (!Number.isFinite(increment)) {
        throw new Error(`Increment for '${field}' must be a finite number.`);
      }
      params.push(increment);
      const column = this.column(field);
      assignments.push(`${column} = COALESCE(${column}, 0) + $${params.length}`);
    }

    if (assignments.length === 0) {
      throw new Error('An increment update must include at least one field.');
    }

    const conditions = ['"active" = true'];
    params.push(id);
    conditions.push(`"id" = $${params.length}`);
    conditions.push(this.mutationScopeClause(scope, params));
    params.push(actorId);
    assignments.push(`"write_uid" = $${params.length}`);

    return {
      sql: `UPDATE "${this.model.tableName}" SET ${assignments.join(', ')}, "write_date" = CURRENT_TIMESTAMP WHERE ${conditions.join(' AND ')} RETURNING *;`,
      params,
    };
  }

  buildDelete(id: string | number, scope: TenantScope): { sql: string; params: unknown[] } {
    const params: unknown[] = [id];
    const companyClause = this.mutationScopeClause(scope, params);

    return {
      sql: `DELETE FROM "${this.model.tableName}" WHERE "active" = true AND "id" = $1 AND ${companyClause} RETURNING "id";`,
      params,
    };
  }

  // Archive / unarchive: a lifecycle flip on the reserved `active` column, which
  // buildUpdate refuses to write. Pinned to the tenant scope and only touches
  // rows currently in the opposite state, so re-archiving is a no-op. Runs
  // through the audit-context transaction so the row trigger captures it.
  buildArchive(
    ids: Array<string | number>,
    active: boolean,
    scope: TenantScope,
    actorId: number
  ): { sql: string; params: unknown[] } {
    this.assertAuditActor(actorId);
    if (ids.length === 0) {
      throw new Error(`'${this.model.name}' archive requires at least one id.`);
    }
    const params: unknown[] = [];
    params.push(active);
    const setTarget = `$${params.length}`;
    params.push(actorId);
    const setWriter = `$${params.length}`;
    const idPlaceholders = ids.map((id) => {
      params.push(id);
      return `$${params.length}`;
    });
    const companyClause = this.mutationScopeClause(scope, params);
    // Precondition: only flip rows that are not already in the target state.
    const precondition = active ? '"active" = false' : '"active" = true';
    const sql = `UPDATE "${this.model.tableName}" SET "active" = ${setTarget}, "write_uid" = ${setWriter}, "write_date" = CURRENT_TIMESTAMP WHERE ${precondition} AND "id" IN (${idPlaceholders.join(', ')}) AND ${companyClause} RETURNING "id";`;
    return { sql, params };
  }

  // Cast a bound value to the column's Postgres type so a heterogeneous VALUES
  // list (which may carry NULLs) still has a concrete inferred column type.
  private valueCastFor(field: string): string {
    if (field === 'id') return 'integer';
    const def = this.model.fields[field];
    switch (def?.type) {
      case 'integer':
      case 'many2one':
        return 'integer';
      case 'float':
        return 'double precision';
      case 'boolean':
        return 'boolean';
      case 'datetime':
        return 'timestamptz';
      case 'json':
        return 'jsonb';
      default:
        // char/text/selection and every unknown field arrive as text.
        return 'text';
    }
  }

  // Set-based batched update (roadmap T2.4b). One `UPDATE … FROM (VALUES …)`
  // statement replaces the per-row loop, but rows that touch different column
  // sets cannot share a statement, so we group them by their sorted column
  // signature and emit one statement per (group, chunk). Chunks stay under the
  // 65535-parameter cap. PostgreSQL fires the row-level BEFORE/AFTER triggers
  // once per updated row, so the audit + sync event families still capture every
  // change exactly as the single-row path did.
  buildUpdateMany(
    updates: Array<{ id: string | number; data: Record<string, unknown> }>,
    scope: TenantScope,
    actorId: number
  ): Array<{ sql: string; params: unknown[] }> {
    this.assertAuditActor(actorId);
    if (updates.length === 0) return [];

    type Shape = { cols: string[]; rows: Array<{ id: string | number; data: Record<string, unknown> }> };
    const shapes = new Map<string, Shape>();
    for (const update of updates) {
      const cols = Object.keys(update.data);
      if (cols.length === 0) throw new Error('An update must include at least one field.');
      for (const field of cols) this.assertWritableField(field, isSystemScope(scope));
      const sorted = [...cols].sort();
      const key = sorted.join(',');
      let shape = shapes.get(key);
      if (!shape) {
        shape = { cols: sorted, rows: [] };
        shapes.set(key, shape);
      }
      shape.rows.push(update);
    }

    const statements: Array<{ sql: string; params: unknown[] }> = [];
    for (const shape of shapes.values()) {
      // id + one value per column, plus room for actor + company scalars.
      const perRow = shape.cols.length + 1;
      const chunkSize = Math.max(1, Math.min(1000, Math.floor(60000 / (perRow + 2))));
      const valueColumns = ['id', ...shape.cols].map((c) => `"${c}"`).join(', ');
      const assignments = shape.cols.map((c) => `"${c}" = v."${c}"`).join(', ');

      for (let start = 0; start < shape.rows.length; start += chunkSize) {
        const chunk = shape.rows.slice(start, start + chunkSize);
        const params: unknown[] = [];
        const tuples = chunk.map((row) => {
          const parts = [`$${params.push(row.id) || params.length}::integer`];
          for (const col of shape.cols) {
            const ref = `$${params.push(row.data[col] ?? null) || params.length}`;
            parts.push(`${ref}::${this.valueCastFor(col)}`);
          }
          return `(${parts.join(', ')})`;
        });
        params.push(actorId);
        const actorRef = `$${params.length}`;
        const companyClause = this.mutationScopeClause(scope, params);
        statements.push({
          sql:
            `UPDATE "${this.model.tableName}" AS t SET ${assignments}, "write_uid" = ${actorRef}, `
            + `"write_date" = CURRENT_TIMESTAMP FROM (VALUES ${tuples.join(', ')}) AS v(${valueColumns}) `
            + `WHERE t."id" = v."id" AND t."active" = true AND ${companyClause} RETURNING t.*;`,
          params,
        });
      }
    }
    return statements;
  }
}
