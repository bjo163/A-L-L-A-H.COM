import {
  seedDatasets,
  seedIdempotent,
  PLATFORM_COMPANY_ID,
  type SeedContext,
  type SeedResult,
  type SeedDataset,
} from '@allah/arsy-orm';
import { DEFAULT_AI_PROVIDERS, DEFAULT_AI_MODELS, DEFAULT_AI_ROUTES } from './default';

/**
 * Load the platform AI routing catalog (company_id 0).
 *
 * Order matters for FK integrity: providers first, then models (whose
 * `provider_id` is resolved from the just-seeded provider `slug`s), then routes.
 * Each step is idempotent on its natural key (`slug` / `model_id` / `alias`), so
 * a re-run inserts nothing new. All reads/writes go through the injected
 * repositories — never raw SQL.
 */
export async function loadDefaultData(ctx: SeedContext): Promise<SeedResult> {
  const scope = { systemScope: true } as const;
  const result: SeedResult = [];

  // 1. Providers.
  const providerDatasets: SeedDataset[] = [
    {
      model: 'ai.provider',
      keyFields: ['slug'],
      rows: DEFAULT_AI_PROVIDERS.map((provider) => ({ ...provider, is_healthy: true })),
    },
  ];
  result.push(...await seedDatasets(ctx, providerDatasets, scope));

  // Resolve provider slug -> id for the model FK.
  const providerRows = await ctx.repository('ai.provider').find({
    scope,
    filters: [{ field: 'company_id', operator: '=', value: PLATFORM_COMPANY_ID }],
  });
  const providerIds = new Map<string, number>();
  for (const row of providerRows) providerIds.set(String(row.slug), Number(row.id));

  // 2. Models (provider_id resolved; skip any whose provider did not seed).
  const modelRows: Record<string, unknown>[] = [];
  for (const spec of DEFAULT_AI_MODELS) {
    const providerId = providerIds.get(spec.provider);
    if (providerId === undefined) continue;
    modelRows.push({
      name: spec.name,
      model_id: spec.model_id,
      provider_id: providerId,
      context_window: spec.context_window,
      input_cost_per_m: spec.input_cost_per_m,
      output_cost_per_m: spec.output_cost_per_m,
    });
  }
  const modelRepo = ctx.repository('ai.model');
  const modelsCreated = await seedIdempotent(
    modelRepo,
    { model: 'ai.model', keyFields: ['model_id'], rows: modelRows.map((row) => ({ company_id: PLATFORM_COMPANY_ID, ...row })) },
    scope,
    ctx.actor,
  );
  result.push({ model: 'ai.model', created: modelsCreated });

  // 3. Routes.
  const routeDatasets: SeedDataset[] = [
    { model: 'ai.route', keyFields: ['alias'], rows: DEFAULT_AI_ROUTES.map((route) => ({ ...route })) },
  ];
  result.push(...await seedDatasets(ctx, routeDatasets, scope));

  return result;
}

export * from './default';
