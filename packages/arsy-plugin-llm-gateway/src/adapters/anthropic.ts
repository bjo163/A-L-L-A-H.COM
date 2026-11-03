import crypto from 'crypto';
import { request as undiciRequest } from 'undici';
import { logger } from '@allah/arsy-core';
import type { ProviderAdapter } from './base';
import type {
  ChatCompletionRequest,
  ChatCompletionResponse,
  StreamChunk,
  UsageInfo,
} from '../types';
import { validateUrlSsrf } from '../ssrf';

export class AnthropicAdapter implements ProviderAdapter {
  readonly slug: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(slug = 'anthropic', baseUrl = 'https://api.anthropic.com/v1', apiKey?: string) {
    this.slug = slug;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private transformMessages(messages: ChatCompletionRequest['messages']): {
    system?: string;
    anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  } {
    let systemPrompt = '';
    const anthropicMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemPrompt = systemPrompt ? `${systemPrompt}\n\n${msg.content}` : msg.content;
      } else if (msg.role === 'user' || msg.role === 'assistant') {
        anthropicMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Hello' });
    }

    return {
      system: systemPrompt || undefined,
      anthropicMessages,
    };
  }

  async chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(`Anthropic API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Anthropic Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { system, anthropicMessages } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      model: upstreamModel,
      max_tokens: req.max_tokens || 4096,
      messages: anthropicMessages,
      temperature: req.temperature ?? 0.7,
    };

    if (system) {
      payload.system = system;
    }

    const response = await undiciRequest(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Anthropic Provider returned HTTP ${response.statusCode}: ${errorText}`);
    }

    const json = (await response.body.json()) as any;
    const textContent = (json.content || [])
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    return {
      id: json.id || `msg-${crypto.randomBytes(8).toString('hex')}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: req.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: textContent,
          },
          finish_reason: json.stop_reason === 'end_turn' ? 'stop' : json.stop_reason || 'stop',
        },
      ],
      usage: json.usage
        ? {
            prompt_tokens: json.usage.input_tokens || 0,
            completion_tokens: json.usage.output_tokens || 0,
            total_tokens: (json.usage.input_tokens || 0) + (json.usage.output_tokens || 0),
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
      throw new Error(`Anthropic API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Anthropic Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { system, anthropicMessages } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      model: upstreamModel,
      max_tokens: req.max_tokens || 4096,
      messages: anthropicMessages,
      temperature: req.temperature ?? 0.7,
      stream: true,
    };

    if (system) {
      payload.system = system;
    }

    const response = await undiciRequest(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Anthropic Provider stream failed with HTTP ${response.statusCode}: ${errorText}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    let streamId = `msg-${crypto.randomBytes(8).toString('hex')}`;
    let buffer = '';

    for await (const chunk of response.body) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.type === 'message_start' && data.message) {
              streamId = data.message.id || streamId;
              if (data.message.usage) {
                promptTokens = data.message.usage.input_tokens || 0;
              }
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: { role: 'assistant', content: '' }, finish_reason: null }],
              });
            } else if (data.type === 'content_block_delta' && data.delta?.text) {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: { content: data.delta.text }, finish_reason: null }],
              });
            } else if (data.type === 'message_delta' && data.usage) {
              completionTokens = data.usage.output_tokens || 0;
            } else if (data.type === 'message_stop') {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
              });
            }
          } catch (e) {
            logger.warn({ err: e, line: trimmed }, 'Failed parsing Anthropic SSE chunk');
          }
        }
      }
    }

    return {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens,
    };
  }
}
