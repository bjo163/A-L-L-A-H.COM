import crypto from 'crypto';

/**
 * The tenant/audit column contract, defined once and shared by the query
 * builder, the schema migrator, and the audit-trigger SQL. Previously this list
 * was duplicated in three places, so any drift silently widened or narrowed the
 * surface the ORM considers "managed". (roadmap T9)
 */
export const RESERVED_COLUMNS = [
  'id',
  'active',
  'create_date',
  'write_date',
  'create_uid',
  'write_uid',
  'company_id',
] as const;

export const RESERVED_COLUMN_SET: ReadonlySet<string> = new Set<string>(RESERVED_COLUMNS);

/**
 * Columns the audit change-capture must never report as a business-field edit
 * (identity + lifecycle bookkeeping). This is RESERVED_COLUMNS minus the
 * tenant/active flags, which ARE meaningful audit deltas.
 */
export const AUDIT_EXCLUDED_COLUMNS: readonly string[] = [
  'id',
  'create_date',
  'write_date',
  'create_uid',
  'write_uid',
];

/** Render a column list as a SQL inline list, e.g. `'id', 'write_uid'`. */
export function sqlQuotedColumnList(columns: readonly string[]): string {
  return columns.map((column) => `'${column}'`).join(', ');
}

/**
 * Identifier guard for SQL interpolation: table/column/alias names are interpolated
 * directly (they cannot be parameterized in DDL or query compilation), so restrict
 * them to a conservative safe set before emitting any SQL statement. Single owner
 * for the whole ORM (roadmap S1.1, audit R01).
 */
export function isSafeIdentifier(name: string): boolean {
  return /^[a-z][a-z0-9_]{0,62}$/.test(name);
}

/**
 * One SHA-256 helper for the whole platform. Replaces the ~11 independent
 * `crypto.createHash('sha256')...digest('hex')` reimplementations across the
 * addons and packages (roadmap T9). Accepts text or raw bytes.
 */
export function sha256Hex(input: string | Buffer | Uint8Array): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}
