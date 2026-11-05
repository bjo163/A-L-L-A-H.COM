export interface OperationMetric {
  operation: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  succeeded: boolean;
}

export function summarizeMetrics(metrics: OperationMetric[]) {
  const total = metrics.length;
  const succeeded = metrics.filter((metric) => metric.succeeded).length;
  return {
    total,
    succeeded,
    failureRate: total === 0 ? 0 : (total - succeeded) / total,
    averageLatencyMs: total === 0 ? 0 : metrics.reduce((sum, metric) => sum + metric.latencyMs, 0) / total,
    totalTokens: metrics.reduce((sum, metric) => sum + metric.inputTokens + metric.outputTokens, 0),
  };
}
