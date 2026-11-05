/**
 * Retry Policy
 * Implements exponential backoff, jitter, and circuit breaker
 */

export interface RetryPolicyConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  jitterPercent?: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalDelayMs: number;
}

export type ErrorClassification = 'permanent' | 'transient' | 'unknown';

/**
 * Classify error type to determine retry strategy
 */
export function classifyError(error: unknown): ErrorClassification {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Permanent errors - don't retry
    if (
      message.includes('401') ||
      message.includes('403') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('invalid api key') ||
      message.includes('authentication failed')
    ) {
      return 'permanent';
    }

    // Transient errors - retry
    if (
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('timeout') ||
      message.includes('econnrefused') ||
      message.includes('network error')
    ) {
      return 'transient';
    }
  }

  return 'unknown';
}

export class RetryPolicy {
  private maxRetries: number;
  private initialDelayMs: number;
  private maxDelayMs: number;
  private jitterPercent: number;

  constructor(config: RetryPolicyConfig = {}) {
    this.maxRetries = config.maxRetries ?? 5;
    this.initialDelayMs = config.initialDelayMs ?? 1000;
    this.maxDelayMs = config.maxDelayMs ?? 60000;
    this.jitterPercent = config.jitterPercent ?? 10;
  }

  /**
   * Calculate delay for given attempt number (exponential backoff with jitter)
   */
  calculateDelay(attemptNumber: number): number {
    const exponentialDelay = Math.min(
      this.initialDelayMs * Math.pow(2, attemptNumber),
      this.maxDelayMs
    );

    // Add jitter: ±jitterPercent
    const jitter = (Math.random() - 0.5) * 2 * (exponentialDelay * (this.jitterPercent / 100));
    const delayWithJitter = Math.max(0, exponentialDelay + jitter);

    return Math.round(delayWithJitter);
  }

  /**
   * Wait for specified milliseconds
   */
  private async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    onRetry?: (attempt: number, delay: number, error: Error) => void
  ): Promise<RetryResult<T>> {
    let lastError: Error | undefined;
    let totalDelayMs = 0;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const data = await fn();
        return {
          success: true,
          data,
          attempts: attempt + 1,
          totalDelayMs,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const classification = classifyError(lastError);

        // Don't retry permanent errors
        if (classification === 'permanent') {
          return {
            success: false,
            error: lastError.message,
            attempts: attempt + 1,
            totalDelayMs,
          };
        }

        // If max retries reached, give up
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: lastError.message,
            attempts: attempt + 1,
            totalDelayMs,
          };
        }

        // Calculate and wait for next retry
        const delayMs = this.calculateDelay(attempt);
        totalDelayMs += delayMs;

        if (onRetry) {
          onRetry(attempt + 1, delayMs, lastError);
        }

        await this.wait(delayMs);
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      attempts: this.maxRetries + 1,
      totalDelayMs,
    };
  }
}

/**
 * Circuit Breaker Pattern
 * Prevents repeated calls to failing services
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private readonly failureThreshold: number = 3,
    private readonly resetTimeoutMs: number = 30000
  ) {}

  /**
   * Check if circuit can attempt call
   */
  canAttempt(): boolean {
    if (this.state === 'closed') return true;
    if (this.state === 'half-open') return true;

    // If open, check if reset timeout has passed
    if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
      this.state = 'half-open';
      return true;
    }

    return false;
  }

  /**
   * Record successful call
   */
  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  /**
   * Record failed call
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * Get current state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }
}
