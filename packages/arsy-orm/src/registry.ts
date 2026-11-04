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

export class ModelRegistry {
  private models = new Map<string, ModelDefinition>();
  private tableMap = new Map<string, ModelDefinition>();

  register(model: ModelDefinition, options: RegisterOptions = {}): this {
    // Re-registering the identical definition (shared module instance) is idempotent.
    // A different object claiming the same name or table is a wiring bug — fail closed.
    if (!options.overwrite) {
      const byName = this.models.get(model.name);
      if (byName && byName !== model) {
        throw new ModelCollisionError(model.name, byName.tableName, model.tableName);
      }
      const byTable = this.tableMap.get(model.tableName);
      if (byTable && byTable !== model) {
        throw new ModelCollisionError(model.tableName, byTable.name, model.name);
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

