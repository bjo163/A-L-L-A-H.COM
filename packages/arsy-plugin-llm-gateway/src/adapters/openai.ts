import crypto from 'crypto';
import { request as undiciRequest } from 'undici';
import { logger } from '@allah/arsy-core';
import type { ProviderAdapter, EmbeddingsRequest, EmbeddingsResponse } from './base';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
} from '../types';
import { validateUrlSsrf } from '../ssrf';

export class OpenAiAdapter implements ProviderAdapter {
  readonly slug: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(slug: string, baseUrl: string, apiKey?: string) {
    this.slug = slug;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey) || this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1');
  }

  async embeddings(req: EmbeddingsRequest): Promise<EmbeddingsResponse> {
    if (!this.apiKey && !this.baseUrl.includes('localhost') && !this.baseUrl.includes('127.0.0.1')) {
      throw new Error(`OpenAI API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Upstream URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const input = Array.isArray(req.input) ? req.input : [req.input];
    const payload = {
      model: req.model,
      input,
      encoding_format: req.encoding_format || 'float',
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await undiciRequest(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`OpenAI Embeddings Provider [${this.slug}] returned HTTP ${response.statusCode}: ${errorText}`);
    }

    const json = (await response.body.json()) as any;
    return {
      object: 'list',
      data: (json.data || []).map((d: any, idx: number) => ({
        object: 'embedding',
        index: d.index ?? idx,
        embedding: d.embedding || [],
      })),
      model: json.model || req.model,
      usage: {
        prompt_tokens: json.usage?.prompt_tokens || 0,
        total_tokens: json.usage?.total_tokens || json.usage?.prompt_tokens || 0,
      },
    };
  }

  async chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      // Mock completion for local testing / unconfigured keys
      return this.generateMockResponse(req, upstreamModel);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Upstream URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const payload = {
      model: upstreamModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens,
      stream: false,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await undiciRequest(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`OpenAI Provider [${this.slug}] returned HTTP ${response.statusCode}: ${errorText}`);
    }

    const json = (await response.body.json()) as any;
    return {
      id: json.id || `chatcmpl-${crypto.randomBytes(8).toString('hex')}`,
      object: 'chat.completion',
      created: json.created || Math.floor(Date.now() / 1000),
      model: req.model,
      choices: (json.choices || []).map((c: any, idx: number) => ({
        index: c.index ?? idx,
        message: {
          role: c.message?.role || 'assistant',
          content: c.message?.content || '',
        },
        finish_reason: c.finish_reason || 'stop',
      })),
      usage: json.usage
        ? {
            prompt_tokens: json.usage.prompt_tokens || 0,
            completion_tokens: json.usage.completion_tokens || 0,
            total_tokens: json.usage.total_tokens || 0,
          }
        : undefined,
    };
  }

  async chatStream(
    req: ChatCompletionRequest,
    upstreamModel: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<UsageInfo> {
    if (!this.apiKey) {
      return this.streamMockResponse(req, upstreamModel, onChunk);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Upstream URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const payload = {
      model: upstreamModel,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens,
      stream: true,
      stream_options: { include_usage: true },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }

    const response = await undiciRequest(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`OpenAI Provider [${this.slug}] stream failed with HTTP ${response.statusCode}: ${errorText}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    let buffer = '';

    for await (const chunk of response.body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.usage) {
              promptTokens = data.usage.prompt_tokens || promptTokens;
              completionTokens = data.usage.completion_tokens || completionTokens;
            }

            const streamChunk: StreamChunk = {
              id: data.id || `chatcmpl-${crypto.randomBytes(6).toString('hex')}`,
              object: 'chat.completion.chunk',
              created: data.created || Math.floor(Date.now() / 1000),
              model: req.model,
              choices: (data.choices || []).map((c: any, idx: number) => ({
                index: c.index ?? idx,
                delta: {
                  role: c.delta?.role,
                  content: c.delta?.content || '',
                },
                finish_reason: c.finish_reason || null,
              })),
            };

            onChunk(streamChunk);
          } catch (e) {
            logger.warn({ err: e, line: trimmed }, 'Failed parsing SSE chunk from OpenAI provider');
          }
        }
      }
    }

    // Fallback token approximation if provider didn't return usage
    if (promptTokens === 0 && completionTokens === 0) {
      promptTokens = Math.ceil(JSON.stringify(req.messages).length / 4);
      completionTokens = 20;
    }

    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    };
  }

  private generateMockResponse(req: ChatCompletionRequest, upstreamModel: string): ChatCompletionResponse {
    const promptLen = JSON.stringify(req.messages).length;
    const promptTokens = Math.ceil(promptLen / 4);
    const mockContent = `[MoonWitness AI Gateway: ${this.slug}] Processed completion for model '${req.model}' (upstream: '${upstreamModel}').`;
    const completionTokens = Math.ceil(mockContent.length / 4);

    return {
      id: `chatcmpl-${crypto.randomBytes(8).toString('hex')}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: mockContent,
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
    };
  }

  private async streamMockResponse(
    req: ChatCompletionRequest,
    upstreamModel: string,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<UsageInfo> {
    const streamId = `chatcmpl-${crypto.randomBytes(8).toString('hex')}`;
    const words = `[MoonWitness AI Gateway: ${this.slug}] Streaming completion for '${req.model}' (upstream: '${upstreamModel}'). Engine ready.`.split(
      ' '
    );

    // Initial role chunk
    onChunk({
      id: streamId,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
    });

    for (const word of words) {
      onChunk({
        id: streamId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: req.model,
        choices: [{ index: 0, delta: { content: `${word} ` }, finish_reason: null }],
      });
    }

    // Terminal chunk
    onChunk({
      id: streamId,
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
    });

    const promptTokens = Math.ceil(JSON.stringify(req.messages).length / 4);
    const completionTokens = words.length * 2;

    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    };
  }
}

