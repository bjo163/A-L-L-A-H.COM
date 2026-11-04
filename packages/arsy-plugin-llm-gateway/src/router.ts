import { logger, resolveLocalSecret } from '@allah/arsy-core';
import { BaseRepository, SYSTEM_ACTOR, decryptSecret, modelRegistry } from '@allah/arsy-orm';
import { OpenAiAdapter } from './adapters/openai';
import { AnthropicAdapter } from './adapters/anthropic';
import { GeminiAdapter } from './adapters/gemini';
import type { ProviderAdapter } from './adapters/base';
import { ProviderCircuitBreaker } from './circuit';
import { hashVirtualKey } from './usage';
import type {
  ProviderRecord,
  ModelRecord,
  RouteRecord,
  LlmGatewayOptions,
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
} from './types';

export interface RouteResolution {
  route: RouteRecord;
  targetChain: Array<{
    provider: ProviderRecord;
    model: ModelRecord;
    adapter: ProviderAdapter;
  }>;
}

export class SmartRouter {
  private adapters = new Map<string, ProviderAdapter>();
  readonly circuitBreaker = new ProviderCircuitBreaker();
  private initialized = false;

  // Platform routing configuration (providers/models/routes) changes rarely, but
  // resolveRoute used to re-SELECT all three on every request. Cache the raw rows
  // behind a short TTL so steady-state routing issues at most one read per window
  // (roadmap T13). The cache is keyed on the visible-tenant set so a tenant never
  // sees another tenant's config; adapters are rebuilt by initialize()/write paths.
  private readonly configTtlMs = Number(process.env.LLM_ROUTE_CONFIG_TTL_MS ?? 15000);
  private configCache: { key: string; fetchedAt: number; providers: ProviderRecord[]; models: ModelRecord[] } | null = null;
  private routeCache = new Map<string, { fetchedAt: number; route: RouteRecord | undefined }>();

  constructor(private readonly options: LlmGatewayOptions = {}) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Register built-in adapters based on env or options
    const openaiKey = this.options.upstreamApiKey || process.env.UPSTREAM_OPENAI_KEY || process.env.OPENAI_API_KEY;
    const openaiUrl = this.options.defaultUpstreamUrl || process.env.UPSTREAM_OPENAI_URL || 'https://api.openai.com/v1';

    const anthropicKey = this.options.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    const geminiKey = this.options.geminiApiKey || process.env.GEMINI_API_KEY;
    const ollamaUrl = this.options.ollamaBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1';

    this.adapters.set('openai', new OpenAiAdapter('openai', openaiUrl, openaiKey));
    this.adapters.set('anthropic', new AnthropicAdapter('anthropic', 'https://api.anthropic.com/v1', anthropicKey));
    this.adapters.set('gemini', new GeminiAdapter('gemini', 'https://generativelanguage.googleapis.com/v1beta', geminiKey));
    this.adapters.set('ollama', new OpenAiAdapter('ollama', ollamaUrl, undefined));

