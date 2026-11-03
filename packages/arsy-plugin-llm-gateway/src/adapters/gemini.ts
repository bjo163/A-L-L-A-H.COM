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

export class GeminiAdapter implements ProviderAdapter {
  readonly slug: string;
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(
    slug = 'gemini',
    baseUrl = 'https://generativelanguage.googleapis.com/v1beta',
    apiKey?: string
  ) {
    this.slug = slug;
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  private transformMessages(messages: ChatCompletionRequest['messages']): {
    systemInstruction?: { parts: Array<{ text: string }> };
    contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  } {
    let systemText = '';
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    for (const msg of messages) {
      if (msg.role === 'system') {
        systemText = systemText ? `${systemText}\n\n${msg.content}` : msg.content;
      } else {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
    }

    return {
      systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
      contents,
    };
  }

  async chat(req: ChatCompletionRequest, upstreamModel: string): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(`Google Gemini API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Gemini Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { systemInstruction, contents } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.max_tokens,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    const url = `${this.baseUrl}/models/${upstreamModel}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    const response = await undiciRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Gemini Provider returned HTTP ${response.statusCode}: ${errorText}`);
    }

    const json = (await response.body.json()) as any;
    const candidate = json.candidates?.[0];
    const textContent = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

    return {
      id: `gemini-${crypto.randomBytes(8).toString('hex')}`,
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
          finish_reason: candidate?.finishReason === 'STOP' ? 'stop' : candidate?.finishReason || 'stop',
        },
      ],
      usage: json.usageMetadata
        ? {
            prompt_tokens: json.usageMetadata.promptTokenCount || 0,
            completion_tokens: json.usageMetadata.candidatesTokenCount || 0,
            total_tokens: json.usageMetadata.totalTokenCount || 0,
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
      throw new Error(`Google Gemini API Key not configured for provider [${this.slug}]`);
    }

    if (!validateUrlSsrf(this.baseUrl)) {
      throw new Error(`Gemini Base URL '${this.baseUrl}' rejected by SSRF guard`);
    }

    const { systemInstruction, contents } = this.transformMessages(req.messages);

    const payload: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.max_tokens,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    const url = `${this.baseUrl}/models/${upstreamModel}:streamGenerateContent?alt=sse&key=${encodeURIComponent(
      this.apiKey
    )}`;
    const response = await undiciRequest(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.statusCode < 200 || response.statusCode >= 300) {
      const errorText = await response.body.text().catch(() => '');
      throw new Error(`Gemini Provider stream failed with HTTP ${response.statusCode}: ${errorText}`);
    }

    let promptTokens = 0;
    let completionTokens = 0;
    const streamId = `gemini-${crypto.randomBytes(8).toString('hex')}`;
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
            if (data.usageMetadata) {
              promptTokens = data.usageMetadata.promptTokenCount || promptTokens;
              completionTokens = data.usageMetadata.candidatesTokenCount || completionTokens;
            }

            const candidate = data.candidates?.[0];
            const textDelta = candidate?.content?.parts?.map((p: any) => p.text).join('') || '';

            if (textDelta) {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [
                  {
                    index: 0,
                    delta: { content: textDelta },
                    finish_reason: null,
                  },
                ],
              });
            }

            if (candidate?.finishReason) {
              onChunk({
                id: streamId,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: req.model,
                choices: [
                  {
                    index: 0,
                    delta: {},
                    finish_reason: candidate.finishReason === 'STOP' ? 'stop' : candidate.finishReason,
                  },
                ],
              });
            }
          } catch (e) {
            logger.warn({ err: e, line: trimmed }, 'Failed parsing Gemini SSE chunk');
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
