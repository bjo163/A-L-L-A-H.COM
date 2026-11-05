// Lightweight cron runner that polls ir.cron every 10 s and executes due jobs.
// Cross-tenant by design — the outbox pattern used in sync.ts applies here too:
// each row still carries company_id for downstream scoping.

import { dbEngine } from '@allah/arsy-orm';

const POLL_INTERVAL_MS = 10_000;

interface CronRow {
  id: number;
  company_id: number;
  name: string;
  model_name: string | null;
  method_name: string | null;
  interval_number: number;
  interval_unit: 'seconds' | 'minutes' | 'hours' | 'days';
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
  const due = await dbEngine.query<CronRow>(
    `SELECT id, company_id, name, model_name, method_name, interval_number, interval_unit
       FROM ir_cron
      WHERE active = true AND state != $1 AND nextcall <= $2
      ORDER BY nextcall
      LIMIT 10`,
    ['running', now]
  );

  for (const cron of due) {
    // Optimistic lock: only proceed if we won the state transition.
    const locked = await dbEngine.query<{ id: number }>(
      `UPDATE ir_cron SET state = 'running' WHERE id = $1 AND state != 'running' RETURNING id`,
      [cron.id]
    );
    if (locked.length === 0) continue;

    let lastError = '';
    try {
      // Dispatch table: extend here as new cron methods are added.
      if (cron.method_name === 'sync_local_plans') {
        // Deferred import to avoid circular dependency at module load time.
        const { reconcilePlans } = await import('./sync_worker');
        const projects = await dbEngine.query<{ id: number; workspace_path: string | null }>(
          `SELECT id, workspace_path
             FROM project_project
            WHERE company_id = $1 AND active = true AND sync_mode != 'disabled'`,
          [cron.company_id]
        );
        // Projects without a workspace_path use Extension-push sync only; skip here.
        for (const project of projects) {
          if (!project.workspace_path) continue;
          // The Hub running in a local dev environment with filesystem access
          // can call reconcilePlans with an empty plans array to trigger a no-op
          // that updates last_sync_at. Full sync via Extension push is preferred.
          await reconcilePlans(cron.company_id, project.id, []);
        }
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }

    const nextcall = new Date(Date.now() + intervalToMs(cron.interval_number, cron.interval_unit)).toISOString();
    await dbEngine.query(
      `UPDATE ir_cron
          SET state = $1, nextcall = $2, last_error = $3, run_count = run_count + 1
        WHERE id = $4`,
      [lastError ? 'error' : 'idle', nextcall, lastError, cron.id]
    );
  }
}

let runnerHandle: ReturnType<typeof setTimeout> | undefined;

export function startCronRunner(): void {
  const tick = (): void => {
    runDueCrons().catch(() => {}).finally(() => {
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
