/**
 * Usage Dashboard Service
 * Tracks token usage, costs, and enforces budget limits
 * Provides real-time metrics and alerts
 */

import { EventEmitter } from 'events';
import { TokenCounterService } from './TokenCounterService';
import { MissionTimelineService } from './MissionTimelineService';

export interface BudgetLimit {
  period: 'daily' | 'weekly' | 'monthly';
  maxTokens: number;
  maxCost: number;
  alertThreshold: number; // percentage (e.g., 75 = alert at 75%)
}

export interface UsageMetrics {
  period: string;
  tokensUsed: number;
  costIncurred: number;
  requestCount: number;
  errorCount: number;
  averageLatencyMs: number;
  topModels: Array<{ model: string; tokenCount: number; cost: number }>;
  estimatedCostRemaining: number;
  budgetStatus: 'healthy' | 'warning' | 'critical' | 'exceeded';
}

export interface BudgetAlert {
  severity: 'warning' | 'critical' | 'exceeded';
  message: string;
  timestamp: number;
  percentageUsed: number;
  currentCost: number;
  remainingBudget: number;
}

/**
 * Singleton service for usage tracking and budget enforcement
 */
export class UsageDashboardService extends EventEmitter {
  private static instance: UsageDashboardService;
  private budgetLimits: Map<string, BudgetLimit> = new Map();
  private dailyUsage: UsageMetrics = this.initializeMetrics('daily');
  private weeklyUsage: UsageMetrics = this.initializeMetrics('weekly');
  private monthlyUsage: UsageMetrics = this.initializeMetrics('monthly');
  private alerts: BudgetAlert[] = [];
  private lastCheckTime: number = Date.now();

  private constructor(
    private tokenCounter: TokenCounterService,
    private timeline: MissionTimelineService
  ) {
    super();
    this.initializeDefaultBudgets();
    this.startBudgetMonitoring();
  }

  public static getInstance(
    tokenCounter?: TokenCounterService,
    timeline?: MissionTimelineService
  ): UsageDashboardService {
    if (!UsageDashboardService.instance) {
      if (!tokenCounter || !timeline) {
        throw new Error('TokenCounterService and MissionTimelineService required for initialization');
      }
      UsageDashboardService.instance = new UsageDashboardService(tokenCounter, timeline);
    }
    return UsageDashboardService.instance;
  }

  /**
   * Set budget limits for a period
   */
  public setBudgetLimit(period: 'daily' | 'weekly' | 'monthly', limit: BudgetLimit): void {
    this.budgetLimits.set(period, limit);
    this.emit('budgetUpdated', { period, limit });
  }

  /**
   * Get current budget limit
   */
  public getBudgetLimit(period: 'daily' | 'weekly' | 'monthly'): BudgetLimit | undefined {
    return this.budgetLimits.get(period);
  }

  /**
   * Record token usage from a request
   */
  public recordUsage(model: string, inputTokens: number, outputTokens: number, latencyMs: number): void {
    const stats = this.tokenCounter.getUsageStats();
    const cost = stats.averageCost;

    // Update all usage metrics
    this.dailyUsage.tokensUsed += inputTokens + outputTokens;
    this.dailyUsage.costIncurred += cost;
    this.dailyUsage.requestCount += 1;
    this.dailyUsage.averageLatencyMs =
      (this.dailyUsage.averageLatencyMs * (this.dailyUsage.requestCount - 1) + latencyMs) /
      this.dailyUsage.requestCount;

    // Update model-specific metrics
    const modelEntry = this.dailyUsage.topModels.find((m) => m.model === model);
    if (modelEntry) {
      modelEntry.tokenCount += inputTokens + outputTokens;
      modelEntry.cost += cost;
    } else {
      this.dailyUsage.topModels.push({
        model,
        tokenCount: inputTokens + outputTokens,
        cost,
      });
    }

    // Sort by tokens used
    this.dailyUsage.topModels.sort((a, b) => b.tokenCount - a.tokenCount);

    // Check budget
    this.checkBudgetLimits();
  }

  /**
   * Record error in usage
   */
  public recordError(): void {
    this.dailyUsage.errorCount += 1;
    this.weeklyUsage.errorCount += 1;
    this.monthlyUsage.errorCount += 1;
  }

  /**
   * Get current usage metrics
   */
  public getMetrics(period: 'daily' | 'weekly' | 'monthly'): UsageMetrics {
    switch (period) {
      case 'daily':
        return this.calculateMetrics(this.dailyUsage);
      case 'weekly':
        return this.calculateMetrics(this.weeklyUsage);
      case 'monthly':
        return this.calculateMetrics(this.monthlyUsage);
    }
  }

  /**
   * Get all active alerts
   */
  public getAlerts(): BudgetAlert[] {
    return [...this.alerts];
  }

  /**
   * Acknowledge and dismiss an alert
   */
  public dismissAlert(index: number): void {
    this.alerts.splice(index, 1);
  }

  /**
   * Check if budget is exceeded
   */
  public isBudgetExceeded(period: 'daily' | 'weekly' | 'monthly'): boolean {
    const limit = this.budgetLimits.get(period);
    if (!limit) return false;

    const metrics = this.getMetrics(period);
    return metrics.costIncurred > limit.maxCost || metrics.tokensUsed > limit.maxTokens;
  }

