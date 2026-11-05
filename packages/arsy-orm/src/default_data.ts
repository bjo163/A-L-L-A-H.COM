import { BaseRepository } from './repository';
import { AuditActor } from './model';
import { TenantScope, QueryFilter, QueryOptions } from './query_builder';

/**
 * The structural surface a seed step needs from a repository, so a caller can
 * pass either a concrete `BaseRepository` or a duck-typed subset. `find` and
 * `createMany` are the only two operations default data ever performs.
 */
export interface SeedRepositoryLike {
  find(options: QueryOptions): Promise<Record<string, unknown>[]>;
  createMany(rows: Record<string, unknown>[], scope: TenantScope, actor: AuditActor): Promise<unknown[]>;
}

/**
 * A minimal seam a default-data module needs from the query layer: a way to
 * resolve a repository by model name and the audit actor to write as. Addons
 * never touch `dbEngine` directly; the hub satisfies this with a factory over
 * `modelRegistry` plus `SYSTEM_ACTOR` (mirrors `apps/arsy/src/seed.ts`).
 */
export interface SeedContext {
  repository(modelName: string): BaseRepository<Record<string, unknown>>;
  actor: AuditActor;
}

/**
 * One idempotent dataset: a model, the natural key fields that identify a row
 * (single or composite, e.g. `['code']` or `['lang', 'name', 'type']`), and the
 * rows to insert when they are missing.
 */
export interface SeedDataset {
  model: string;
  keyFields: string[];
  rows: Record<string, unknown>[];
}

export interface SeedResultEntry {
  model: string;
  created: number;
}

export type SeedResult = SeedResultEntry[];

// Platform-owned reference rows live at the shared tenant, the same convention
// `works` and the i18n catalogs already use.
export const PLATFORM_COMPANY_ID = 0;

// A bounded scan guard: seeding reads the candidate rows once per dataset. A
// dataset that legitimately exceeds this is a design smell worth failing on.
const MAX_SEED_SCAN = 10_000;

function compositeKey(row: Record<string, unknown>, keyFields: string[]): string {
  return keyFields.map((field) => JSON.stringify(row[field] ?? null)).join('|');
}

/**
 * Idempotently insert a dataset's missing rows through the ORM. One scoped read
 * fetches the candidate universe (every key field constrained by an `IN` filter,
 * ANDed), rows already present are matched on their exact composite key, and the
 * remainder is written in a single batched `createMany` — never raw SQL, always
 * tenant-scoped and audit-logged. Re-running inserts nothing new.
 */
export async function seedIdempotent(
  repo: SeedRepositoryLike,
  dataset: SeedDataset,
  scope: TenantScope,
  actor: AuditActor,
): Promise<number> {
  const { keyFields, rows } = dataset;
  if (rows.length === 0) return 0;
  if (keyFields.length === 0) {
    throw new Error(`Seed dataset '${dataset.model}' must declare at least one keyField for idempotent insert.`);
  }

  const filters: QueryFilter[] = keyFields.map((field) => ({
    field,
    operator: 'IN',
    value: Array.from(new Set(rows.map((row) => row[field]))),
  }));

  const existing = await repo.find({ scope, filters, limit: MAX_SEED_SCAN });
  if (existing.length >= MAX_SEED_SCAN) {
    throw new Error(
      `Seed scan for '${dataset.model}' hit the ${MAX_SEED_SCAN}-row guard; narrow the dataset or its key fields.`
    );
  }

  const present = new Set(existing.map((row) => compositeKey(row, keyFields)));
  const missing = rows.filter((row) => !present.has(compositeKey(row, keyFields)));

  if (missing.length > 0) {
    await repo.createMany(missing, scope, actor);
  }
  return missing.length;
}

/**
 * Run a list of datasets for one addon against a scope, stamping the platform
 * company id when a row omits it. Returns a per-model created count so the boot
 * loader can log an honest summary.
 */
export async function seedDatasets(
  ctx: SeedContext,
  datasets: SeedDataset[],
  scope: TenantScope = { systemScope: true },
): Promise<SeedResult> {
  const result: SeedResult = [];
  for (const dataset of datasets) {
    const rows = dataset.rows.map((row) =>
      row.company_id === undefined ? { ...row, company_id: PLATFORM_COMPANY_ID } : row
    );
    const repo = ctx.repository(dataset.model);
    const created = await seedIdempotent(repo, { ...dataset, rows }, scope, ctx.actor);
    result.push({ model: dataset.model, created });
  }
  return result;
}

/** Sum the rows created across a seed result, for one-line boot logging. */
export function totalCreated(result: SeedResult): number {
  return result.reduce((sum, entry) => sum + entry.created, 0);
}
