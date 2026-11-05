/**
 * Provider Registry
 * Manages and provides access to all LLM providers
 */

import type { ILLMProvider, LLMProvider, ModelInfo } from './ILLMProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider } from './AnthropicProvider';
import { GeminiProvider } from './GeminiProvider';
import { OllamaProvider } from './OllamaProvider';
import { MoonWitnessProvider } from './MoonWitnessProvider';

export interface ProviderCredentials {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  moonwitness?: {
    baseUrl: string;
    virtualKey?: string;
    sessionToken?: string;
  };
}

export class ProviderRegistry {
  private providers: Map<LLMProvider, ILLMProvider | null> = new Map();
  private static instance: ProviderRegistry;

  private constructor() {
    // Initialize placeholders
    this.providers.set('openai', null);
    this.providers.set('anthropic', null);
    this.providers.set('gemini', null);
    this.providers.set('ollama', null);
    this.providers.set('moonwitness', null);
  }

  static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /**
   * Register provider credentials
   */
  registerCredentials(credentials: ProviderCredentials): void {
    if (credentials.openai) {
      this.providers.set('openai', new OpenAIProvider(credentials.openai));
    }
    if (credentials.anthropic) {
      this.providers.set('anthropic', new AnthropicProvider(credentials.anthropic));
    }
    if (credentials.gemini) {
      this.providers.set('gemini', new GeminiProvider(credentials.gemini));
    }
    if (credentials.moonwitness) {
      this.providers.set(
        'moonwitness',
        new MoonWitnessProvider(
          credentials.moonwitness.baseUrl,
          credentials.moonwitness.virtualKey,
          credentials.moonwitness.sessionToken
        )
      );
    }

    // Ollama is always available if running locally
    this.ensureOllamaProvider();
  }

  /**
   * Ensure Ollama provider is available
   */
  private async ensureOllamaProvider(): Promise<void> {
    if (!this.providers.get('ollama')) {
      this.providers.set('ollama', new OllamaProvider());
    }
  }

  /**
   * Get provider by ID
   */
  getProvider(id: LLMProvider): ILLMProvider | null {
    return this.providers.get(id) || null;
  }

  /**
   * Get all configured providers
   */
  getConfiguredProviders(): Array<{ id: LLMProvider; provider: ILLMProvider }> {
    const configured: Array<{ id: LLMProvider; provider: ILLMProvider }> = [];
    for (const [id, provider] of this.providers) {
      if (provider) {
        configured.push({ id, provider });
      }
    }
    return configured;
  }

  /**
   * Get first available provider (with fallback chain)
   */
  async getFirstAvailableProvider(): Promise<ILLMProvider | null> {
    // Try in order: moonwitness → primary configured → ollama fallback
    const providers = [
      this.providers.get('moonwitness'),
      this.providers.get('openai'),
      this.providers.get('anthropic'),
      this.providers.get('gemini'),
      new OllamaProvider(), // Always try Ollama as last resort
    ];

    for (const provider of providers) {
      if (provider && (await provider.validateCredentials())) {
        return provider;
      }
    }

    return null;
  }

  /**
   * Get all available models from all providers
   */
  async getAllAvailableModels(): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];

    for (const provider of this.providers.values()) {
      if (!provider) continue;
      try {
        const models = await provider.listModels();
        allModels.push(...models);
      } catch {
        // Skip providers that fail
      }
    }

    return allModels;
  }

  /**
   * Clear all providers
   */
  clear(): void {
    this.providers.clear();
    this.providers.set('openai', null);
    this.providers.set('anthropic', null);
    this.providers.set('gemini', null);
    this.providers.set('ollama', null);
    this.providers.set('moonwitness', null);
  }
}
