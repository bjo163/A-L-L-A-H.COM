import { PGliteEngine } from './engine';
import { ModelRegistry, modelRegistry } from './registry';
import { FieldDefinition } from './fields';
import { logger } from '@allah/arsy-core';

export class SchemaMigrator {
  constructor(
    private readonly engine: PGliteEngine,
    private readonly registry: ModelRegistry = modelRegistry
  ) {}

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
    const models = this.registry.getAll();
    logger.info(`Starting schema sync for ${models.length} registered models...`);

    for (const model of models) {
      const columns = [
        'id SERIAL PRIMARY KEY',
        'active BOOLEAN DEFAULT true',
        'create_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
        'write_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP',
        'create_uid VARCHAR(100)',
        'write_uid VARCHAR(100)',
        'company_id INTEGER',
      ];

      for (const [fieldName, fieldDef] of Object.entries(model.fields)) {
        const sqlType = this.mapFieldToSqlType(fieldDef);
        const nullable = fieldDef.required ? 'NOT NULL' : '';
        const unique = fieldDef.unique ? 'UNIQUE' : '';
        columns.push(`${fieldName} ${sqlType} ${nullable} ${unique}`.trim());
      }

      const createTableSql = `
        CREATE TABLE IF NOT EXISTS "${model.tableName}" (
          ${columns.join(',\n          ')}
        );
      `;
      await this.engine.exec(createTableSql);

      // Multi-tenant company_id index
      await this.engine.exec(`
        CREATE INDEX IF NOT EXISTS idx_${model.tableName}_company_id 
        ON "${model.tableName}" (company_id);
      `);

      // Custom model indexes
      for (const idx of model.indexes) {
        const idxName = idx.name || `idx_${model.tableName}_${idx.fields.join('_')}`;
        const unique = idx.unique ? 'UNIQUE' : '';
        const fieldsSql = idx.fields.map((f) => `"${f}"`).join(', ');
        await this.engine.exec(`
          CREATE ${unique} INDEX IF NOT EXISTS ${idxName} 
          ON "${model.tableName}" (${fieldsSql});
        `);
      }
    }

    logger.info('Schema sync complete.');
  }
}

