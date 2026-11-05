import { ModelDefinition } from './model';
import { singleton } from './singleton';

export interface RegisterOptions {
  // Explicitly replace an existing definition registered under the same name or table.
  overwrite?: boolean;
}

export class ModelCollisionError extends Error {
  constructor(modelName: string, existingTable: string, incomingTable: string) {
    super(
      `Model '${modelName}' is already registered against table '${existingTable}'; ` +
        `refusing to silently overwrite it with table '${incomingTable}'. ` +
        `Remove the duplicate definition or pass { overwrite: true }.`
    );
    this.name = 'ModelCollisionError';
  }
}

// A stable signature of a model's physical shape: name, backing table, and the
// set of fields with their type/relation/constraints. Two independently built
// module instances of the same logical model (which share the Symbol.for
// registry) produce identical signatures, whereas a divergent duplicate — the
// `works` isp_* bug — differs.
function modelSignature(model: ModelDefinition): string {
  const fieldSig = Object.entries(model.fields)
    .map(([name, def]) => {
      const selection = def.selection ? Object.keys(def.selection).sort().join('|') : '';
      const compute = def.compute ?? '';
      const related = def.related ?? '';
      return `${name}:${def.type}:${def.relation ?? ''}:${def.required ? 1 : 0}:${def.unique ? 1 : 0}:${selection}:${compute}:${related}`;
    })
    .sort()
    .join(',');
  const indexSig = model.indexes
    .map((idx) => `${idx.name ?? ''}:${idx.fields.sort().join(',')}:${idx.unique ? 1 : 0}`)
    .sort()
    .join(';');
  const computeNames = Array.from((model as any).computeHandlers?.keys() ?? []).sort().join(',');
  const displayNameSpec = model.displayNameSpec ?? '';
  return `${model.name}#${model.tableName}#${fieldSig}#${indexSig}#${computeNames}#${displayNameSpec}`;
}

export class ModelRegistry {
  private models = new Map<string, ModelDefinition>();
  private tableMap = new Map<string, ModelDefinition>();

  register(model: ModelDefinition, options: RegisterOptions = {}): this {
    const existingByName = this.models.get(model.name);
    const existingByTable = this.tableMap.get(model.tableName);

    if (!options.overwrite) {
      // A different object claiming the same name.
      if (existingByName && existingByName !== model) {
        // Structurally identical (same table + same fields): the same logical
        // model arriving from a second module instance over the shared
        // singleton registry. Treat as idempotent and keep the first.
        if (
          existingByName.tableName === model.tableName &&
          modelSignature(existingByName) === modelSignature(model)
        ) {
          return this;
        }
        // Genuinely divergent definition — fail closed.
        throw new ModelCollisionError(model.name, existingByName.tableName, model.tableName);
      }
      // A different model reaching for an already-owned table is always a bug.
      if (existingByTable && existingByTable !== model && existingByTable.name !== model.name) {
        throw new ModelCollisionError(model.tableName, existingByTable.name, model.name);
      }
    }

    this.models.set(model.name, model);
    this.tableMap.set(model.tableName, model);
    return this;
  }

  get(modelName: string): ModelDefinition | undefined {
    return this.models.get(modelName);
  }

  getByTable(tableName: string): ModelDefinition | undefined {
    return this.tableMap.get(tableName);
  }

  getAll(): ModelDefinition[] {
    return Array.from(this.models.values());
  }

  clear(): void {
    this.models.clear();
    this.tableMap.clear();
  }
}

export const modelRegistry = singleton('modelRegistry', () => new ModelRegistry());

