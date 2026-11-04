import { logger, resolveLocalSecret } from '@allah/arsy-core';
import { dbEngine, decryptSecret } from '@allah/arsy-orm';
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

  private async seedDefaultsIfEmpty(): Promise<void> {
    try {
      const providers = (await dbEngine.query(
        'SELECT count(*) as count FROM ai_provider'
      )) as Array<{ count: number | string }>;

      if (Number(providers[0]?.count || 0) > 0) return;

      // Provider, model and route rows are platform configuration, not tenant data: they
      // live under the shared platform tenant, the same convention res_translation uses
      // for global terms.
      await dbEngine.query(
        'INSERT INTO ai_provider (company_id, name, slug, provider_type, base_url, priority, is_healthy) VALUES ' +
          '(0, \'OpenAI Platform\', \'openai\', \'openai_compatible\', \'https://api.openai.com/v1\', 10, true), ' +
          '(0, \'Anthropic Cloud\', \'anthropic\', \'anthropic\', \'https://api.anthropic.com/v1\', 20, true), ' +
          '(0, \'Google Gemini\', \'gemini\', \'gemini\', \'https://generativelanguage.googleapis.com/v1beta\', 30, true), ' +
          '(0, \'Local Ollama\', \'ollama\', \'ollama\', \'http://localhost:11434/v1\', 40, true)'
      );

      await dbEngine.query(
        'INSERT INTO ai_model (company_id, name, model_id, provider_id, context_window, input_cost_per_m, output_cost_per_m) VALUES ' +
          '(0, \'GPT-4o\', \'gpt-4o\', 1, 128000, 2.5, 10.0), ' +
          '(0, \'GPT-4o Mini\', \'gpt-4o-mini\', 1, 128000, 0.15, 0.6), ' +
          '(0, \'Claude 3.5 Sonnet\', \'claude-3-5-sonnet-20241022\', 2, 200000, 3.0, 15.0), ' +
          '(0, \'Gemini 2.5 Flash\', \'gemini-2.5-flash\', 3, 1000000, 0.075, 0.3), ' +
          '(0, \'Llama 3.3 70B Local\', \'llama3.3\', 4, 32768, 0, 0)'
      );

      await dbEngine.query(
        'INSERT INTO ai_route (company_id, name, alias, strategy) VALUES ' +
          '(0, \'Default Adaptive Route\', \'dx-default\', \'fallback\'), ' +
          '(0, \'Ultra Fast Route\', \'dx-fast\', \'lowest_cost\'), ' +
          '(0, \'Deep Reasoning Route\', \'dx-reasoning\', \'fallback\')'
      );

      logger.info('Successfully bootstrapped default AI Gateway routing models in PGlite');
    } catch (err: any) {
      logger.warn({ err }, 'Could not seed AI gateway defaults (schema might be booting)');
    }

    await this.seedPlatformVirtualKey();
  }

  private async seedPlatformVirtualKey(): Promise<void> {
    try {
      const existing = (await dbEngine.query(
        "SELECT 1 FROM ai_virtual_key WHERE name = $1 LIMIT 1",
        ['Platform Master Key']
      )) as unknown[];
      if (existing && existing.length > 0) return;

      const raw = resolveLocalSecret('GATEWAY_VIRTUAL_KEY', 'gateway.virtual.key');
      await dbEngine.query(
        'INSERT INTO ai_virtual_key (company_id, name, key_prefix, key_hash, budget_limit, rate_limit_rpm, rate_limit_tpm, revoked) ' +
          'VALUES (0, $1, $2, $3, 1000.0, 120, 200000, false)',
        ['Platform Master Key', raw.slice(0, 15), hashVirtualKey(raw)]
      );
      logger.info('Seeded platform master virtual key; the secret is in GATEWAY_VIRTUAL_KEY or data/keys');
    } catch (err: any) {
      logger.warn({ err }, 'Could not seed the platform master virtual key');
    }
  }

  async resolveRoute(requestedModelOrAlias: string): Promise<RouteResolution> {
    await this.initialize();

    // 1. Check if model is a recognized route alias (e.g. "dx-default", "dx-reasoning", "dx-fast")
    const routeRows = (await dbEngine.query('SELECT * FROM ai_route WHERE alias = $1 LIMIT 1', [
      requestedModelOrAlias,
    ])) as RouteRecord[];

    const route: RouteRecord = routeRows[0] || {
      id: 0,
      name: 'Ad-hoc Route',
      alias: requestedModelOrAlias,
      strategy: 'fallback',
    };

    // 2. Fetch all healthy providers and available models from DB
    const providerRows = (await dbEngine.query(
      'SELECT * FROM ai_provider WHERE is_healthy = true ORDER BY priority ASC'
    )) as ProviderRecord[];

    const modelRows = (await dbEngine.query('SELECT * FROM ai_model')) as ModelRecord[];

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

  async routeChat(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const model = req.model || 'dx-default';
    const resolution = await this.resolveRoute(model);
    const { response } = await this.executeWithFallback(resolution, req);
    return response;
  }
}
