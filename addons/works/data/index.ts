import {
  type SeedContext,
  type SeedResult,
  type SeedDataset,
  type SeedRepositoryLike,
  type TenantScope,
  type AuditActor,
  seedDatasets,
  seedIdempotent,
} from '@allah/arsy-orm';
import { DEFAULT_ISP_PLANS, DEFAULT_ISP_COVERAGE } from './default';

// Platform-owned catalog rows live at company_id 0 (the same convention as the
// i18n catalogs). `seedDatasets` stamps that id for rows which omit it.
export interface WorksSeedResult {
  plansCreated: number;
  coverageCreated: number;
}

/** The two idempotent ISP datasets, ordered so plans precede coverage. */
function datasets(): SeedDataset[] {
  return [
    { model: 'isp.plan', keyFields: ['slug'], rows: DEFAULT_ISP_PLANS.map((plan) => ({ ...plan })) },
    { model: 'isp.coverage', keyFields: ['slug'], rows: DEFAULT_ISP_COVERAGE.map((area) => ({ ...area })) },
  ];
}

/**
 * Load the default ISP catalog and coverage footprint through the shared
 * seed runtime. Idempotent: keyed on `slug`, so a re-run inserts nothing new.
 */
export async function loadDefaultData(ctx: SeedContext): Promise<SeedResult> {
  return seedDatasets(ctx, datasets(), { systemScope: true });
}

/**
 * Back-compat alias for the pre-registry call shape used by older callers: it
 * takes the concrete plan/coverage repositories directly instead of a
 * `SeedContext`. Delegates to the same `seedIdempotent` primitive so there is a
 * single insert path; retained only so nothing outside the boot loader breaks
 * mid-migration.
 */
export async function loadWorksDefaultData(deps: {
  planRepo: SeedRepositoryLike;
  coverageRepo: SeedRepositoryLike;
  actor: AuditActor;
}): Promise<WorksSeedResult> {
  const scope: TenantScope = { systemScope: true };
  const [plans, coverage] = datasets();
  const stamp = (rows: Record<string, unknown>[]) => rows.map((row) => ({ company_id: 0, ...row }));
  const plansCreated = await seedIdempotent(
    deps.planRepo,
    { ...plans, rows: stamp(plans.rows) },
    scope,
    deps.actor,
  );
  const coverageCreated = await seedIdempotent(
    deps.coverageRepo,
    { ...coverage, rows: stamp(coverage.rows) },
    scope,
    deps.actor,
  );
  return { plansCreated, coverageCreated };
}

export * from './default';
