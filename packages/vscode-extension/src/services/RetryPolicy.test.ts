import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RetryPolicy, CircuitBreaker, classifyError } from './RetryPolicy';

describe('RetryPolicy', () => {
  let policy: RetryPolicy;

  beforeEach(() => {
    policy = new RetryPolicy({
      maxRetries: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      jitterPercent: 10,
    });
  });

  it('should succeed on first attempt', async () => {
    const result = await policy.execute(() => Promise.resolve('success'));
    expect(result.success).toBe(true);
    expect(result.data).toBe('success');
    expect(result.attempts).toBe(1);
  });

  it('should retry on transient error', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      if (attempts < 3) throw new Error('503 Service Unavailable');
      return Promise.resolve('success');
    };

    const result = await policy.execute(fn);
    expect(result.success).toBe(true);
    expect(attempts).toBe(3);
  });

  it('should not retry on permanent error', async () => {
    let attempts = 0;
    const fn = () => {
      attempts++;
      throw new Error('401 Unauthorized');
    };

    const result = await policy.execute(fn);
    expect(result.success).toBe(false);
    expect(attempts).toBe(1);
  });

  it('should calculate exponential backoff', () => {
    const delay0 = policy.calculateDelay(0);
    const delay1 = policy.calculateDelay(1);
    const delay2 = policy.calculateDelay(2);

    expect(delay1).toBeGreaterThan(delay0);
    expect(delay2).toBeGreaterThan(delay1);
  });
});

describe('CircuitBreaker', () => {
  it('should allow calls when closed', () => {
    const breaker = new CircuitBreaker();
    expect(breaker.canAttempt()).toBe(true);
  });

  it('should open after threshold failures', () => {
    const breaker = new CircuitBreaker(3, 100);

    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.canAttempt()).toBe(true);

    breaker.recordFailure();
    expect(breaker.canAttempt()).toBe(false);
  });

  it('should reset on success', () => {
    const breaker = new CircuitBreaker(2, 100);

    breaker.recordFailure();
    breaker.recordSuccess();
    expect(breaker.canAttempt()).toBe(true);
  });
});

describe('classifyError', () => {
  it('should classify 401 as permanent', () => {
    expect(classifyError(new Error('401 Unauthorized'))).toBe('permanent');
    expect(classifyError(new Error('403 Forbidden'))).toBe('permanent');
  });

  it('should classify 429 as transient', () => {
    expect(classifyError(new Error('429 Too Many Requests'))).toBe('transient');
  });

  it('should classify timeout as transient', () => {
    expect(classifyError(new Error('Request timeout'))).toBe('transient');
  });
});
