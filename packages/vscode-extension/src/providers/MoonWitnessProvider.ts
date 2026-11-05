/**
 * MoonWitness Gateway Provider
 * Uses existing gateway infrastructure with virtual API keys
 */

import type { ILLMProvider, LLMProvider, ModelInfo, ChatMessage, ChatResponse, StreamChunk } from './ILLMProvider';

export class MoonWitnessProvider implements ILLMProvider {
  readonly id: LLMProvider = 'moonwitness';
  readonly name = 'MoonWitness Gateway';

  constructor(
    private readonly baseUrl: string,
    private readonly virtualKey: string | undefined,
    private readonly sessionToken: string | undefined
  ) {}

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/models`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      const data = await response.json() as any;

      // Normalize response format
      const models = Array.isArray(data.data) ? data.data : data.models || [];
      return models.map((m: any) => ({
        id: m.id || m.model,
        name: m.id || m.model,
        provider: this.id,
        capabilities: {
          supportsVision: m.supportsVision || false,
          supportsFunctionCalling: m.supportsFunctions || false,
          maxContextWindow: m.context_window || 4096,
          inputCostPer1MTokens: m.pricing?.input,
          outputCostPer1MTokens: m.pricing?.output,
        },
        ownedBy: m.owned_by,
      }));
    } catch (error) {
      console.error('MoonWitness: Failed to list models', error);
      return [];
    }
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
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const data = await response.json() as any;
    const usage = data.usage || {};

    return {
      id: data.id || '',
      model,
      content: data.choices?.[0]?.message?.content || '',
      tokenUsage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
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
    const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: true,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      onChunk({
        type: 'error',
        error: `Stream request failed: ${response.statusText}`,
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
          if (data === '[DONE]') continue;

          try {
            const json = JSON.parse(data) as any;
            const content = json.choices?.[0]?.delta?.content || '';
            if (content) {
              onChunk({ type: 'chunk', content });
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
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.getHeaders(),
      });
      const latencyMs = Date.now() - start;
      return {
        ok: response.ok,
        latencyMs,
        message: response.ok ? 'Healthy' : `Status ${response.status}`,
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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }
    if (this.virtualKey) {
      headers['X-API-Key'] = this.virtualKey;
    }
    return headers;
  }
}
