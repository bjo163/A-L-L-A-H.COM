/**
 * OpenAI Provider
 * Direct integration with OpenAI API for GPT models
 */

import type { ILLMProvider, LLMProvider, ModelInfo, StandaloneChatMessage, ChatResponse, StreamChunk } from './ILLMProvider';

// Popular OpenAI models with capabilities
const OPENAI_MODELS = [
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: true,
      maxContextWindow: 128000,
      inputCostPer1MTokens: 10,
      outputCostPer1MTokens: 30,
    },
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    capabilities: {
      supportsVision: false,
      supportsFunctionCalling: true,
      maxContextWindow: 8192,
      inputCostPer1MTokens: 30,
      outputCostPer1MTokens: 60,
    },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    capabilities: {
      supportsVision: false,
      supportsFunctionCalling: true,
      maxContextWindow: 4096,
      inputCostPer1MTokens: 0.5,
      outputCostPer1MTokens: 1.5,
    },
  },
];

export class OpenAIProvider implements ILLMProvider {
  readonly id: LLMProvider = 'openai';
  readonly name = 'OpenAI';
  private readonly baseUrl = 'https://api.openai.com/v1';

  constructor(private readonly apiKey: string) {}

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    return OPENAI_MODELS.map((model) => ({
      id: model.id,
      name: model.name,
      provider: this.id,
      capabilities: model.capabilities,
      ownedBy: 'openai',
    }));
  }

  async chat(
    model: string,
    messages: StandaloneChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json() as any;

    return {
      id: data.id || '',
      model: data.model || model,
      content: data.choices?.[0]?.message?.content || '',
      tokenUsage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    };
  }

  async stream(
    model: string,
    messages: StandaloneChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
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
        error: `OpenAI stream error: ${response.statusText}`,
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
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
      });
      const latencyMs = Date.now() - start;
      if (!response.ok) {
        return {
          ok: false,
          latencyMs,
          message: `HTTP ${response.status}`,
        };
      }
      return {
        ok: true,
        latencyMs,
        message: 'Healthy',
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
      'Authorization': `Bearer ${this.apiKey}`,
    };
  }
}
