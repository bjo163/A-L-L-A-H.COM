import type { StandaloneChatMessage } from '../contracts';

/**
 * Abstract interface for LLM providers
 * Allows seamless switching between different AI backend providers
 */

export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'moonwitness';

export interface ModelCapabilities {
  supportsVision: boolean;
  supportsFunctionCalling: boolean;
  maxContextWindow: number;
  inputCostPer1MTokens?: number;
  outputCostPer1MTokens?: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: LLMProvider;
  capabilities: ModelCapabilities;
  ownedBy?: string;
}

export type { StandaloneChatMessage } from '../contracts';

export interface ChatResponse {
  id: string;
  model: string;
  content: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  type: 'start' | 'chunk' | 'end' | 'error';
  content?: string;
  error?: string;
  tokenUsage?: ChatResponse['tokenUsage'];
}

export interface ILLMProvider {
  /**
   * Provider identifier
   */
  readonly id: LLMProvider;

  /**
   * Provider display name
   */
  readonly name: string;

  /**
   * Check if provider is properly configured and accessible
   */
  validateCredentials(): Promise<boolean>;

  /**
   * Get list of available models from this provider
   */
  listModels(): Promise<ModelInfo[]>;

  /**
   * Send a chat completion request (single turn)
   */
  chat(
    model: string,
    messages: StandaloneChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<ChatResponse>;

  /**
   * Stream a chat completion response
   */
  stream(
    model: string,
    messages: StandaloneChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<void>;

  /**
   * Get current health status of provider
   */
  getHealth(): Promise<{
    ok: boolean;
    latencyMs: number;
    message?: string;
  }>;

  /**
   * Detect if provider is available locally (e.g., Ollama on localhost)
   */
  detectLocal?(): Promise<boolean>;
}
