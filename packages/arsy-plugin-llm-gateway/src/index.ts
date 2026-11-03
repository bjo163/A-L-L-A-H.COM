import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { request as undiciRequest } from 'undici';
import { ok, fail, logger } from '@allah/arsy-core';

export interface LlmGatewayOptions {
  prefix?: string;
  defaultUpstreamUrl?: string;
  upstreamApiKey?: string;
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private readonly maxTokens: number = 60,
    private readonly refillRatePerSecond: number = 1
  ) {
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  consume(amount = 1): boolean {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsedSeconds * this.refillRatePerSecond);
    this.lastRefill = now;

    if (this.tokens >= amount) {
      this.tokens -= amount;
      return true;
    }
    return false;
  }
}

export class SemanticCache {
  private cache = new Map<string, { response: unknown; expiresAt: number }>();

  generateKey(model: string, messages: unknown[]): string {
    const serialized = JSON.stringify({ model, messages });
    return crypto.createHash('sha256').update(serialized).digest('hex');
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.response;
  }

  set(key: string, response: unknown, ttlSeconds = 3600): void {
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

function validateUrlSsrf(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.31.')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

const llmGatewayAsync: FastifyPluginAsync<LlmGatewayOptions> = async (fastify: FastifyInstance, options) => {
  const prefix = options.prefix || '/v1';
  const rateLimiter = new TokenBucket(60, 2);
  const cache = new SemanticCache();

  // GET /v1/models
  fastify.get(`${prefix}/models`, async () => {
    return ok({
      object: 'list',
      data: [
        { id: 'dx-default', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
        { id: 'dx-fast', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
        { id: 'dx-reasoning', object: 'model', created: Date.now(), owned_by: 'moonwitness' },
      ],
    });
  });

  // POST /v1/chat/completions
  fastify.post<{
    Body: {
      model: string;
      messages: { role: string; content: string }[];
      temperature?: number;
      stream?: boolean;
    };
  }>(`${prefix}/chat/completions`, async (request, reply) => {
    if (!rateLimiter.consume(1)) {
      reply.status(429);
      return fail('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded. Please try again later.');
    }

    const { model, messages, temperature = 0.7 } = request.body || {};
    if (!model || !messages || !Array.isArray(messages)) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'Model and messages array are required');
    }

    const cacheKey = cache.generateKey(model, messages);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      reply.header('X-Cache-Hit', 'true');
      return cachedResponse;
    }

    const upstreamUrl = options.defaultUpstreamUrl || process.env.UPSTREAM_OPENAI_URL || 'https://api.openai.com/v1';
    const upstreamKey = options.upstreamApiKey || process.env.UPSTREAM_OPENAI_KEY;

    if (!upstreamKey) {
      // Mock / fallback response when no upstream key is configured
      const mockResult = {
        id: `chatcmpl-${crypto.randomBytes(8).toString('hex')}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: `[Arsy LLM Gateway Mock] Processed completion for model '${model}'.`,
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      cache.set(cacheKey, mockResult);
      return mockResult;
    }

    if (!validateUrlSsrf(upstreamUrl)) {
      reply.status(400);
      return fail('SSRF_GUARD_REJECTION', 'Target upstream URL rejected by SSRF guard');
    }

    try {
      const response = await undiciRequest(`${upstreamUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${upstreamKey}`,
        },
        body: JSON.stringify({ model, messages, temperature }),
      });

      const responseBody = (await response.body.json()) as any;
      if (response.statusCode >= 200 && response.statusCode < 300) {
        cache.set(cacheKey, responseBody);
      }

      reply.status(response.statusCode);
      return responseBody;
    } catch (err: any) {
      logger.error({ err }, 'Error forwarding to upstream LLM');
      reply.status(502);
      return fail('UPSTREAM_ERROR', 'Failed to communicate with upstream provider', err.message);
    }
  });
};

export const llmGatewayPlugin = fp(llmGatewayAsync, {
  name: '@allah/arsy-plugin-llm-gateway',
  fastify: '5.x',
});

export default llmGatewayPlugin;

