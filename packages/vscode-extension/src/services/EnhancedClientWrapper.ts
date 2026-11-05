/**
 * Enhanced Client Wrapper
 * Wraps the LLM client with retry, fallback, and queuing logic
 */

import { ProviderRegistry, type ILLMProvider, type StandaloneChatMessage, type ChatResponse, type StreamChunk } from '../providers';
import { RetryPolicy, CircuitBreaker } from './RetryPolicy';
import { ProviderFallbackChain } from './ProviderFallbackChain';
import { RequestQueue, type QueuedRequest } from './RequestQueue';
import { HealthMonitorService } from './HealthMonitorService';

export class EnhancedClientWrapper {
  private readonly retryPolicy: RetryPolicy;
  private readonly circuitBreakers = new Map<string, CircuitBreaker>();
  private readonly fallbackChain: ProviderFallbackChain;
  private readonly requestQueue: RequestQueue;

  constructor(
    private readonly registry: ProviderRegistry,
    private readonly healthMonitor?: HealthMonitorService
  ) {
    this.retryPolicy = new RetryPolicy({
      maxRetries: 5,
      initialDelayMs: 1000,
      maxDelayMs: 60000,
      jitterPercent: 10,
    });

    this.fallbackChain = ProviderFallbackChain.getInstance(registry);
    this.requestQueue = new RequestQueue();

    // Initialize circuit breakers
    for (const { id } of this.registry.getConfiguredProviders()) {
      this.circuitBreakers.set(id, new CircuitBreaker(3, 30000));
    }
  }

  /**
   * Chat with automatic retry and fallback
   */
  async chat(
    modelId: string,
    messages: StandaloneChatMessage[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<ChatResponse> {
    const provider = await this.getAvailableProvider();
    if (!provider) {
      throw new Error('No available providers');
    }

    const result = await this.retryPolicy.execute(() =>
      provider.chat(modelId, messages, options)
    );

    if (result.success && result.data) {
      this.recordSuccess(provider);
      return result.data;
    }

    throw new Error(result.error || 'Chat request failed');
  }

  /**
   * Stream with automatic retry and fallback
   */
  async stream(
    modelId: string,
    messages: StandaloneChatMessage[],
    onChunk: (chunk: StreamChunk) => void,
    options?: {
      temperature?: number;
      maxTokens?: number;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    const provider = await this.getAvailableProvider();
    if (!provider) {
      throw new Error('No available providers');
    }

    const result = await this.retryPolicy.execute(() =>
      provider.stream(modelId, messages, onChunk, options)
    );

    if (result.success) {
      this.recordSuccess(provider);
      return;
    }

    throw new Error(result.error || 'Stream request failed');
  }

  /**
   * Get first available provider with circuit breaker checks
   */
  private async getAvailableProvider(): Promise<ILLMProvider | null> {
    const configured = this.registry.getConfiguredProviders();

    // Try each configured provider if circuit breaker allows
    for (const { id, provider } of configured) {
      const breaker = this.circuitBreakers.get(id) || new CircuitBreaker();

      if (breaker.canAttempt() && (await this.isHealthy(provider))) {
        return provider;
      }
    }

    // Fallback to Ollama or next available
    return this.fallbackChain.getFirstAvailableProvider();
  }

  /**
   * Check provider health
   */
  private async isHealthy(provider: ILLMProvider): Promise<boolean> {
    try {
      const health = await provider.getHealth();
      return health.ok;
    } catch {
      return false;
    }
  }

  /**
   * Record successful request
   */
  private recordSuccess(provider: ILLMProvider): void {
    const breaker = this.circuitBreakers.get(provider.id);
    if (breaker) {
      breaker.recordSuccess();
    }
  }

  /**
   * Record failed request
   */
  recordFailure(providerId: string): void {
    const breaker = this.circuitBreakers.get(providerId) || new CircuitBreaker();
    breaker.recordFailure();
    this.circuitBreakers.set(providerId, breaker);
  }

  /**
   * Queue a request for later retry
   */
  queueRequest(operation: 'chat' | 'stream' | 'listModels', payload: unknown): QueuedRequest {
    const provider = Array.from(this.circuitBreakers.keys())[0] || 'moonwitness';
    return this.requestQueue.enqueue({
      provider,
      operation,
      payload,
    });
  }

  /**
   * Process queued requests
   */
  async processQueuedRequests(): Promise<number> {
    return this.requestQueue.process(async (request) => {
      try {
        // Process based on operation type
        // This is a placeholder - real implementation would deserialize and execute
        return true;
      } catch {
        return false;
      }
    });
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    queueSize: number;
    oldestRequestAgeMs: number;
    averageRetriesPerRequest: number;
  } {
    return this.requestQueue.getStats();
  }

  /**
   * Check if in offline mode
   */
  isOfflineMode(): boolean {
    return this.fallbackChain.isOffline();
  }
}
