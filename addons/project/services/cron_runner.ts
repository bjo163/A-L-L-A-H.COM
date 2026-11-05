// Lightweight cron runner that polls ir.cron every 10 s and executes due jobs.
// Cross-tenant by design — the outbox pattern used in sync.ts applies here too:
// each row still carries company_id for downstream scoping.
//
// All reads/writes go through the registered `ir.cron` / `project.project`
// repositories rather than raw SQL (roadmap T3.1), so every state transition
// flows through the ORM's tenant-scope + audit triggers. The claim is an
// optimistic compare-and-swap on the row's previously-read `state`.

import { BaseRepository, SYSTEM_ACTOR, dbEngine, type TenantScope } from '@allah/arsy-orm';
import { IrCron } from '../models/ir_cron';
import { ProjectProject } from '../models/project_project';

const POLL_INTERVAL_MS = 10_000;

interface CronRow extends Record<string, unknown> {
  id: number;
  company_id: number;
  name: string;
  model_name: string | null;
  method_name: string | null;
  interval_number: number;
  interval_unit: 'seconds' | 'minutes' | 'hours' | 'days';
  state: string;
  run_count: number;
}

function intervalToMs(number: number, unit: string): number {
  switch (unit) {
    case 'seconds': return number * 1_000;
    case 'hours':   return number * 3_600_000;
    case 'days':    return number * 86_400_000;
    default:        return number * 60_000; // minutes
  }
}

async function runDueCrons(): Promise<void> {
  const now = new Date().toISOString();
  const cronRepo = new BaseRepository<CronRow>(IrCron, dbEngine);
  const projectRepo = new BaseRepository<Record<string, unknown>>(ProjectProject, dbEngine);

  // Cross-tenant poll: `systemScope` reads every tenant's due rows (the row's
  // own company_id scopes each job's work below). The default `active = true`
  // filter is applied by the builder.
  const due = await cronRepo.find({
    scope: { systemScope: true },
    filters: [
      { field: 'state', operator: '!=', value: 'running' },
      { field: 'nextcall', operator: '<=', value: now },
    ],
    orderBy: 'nextcall',
    limit: 10,
  });

  for (const cron of due) {
    const writeScope: TenantScope = { systemScope: true, companyId: cron.company_id };

    // Optimistic lock through the registered repository: the CAS `expected`
    // clause only wins if nobody else transitioned the row since we read it,
    // and the write is audited like every other ORM mutation.
    const claimed = await cronRepo.updateById(
      cron.id,
      { state: 'running' },
      writeScope,
      SYSTEM_ACTOR,
      { state: cron.state },
    );
    if (!claimed) continue;

    let lastError = '';
    try {
      // Dispatch table: extend here as new cron methods are added.
      if (cron.method_name === 'sync_local_plans') {
        // Deferred import to avoid circular dependency at module load time.
        const { reconcilePlans } = await import('./sync_worker');
        const projects = await projectRepo.find({
          scope: { companyId: cron.company_id },
          filters: [{ field: 'sync_mode', operator: '!=', value: 'disabled' }],
        });
        // Projects without a workspace_path use Extension-push sync only; skip here.
        for (const project of projects) {
          if (!project.workspace_path) continue;
          // The Hub running in a local dev environment with filesystem access
          // can call reconcilePlans with an empty plans array to trigger a no-op
          // that updates last_sync_at. Full sync via Extension push is preferred.
          await reconcilePlans(cron.company_id, Number(project.id), []);
        }
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    const nextcall = new Date(Date.now() + intervalToMs(cron.interval_number, cron.interval_unit)).toISOString();
    await cronRepo.updateById(
      cron.id,
      {
        state: lastError ? 'error' : 'idle',
        nextcall,
        last_error: lastError,
        run_count: cron.run_count + 1,
      },
      writeScope,
      SYSTEM_ACTOR,
    );
  }
}

let runnerHandle: ReturnType<typeof setTimeout> | undefined;

/**
 * Start the poll loop. `onError` is injected by the host (which owns the logger
 * dependency) so this addon stays free of `@allah/arsy-core` — the same
 * convention as `runBootSeed(log)`. A failed poll must not crash the loop, but
 * must not be silently swallowed either (roadmap T3.1 replaced `.catch(() => {})`).
 */
export function startCronRunner(onError: (err: unknown) => void = () => {}): void {
  const tick = (): void => {
    runDueCrons()
      .catch(onError)
      .finally(() => {
        runnerHandle = setTimeout(tick, POLL_INTERVAL_MS);
      });
  };
  runnerHandle = setTimeout(tick, POLL_INTERVAL_MS);
}

export function stopCronRunner(): void {
  if (runnerHandle) {
    clearTimeout(runnerHandle);
    runnerHandle = undefined;
  }
}
