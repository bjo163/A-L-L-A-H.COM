export type FieldType =
  | 'char'
  | 'text'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'datetime'
  | 'selection'
  | 'many2one'
  | 'one2many'
  | 'many2many'
  | 'json';

export interface FieldDefinition<T = unknown> {
  type: FieldType;
  label?: string;
  help?: string;
  required?: boolean;
  readonly?: boolean;
  unique?: boolean;
  default?: T | (() => T);
  relation?: string;
  selection?: Record<string, string>;
  translate?: boolean;
  primary?: boolean;
  size?: number;
  choices?: [string, string][];
}

function makeDecorator(def: FieldDefinition): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const existing = (target as any).__fieldDefinitions || {};
    existing[String(propertyKey)] = def;
    (target as any).__fieldDefinitions = existing;
  };
}

export const fields = {
  char: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> =>
    ({ type: 'char', ...opts } as FieldDefinition<string>),
  text: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> =>
    ({ type: 'text', ...opts } as FieldDefinition<string>),
  integer: (opts: Omit<FieldDefinition<number>, 'type'> = {}): FieldDefinition<number> =>
    ({ type: 'integer', ...opts } as FieldDefinition<number>),
  float: (opts: Omit<FieldDefinition<number>, 'type'> = {}): FieldDefinition<number> =>
    ({ type: 'float', ...opts } as FieldDefinition<number>),
  boolean: (opts: Omit<FieldDefinition<boolean>, 'type'> = {}): FieldDefinition<boolean> =>
    ({ type: 'boolean', default: opts.default ?? false, ...opts } as FieldDefinition<boolean>),
  datetime: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> =>
    ({ type: 'datetime', ...opts } as FieldDefinition<string>),
  selection: (
    selection: Record<string, string> | FieldDefinition<string>,
    opts: Omit<FieldDefinition<string>, 'type' | 'selection'> = {}
  ): FieldDefinition<string> => {
    if ('choices' in selection && Array.isArray((selection as any).choices)) {
      return { ...selection, type: 'selection' } as FieldDefinition<string>;
    }
    return { type: 'selection', selection: selection as Record<string, string>, ...opts } as FieldDefinition<string>;
  },
  many2one: (
    relation: string,
    opts: Omit<FieldDefinition<string | number>, 'type' | 'relation'> = {}
  ): FieldDefinition<string | number> => ({ type: 'many2one', relation, ...opts } as FieldDefinition<string | number>),
  one2many: (
    relation: string,
    opts: Omit<FieldDefinition<unknown[]>, 'type' | 'relation'> = {}
  ): FieldDefinition<unknown[]> => ({ type: 'one2many', relation, ...opts } as FieldDefinition<unknown[]>),
  json: (opts: Omit<FieldDefinition<unknown>, 'type'> = {}): FieldDefinition<unknown> =>
    ({ type: 'json', ...opts } as FieldDefinition<unknown>),
};

export const fieldDecorators = {
  char: (opts: Omit<FieldDefinition<string>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'char', ...opts }),
  text: (opts: Omit<FieldDefinition<string>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'text', ...opts }),
  integer: (opts: Omit<FieldDefinition<number>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'integer', ...opts }),
  float: (opts: Omit<FieldDefinition<number>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'float', ...opts }),
  boolean: (opts: Omit<FieldDefinition<boolean>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'boolean', default: opts.default ?? false, ...opts }),
  datetime: (opts: Omit<FieldDefinition<string>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'datetime', ...opts }),
  selection: (
    selection: Record<string, string> | FieldDefinition<string>,
    opts: Omit<FieldDefinition<string>, 'type' | 'selection'> = {}
  ): PropertyDecorator => {
    if ('choices' in selection && Array.isArray((selection as any).choices)) {
      return makeDecorator({ ...selection, type: 'selection' });
    }
    return makeDecorator({ type: 'selection', selection: selection as Record<string, string>, ...opts });
  },
  many2one: (
    relation: string,
    opts: Omit<FieldDefinition<string | number>, 'type' | 'relation'> = {}
  ): PropertyDecorator => makeDecorator({ type: 'many2one', relation, ...opts }),
  one2many: (
    relation: string,
    opts: Omit<FieldDefinition<unknown[]>, 'type' | 'relation'> = {}
  ): PropertyDecorator => makeDecorator({ type: 'one2many', relation, ...opts }),
  json: (opts: Omit<FieldDefinition<unknown>, 'type'> = {}): PropertyDecorator =>
    makeDecorator({ type: 'json', ...opts }),
};

