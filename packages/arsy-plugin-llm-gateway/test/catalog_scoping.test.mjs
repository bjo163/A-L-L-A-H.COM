import assert from 'node:assert/strict';
import test from 'node:test';

const [
  { PGliteEngine, SchemaMigrator, BaseRepository, SYSTEM_ACTOR, modelRegistry, AuditEvent, AuthUser, AuthSession, AuthVerification, AuthSetup },
  { registerBaseAddon },
  { registerMwLlmRouterAddon },
] = await Promise.all([
  import('@allah/arsy-orm'),
  import('../../../addons/base/index.ts'),
  import('../../../addons/mw_llm_router/index.ts'),
]);

// AC-9: the model + provider catalog endpoints read through the repository
// rather than a raw dbEngine JOIN. This drives the real ai.* models with the
// exact QueryOptions the handlers pass, so three behaviors are locked:
//   1. a model reaches the catalog only when its provider is healthy,
//   2. the providers projection never surfaces the credential envelope,
//   3. providers are returned in ascending priority.
async function boot() {
  registerBaseAddon();
  registerMwLlmRouterAddon();
  // The auth cluster + audit-event table are wired at app boot, not by these
  // addons; schema sync references them (bot provisioning + the audit trigger).
  for (const model of [AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent]) {
    modelRegistry.register(model);
  }
  const engine = new PGliteEngine();
  await engine.connect();
  await new SchemaMigrator(engine, modelRegistry).sync();
  return engine;
}

const systemScope = { systemScope: true };

test('gateway catalog reads scope by provider health, project away the credential envelope, and order by priority', { timeout: 120_000 }, async () => {
  const engine = await boot();
  try {
    const providerRepo = new BaseRepository(modelRegistry.get('ai.provider'), engine);
    const modelRepo = new BaseRepository(modelRegistry.get('ai.model'), engine);
    const routeRepo = new BaseRepository(modelRegistry.get('ai.route'), engine);

    const healthy = await providerRepo.create(
      { company_id: 0, name: 'OpenAI', slug: 'openai', provider_type: 'openai_compatible', base_url: 'https://api.openai.test', priority: 10, is_healthy: true, encrypted_api_key: 'sk-live-SECRET' },
      systemScope,
      SYSTEM_ACTOR
    );
    await providerRepo.create(
      { company_id: 0, name: 'Stale', slug: 'stale', provider_type: 'openai_compatible', base_url: 'https://stale.test', priority: 5, is_healthy: false, encrypted_api_key: 'sk-stale-SECRET' },
      systemScope,
      SYSTEM_ACTOR
    );
    await modelRepo.create(
      { company_id: 0, name: 'GPT X', model_id: 'gpt-x', provider_id: Number(healthy.id) },
      systemScope,
      SYSTEM_ACTOR
    );
    const stale = await providerRepo.find({ scope: systemScope, filters: [{ field: 'slug', operator: '=', value: 'stale' }] });
    await modelRepo.create(
      { company_id: 0, name: 'Old Y', model_id: 'old-y', provider_id: Number(stale[0].id) },
      systemScope,
      SYSTEM_ACTOR
    );
    await routeRepo.create({ company_id: 0, name: 'Fast', alias: 'dx-fast' }, systemScope, SYSTEM_ACTOR);

    // 1. Reproduce the /v1/models assembly: healthy providers gate their models.
    const healthyRows = await providerRepo.find({
      scope: systemScope,
      filters: [{ field: 'is_healthy', operator: '=', value: true }],
      fields: ['id', 'slug', 'name'],
    });
    const providerById = new Map(healthyRows.map((p) => [Number(p.id), { slug: String(p.slug), name: String(p.name) }]));
    const models = await modelRepo.find({ scope: systemScope });
    const catalogModelIds = models
      .flatMap((m) => (providerById.has(Number(m.provider_id)) ? [String(m.model_id)] : []))
      .sort();
    assert.deepEqual(catalogModelIds, ['gpt-x']);

    // 2 + 3. Reproduce the /v1/gateway/providers read: the projection omits the
    // credential envelope and rows come back in ascending priority.
    const providers = await providerRepo.find({
      scope: systemScope,
      fields: ['id', 'company_id', 'name', 'slug', 'provider_type', 'base_url', 'priority', 'is_healthy'],
      orderBy: 'priority',
      orderDirection: 'ASC',
    });
    assert.deepEqual(providers.map((p) => String(p.slug)), ['stale', 'openai']);
    for (const p of providers) {
      assert.ok(!('encrypted_api_key' in p), 'credential envelope leaked into provider catalog');
    }
    assert.ok(!JSON.stringify(providers).includes('SECRET'), 'stored secret value reached the response body');

    // Routes still reach the catalog with their alias/name.
    const routes = await routeRepo.find({ scope: systemScope, fields: ['alias', 'name'] });
    assert.ok(routes.some((r) => String(r.alias) === 'dx-fast'));
  } finally {
    await engine.close();
  }
});