    // Bootstrap default database seed records if empty
    await this.seedDefaultsIfEmpty();
    this.initialized = true;
  }

  private repo<T = Record<string, any>>(modelName: string): BaseRepository<T> {
    const model = modelRegistry.get(modelName);
    if (!model) {
      throw new Error(`LLM gateway model '${modelName}' is not registered. Did the mw_llm_router addon load?`);
    }
    return new BaseRepository<T>(model);
  }

  private async seedDefaultsIfEmpty(): Promise<void> {
    try {
      const providerRepo = this.repo('ai.provider');
      // Provider, model and route rows are platform configuration, not tenant data: they
      // live under the shared platform tenant (company_id = 0), the same convention
      // res_translation uses for global terms. Written through the ORM so every value is
      // parameterized and each row is audit-logged like any other record.
      const existing = await providerRepo.count({
        scope: { systemScope: true },
        filters: [{ field: 'company_id', operator: '=', value: 0 }],
      });

      if (existing === 0) {
        const providerSpecs = [
          { name: 'OpenAI Platform', slug: 'openai', provider_type: 'openai_compatible', base_url: 'https://api.openai.com/v1', priority: 10 },
          { name: 'Anthropic Cloud', slug: 'anthropic', provider_type: 'anthropic', base_url: 'https://api.anthropic.com/v1', priority: 20 },
          { name: 'Google Gemini', slug: 'gemini', provider_type: 'gemini', base_url: 'https://generativelanguage.googleapis.com/v1beta', priority: 30 },
          { name: 'Local Ollama', slug: 'ollama', provider_type: 'ollama', base_url: 'http://localhost:11434/v1', priority: 40 },
        ] as const;

        const providerIds = new Map<string, number>();
        for (const spec of providerSpecs) {
          const row = await providerRepo.create(
            { ...spec, company_id: 0, is_healthy: true },
            { systemScope: true },
            SYSTEM_ACTOR
          );
          providerIds.set(spec.slug, Number((row as { id: number }).id));
        }

        const modelSpecs = [
          { name: 'GPT-4o', model_id: 'gpt-4o', provider: 'openai', context_window: 128000, input_cost_per_m: 2.5, output_cost_per_m: 10.0 },
          { name: 'GPT-4o Mini', model_id: 'gpt-4o-mini', provider: 'openai', context_window: 128000, input_cost_per_m: 0.15, output_cost_per_m: 0.6 },
          { name: 'Claude 3.5 Sonnet', model_id: 'claude-3-5-sonnet-20241022', provider: 'anthropic', context_window: 200000, input_cost_per_m: 3.0, output_cost_per_m: 15.0 },
          { name: 'Gemini 2.5 Flash', model_id: 'gemini-2.5-flash', provider: 'gemini', context_window: 1000000, input_cost_per_m: 0.075, output_cost_per_m: 0.3 },
          { name: 'Llama 3.3 70B Local', model_id: 'llama3.3', provider: 'ollama', context_window: 32768, input_cost_per_m: 0, output_cost_per_m: 0 },
        ] as const;

        const modelRepo = this.repo('ai.model');
        for (const spec of modelSpecs) {
          const providerId = providerIds.get(spec.provider);
          if (!providerId) continue;
          await modelRepo.create(
            {
              name: spec.name,
              model_id: spec.model_id,
              provider_id: providerId,
              context_window: spec.context_window,
              input_cost_per_m: spec.input_cost_per_m,
              output_cost_per_m: spec.output_cost_per_m,
              company_id: 0,
            },
            { systemScope: true },
            SYSTEM_ACTOR
          );
        }

        const routeSpecs = [
          { name: 'Default Adaptive Route', alias: 'dx-default', strategy: 'fallback' },
          { name: 'Ultra Fast Route', alias: 'dx-fast', strategy: 'lowest_cost' },
          { name: 'Deep Reasoning Route', alias: 'dx-reasoning', strategy: 'fallback' },
        ] as const;

        const routeRepo = this.repo('ai.route');
        for (const spec of routeSpecs) {
          await routeRepo.create({ ...spec, company_id: 0 }, { systemScope: true }, SYSTEM_ACTOR);
        }

        logger.info('Successfully bootstrapped default AI Gateway routing models in PGlite');
      }
    } catch (err: any) {
      logger.warn({ err }, 'Could not seed AI gateway defaults (schema might be booting)');
    }

    await this.seedPlatformVirtualKey();
  }

  private async seedPlatformVirtualKey(): Promise<void> {
    try {
      const keyRepo = this.repo('ai.virtual_key');
      const existing = await keyRepo.find({
        scope: { systemScope: true },
        filters: [
          { field: 'company_id', operator: '=', value: 0 },
          { field: 'name', operator: '=', value: 'Platform Master Key' },
        ],
        limit: 1,
      });
      if (existing.length > 0) return;

      const raw = resolveLocalSecret('GATEWAY_VIRTUAL_KEY', 'gateway.virtual.key');
      await keyRepo.create(
        {
          company_id: 0,
          name: 'Platform Master Key',
          key_prefix: raw.slice(0, 15),
          key_hash: hashVirtualKey(raw),
          budget_limit: 1000.0,
          rate_limit_rpm: 120,
          rate_limit_tpm: 200000,
          revoked: false,
        },
        { systemScope: true },
        SYSTEM_ACTOR
      );
      logger.info('Seeded platform master virtual key; the secret is in GATEWAY_VIRTUAL_KEY or data/keys');
    } catch (err: any) {
      logger.warn({ err }, 'Could not seed the platform master virtual key');
    }
  }

  async resolveRoute(requestedModelOrAlias: string, companyId?: number): Promise<RouteResolution> {
    await this.initialize();

    // Platform routing configuration lives under the shared platform tenant (company_id = 0).
    // Reads are scoped to the platform tenant plus the requesting tenant, so a tenant can never
    // resolve another tenant's provider/model/route rows. All values are parameterized via the ORM.
    const visibleCompanyIds = typeof companyId === 'number' && companyId !== 0 ? [0, companyId] : [0];
    const visibleKey = visibleCompanyIds.join(',');
    const now = Date.now();

    // 1. Check if model is a recognized route alias (e.g. "dx-default", "dx-reasoning", "dx-fast")
    const routeCacheKey = `${visibleKey}::${requestedModelOrAlias}`;
    const cachedRoute = this.routeCache.get(routeCacheKey);
    let route: RouteRecord;
    if (cachedRoute && now - cachedRoute.fetchedAt < this.configTtlMs) {
      route = cachedRoute.route || { id: 0, name: 'Ad-hoc Route', alias: requestedModelOrAlias, strategy: 'fallback' };
    } else {
      const routeRows = await this.repo<RouteRecord>('ai.route').find({
        scope: { systemScope: true },
        filters: [
          { field: 'company_id', operator: 'IN', value: visibleCompanyIds },
          { field: 'alias', operator: '=', value: requestedModelOrAlias },
        ],
        limit: 1,
      });
      route = routeRows[0] || { id: 0, name: 'Ad-hoc Route', alias: requestedModelOrAlias, strategy: 'fallback' };
      this.routeCache.set(routeCacheKey, { fetchedAt: now, route: routeRows[0] });
    }

    // 2. Fetch healthy providers and available models visible to this tenant, ordered by priority.
    let providerRows: ProviderRecord[];
    let modelRows: ModelRecord[];
    if (this.configCache && this.configCache.key === visibleKey && now - this.configCache.fetchedAt < this.configTtlMs) {
      providerRows = this.configCache.providers;
      modelRows = this.configCache.models;
    } else {
      providerRows = await this.repo<ProviderRecord>('ai.provider').find({
        scope: { systemScope: true },
        filters: [
          { field: 'company_id', operator: 'IN', value: visibleCompanyIds },
          { field: 'is_healthy', operator: '=', value: true },
        ],
        orderBy: 'priority',
      });
      modelRows = await this.repo<ModelRecord>('ai.model').find({
        scope: { systemScope: true },
        filters: [{ field: 'company_id', operator: 'IN', value: visibleCompanyIds }],
      });
      this.configCache = { key: visibleKey, fetchedAt: now, providers: providerRows, models: modelRows };
    }

    const targetChain: RouteResolution['targetChain'] = [];

    // Prioritize chain selection based on alias or direct model matching
    for (const provider of providerRows) {
      let matchingModel = modelRows.find(
        (m) => m.provider_id === provider.id && (m.model_id === requestedModelOrAlias || m.name === requestedModelOrAlias)
      );

      // If requested was an alias (dx-fast, dx-default, dx-reasoning), assign appropriate provider model
      if (!matchingModel) {
        if (requestedModelOrAlias === 'dx-fast') {
          matchingModel = modelRows.find((m) => m.provider_id === provider.id && m.input_cost_per_m < 1.0);
        } else if (requestedModelOrAlias === 'dx-reasoning') {
          matchingModel = modelRows.find(
            (m) => m.provider_id === provider.id && (m.model_id.includes('sonnet') || m.model_id.includes('gpt-4o'))
          );
        }
        // Fallback to any model on this provider
        if (!matchingModel) {
          matchingModel = modelRows.find((m) => m.provider_id === provider.id);
        }
      }

      if (matchingModel) {
        let adapter = this.adapters.get(provider.slug);
        if (!adapter) {
          // The column holds an AES-GCM envelope; the upstream call needs the plaintext key,
          // so a row written before envelope encryption existed fails closed here.
          const apiKey = provider.encrypted_api_key ? decryptSecret(provider.encrypted_api_key) : undefined;
          if (provider.provider_type === 'anthropic') {
            adapter = new AnthropicAdapter(provider.slug, provider.base_url, apiKey);
          } else if (provider.provider_type === 'gemini') {
            adapter = new GeminiAdapter(provider.slug, provider.base_url, apiKey);
          } else {
            adapter = new OpenAiAdapter(provider.slug, provider.base_url, apiKey);
          }
          this.adapters.set(provider.slug, adapter);
        }

        targetChain.push({
          provider,
          model: matchingModel,
          adapter,
        });
      }
    }

    if (targetChain.length === 0) {
      // Fallback default adapter
      const defaultAdapter = this.adapters.get('openai') || new OpenAiAdapter('openai', 'https://api.openai.com/v1');
      targetChain.push({
        provider: {
          id: 1,
          name: 'OpenAI Default',
          slug: 'openai',
          provider_type: 'openai_compatible',
          base_url: 'https://api.openai.com/v1',
          priority: 10,
          is_healthy: true,
        },
        model: {
          id: 1,
          name: requestedModelOrAlias,
          model_id: requestedModelOrAlias,
          provider_id: 1,
          context_window: 8192,
          input_cost_per_m: 0,
          output_cost_per_m: 0,
        },
        adapter: defaultAdapter,
      });
    }

    return { route, targetChain };
  }

  async executeWithFallback(
    resolution: RouteResolution,
    req: ChatCompletionRequest
  ): Promise<{ response: ChatCompletionResponse; provider: ProviderRecord; model: ModelRecord }> {
    const errors: Array<{ provider: string; error: string }> = [];

    for (const item of resolution.targetChain) {
      if (!this.circuitBreaker.isAvailable(item.provider.slug)) {
        logger.warn(`Provider [${item.provider.slug}] circuit is open, bypassing`);
        continue;
      }

      try {
        const response = await item.adapter.chat(req, item.model.model_id);
        this.circuitBreaker.recordSuccess(item.provider.slug);
        return { response, provider: item.provider, model: item.model };
      } catch (err: any) {
        this.circuitBreaker.recordFailure(item.provider.slug);
        logger.warn(
          { err: err.message, provider: item.provider.slug },
          `Provider execution failed, triggering fallback sequence`
        );
        errors.push({ provider: item.provider.slug, error: err.message });
      }
    }

    throw new Error(`All providers in fallback chain failed: ${JSON.stringify(errors)}`);
  }

  async executeStreamWithFallback(
    resolution: RouteResolution,
    req: ChatCompletionRequest,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<{ usage: UsageInfo; provider: ProviderRecord; model: ModelRecord }> {
    const errors: Array<{ provider: string; error: string }> = [];

    for (const item of resolution.targetChain) {
      if (!this.circuitBreaker.isAvailable(item.provider.slug)) {
        logger.warn(`Provider [${item.provider.slug}] circuit is open, bypassing stream`);
        continue;
      }

      try {
        const usage = await item.adapter.chatStream(req, item.model.model_id, onChunk);
        this.circuitBreaker.recordSuccess(item.provider.slug);
        return { usage, provider: item.provider, model: item.model };
      } catch (err: any) {
        this.circuitBreaker.recordFailure(item.provider.slug);
        logger.warn(
          { err: err.message, provider: item.provider.slug },
          `Stream execution failed on provider, trying next fallback`
        );
        errors.push({ provider: item.provider.slug, error: err.message });
      }
    }

    throw new Error(`All streaming providers in fallback chain failed: ${JSON.stringify(errors)}`);
  }

  async routeChat(req: ChatCompletionRequest, companyId?: number): Promise<ChatCompletionResponse> {
    const model = req.model || 'dx-default';
    const resolution = await this.resolveRoute(model, companyId);
    const { response } = await this.executeWithFallback(resolution, req);
    return response;
  }
}
