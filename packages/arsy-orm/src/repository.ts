import { PGliteEngine, dbEngine } from './engine';
import { ModelDefinition } from './model';
import { QueryBuilder, QueryOptions } from './query_builder';

export class BaseRepository<T = Record<string, unknown>> {
  private queryBuilder: QueryBuilder;

  constructor(
    public readonly model: ModelDefinition,
    private readonly engine: PGliteEngine = dbEngine
  ) {
    this.queryBuilder = new QueryBuilder(model);
  }

  async find(options: QueryOptions = {}): Promise<T[]> {
    const { sql, params } = this.queryBuilder.buildSelect(options);
    return this.engine.query<T>(sql, params);
  }

  async findById(id: string | number, companyId?: string | number | null): Promise<T | null> {
    const options: QueryOptions = {
      companyId,
      filters: [{ field: 'id', operator: '=', value: id }],
      limit: 1,
    };
    const rows = await this.find(options);
    return rows[0] || null;
  }

  async create(data: Record<string, unknown>, companyId?: string | number | null): Promise<T> {
    const { sql, params } = this.queryBuilder.buildInsert(data, companyId);
    const rows = await this.engine.query<T>(sql, params);
    const created = rows[0];
    if (!created) throw new Error(`Failed to create a record in '${this.model.tableName}'.`);
    return created;
  }

  async updateById(
    id: string | number,
    data: Record<string, unknown>,
    companyId: string | number,
    expected: Record<string, unknown> = {}
  ): Promise<T | null> {
    const { sql, params } = this.queryBuilder.buildUpdate(id, data, companyId, expected);
    const rows = await this.engine.query<T>(sql, params);
    return rows[0] || null;
  }
}
