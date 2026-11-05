import { seedDatasets, type SeedContext, type SeedResult, type SeedDataset } from '@allah/arsy-orm';
import {
  DEFAULT_COUNTRIES,
  DEFAULT_CURRENCIES,
  DEFAULT_LANGS,
  DEFAULT_UI_TRANSLATIONS,
  DEFAULT_MODEL_ACCESS,
  DEFAULT_RULE,
} from './default';

/**
 * Load the platform reference data (currencies, countries, languages) and ACL
 * rules at the shared tenant (company_id 0). Idempotent: keyed on each model's
 * unique field, so a re-run inserts nothing new. Reads/writes go through the
 * injected repositories (which own tenant scope and the audit trigger), never
 * raw SQL.
 */
export async function loadDefaultData(ctx: SeedContext): Promise<SeedResult> {
  const datasets: SeedDataset[] = [
    { model: 'res.currency', keyFields: ['name'], rows: DEFAULT_CURRENCIES.map((row) => ({ ...row })) },
    { model: 'res.country', keyFields: ['code'], rows: DEFAULT_COUNTRIES.map((row) => ({ ...row })) },
    { model: 'res.lang', keyFields: ['code'], rows: DEFAULT_LANGS.map((row) => ({ ...row })) },
    {
      model: 'ir.translation',
      keyFields: ['lang', 'name', 'type'],
      rows: DEFAULT_UI_TRANSLATIONS.map((row) => ({ ...row, type: 'ui', state: 'translated' })),
    },
    {
      model: 'ir.model.access',
      keyFields: ['model_name', 'group_id'],
      rows: DEFAULT_MODEL_ACCESS.map((row) => ({ ...row })),
    },
    {
      model: 'ir.rule',
      keyFields: ['model_name', 'global'],
      rows: DEFAULT_RULE.map((row) => ({ ...row })),
    },
  ];
  return seedDatasets(ctx, datasets, { systemScope: true });
}

export * from './default';
