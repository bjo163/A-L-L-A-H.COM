import { PGliteEngine, dbEngine } from './engine';
import { ModelDefinition } from './model';
import { QueryBuilder, QueryOptions } from './query_builder';
import { logger } from '@allah/arsy-core';

/**
 * Simple LRU cache for translations
 * Key format: `${modelName}:${recordId}:${fieldName}:${lang}:${companyId}`
 */
class TranslationCache {
  private cache: Map<string, { value: string; expiry: number }> = new Map();
  private readonly maxSize = 1000;
  private readonly ttlMs = 5 * 60 * 1000; // 5 minutes

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      for (const [oldKey] of this.cache) {
        this.cache.delete(oldKey);
        break;
      }
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + this.ttlMs,
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const translationCache = new TranslationCache();

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
    const rows = await this.engine.query<T>(sql, params);

    // Apply transparent field translation if context.lang is provided
    if (options.lang && rows.length > 0) {
      return this._applyTranslations(rows, options.lang, options.companyId);
    }

    return rows;
  }

  async findById(id: string | number, companyId?: string | number | null, lang?: string): Promise<T | null> {
    const options: QueryOptions = {
      companyId,
      lang,
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

  private async _applyTranslations(
    rows: T[],
    lang: string,
    companyId: string | number | null
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

    const translationQuery = `
      SELECT res_id, name, value
      FROM ir_translation
      WHERE company_id IN (0, ${companyId || 0})
        AND lang = ?
        AND type = 'model'
        AND res_id IN (${recordIds.map(() => '?').join(',')})
        AND name IN (${translatableFields.map(() => '?').join(',')})
    `;

    const translationParams = [lang, ...recordIds, ...translatableFields];
    const translations = await this.engine.query<{
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
      const rowClone = { ...row };
      const recordId = (row as any).id;
      const transMap = translationMap.get(recordId);

      if (transMap) {
        for (const fieldName of translatableFields) {
          const translated = transMap.get(fieldName);
          if (translated !== undefined) {
            rowClone[fieldName] = translated as any;
          }
        }
      }

      result.push(rowClone);
    }

    return result;
  }
}
