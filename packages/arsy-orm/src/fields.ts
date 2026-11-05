export type FieldType =
  | 'char'
  | 'text'
  | 'integer'
  | 'float'
  | 'decimal'
  | 'boolean'
  | 'datetime'
  | 'timestamp'
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
  uniqueScope?: 'global' | 'company';
  default?: T | (() => T);
  relation?: string;
  selection?: Record<string, string>;
  translate?: boolean;
  primary?: boolean;
  size?: number;
  choices?: [string, string][];
  // many2many join-table wiring (relation_table/column1/column2). Virtual on
  // read, but the migrator turns these into a real UNIQUE(pair) join table.
  relationTable?: string;
  column1?: string;
  column2?: string;
  // Computed / related field metadata (roadmap T2.3).
  compute?: string;
  related?: string;
  store?: boolean;
  // DECIMAL(precision, scale) wiring the migrator already reads for 'decimal'.
  precision?: number;
  scale?: number;
  // many2one FK behavior: ondelete controls what happens when the referenced
  // record is deleted. Defaults to 'set null' for optional fields, 'restrict'
  // for required fields.
  ondelete?: 'cascade' | 'set null' | 'restrict';
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
  many2many: (
    relation: string,
    rel: { relation_table: string; column1: string; column2: string },
    opts: Omit<FieldDefinition<unknown[]>, 'type' | 'relation' | 'relationTable' | 'column1' | 'column2'> = {}
  ): FieldDefinition<unknown[]> =>
    ({
      type: 'many2many',
      relation,
      relationTable: rel.relation_table,
      column1: rel.column1,
      column2: rel.column2,
      ...opts,
    }) as FieldDefinition<unknown[]>,
  json: (opts: Omit<FieldDefinition<unknown>, 'type'> = {}): FieldDefinition<unknown> =>
    ({ type: 'json', ...opts } as FieldDefinition<unknown>),
};

