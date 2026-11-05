import { FieldDefinition } from './fields';

export interface ModelAudit {
  id: string;
  active: boolean;
  create_date: string;
  write_date: string;
  create_uid: number;
  write_uid: number;
  company_id?: string | number | null;
}

export type AuditActor = (
  | { type: 'user'; userId: number }
  | { type: 'system' }
) & {
  reasonHash?: string;
  requestId?: string;
  globalAccess?: boolean;
};

export const SYSTEM_ACTOR: AuditActor = { type: 'system' };

export interface ModelIndex {
  name?: string;
  fields: string[];
  unique?: boolean;
}

/**
 * A per-model compute handler. Receives the materialized record (with any
 * expanded relations / already-computed fields available on it) and returns the
 * derived value. Registered beside `defineModel` via `model.compute(name, fn)`
 * and referenced by a field's `compute` key (roadmap T2.3).
 */
export type ComputeHandler = (record: Record<string, unknown>) => unknown;

export interface ModelConfig<TFields extends Record<string, FieldDefinition>> {
  name: string; // e.g. 'res.partner'
  tableName: string; // e.g. 'res_partner'
  displayName?: string;
  // Field used to render a record's display name for `name_search` (roadmap
  // T2.2). Falls back to 'name' when present, else the first char field.
  displayNameSpec?: string;
  fields: TFields;
  indexes?: ModelIndex[];
}

export class ModelDefinition<TFields extends Record<string, FieldDefinition> = Record<string, FieldDefinition>> {
  public readonly name: string;
  public readonly tableName: string;
  public readonly displayName: string;
  public readonly displayNameSpec?: string;
  public readonly fields: TFields;
  public readonly indexes: ModelIndex[];
  private readonly computeHandlers = new Map<string, ComputeHandler>();

  constructor(config: ModelConfig<TFields>) {
    this.name = config.name;
    this.tableName = config.tableName;
    this.displayName = config.displayName || config.name;
    this.displayNameSpec = config.displayNameSpec;
    this.fields = config.fields;
    this.indexes = config.indexes || [];
  }

  // Register a compute handler under a name; a field opts in by setting
  // `compute: '<name>'`. Returns the model so it chains off `defineModel(...)`.
  compute(name: string, handler: ComputeHandler): this {
    this.computeHandlers.set(name, handler);
    return this;
  }

  getComputeHandler(name: string): ComputeHandler | undefined {
    return this.computeHandlers.get(name);
  }
}

export function defineModel<TFields extends Record<string, FieldDefinition>>(
  config: ModelConfig<TFields>
): ModelDefinition<TFields> {
  return new ModelDefinition(config);
}
