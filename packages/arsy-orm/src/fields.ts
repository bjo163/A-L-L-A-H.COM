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
  relation?: string; // target model name for relations (e.g. 'res.company')
  selection?: Record<string, string>;
}

export const fields = {
  char: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> => ({
    type: 'char',
    ...opts,
  }),
  text: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> => ({
    type: 'text',
    ...opts,
  }),
  integer: (opts: Omit<FieldDefinition<number>, 'type'> = {}): FieldDefinition<number> => ({
    type: 'integer',
    ...opts,
  }),
  float: (opts: Omit<FieldDefinition<number>, 'type'> = {}): FieldDefinition<number> => ({
    type: 'float',
    ...opts,
  }),
  boolean: (opts: Omit<FieldDefinition<boolean>, 'type'> = {}): FieldDefinition<boolean> => ({
    type: 'boolean',
    default: opts.default ?? false,
    ...opts,
  }),
  datetime: (opts: Omit<FieldDefinition<string>, 'type'> = {}): FieldDefinition<string> => ({
    type: 'datetime',
    ...opts,
  }),
  selection: (
    selection: Record<string, string>,
    opts: Omit<FieldDefinition<string>, 'type' | 'selection'> = {}
  ): FieldDefinition<string> => ({
    type: 'selection',
    selection,
    ...opts,
  }),
  many2one: (
    relation: string,
    opts: Omit<FieldDefinition<string | number>, 'type' | 'relation'> = {}
  ): FieldDefinition<string | number> => ({
    type: 'many2one',
    relation,
    ...opts,
  }),
  one2many: (
    relation: string,
    opts: Omit<FieldDefinition<unknown[]>, 'type' | 'relation'> = {}
  ): FieldDefinition<unknown[]> => ({
    type: 'one2many',
    relation,
    ...opts,
  }),
  json: (opts: Omit<FieldDefinition<unknown>, 'type'> = {}): FieldDefinition<unknown> => ({
    type: 'json',
    ...opts,
  }),
};