  /**
   * Get budget status
   */
  public getBudgetStatus(period: 'daily' | 'weekly' | 'monthly'): 'healthy' | 'warning' | 'critical' | 'exceeded' {
    const limit = this.budgetLimits.get(period);
    if (!limit) return 'healthy';

    const metrics = this.getMetrics(period);
    const percentageUsed = (metrics.costIncurred / limit.maxCost) * 100;

    if (percentageUsed >= 100) return 'exceeded';
    if (percentageUsed >= 90) return 'critical';
    if (percentageUsed >= limit.alertThreshold) return 'warning';
    return 'healthy';
  }

  /**
   * Export usage data for reporting
   */
  public exportUsageData(period: 'daily' | 'weekly' | 'monthly'): string {
    const metrics = this.getMetrics(period);
    const data = {
      period: metrics.period,
      timestamp: new Date().toISOString(),
      metrics,
      alerts: this.alerts,
      budgetLimit: this.budgetLimits.get(period as any),
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Reset usage for a period
   */
  public resetUsage(period: 'daily' | 'weekly' | 'monthly'): void {
    switch (period) {
      case 'daily':
        this.dailyUsage = this.initializeMetrics('daily');
        break;
      case 'weekly':
        this.weeklyUsage = this.initializeMetrics('weekly');
        break;
      case 'monthly':
        this.monthlyUsage = this.initializeMetrics('monthly');
        break;
    }

    this.emit('usageReset', { period });
  }

  /**
   * Initialize default budget limits (generous defaults for v1.0)
   */
  private initializeDefaultBudgets(): void {
    this.budgetLimits.set('daily', {
      period: 'daily',
      maxTokens: 1000000,
      maxCost: 50,
      alertThreshold: 75,
    });

    this.budgetLimits.set('weekly', {
      period: 'weekly',
      maxTokens: 5000000,
      maxCost: 250,
      alertThreshold: 75,
    });

    this.budgetLimits.set('monthly', {
      period: 'monthly',
      maxTokens: 20000000,
      maxCost: 1000,
      alertThreshold: 75,
    });
  }

  /**
   * Check budget limits and emit alerts
   */
  private checkBudgetLimits(): void {
    const periods: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly'];

    for (const period of periods) {
      const limit = this.budgetLimits.get(period);
      if (!limit) continue;

      const metrics = this.getMetrics(period);
      const percentageUsed = (metrics.costIncurred / limit.maxCost) * 100;

      // Check for exceeded
      if (percentageUsed >= 100) {
        const alert: BudgetAlert = {
          severity: 'exceeded',
          message: `${period.charAt(0).toUpperCase() + period.slice(1)} budget EXCEEDED: $${metrics.costIncurred.toFixed(2)} / $${limit.maxCost}`,
          timestamp: Date.now(),
          percentageUsed,
          currentCost: metrics.costIncurred,
          remainingBudget: Math.max(0, limit.maxCost - metrics.costIncurred),
        };
        this.addAlert(alert);
      } else if (percentageUsed >= 90) {
        // Check for critical
        const alert: BudgetAlert = {
          severity: 'critical',
          message: `${period.charAt(0).toUpperCase() + period.slice(1)} budget CRITICAL: ${percentageUsed.toFixed(1)}% used`,
          timestamp: Date.now(),
          percentageUsed,
          currentCost: metrics.costIncurred,
          remainingBudget: Math.max(0, limit.maxCost - metrics.costIncurred),
        };
        this.addAlert(alert);
      } else if (percentageUsed >= limit.alertThreshold) {
        // Check for warning
        const alert: BudgetAlert = {
          severity: 'warning',
          message: `${period.charAt(0).toUpperCase() + period.slice(1)} budget WARNING: ${percentageUsed.toFixed(1)}% used`,
          timestamp: Date.now(),
          percentageUsed,
          currentCost: metrics.costIncurred,
          remainingBudget: Math.max(0, limit.maxCost - metrics.costIncurred),
        };
        this.addAlert(alert);
      }
    }
  }

  /**
   * Add alert if not already present
   */
  private addAlert(alert: BudgetAlert): void {
    const exists = this.alerts.some(
      (a) =>
        a.severity === alert.severity &&
        a.message === alert.message &&
        Date.now() - a.timestamp < 60000 // Same alert within 1 minute
    );

    if (!exists) {
      this.alerts.push(alert);
      this.emit('alert', alert);

      // Keep only last 50 alerts
      if (this.alerts.length > 50) {
        this.alerts.shift();
      }
    }
  }

  /**
   * Calculate metrics from usage data
   */
  private calculateMetrics(usage: UsageMetrics): UsageMetrics {
    const limit = this.budgetLimits.get(usage.period as any);
    return {
      ...usage,
      estimatedCostRemaining: limit ? Math.max(0, limit.maxCost - usage.costIncurred) : 0,
      budgetStatus: limit
        ? (usage.costIncurred / limit.maxCost > 1
            ? 'exceeded'
            : usage.costIncurred / limit.maxCost > 0.9
              ? 'critical'
              : usage.costIncurred / limit.maxCost > limit.alertThreshold / 100
                ? 'warning'
                : 'healthy')
        : 'healthy',
    };
  }

  /**
   * Initialize metrics object
   */
  private initializeMetrics(period: string): UsageMetrics {
    return {
      period,
      tokensUsed: 0,
      costIncurred: 0,
      requestCount: 0,
      errorCount: 0,
      averageLatencyMs: 0,
      topModels: [],
      estimatedCostRemaining: 0,
      budgetStatus: 'healthy',
    };
  }

  /**
   * Start background budget monitoring
   */
  private startBudgetMonitoring(): void {
    // Check every minute
    setInterval(() => {
      this.checkBudgetLimits();
    }, 60000);
  }
}
