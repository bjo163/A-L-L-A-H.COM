/**
 * Anthropic Provider
 * Direct integration with Anthropic API for Claude models
 */

import type { ILLMProvider, LLMProvider, ModelInfo, ChatMessage, ChatResponse, StreamChunk } from './ILLMProvider';

const ANTHROPIC_MODELS = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: false,
      maxContextWindow: 200000,
      inputCostPer1MTokens: 15,
      outputCostPer1MTokens: 75,
    },
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: false,
      maxContextWindow: 200000,
      inputCostPer1MTokens: 3,
      outputCostPer1MTokens: 15,
    },
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: false,
      maxContextWindow: 200000,
      inputCostPer1MTokens: 0.8,
      outputCostPer1MTokens: 4,
    },
  },
];

export class AnthropicProvider implements ILLMProvider {
  readonly id: LLMProvider = 'anthropic';
  readonly name = 'Anthropic';
  private readonly baseUrl = 'https://api.anthropic.com/v1';

  constructor(private readonly apiKey: string) {}

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return response.ok || response.status === 400; // 400 means auth is valid but request is bad
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    return ANTHROPIC_MODELS.map((model) => ({
      id: model.id,
      name: model.name,
      provider: this.id,
      capabilities: model.capabilities,
      ownedBy: 'anthropic',
    }));
  }

  async chat(
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<ChatResponse> {
    // Convert system messages to separate parameter
    const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 0.7,
        system: systemMessages || undefined,
        messages: userMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json() as any;

    return {
      id: data.id || '',
      model: data.model || model,
      content: data.content?.[0]?.text || '',
      tokenUsage: {
        promptTokens: data.usage?.input_tokens || 0,
        completionTokens: data.usage?.output_tokens || 0,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
      },
    };
  }

  async stream(
    model: string,
    messages: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const systemMessages = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature ?? 0.7,
        system: systemMessages || undefined,
        messages: userMessages.map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        stream: true,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      onChunk({
        type: 'error',
        error: `Anthropic stream error: ${response.statusText}`,
      });
      return;
    }

    onChunk({ type: 'start' });

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk({ type: 'error', error: 'No response body' });
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);

          try {
            const json = JSON.parse(data) as any;
            if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
              onChunk({ type: 'chunk', content: json.delta.text });
            }
          } catch {
            // Skip parse errors
          }
        }
      }

      onChunk({ type: 'end' });
    } catch (error) {
      onChunk({
        type: 'error',
        error: error instanceof Error ? error.message : 'Stream error',
      });
    } finally {
      reader.releaseLock();
    }
  }

  async getHealth(): Promise<{
    ok: boolean;
    latencyMs: number;
    message?: string;
  }> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ok' }],
        }),
      });
      const latencyMs = Date.now() - start;
      const isHealthy = response.ok || response.status === 400;
      return {
        ok: isHealthy,
        latencyMs,
        message: isHealthy ? 'Healthy' : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      'anthropic-version': '2023-06-01',
    };
  }
}
