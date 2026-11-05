import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import crypto from 'crypto';
import { ok, fail, logger } from '@allah/arsy-core';
import { dbEngine, BaseRepository, modelRegistry } from '@allah/arsy-orm';
import { SmartRouter } from './router';
import { GatewayCache } from './cache';
import { UsageManager } from './usage';
import { rollupUsageDay, isoDay } from './usage_rollup';
import { embedPrompt } from './embedding';
import { OpenAiAdapter } from './adapters/openai';
import { GeminiAdapter } from './adapters/gemini';
import { toolRegistry } from './tools';
import { mcpHandler } from './mcp';
import type { LlmGatewayOptions, ChatCompletionRequest, VirtualKeyRecord } from './types';
import { runAgent, streamAgent } from './agent/loop';
import { SwarmCoordinator } from './swarm';
import { deviceControlPlugin } from './device_control';

export { deviceControlPlugin } from './device_control';
export * from './types';
export * from './router';
export * from './cache';
export * from './usage';
export * from './strategy';
export * from './embedding';
export * from './usage_rollup';
export * from './circuit';
export * from './ssrf';
export * from './adapters/base';
export * from './adapters/openai';
export * from './adapters/anthropic';
export * from './adapters/gemini';
export * from './tools';
export * from './agent';
export * from './swarm';

