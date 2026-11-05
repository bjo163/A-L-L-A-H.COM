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
