export interface CircuitState {
  consecutiveFailures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export class ProviderCircuitBreaker {
  private states = new Map<string, CircuitState>();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(failureThreshold = 3, resetTimeoutMs = 60000) {
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
  }

  isAvailable(providerSlug: string): boolean {
    const state = this.states.get(providerSlug);
    if (!state) return true;

    if (state.isOpen) {
      const elapsed = Date.now() - state.lastFailureTime;
      if (elapsed > this.resetTimeoutMs) {
        // Half-open: allow a trial request
        return true;
      }
      return false;
    }
    return true;
  }

  recordSuccess(providerSlug: string): void {
    const state = this.states.get(providerSlug);
    if (state) {
      state.consecutiveFailures = 0;
      state.isOpen = false;
    }
  }

  recordFailure(providerSlug: string): void {
    let state = this.states.get(providerSlug);
    if (!state) {
      state = { consecutiveFailures: 0, lastFailureTime: 0, isOpen: false };
      this.states.set(providerSlug, state);
    }

    state.consecutiveFailures += 1;
    state.lastFailureTime = Date.now();

    if (state.consecutiveFailures >= this.failureThreshold) {
      state.isOpen = true;
    }
  }

  getSnapshot(): Record<string, { healthy: boolean; failures: number; isOpen: boolean }> {
    const result: Record<string, { healthy: boolean; failures: number; isOpen: boolean }> = {};
    for (const [slug, state] of this.states.entries()) {
      result[slug] = {
        healthy: !state.isOpen,
        failures: state.consecutiveFailures,
        isOpen: state.isOpen,
      };
    }
    return result;
  }
}