const llmGatewayAsync: FastifyPluginAsync<LlmGatewayOptions> = async (
  fastify: FastifyInstance,
  options: LlmGatewayOptions
) => {
  const prefix = options.prefix || '/v1';
  const router = new SmartRouter(options);
  const cache = new GatewayCache();
  const usageManager = new UsageManager();

  // Semantic cache (roadmap F2) is opt-in: default-off keeps the byte-for-byte today
  // behavior, and the env toggle is read per-request so it never leaks across processes.
  const semanticEnabled = () => process.env.LLM_SEMANTIC_CACHE === '1';
  const semanticThreshold = () => Number(process.env.LLM_SEMANTIC_THRESHOLD ?? 0.95);
  const semanticPromptText = (msgs: ChatCompletionRequest['messages']): string =>
    msgs
      .map((m: ChatCompletionRequest['messages'][number]) =>
        typeof m.content === 'string'
          ? m.content
          : (m.content || []).filter((p: any) => p.type === 'text').map((p: any) => p.text).join(' ')
      )
      .join('\n');

  // Per-tenant daily budget cap (roadmap F1). Off unless configured; read at request
  // time so a test can toggle the env without a restart.
  const dailyBudgetUsd = () =>
    (options as any).dailyBudgetUsd ?? Number(process.env.LLM_DAILY_BUDGET_USD ?? 0);

  // Tenant always comes from the verified principal or the presented virtual key, never
  // from a query string or body field.
  const tenantOf = (request: FastifyRequest): number | null => {
    const principal = (request as any).principal;
    if (typeof principal?.companyId === 'number') return principal.companyId;
    const companyId = (request as any).user?.company_id;
    return typeof companyId === 'number' ? companyId : null;
  };

  // Catalog reads go through the repository, not raw SQL. modelRegistry.get is
  // untyped-undefined, so guard the registration the same way router.ts does.
  const catalogRepo = (modelName: string): BaseRepository => {
    const model = modelRegistry.get(modelName);
    if (!model) {
      throw new Error(`LLM gateway model '${modelName}' is not registered. Did the mw_llm_router addon load?`);
    }
    return new BaseRepository(model);
  };

  // Initialize router models and database defaults
  await router.initialize();
  await fastify.register(deviceControlPlugin, { prefix });

  // GET /v1/models (Universal Model Catalog)
  fastify.get(`${prefix}/models`, async () => {
    try {
      const models = (await dbEngine.query(
        'SELECT m.model_id, m.name, p.slug as provider_slug, p.name as provider_name FROM ai_model m JOIN ai_provider p ON m.provider_id = p.id WHERE p.is_healthy = true'
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

    let keyRecord: VirtualKeyRecord | undefined;
    if (rawKey) {
      const authResult = await usageManager.validateVirtualKey(rawKey);
      if (!authResult.valid) {
        reply.status(authResult.error?.includes('Rate limit') ? 429 : 403);
        return fail('VIRTUAL_KEY_ERROR', authResult.error || 'Unauthorized virtual key');
      }
      keyRecord = authResult.keyRecord;
    }

    const tenant = keyRecord?.company_id ?? tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }

    // Fail-closed per-tenant daily budget guard (roadmap F1). Skipped entirely when no
    // cap is configured, so the default request path is byte-identical to before.
    const budgetCap = dailyBudgetUsd();
    if (budgetCap > 0) {
      const spentToday = await usageManager.dailySpend(tenant, isoDay(0));
      if (spentToday >= budgetCap) {
        reply.status(429);
        return fail(
          'DAILY_BUDGET_EXCEEDED',
          `Tenant has spent $${spentToday.toFixed(6)} today, at or over the $${budgetCap.toFixed(6)} daily budget`
        );
      }
    }

    // Cache lookup for non-streaming calls
    if (!stream) {
      const cacheKey = cache.generateKey(model, messages, temperature);
      const cached = cache.get(cacheKey);
      if (cached) {
        reply.header('X-Cache-Hit', 'true');
        usageManager.recordUsage({
          companyId: tenant,
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

    // Semantic near-duplicate lookup (roadmap F2), only when enabled. Runs after the
    // exact-key miss so a rephrased prompt short-circuits the provider call. The
    // embedding is computed once here and reused for the store on the way out.
    let semanticEmbedding: number[] | null = null;
    if (!stream && semanticEnabled()) {
      semanticEmbedding = embedPrompt(semanticPromptText(messages));
      const semanticHit = await cache.getVector(tenant, model, semanticEmbedding, semanticThreshold());
      if (semanticHit) {
        reply.header('X-Cache-Hit', 'true');
        reply.header('X-Semantic-Cache', 'hit');
        usageManager.recordUsage({
          companyId: tenant,
          virtualKeyId: keyRecord?.id,
          promptTokens: semanticHit.usage?.prompt_tokens || 0,
          completionTokens: semanticHit.usage?.completion_tokens || 0,
          costUsd: 0,
          latencyMs: Date.now() - startTime,
          statusCode: 200,
          isCached: true,
        });
        return semanticHit;
      }
    }

    // Resolve Route and Fallback Chain
    let resolution;
    try {
      resolution = await router.resolveRoute(model, tenant);
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
          companyId: tenant,
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

      // Persist the semantic layer too (roadmap F2) when enabled, keyed by the same
      // embedding used for the lookup so a later near-duplicate resolves to it.
      if (semanticEmbedding) {
        await cache.setVector(tenant, model, semanticPromptText(messages), cacheKey, semanticEmbedding, execResult.response);
      }

      // Async usage record
      usageManager.recordUsage({
        companyId: tenant,
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

  // --- Model Context Protocol (MCP) Endpoints ---
  // GET /v1/mcp/sse: Server-Sent Events stream for MCP client connections.
  fastify.get(`${prefix}/mcp/sse`, async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');

    const sessionId = `mcp_${crypto.randomBytes(8).toString('hex')}`;
    reply.raw.write(`event: endpoint\ndata: ${sessionId}\n\n`);

    const keepAlive = setInterval(() => {
      try {
        reply.raw.write(':ping\n\n');
      } catch {
        clearInterval(keepAlive);
      }
    }, 15000);

    request.raw.on('close', () => clearInterval(keepAlive));
    request.raw.on('error', () => clearInterval(keepAlive));

    // Keep the stream open; clients POST messages to /v1/mcp/message
    return reply;
  });

  // POST /v1/mcp/message: Ingress endpoint for JSON-RPC 2.0 MCP messages.
  fastify.post<{ Body: { jsonrpc?: string; method?: string; params?: unknown; id?: string | number | null } }>(
    `${prefix}/mcp/message`,
    async (request, reply) => {
      const tenant = tenantOf(request);
      if (typeof tenant !== 'number') {
        reply.status(403);
        return fail('TENANT_REQUIRED', 'No tenant bound to this request');
      }
      const body = request.body || {};
      const response = await mcpHandler.handle(
        {
          jsonrpc: body.jsonrpc ?? '2.0',
          method: (body.method as string) || '',
          params: body.params as Record<string, unknown> | undefined,
          id: (body.id ?? null) as string | number | null,
        },
        { companyId: tenant, actor: 'mcp' }
      );
      return response;
    }
  );

  // GET /v1/mcp/audit: Tool execution audit log (from ToolRegistry)
  fastify.get(`${prefix}/mcp/audit`, async (request, reply) => {
    const tenant = tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    try {
      const log = toolRegistry.getLog(tenant);
      return ok({ audit: log, total: log.length });
    } catch (err: any) {
      return fail('MCP_AUDIT_ERROR', err.message);
    }
  });

  // --- Autonomous Cognitive Agent Loop Endpoints ---
  // const agentLoop = new AgentLoop(router);

  // POST /v1/agent/run: Synchronous execution of cognitive agent loop
  fastify.post<{
    Body: {
      prompt: string;
      system?: string;
      max_steps?: number;
      allowed_tools?: string[];
      temperature?: number;
    };
  }>(`${prefix}/agent/run`, async (request, reply) => {
    const { prompt, system, max_steps, allowed_tools, temperature } = request.body || {};
    if (!prompt) {
      reply.code(400);
      return fail('MISSING_PROMPT', 'Prompt is required for agent execution');
    }

    const companyId = tenantOf(request);
    if (typeof companyId !== 'number') {
      reply.code(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    const result = await runAgent({
      prompt,
      system,
      max_steps,
      allowed_tools,
      temperature,
      company_id: companyId,
    });

    return ok(result);
  });

  // POST /v1/agent/stream: Zero-copy SSE real-time cognitive reasoning stream
  fastify.post<{
    Body: {
      prompt: string;
      system?: string;
      max_steps?: number;
      allowed_tools?: string[];
      temperature?: number;
    };
  }>(`${prefix}/agent/stream`, async (request, reply) => {
    const { prompt, system, max_steps, allowed_tools, temperature } = request.body || {};
    if (!prompt) {
      reply.code(400).send({ error: 'Prompt is required for agent execution' });
      return;
    }

    const companyId = tenantOf(request);
    if (typeof companyId !== 'number') {
      reply.code(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');

    await streamAgent(
      {
        prompt,
        system,
        max_steps,
        allowed_tools,
        temperature,
        company_id: companyId,
      },
      (event: string, data: string) => {
        try {
          reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch {
          // Client disconnected
        }
      }
    );

    reply.raw.end();
  });

  // --- Multi-Agent Swarm Orchestration Endpoints ---
  const swarmCoordinator = new SwarmCoordinator();

  // POST /v1/swarm/run: Synchronous hierarchical multi-agent execution
  fastify.post<{
    Body: {
      goal: string;
      system?: string;
      max_turns?: number;
      allowed_tools?: string[];
      temperature?: number;
      context?: Record<string, unknown>;
    };
  }>(`${prefix}/swarm/run`, async (request, reply) => {
    const { goal, system, max_turns, allowed_tools, temperature, context } = request.body || {};
    if (!goal) {
      reply.code(400);
      return fail('MISSING_GOAL', 'Goal is required for swarm execution');
    }

    const companyId = tenantOf(request);
    if (typeof companyId !== 'number') {
      reply.code(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    const result = await swarmCoordinator.run({
      goal,
      system,
      max_turns,
      allowed_tools,
      temperature,
      context,
      company_id: companyId,
    });

    return ok(result);
  });

  // POST /v1/swarm/stream: Aggregated SSE multi-agent trajectory stream
  fastify.post<{
    Body: {
      goal: string;
      system?: string;
      max_turns?: number;
      allowed_tools?: string[];
      temperature?: number;
      context?: Record<string, unknown>;
    };
  }>(`${prefix}/swarm/stream`, async (request, reply) => {
    const { goal, system, max_turns, allowed_tools, temperature, context } = request.body || {};
    if (!goal) {
      reply.code(400).send({ error: 'Goal is required for swarm execution' });
      return;
    }

    const companyId = tenantOf(request);
    if (typeof companyId !== 'number') {
      reply.code(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }

    reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    reply.raw.setHeader('Cache-Control', 'no-cache, no-transform');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('X-Accel-Buffering', 'no');

    await swarmCoordinator.run(
      {
        goal,
        system,
        max_turns,
        allowed_tools,
        temperature,
        context,
        company_id: companyId,
      },
      (event, data) => {
        try {
          reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        } catch {
          // Client disconnected
        }
      }
    );

    reply.raw.end();
  });


  // GET /v1/gateway/telemetry (Aggregate Usage & Health Telemetry)
  fastify.get(`${prefix}/gateway/telemetry`, async (request, reply) => {
    const tenant = tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    try {
      const stats = (await dbEngine.query(
        'SELECT COUNT(*) as total_requests, COALESCE(SUM(total_tokens), 0) as total_tokens, COALESCE(SUM(cost_usd), 0) as total_cost_usd, COALESCE(AVG(latency_ms), 0) as avg_latency_ms FROM ai_usage_log WHERE company_id = $1',
        [tenant]
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
  // Platform configuration, and never the stored credential envelope.
  fastify.get(`${prefix}/gateway/providers`, async () => {
    try {
      const providers = await dbEngine.query(
        'SELECT id, company_id, name, slug, provider_type, base_url, priority, is_healthy FROM ai_provider ORDER BY priority ASC'
      );
      return ok(providers);
    } catch (err: any) {
      return fail('PROVIDERS_FETCH_ERROR', err.message);
    }
  });

  // GET /v1/gateway/usage
  fastify.get(`${prefix}/gateway/usage`, async (request, reply) => {
    const tenant = tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    try {
      const logs = await dbEngine.query(
        'SELECT l.*, p.name as provider_name, m.name as model_name, k.name as key_name FROM ai_usage_log l LEFT JOIN ai_provider p ON l.provider_id = p.id LEFT JOIN ai_model m ON l.model_id = m.id LEFT JOIN ai_virtual_key k ON l.virtual_key_id = k.id WHERE l.company_id = $1 ORDER BY l.id DESC LIMIT 100',
        [tenant]
      );
      return ok(logs);
    } catch (err: any) {
      return fail('USAGE_FETCH_ERROR', err.message);
    }
  });

  // POST /v1/gateway/usage/rollup — recompute a tenant's ai.usage_daily totals (F1).
  // Idempotent: the aggregate is absolute, so re-running a day yields the same totals.
  fastify.post<{ Body: { day?: string } }>(`${prefix}/gateway/usage/rollup`, async (request, reply) => {
    const tenant = tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    const day = (request.body?.day || isoDay(0)) as string;
    try {
      const rows = await rollupUsageDay(day, tenant);
      return ok({ day, company_id: tenant, rows });
    } catch (err: any) {
      reply.status(400);
      return fail('USAGE_ROLLUP_ERROR', err.message);
    }
  });

  // GET /v1/gateway/usage/daily?day= — read the tenant's rollup. Scoped by company_id,
  // so a tenant never sees another tenant's aggregates (F1).
  fastify.get<{ Querystring: { day?: string } }>(`${prefix}/gateway/usage/daily`, async (request, reply) => {
    const tenant = tenantOf(request);
    if (typeof tenant !== 'number') {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'No tenant bound to this request');
    }
    const day = (request.query?.day || isoDay(0)) as string;
    try {
      const def = modelRegistry.get('ai.usage_daily');
      if (!def) return ok([]);
      const repo = new BaseRepository(def);
      const rows = await repo.find({
        scope: { companyId: tenant },
        filters: [{ field: 'day', operator: '=', value: day }],
      });
      return ok(rows);
    } catch (err: any) {
      return fail('USAGE_DAILY_FETCH_ERROR', err.message);
    }
  });
};

export const llmGatewayPlugin = fp(llmGatewayAsync, {
  name: '@allah/arsy-plugin-llm-gateway',
  fastify: '5.x',
});

export default llmGatewayPlugin;
