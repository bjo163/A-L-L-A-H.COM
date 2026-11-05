/**
 * Provider Fallback Chain
 * Manages graceful degradation when providers fail
 */

import { ProviderRegistry, type ILLMProvider } from '../providers';

export interface FallbackChainOptions {
  primaryProvider?: string;
  fallbackOrder?: string[];
}

export class ProviderFallbackChain {
  private static instance: ProviderFallbackChain;
  private primaryProvider: string = 'moonwitness';
  private fallbackOrder: string[] = ['openai', 'anthropic', 'gemini', 'ollama'];
  private isOfflineMode = false;

  private constructor(private readonly registry: ProviderRegistry) {}

  static getInstance(registry: ProviderRegistry): ProviderFallbackChain {
    if (!ProviderFallbackChain.instance) {
      ProviderFallbackChain.instance = new ProviderFallbackChain(registry);
    }
    return ProviderFallbackChain.instance;
  }

  /**
   * Configure fallback chain order
   */
  configure(options: FallbackChainOptions): void {
    if (options.primaryProvider) {
      this.primaryProvider = options.primaryProvider;
    }
    if (options.fallbackOrder) {
      this.fallbackOrder = options.fallbackOrder;
    }
  }

  /**
   * Get first available provider in fallback chain
   */
  async getFirstAvailableProvider(): Promise<ILLMProvider | null> {
    // Build chain: primary → other configured → ollama fallback
    const chain = [
      this.primaryProvider,
      ...this.fallbackOrder.filter((p) => p !== this.primaryProvider),
    ];

    for (const providerId of chain) {
      const provider = this.registry.getProvider(providerId as any);
      if (provider && (await this.isProviderAvailable(provider))) {
        this.isOfflineMode = false;
        return provider;
      }
    }

    // Last resort: Ollama if available
    try {
      const ollamaProvider = this.registry.getProvider('ollama');
      if (ollamaProvider && (await ollamaProvider.validateCredentials())) {
        this.isOfflineMode = true;
        return ollamaProvider;
      }
    } catch {
      // Ollama not available
    }

    this.isOfflineMode = true;
    return null;
  }

  /**
   * Check if provider is available
   */
  private async isProviderAvailable(provider: ILLMProvider): Promise<boolean> {
    try {
      const health = await provider.getHealth();
      return health.ok;
    } catch {
      return false;
    }
  }

  /**
   * Check if in offline mode
   */
  isOffline(): boolean {
    return this.isOfflineMode;
  }

  /**
   * Set offline mode
   */
  setOfflineMode(offline: boolean): void {
    this.isOfflineMode = offline;
  }

  /**
   * Get current fallback chain order
   */
  getChainOrder(): string[] {
    return [this.primaryProvider, ...this.fallbackOrder];
  }
}
