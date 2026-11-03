import { FieldDefinition } from './fields';

export interface ModelAudit {
  id: string;
  active: boolean;
  create_date: string;
  write_date: string;
  create_uid?: string | null;
  write_uid?: string | null;
  company_id?: string | number | null;
}

export interface ModelIndex {
  name?: string;
  fields: string[];
  unique?: boolean;
}

export interface ModelConfig<TFields extends Record<string, FieldDefinition>> {
  name: string; // e.g. 'res.partner'
  tableName: string; // e.g. 'res_partner'
  displayName?: string;
  fields: TFields;
  indexes?: ModelIndex[];
}

export class ModelDefinition<TFields extends Record<string, FieldDefinition> = Record<string, FieldDefinition>> {
  public readonly name: string;
  public readonly tableName: string;
  public readonly displayName: string;
  public readonly fields: TFields;
  public readonly indexes: ModelIndex[];

  constructor(config: ModelConfig<TFields>) {
    this.name = config.name;
    this.tableName = config.tableName;
    this.displayName = config.displayName || config.name;
    this.fields = config.fields;
    this.indexes = config.indexes || [];
  }
}

export function defineModel<TFields extends Record<string, FieldDefinition>>(
  config: ModelConfig<TFields>
): ModelDefinition<TFields> {
  return new ModelDefinition(config);
}
