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

