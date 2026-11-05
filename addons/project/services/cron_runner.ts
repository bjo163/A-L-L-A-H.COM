// Cron work queue (roadmap T3.2). Polls ir.cron every 10 s and dispatches due
// jobs through the addon-owned handler registry.
//
// Claiming is a `FOR UPDATE SKIP LOCKED` select + a `state = running` write inside
// ONE transaction (T2.2 `forUpdate` + `withTransaction`), so a concurrent runner
// takes the next unlocked rows instead of racing on the same job. PGlite is a
// single embedded writer, so this is about claim *correctness* and per-process
// kind partitioning (`ARSY_CRON_KINDS`), not write throughput. The job body runs
// AFTER the claim commits, so a handler that opens its own transaction never
// nests inside the claim. Failures back off exponentially via `attempt_count`.

import { BaseRepository, SYSTEM_ACTOR, dbEngine, withTransaction, type QueryFilter, type TenantScope } from '@allah/arsy-orm';
import { IrCron } from '../models/ir_cron';
import { resolveCronHandler } from './cron_registry';

const POLL_INTERVAL_MS = 10_000;
const CLAIM_BATCH = 10;
// Exponential backoff ceiling so a persistently failing job cannot spin the loop.
const MAX_BACKOFF_MS = 6 * 60 * 60 * 1000;

interface ClaimedCron extends Record<string, unknown> {
  id: number;
  company_id: number;
  model_name: string | null;
  method_name: string;
  interval_number: number;
  interval_unit: 'seconds' | 'minutes' | 'hours' | 'days';
  attempt_count: number;
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

// `ARSY_CRON_KINDS` partitions jobs across runner processes by dispatch method.
// Undefined => this process runs every kind; a defined value (even empty) =>
// only the listed method names. Keeps "run all" and "run none" explicit.
function allowedKinds(): Set<string> | null {
  const raw = process.env.ARSY_CRON_KINDS;
  if (raw === undefined) return null;
  return new Set(raw.split(',').map((s) => s.trim()).filter(Boolean));
}

function backoffMs(intervalMs: number, attempt: number): number {
  const scaled = intervalMs * 2 ** Math.max(0, attempt - 1);
  return Math.min(scaled, MAX_BACKOFF_MS);
}

// Atomically claim a batch of due, non-running, non-disabled jobs and mark them
// running. Returns the rows with their post-increment `attempt_count`; the row
// locks are held only for the duration of this transaction.
async function claimDueCrons(now: string): Promise<ClaimedCron[]> {
  const kinds = allowedKinds();
  return withTransaction(async ({ repositoryFor }) => {
    const repo = repositoryFor<ClaimedCron>(IrCron);
    const filters: QueryFilter[] = [
      { field: 'state', operator: 'IN', value: ['idle', 'error'] },
      { field: 'nextcall', operator: '<=', value: now },
    ];
    if (kinds) filters.push({ field: 'method_name', operator: 'IN', value: [...kinds] });

    const due = await repo.find({
      scope: { systemScope: true },
      filters,
      orderBy: 'nextcall',
      forUpdate: 'skip_locked',
      limit: CLAIM_BATCH,
    });

    const claimed: ClaimedCron[] = [];
    for (const cron of due) {
      const writeScope: TenantScope = { systemScope: true, companyId: cron.company_id };
      const attemptCount = Number(cron.attempt_count ?? 0) + 1;
      const marked = await repo.updateById(
        cron.id,
        { state: 'running', attempt_count: attemptCount },
        writeScope,
        SYSTEM_ACTOR,
        { state: String(cron.state ?? 'idle') },
      );
      if (marked) claimed.push({ ...cron, attempt_count: attemptCount });
    }
    return claimed;
  });
}

// Exported as a deterministic one-poll seam for tests (the loop calls it per
// tick); production entry is `startCronRunner`.
export async function runDueCrons(): Promise<void> {
  const now = new Date().toISOString();
  const claimed = await claimDueCrons(now);
  if (claimed.length === 0) return;

  const finalizeRepo = new BaseRepository<ClaimedCron>(IrCron, dbEngine);

  for (const cron of claimed) {
    const writeScope: TenantScope = { systemScope: true, companyId: cron.company_id };
    const intervalMs = intervalToMs(cron.interval_number, cron.interval_unit);

    let lastError = '';
    const handler = resolveCronHandler(cron.method_name);
    if (!handler) {
      lastError = `No cron handler registered for '${cron.method_name}'`;
    } else {
      try {
        await handler({
          id: cron.id,
          company_id: cron.company_id,
          model_name: cron.model_name,
          method_name: cron.method_name,
          attempt_count: cron.attempt_count,
        });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (lastError) {
      // Keep `attempt_count` (already incremented) and park the next attempt on
      // an exponential backoff so a failing job cannot hot-loop.
      const delay = backoffMs(intervalMs, cron.attempt_count);
      const nextcall = new Date(Date.now() + delay).toISOString();
      await finalizeRepo.updateById(
        cron.id,
        { state: 'error', nextcall, next_retry_at: nextcall, last_error: lastError },
        writeScope,
        SYSTEM_ACTOR,
      );
    } else {
      const nextcall = new Date(Date.now() + intervalMs).toISOString();
      await finalizeRepo.updateById(
        cron.id,
        { state: 'idle', nextcall, next_retry_at: null, last_error: '', run_count: cron.run_count + 1, attempt_count: 0 },
        writeScope,
        SYSTEM_ACTOR,
      );
    }
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
