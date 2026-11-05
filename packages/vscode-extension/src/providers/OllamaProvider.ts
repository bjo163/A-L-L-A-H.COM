/**
 * Ollama Provider
 * Local model support via Ollama (localhost:11434)
 */

import type { ILLMProvider, LLMProvider, ModelInfo, ChatMessage, ChatResponse, StreamChunk } from './ILLMProvider';

export class OllamaProvider implements ILLMProvider {
  readonly id: LLMProvider = 'ollama';
  readonly name = 'Ollama (Local)';
  private readonly baseUrl = 'http://localhost:11434';

  async validateCredentials(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json() as any;
      const models = Array.isArray(data.models) ? data.models : [];

      return models.map((model: any) => ({
        id: model.name,
        name: model.name,
        provider: this.id,
        capabilities: {
          supportsVision: false, // Most Ollama models don't support vision
          supportsFunctionCalling: false,
          maxContextWindow: 4096,
        },
        ownedBy: 'ollama',
      }));
    } catch {
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
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    // Read as text, not JSON (streaming response is JSONL)
    const text = await response.text();
    const lines = text.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    let content = '';
    let totalTokens = 0;

    try {
      const data = JSON.parse(lastLine) as any;
      content = data.message?.content || '';
      totalTokens = (data.prompt_eval_count || 0) + (data.eval_count || 0);
    } catch {
      // If parsing fails, treat as content
      content = text;
    }

    return {
      id: model,
      model,
      content,
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens,
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
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
      signal: options?.signal,
    });

    if (!response.ok) {
      onChunk({
        type: 'error',
        error: `Ollama stream error: ${response.statusText}`,
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
          if (!line.trim()) continue;

          try {
            const json = JSON.parse(line) as any;
            const content = json.message?.content || '';
            if (content) {
              onChunk({ type: 'chunk', content });
            }
            if (json.done) {
              onChunk({
                type: 'end',
                tokenUsage: {
                  promptTokens: json.prompt_eval_count || 0,
                  completionTokens: json.eval_count || 0,
                  totalTokens: (json.prompt_eval_count || 0) + (json.eval_count || 0),
                },
              });
            }
          } catch {
            // Skip parse errors
          }
        }
      }
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
      const response = await fetch(`${this.baseUrl}/api/tags`);
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

  async detectLocal(): Promise<boolean> {
    return this.validateCredentials();
  }
}
