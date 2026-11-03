import { ModelDefinition } from './model';

export interface QueryFilter {
  field: string;
  operator: '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'ILIKE' | 'IN';
  value: unknown;
}

export interface QueryOptions {
  companyId?: string | number | null;
  filters?: QueryFilter[];
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export class QueryBuilder {
  constructor(private readonly model: ModelDefinition) {}

  buildSelect(options: QueryOptions = {}): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const whereClauses: string[] = ['active = true'];

    // Fail-closed tenant isolation
    if (options.companyId !== undefined && options.companyId !== null) {
      params.push(options.companyId);
      whereClauses.push(`company_id = $${params.length}`);
    }

    if (options.filters) {
      for (const filter of options.filters) {
        params.push(filter.value);
        whereClauses.push(`"${filter.field}" ${filter.operator} $${params.length}`);
      }
    }

    let sql = `SELECT * FROM "${this.model.tableName}" WHERE ${whereClauses.join(' AND ')}`;

    if (options.orderBy) {
      const dir = options.orderDirection || 'ASC';
      sql += ` ORDER BY "${options.orderBy}" ${dir}`;
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

  buildInsert(data: Record<string, unknown>, companyId?: string | number | null): { sql: string; params: unknown[] } {
    const fields: string[] = [];
    const placeholders: string[] = [];
    const params: unknown[] = [];

    const payload = { ...data };
    if (companyId !== undefined && companyId !== null) {
      payload.company_id = companyId;
    }

    for (const [key, val] of Object.entries(payload)) {
      fields.push(`"${key}"`);
      params.push(val);
      placeholders.push(`$${params.length}`);
    }

    const sql = `
      INSERT INTO "${this.model.tableName}" (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *;
    `;

    return { sql, params };
  }

  buildUpdate(
    id: string | number,
    data: Record<string, unknown>,
    companyId: string | number,
    expected: Record<string, unknown> = {}
  ): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const assignments: string[] = [];
    const conditions = ['active = true'];
    const validFields = new Set(Object.keys(this.model.fields));

    for (const [field, value] of Object.entries(data)) {
      if (!validFields.has(field)) {
        throw new Error(`Cannot update unknown field '${field}' on '${this.model.name}'.`);
      }
      params.push(value);
      assignments.push(`"${field}" = $${params.length}`);
    }
    if (assignments.length === 0) {
      throw new Error('An update must include at least one field.');
    }

    params.push(id);
    conditions.push(`id = $${params.length}`);
    params.push(companyId);
    conditions.push(`company_id = $${params.length}`);

    for (const [field, value] of Object.entries(expected)) {
      if (!validFields.has(field)) {
        throw new Error(`Cannot match unknown field '${field}' on '${this.model.name}'.`);
      }
      params.push(value);
      conditions.push(`"${field}" = $${params.length}`);
    }

    return {
      sql: `UPDATE "${this.model.tableName}" SET ${assignments.join(', ')}, write_date = CURRENT_TIMESTAMP WHERE ${conditions.join(' AND ')} RETURNING *;`,
      params,
    };
  }
}
