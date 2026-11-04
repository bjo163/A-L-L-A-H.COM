import { ModelDefinition } from './model';
import { singleton } from './singleton';

export class ModelRegistry {
  private models = new Map<string, ModelDefinition>();
  private tableMap = new Map<string, ModelDefinition>();

  register(model: ModelDefinition): this {
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

