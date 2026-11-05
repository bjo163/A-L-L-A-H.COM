import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeMetrics } from './observability';

test('summarizes latency, reliability, and token metrics', () => {
  assert.deepEqual(summarizeMetrics([
    { operation: 'chat', latencyMs: 100, inputTokens: 2, outputTokens: 3, succeeded: true },
    { operation: 'chat', latencyMs: 300, inputTokens: 1, outputTokens: 4, succeeded: false },
  ]), { total: 2, succeeded: 1, failureRate: 0.5, averageLatencyMs: 200, totalTokens: 10 });
});
