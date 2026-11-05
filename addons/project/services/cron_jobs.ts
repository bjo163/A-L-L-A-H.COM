/**
 * Cron job handlers owned by the `project` addon (roadmap T3.2).
 *
 * Split out from `cron_runner.ts` so the runner only schedules and dispatches,
 * while the actual work lives with the addon that owns it. The handler is
 * registered into the dispatch registry from `../index` at addon registration,
 * and defers its `sync_worker` import to keep module-load acyclic.
 */
import { BaseRepository, dbEngine, type TenantScope } from '@allah/arsy-orm';
import { ProjectProject } from '../models/project_project';
import type { CronJobContext } from './cron_registry';

/**
 * `sync_local_plans`: enumerate the tenant's sync-enabled projects and run a
 * bounded reconciliation pass for each. This performs NO local filesystem scan —
 * the Hub never reads the filesystem; full sync arrives via Extension push. The
 * pass here is a DB-only touch that refreshes each workspace-backed project. The
 * seeded default schedule ships `state: 'disabled'` (see `data/default.ts` and
 * the roadmap decision) so this never runs unattended until an operator enables
 * it; see decision.md.
 */
export async function syncLocalPlans(job: CronJobContext): Promise<void> {
  const { reconcilePlans } = await import('./sync_worker');
  const scope: TenantScope = { companyId: job.company_id };
  const projectRepo = new BaseRepository<Record<string, unknown>>(ProjectProject, dbEngine);
  const projects = await projectRepo.find({
    scope,
    filters: [{ field: 'sync_mode', operator: '!=', value: 'disabled' }],
  });
  // Projects without a workspace_path use Extension-push sync only; skip here.
  for (const project of projects) {
    if (!project.workspace_path) continue;
    await reconcilePlans(job.company_id, Number(project.id), []);
  }
}
