import { ModelDefinition } from './model';
import { RESERVED_COLUMN_SET } from './constants';

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

export interface QueryOptions {
  scope: TenantScope;
  lang?: string;
  filters?: QueryFilter[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
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

  buildSelect(options: QueryOptions): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const whereClauses: string[] = ['"active" = true', ...this.scopeClause(options.scope, params)];

    if (options.filters) {
      const filterClauses: string[] = [];
      for (const filter of options.filters) {
        const column = this.column(filter.field);
        const operator = filter.operator.toUpperCase();
        if (!SUPPORTED_OPERATORS.has(operator)) throw new UnsupportedOperatorError(filter.operator);

        if (operator === 'IN' || operator === 'NOT IN') {
          const values = Array.isArray(filter.value) ? filter.value : [filter.value];
          if (values.length === 0) throw new Error(`'${filter.field}' IN requires at least one value.`);
          const placeholders = values.map((value) => {
            params.push(value);
            return `$${params.length}`;
          });
          filterClauses.push(`${column} ${operator} (${placeholders.join(', ')})`);
        } else if (filter.value === null && operator === '=') {
          filterClauses.push(`${column} IS NULL`);
        } else if (filter.value === null && operator === '!=') {
          filterClauses.push(`${column} IS NOT NULL`);
        } else {
          params.push(filter.value);
          filterClauses.push(`${column} ${operator} $${params.length}`);
        }
      }
      if (filterClauses.length > 0) {
        const combined = filterClauses.reduce((sql, clause, index) => {
          if (index === 0) return clause;
          const connector = options.filters?.[index].connector === 'OR' ? 'OR' : 'AND';
          return `${sql} ${connector} ${clause}`;
        }, '');
        whereClauses.push(`(${combined})`);
      }
    }

    let sql = `SELECT * FROM "${this.model.tableName}" WHERE ${whereClauses.join(' AND ')}`;

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

    return { sql, params };
  }

  buildCount(options: QueryOptions): { sql: string; params: unknown[] } {
    const select = this.buildSelect({ ...options, limit: undefined, offset: undefined, orderBy: undefined });
    return {
      sql: select.sql.replace(/^SELECT \* /, 'SELECT COUNT(*)::integer AS count '),
      params: select.params,
    };
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
}
