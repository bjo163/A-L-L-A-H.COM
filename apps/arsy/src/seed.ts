import {
  BaseRepository,
  PLATFORM_COMPANY_ID,
  SYSTEM_ACTOR,
  dbEngine,
  modelRegistry,
  sha256Hex,
  totalCreated,
  type SeedContext,
  type SeedResult,
} from '@allah/arsy-orm';
import {
  DEFAULT_DATA_REGISTRY,
  DEMO_DATA_REGISTRY,
  resolveSeedOrder,
  resolveDemoSeedOrder,
} from '../../../addons/default-data';
import { resolveViewFiles, type DeclaredViewFile } from '../../../addons/views';

function repository(modelName: string): BaseRepository<Record<string, unknown>> {
  const model = modelRegistry.get(modelName);
  if (!model) throw new Error(`Cannot seed: model '${modelName}' is not registered`);
  return new BaseRepository(model, dbEngine, dbEngine);
}

const ctx: SeedContext = { repository, actor: SYSTEM_ACTOR };

/**
 * Seed one registry (data or demo) across addons in dependency order, logging a
 * one-line summary per addon. Each addon runs in its own try/catch: a single bad
 * dataset must never abort the boot ("boot resilience"), so failures are logged
 * and the aggregate error, if any, is thrown only after every addon is attempted.
 */
async function seedRegistry(
  registry: Record<string, (ctx: SeedContext) => Promise<SeedResult>>,
  order: string[],
  label: string,
  log: (message: string) => void,
): Promise<number> {
  let total = 0;
  const failures: string[] = [];
  for (const name of order) {
    const loader = registry[name];
    if (!loader) continue;
    try {
      const result = await loader(ctx);
      const created = totalCreated(result);
      total += created;
      log(`[seed] ${label} ${name}: ${created} row(s) created (${result.map((e) => `${e.model}:${e.created}`).join(', ') || 'no changes'})`);
    } catch (err) {
      failures.push(name);
      log(`[seed] ${label} ${name} FAILED: ${(err as Error).message}`);
    }
  }
  // Boot resilience: a single bad dataset is logged and skipped, never rethrown
  // as an aggregate that would abort the rest of the boot. main.ts wraps this
  // call as a last line of defence, but the intended path here is to continue.
  if (failures.length > 0) {
    log(`[seed] ${label} WARNING: skipped ${failures.length} failing addon dataset(s): ${failures.join(', ')} (boot continues with existing data)`);
  }
  return total;
}

export { seedRegistry };

/**
 * A deterministic, key-order-independent serialization used only to compare a
 * declared view's `arch_json` against the stored row. PostgreSQL `jsonb` does
 * not preserve object key order, so a raw `JSON.stringify` diff would report
 * drift on every boot; sorting keys makes the digest reflect content alone.
 */
function canonicalArch(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalArch).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalArch(v)}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/**
 * Idempotently seed (and truth-up) the SDUI view registry into `ir.ui.view`
 * (roadmap T3.1). Platform view definitions live at the shared tenant
 * (`company_id` 0). A missing view is created; a stored view whose `arch_json`
 * digest differs from the declaration is updated; an identical view is left
 * untouched so re-running boot writes nothing and emits zero audit churn. All
 * reads/writes go through the ORM (tenant scope + audit trigger), never raw SQL.
 */
async function seedViews(
  ctx: SeedContext,
  files: DeclaredViewFile[],
  log: (message: string) => void,
): Promise<{ created: number; updated: number; unchanged: number }> {
  let created = 0;
  let updated = 0;
  let unchanged = 0;
  if (files.length === 0) return { created, updated, unchanged };

  const repo = ctx.repository('ir.ui.view');
  const readScope = { systemScope: true } as const;
  const writeScope = { systemScope: true, companyId: PLATFORM_COMPANY_ID };

  for (const file of files) {
    for (const [viewType, def] of Object.entries(file.views)) {
      const name = `${file.model},${viewType}`;
      const existing = await repo.find({
        scope: readScope,
        filters: [
          { field: 'model', operator: '=', value: file.model },
          { field: 'view_type', operator: '=', value: viewType },
        ],
      });
      const platformRow = existing.find((row) => Number(row.company_id) === PLATFORM_COMPANY_ID);
      const targetDigest = sha256Hex(canonicalArch(def));

      if (!platformRow) {
        await repo.create(
          { company_id: PLATFORM_COMPANY_ID, name, model: file.model, view_type: viewType, arch_json: def },
          writeScope,
          ctx.actor,
        );
        created += 1;
      } else if (sha256Hex(canonicalArch(platformRow.arch_json)) !== targetDigest) {
        await repo.updateById(platformRow.id as number, { name, arch_json: def }, writeScope, ctx.actor);
        updated += 1;
      } else {
        unchanged += 1;
      }
    }
  }

  log(`[seed] views ir.ui.view: ${created} created, ${updated} updated, ${unchanged} unchanged`);
  return { created, updated, unchanged };
}

export { seedViews };

/**
 * Load every addon's platform default data, in dependency order.
 *
 * Demo rows are seeded only when `ARSY_SEED_DEMO === 'true'` and the app is not
 * running in production — this keeps the public e-isp demo footprint out of real
 * tenants. Called from `main.ts` after the app is built (so addons are registered
 * and the schema is migrated by `SchemaMigrator.sync()`, which creates the
 * `system` bot that `SYSTEM_ACTOR` writes require), NOT from `buildArsyApp`, so
 * the app factory stays free of data side effects for tests against a clean DB.
 */
export async function runBootSeed(log: (message: string) => void = () => {}): Promise<void> {
  const dataTotal = await seedRegistry(DEFAULT_DATA_REGISTRY, resolveSeedOrder(), 'data', log);

  // SDUI view definitions are platform reference data (not demo rows), so they
  // are always seeded — digest-gated so a re-run writes nothing unchanged.
  await seedViews(ctx, resolveViewFiles(), log);

  const demoEnabled = process.env.ARSY_SEED_DEMO === 'true' && process.env.NODE_ENV !== 'production';
  let demoTotal = 0;
  if (demoEnabled) {
    demoTotal = await seedRegistry(DEMO_DATA_REGISTRY, resolveDemoSeedOrder(), 'demo', log);
  }

  log(`[seed] boot complete: ${dataTotal} default row(s)${demoEnabled ? `, ${demoTotal} demo row(s)` : ' (demo disabled)'}`);
}
