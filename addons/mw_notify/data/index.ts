import {
  type SeedContext,
  type SeedResult,
  type SeedDataset,
  seedDatasets,
} from '@allah/arsy-orm';
import { DEFAULT_NOTIFY_TEMPLATES } from './default';

/**
 * Seed the platform notification-template catalog (roadmap T3.4). These are the
 * codes the wired producers (`invoice.paid`, `radius.auth_failure`,
 * `gateway.spend_threshold`, …) reference. They ship as company_id 0 reference
 * rows so every tenant resolves the same subject/body by `code`, and `recordNotifyEvent`
 * looks them up against the platform scope. Idempotent on `code` (a unique column):
 * a re-seed inserts nothing new, so boot writes cause no audit churn.
 */
function datasets(): SeedDataset[] {
  return [
    {
      model: 'notify.template',
      keyFields: ['code'],
      rows: DEFAULT_NOTIFY_TEMPLATES.map((template) => ({ ...template })),
    },
  ];
}

export async function loadDefaultData(ctx: SeedContext): Promise<SeedResult> {
  return seedDatasets(ctx, datasets(), { systemScope: true });
}

export * from './default';
