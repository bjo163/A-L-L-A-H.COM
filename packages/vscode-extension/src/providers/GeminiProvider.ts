/**
 * Google Gemini Provider
 * Direct integration with Google Generative AI API
 */

import type { ILLMProvider, LLMProvider, ModelInfo, StandaloneChatMessage, ChatResponse, StreamChunk } from './ILLMProvider';

const GEMINI_MODELS = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: true,
      maxContextWindow: 2000000,
      inputCostPer1MTokens: 7.5,
      outputCostPer1MTokens: 30,
    },
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    capabilities: {
      supportsVision: true,
      supportsFunctionCalling: true,
      maxContextWindow: 1000000,
      inputCostPer1MTokens: 0.075,
      outputCostPer1MTokens: 0.3,
    },
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    capabilities: {
      supportsVision: false,
      supportsFunctionCalling: true,
      maxContextWindow: 32000,
      inputCostPer1MTokens: 0.5,
      outputCostPer1MTokens: 1.5,
    },
  },
];

export class GeminiProvider implements ILLMProvider {
  readonly id: LLMProvider = 'gemini';
  readonly name = 'Google Gemini';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/openai';

  constructor(private readonly apiKey: string) {}

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    return GEMINI_MODELS.map((model) => ({
      id: model.id,
      name: model.name,
      provider: this.id,
      capabilities: model.capabilities,
      ownedBy: 'google',
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
    const response = await fetch(`${this.baseUrl}/chat/completions?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `google/${model}`,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json() as any;

    return {
      id: data.id || '',
      model: model,
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
    const response = await fetch(`${this.baseUrl}/chat/completions?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: `google/${model}`,
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
        error: `Gemini stream error: ${response.statusText}`,
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      const latencyMs = Date.now() - start;
      return {
        ok: response.ok,
        latencyMs,
        message: response.ok ? 'Healthy' : `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
