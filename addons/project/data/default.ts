/**
 * Odoo-style default data for the `project` addon.
 *
 * The starting task-stage set every project begins from. Keyed on `name` so it
 * is idempotent; an operator can reorder (`sequence`), fold, or add per-tenant
 * stages without disturbing these platform rows (company_id 0).
 */

export interface DefaultProjectStage {
  name: string;
  sequence: number;
  fold: boolean;
  state_mapping: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

export const DEFAULT_PROJECT_STAGES: DefaultProjectStage[] = [
  { name: 'Backlog', sequence: 10, fold: false, state_mapping: 'pending' },
  { name: 'In Progress', sequence: 20, fold: false, state_mapping: 'in_progress' },
  { name: 'In Review', sequence: 30, fold: false, state_mapping: 'in_progress' },
  { name: 'Done', sequence: 40, fold: true, state_mapping: 'completed' },
  { name: 'Cancelled', sequence: 50, fold: true, state_mapping: 'cancelled' },
];

/**
 * The default scheduled action a project tenant gets. This is the single
 * definition of the job; the admin seed route builds its row from here so the
 * schedule is not duplicated between the addon data and the route body.
 */
export interface DefaultProjectCron {
  name: string;
  model_name: string;
  method_name: string;
  interval_number: number;
  interval_unit: 'seconds' | 'minutes' | 'hours' | 'days';
  state: 'idle' | 'running' | 'error' | 'disabled';
}

export const DEFAULT_PROJECT_CRON: DefaultProjectCron = {
  name: 'Project .plans Sync',
  model_name: 'project.project',
  method_name: 'sync_local_plans',
  interval_number: 5,
  interval_unit: 'minutes',
  state: 'idle',
};
