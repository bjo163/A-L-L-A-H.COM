/**
 * Cron dispatch registry (roadmap T3.2).
 *
 * The scheduler used to hard-code an `if (method_name === 'sync_local_plans')`
 * branch. That turned "add a scheduled job" into "edit the runner". Instead the
 * runner now resolves a handler by the row's `method_name` from this registry,
 * and each addon registers its own handlers when it is registered — the same
 * ownership model as the model registry. Keeping the table here (not in the
 * ORM) means a package need not know about addon jobs; a handler is just an
 * async function over a small job context.
 */

export interface CronJobContext {
  id: number;
  company_id: number;
  model_name: string | null;
  method_name: string;
  attempt_count: number;
}

export type CronHandler = (job: CronJobContext) => Promise<void>;

const handlers = new Map<string, CronHandler>();

/** Register (or replace) the handler for a cron `method_name`. Idempotent. */
export function registerCronHandler(methodName: string, handler: CronHandler): void {
  if (!methodName) throw new Error('Cron handler registration requires a non-empty method name.');
  handlers.set(methodName, handler);
}

/** Resolve the handler for a cron `method_name`, or undefined if unregistered. */
export function resolveCronHandler(methodName: string): CronHandler | undefined {
  return handlers.get(methodName);
}

/** The method names this process can dispatch (for boot-time diagnostics). */
export function listCronHandlers(): string[] {
  return [...handlers.keys()];
}
