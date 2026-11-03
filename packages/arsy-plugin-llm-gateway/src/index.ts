import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { ok, fail, logger } from '@allah/arsy-core';
import { dbEngine } from '@allah/arsy-orm';
import { SmartRouter } from './router';
import { GatewayCache } from './cache';
import { UsageManager } from './usage';
import { OpenAiAdapter } from './adapters/openai';
import { GeminiAdapter } from './adapters/gemini';
import { AnthropicAdapter } from './adapters/anthropic';
import type { LlmGatewayOptions, ChatCompletionRequest } from './types';

export * from './types';
export * from './router';
export * from './cache';
export * from './usage';
export * from './circuit';
export * from './ssrf';
export * from './adapters/base';
export * from './adapters/openai';
export * from './adapters/anthropic';
export * from './adapters/gemini';

const llmGatewayAsync: FastifyPluginAsync<LlmGatewayOptions> = async (
  fastify: FastifyInstance,
  options: LlmGatewayOptions
) => {
  const prefix = options.prefix || '/v1';
  const router = new SmartRouter(options);
  const cache = new GatewayCache();
  const usageManager = new UsageManager();

  // Initialize router models and database defaults
  await router.initialize();

  // GET /v1/models (Universal Model Catalog)
  fastify.get(`${prefix}/models`, async () => {
    try {
      const models = (await dbEngine.query(
        `SELECT m.model_id, m.name, p.slug as provider_slug, p.name as provider_name 
         FROM ai_model m 
         JOIN ai_provider p ON m.provider_id = p.id 
         WHERE p.is_healthy = true`
      )) as Array<{ model_id: string; name: string; provider_slug: string; provider_name: string }>;

      const routes = (await dbEngine.query('SELECT alias, name FROM ai_route')) as Array<{
        alias: string;
        name: string;
      }>;

      const data = [
        ...routes.map((r) => ({
          id: r.alias,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: 'moonwitness-router',
          displayName: r.name,
        })),
        ...models.map((m) => ({
          id: m.model_id,
          object: 'model',
          created: Math.floor(Date.now() / 1000),
          owned_by: m.provider_slug,
          displayName: `${m.name} (${m.provider_name})`,
        })),
      ];

      return ok({
        object: 'list',
        data,
      });
    } catch (err: any) {
      logger.error({ err }, 'Error fetching models catalog');
      return ok({
        object: 'list',
        data: [
          { id: 'dx-default', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
          { id: 'dx-fast', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
          { id: 'dx-reasoning', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
        ],
      });
    }
  });

  // POST /v1/embeddings (Multi-provider embeddings normalization)
  fastify.post<{
    Body: { model: string; input: string | string[]; encoding_format?: 'float' | 'base64' };
  }>(`${prefix}/embeddings`, async (request, reply) => {
    const body = request.body || ({} as any);
    const { model, input, encoding_format } = body;

    if (!model || !input) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'model and input are required');
    }

    try {
      // Try to find provider based on model name
      const modelName = model.toLowerCase();
      if (modelName.includes('gemini') || modelName === 'text-embedding-004') {
        const adapter = new GeminiAdapter('gemini', undefined, options.geminiApiKey);
        const result = await adapter.embeddings({ model, input, encoding_format });
        return result;
      } else if (modelName.includes('openai') || modelName.includes('text-embedding')) {
        const adapter = new OpenAiAdapter('openai', options.defaultUpstreamUrl || 'https://api.openai.com/v1', options.upstreamApiKey);
        const result = await adapter.embeddings({ model, input, encoding_format });
        return result;
      } else {
        // Default to OpenAI style if unknown, try OpenAI adapter
        const adapter = new OpenAiAdapter('openai', options.defaultUpstreamUrl || 'https://api.openai.com/v1', options.upstreamApiKey);
        try {
          const result = await adapter.embeddings({ model, input, encoding_format });
          return result;
        } catch {
          const adapter2 = new GeminiAdapter('gemini', undefined, options.geminiApiKey);
          const result = await adapter2.embeddings({ model, input, encoding_format });
          return result;
        }
      }
    } catch (err: any) {
      logger.error({ err }, 'Embeddings request failed');
      reply.status(502);
      return fail('EMBEDDINGS_ERROR', err.message || 'Embeddings generation failed');
    }
  });

  // POST /v1/chat/completions (Universal Ingress with Fallback & Streaming)
  fastify.post<{
    Body: ChatCompletionRequest;
  }>(`${prefix}/chat/completions`, async (request, reply) => {
    const startTime = Date.now();
    const body = request.body || ({} as ChatCompletionRequest);
    const { model = 'dx-default', messages, temperature = 0.7, stream = false } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Messages array is required and must not be empty');
    }

    // Virtual Key Authentication (Optional in dev, required if header provided)
    const rawKey =
      (request.headers['x-virtual-key'] as string) ||
      (request.headers.authorization?.startsWith('Bearer mw_')
        ? request.headers.authorization.slice(7)
        : undefined);

    let keyRecord: any;
    if (rawKey) {
      const authResult = await usageManager.validateVirtualKey(rawKey);
      if (!authResult.valid) {
        reply.status(authResult.error?.includes('Rate limit') ? 429 : 403);
        return fail('VIRTUAL_KEY_ERROR', authResult.error || 'Unauthorized virtual key');
      }
      keyRecord = authResult.keyRecord;
    }

    // Cache lookup for non-streaming calls
    if (!stream) {
      const cacheKey = cache.generateKey(model, messages, temperature);
      const cached = cache.get(cacheKey);
      if (cached) {
        reply.header('X-Cache-Hit', 'true');
        usageManager.recordUsage({
          virtualKeyId: keyRecord?.id,
          promptTokens: cached.usage?.prompt_tokens || 0,
          completionTokens: cached.usage?.completion_tokens || 0,
          costUsd: 0,
          latencyMs: Date.now() - startTime,
          statusCode: 200,
          isCached: true,
        });
        return cached;
      }
    }

    // Resolve Route and Fallback Chain
    let resolution;
    try {
      resolution = await router.resolveRoute(model);
    } catch (err: any) {
      reply.status(500);
      return fail('ROUTER_RESOLUTION_ERROR', `Failed resolving route for '${model}': ${err.message}`);
    }

    // Handle Streaming Execution
    if (stream) {
      reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
      reply.raw.setHeader('Connection', 'keep-alive');
      reply.raw.setHeader('X-Accel-Buffering', 'no');

      try {
        const streamResult = await router.executeStreamWithFallback(resolution, body, (chunk) => {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        });

        reply.raw.write('data: [DONE]\n\n');
        reply.raw.end();

        const latencyMs = Date.now() - startTime;
        const costUsd = usageManager.calculateCost(
          streamResult.usage.prompt_tokens,
          streamResult.usage.completion_tokens,
          streamResult.model.input_cost_per_m,
          streamResult.model.output_cost_per_m
        );

        usageManager.recordUsage({
          virtualKeyId: keyRecord?.id,
          providerId: streamResult.provider.id,
          modelId: streamResult.model.id,
          promptTokens: streamResult.usage.prompt_tokens,
          completionTokens: streamResult.usage.completion_tokens,
          costUsd,
          latencyMs,
          statusCode: 200,
          isCached: false,
        });

        return reply;
      } catch (err: any) {
        logger.error({ err }, 'Streaming chat completion failed across all fallback providers');
        reply.raw.write(
          `data: ${JSON.stringify({ error: { message: err.message, code: 'FALLBACK_EXHAUSTED' } })}\n\n`
        );
        reply.raw.end();
        return reply;
      }
    }

    // Handle Non-Streaming Execution
    try {
      const execResult = await router.executeWithFallback(resolution, body);
      const latencyMs = Date.now() - startTime;

      const promptTokens = execResult.response.usage?.prompt_tokens || 0;
      const completionTokens = execResult.response.usage?.completion_tokens || 0;
      const costUsd = usageManager.calculateCost(
        promptTokens,
        completionTokens,
        execResult.model.input_cost_per_m,
        execResult.model.output_cost_per_m
      );

      if (execResult.response.usage) {
        execResult.response.usage.estimated_cost_usd = costUsd;
      }

      // Populate Cache
      const cacheKey = cache.generateKey(model, messages, temperature);
      cache.set(cacheKey, execResult.response);

      // Async usage record
      usageManager.recordUsage({
        virtualKeyId: keyRecord?.id,
        providerId: execResult.provider.id,
        modelId: execResult.model.id,
        promptTokens,
        completionTokens,
        costUsd,
        latencyMs,
        statusCode: 200,
        isCached: false,
      });

      return execResult.response;
    } catch (err: any) {
      logger.error({ err }, 'Chat completion failed across all fallback providers');
      reply.status(502);
      return fail('GATEWAY_FALLBACK_EXHAUSTED', 'All upstream providers failed in fallback sequence', err.message);
    }
  });

  // GET /v1/gateway/telemetry (Aggregate Usage & Health Telemetry)
  fastify.get(`${prefix}/gateway/telemetry`, async () => {
    try {
      const stats = (await dbEngine.query(
        `SELECT 
          COUNT(*) as total_requests,
          COALESCE(SUM(total_tokens), 0) as total_tokens,
          COALESCE(SUM(cost_usd), 0) as total_cost_usd,
          COALESCE(AVG(latency_ms), 0) as avg_latency_ms
         FROM ai_usage_log`
      )) as Array<{
        total_requests: number | string;
        total_tokens: number | string;
        total_cost_usd: number | string;
        avg_latency_ms: number | string;
      }>;

      const circuits = router.circuitBreaker.getSnapshot();

      return ok({
        metrics: {
          totalRequests: Number(stats[0]?.total_requests || 0),
          totalTokens: Number(stats[0]?.total_tokens || 0),
          totalCostUsd: Number(stats[0]?.total_cost_usd || 0),
          avgLatencyMs: Math.round(Number(stats[0]?.avg_latency_ms || 0)),
        },
        circuits,
      });
    } catch (err: any) {
      return fail('TELEMETRY_ERROR', err.message);
    }
  });

  // GET /v1/gateway/providers
  fastify.get(`${prefix}/gateway/providers`, async () => {
    try {
      const providers = await dbEngine.query('SELECT * FROM ai_provider ORDER BY priority ASC');
      return ok(providers);
    } catch (err: any) {
      return fail('PROVIDERS_FETCH_ERROR', err.message);
    }
  });

  // GET /v1/gateway/usage
  fastify.get(`${prefix}/gateway/usage`, async () => {
    try {
      const logs = await dbEngine.query(
        `SELECT l.*, p.name as provider_name, m.name as model_name, k.name as key_name 
         FROM ai_usage_log l
         LEFT JOIN ai_provider p ON l.provider_id = p.id
         LEFT JOIN ai_model m ON l.model_id = m.id
         LEFT JOIN ai_virtual_key k ON l.virtual_key_id = k.id
         ORDER BY l.id DESC LIMIT 100`
      );
      return ok(logs);
    } catch (err: any) {
      return fail('USAGE_FETCH_ERROR', err.message);
    }
  });
};

export const llmGatewayPlugin = fp(llmGatewayAsync, {
  name: '@allah/arsy-plugin-llm-gateway',
  fastify: '5.x',
});

export default llmGatewayPlugin;
