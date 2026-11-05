import { seedDatasets, type SeedContext, type SeedResult, type SeedDataset } from '@allah/arsy-orm';
import { DEFAULT_PROJECT_STAGES } from './default';

/**
 * Load the platform default task-stage set (company_id 0). Idempotent on `name`.
 */
export async function loadDefaultData(ctx: SeedContext): Promise<SeedResult> {
  const datasets: SeedDataset[] = [
    { model: 'project.task.stage', keyFields: ['name'], rows: DEFAULT_PROJECT_STAGES.map((row) => ({ ...row })) },
  ];
  return seedDatasets(ctx, datasets, { systemScope: true });
}

export * from './default';
