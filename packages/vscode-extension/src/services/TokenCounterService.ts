/**
 * Token Counter Service
 * Tracks token usage and calculates costs
 */

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ModelPricing {
  model: string;
  provider: string;
  inputCost: number; // $ per 1M tokens
  outputCost: number; // $ per 1M tokens
}

export interface UsageRecord {
  timestamp: number;
  model: string;
  provider: string;
  tokens: TokenUsage;
  cost: number;
  operation: string;
}

// Pricing database (hardcoded current rates, can be updated)
const PRICING_DATABASE: ModelPricing[] = [
  // OpenAI
  { model: 'gpt-4-turbo', provider: 'openai', inputCost: 10, outputCost: 30 },
  { model: 'gpt-4', provider: 'openai', inputCost: 30, outputCost: 60 },
  { model: 'gpt-3.5-turbo', provider: 'openai', inputCost: 0.5, outputCost: 1.5 },

  // Anthropic
  { model: 'claude-3-opus', provider: 'anthropic', inputCost: 15, outputCost: 75 },
  { model: 'claude-3-sonnet', provider: 'anthropic', inputCost: 3, outputCost: 15 },
  { model: 'claude-3-haiku', provider: 'anthropic', inputCost: 0.8, outputCost: 4 },

  // Google Gemini
  { model: 'gemini-1.5-pro', provider: 'gemini', inputCost: 7.5, outputCost: 30 },
  { model: 'gemini-1.5-flash', provider: 'gemini', inputCost: 0.075, outputCost: 0.3 },
  { model: 'gemini-1.0-pro', provider: 'gemini', inputCost: 0.5, outputCost: 1.5 },

  // Ollama (local - free)
  { model: '*', provider: 'ollama', inputCost: 0, outputCost: 0 },
];

export class TokenCounterService {
  private static instance: TokenCounterService;
  private usageHistory: UsageRecord[] = [];
  private readonly maxHistorySize = 1000;

  private constructor() {}

  static getInstance(): TokenCounterService {
    if (!TokenCounterService.instance) {
      TokenCounterService.instance = new TokenCounterService();
    }
    return TokenCounterService.instance;
  }

  /**
   * Record token usage
   */
  recordUsage(
    model: string,
    provider: string,
    tokens: TokenUsage,
    operation: string = 'chat'
  ): void {
    const pricing = this.getPricing(model, provider);
    const cost = this.calculateCost(tokens, pricing);

    const record: UsageRecord = {
      timestamp: Date.now(),
      model,
      provider,
      tokens,
      cost,
      operation,
    };

    this.usageHistory.push(record);

    // Keep only recent history
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory.shift();
    }
  }

  /**
   * Get pricing for model
   */
  private getPricing(model: string, provider: string): ModelPricing {
    // Try exact match first
    let pricing = PRICING_DATABASE.find((p) => p.model === model && p.provider === provider);

    // Fall back to wildcard
    if (!pricing) {
      pricing = PRICING_DATABASE.find((p) => p.model === '*' && p.provider === provider);
    }

    // Default to free
    return pricing || { model, provider, inputCost: 0, outputCost: 0 };
  }

  /**
   * Calculate cost for token usage
   */
  private calculateCost(tokens: TokenUsage, pricing: ModelPricing): number {
    const inputCost = (tokens.inputTokens / 1_000_000) * pricing.inputCost;
    const outputCost = (tokens.outputTokens / 1_000_000) * pricing.outputCost;
    return inputCost + outputCost;
  }

  /**
   * Get usage statistics for time period
   */
  getUsageStats(timeWindowMs: number = 24 * 60 * 60 * 1000): {
    totalTokens: number;
    totalCost: number;
    requestCount: number;
    averageCost: number;
    byProvider: Record<string, { tokens: number; cost: number }>;
  } {
    const cutoffTime = Date.now() - timeWindowMs;
    const filtered = this.usageHistory.filter((r) => r.timestamp > cutoffTime);

    const stats = {
      totalTokens: 0,
      totalCost: 0,
      requestCount: filtered.length,
      averageCost: 0,
      byProvider: {} as Record<string, { tokens: number; cost: number }>,
    };

    for (const record of filtered) {
      stats.totalTokens += record.tokens.totalTokens;
      stats.totalCost += record.cost;

      if (!stats.byProvider[record.provider]) {
        stats.byProvider[record.provider] = { tokens: 0, cost: 0 };
      }
      stats.byProvider[record.provider].tokens += record.tokens.totalTokens;
      stats.byProvider[record.provider].cost += record.cost;
    }

    stats.averageCost = filtered.length > 0 ? stats.totalCost / filtered.length : 0;

    return stats;
  }

  /**
   * Format cost as currency
   */
  formatCost(cost: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(cost);
  }

  /**
   * Format token count
   */
  formatTokens(tokens: number): string {
    if (tokens < 1000) return tokens.toString();
    if (tokens < 1_000_000) return (tokens / 1000).toFixed(1) + 'K';
    return (tokens / 1_000_000).toFixed(2) + 'M';
  }

  /**
   * Get full history
   */
  getHistory(): UsageRecord[] {
    return [...this.usageHistory];
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.usageHistory = [];
  }

  /**
   * Export usage as CSV
   */
  exportAsCSV(): string {
    const headers = ['Timestamp', 'Model', 'Provider', 'Input Tokens', 'Output Tokens', 'Total Tokens', 'Cost', 'Operation'];
    const rows = this.usageHistory.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.model,
      r.provider,
      r.tokens.inputTokens,
      r.tokens.outputTokens,
      r.tokens.totalTokens,
      this.formatCost(r.cost),
      r.operation,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }
}
