/**
 * Health Monitor Service
 * Tracks provider health, latency, and error rates
 */

import * as vscode from 'vscode';
import { ProviderRegistry } from '../providers';

export interface HealthMetric {
  provider: string;
  ok: boolean;
  latencyMs: number;
  timestamp: number;
}

export interface ProviderHealth {
  provider: string;
  isHealthy: boolean;
  avgLatencyMs: number;
  errorCount24h: number;
  errorRate: number;
  lastCheck: number;
  recentLatencies: number[];
}

export class HealthMonitorService {
  private static instance: HealthMonitorService;
  private readonly metricsStore = new Map<string, HealthMetric[]>();
  private pollInterval = 30000; // 30 seconds
  private pollTimer: NodeJS.Timeout | undefined;
  private readonly eventEmitter = new vscode.EventEmitter<ProviderHealth>();

  public readonly onHealthChanged = this.eventEmitter.event;

  private constructor(private readonly registry: ProviderRegistry) {
    // Initialize metrics store for all providers
    for (const provider of ['openai', 'anthropic', 'gemini', 'ollama', 'moonwitness']) {
      this.metricsStore.set(provider, []);
    }
  }

  static getInstance(registry: ProviderRegistry): HealthMonitorService {
    if (!HealthMonitorService.instance) {
      HealthMonitorService.instance = new HealthMonitorService(registry);
    }
    return HealthMonitorService.instance;
  }

  /**
   * Start health monitoring
   */
  start(): void {
    if (this.pollTimer) return;
    this.poll();
  }

  /**
   * Stop health monitoring
   */
  stop(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  /**
   * Poll health of all providers
   */
  private poll(): void {
    this.stop();
    void this.checkAllProviders();
    this.pollTimer = setTimeout(() => this.poll(), this.pollInterval);
  }

  /**
   * Check health of all configured providers
   */
  private async checkAllProviders(): Promise<void> {
    const providers = this.registry.getConfiguredProviders();

    for (const { id, provider } of providers) {
      try {
        const health = await provider.getHealth();
        this.recordMetric(id, health.ok, health.latencyMs);
      } catch (error) {
        this.recordMetric(id, false, 0);
      }
    }
  }

  /**
   * Record a health metric
   */
  private recordMetric(provider: string, ok: boolean, latencyMs: number): void {
    const metric: HealthMetric = {
      provider,
      ok,
      latencyMs,
      timestamp: Date.now(),
    };

    const metrics = this.metricsStore.get(provider) || [];
    metrics.push(metric);

    // Keep only last 24 hours of data
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = metrics.filter((m) => m.timestamp > oneDayAgo);
    this.metricsStore.set(provider, filtered);

    // Emit event
    this.eventEmitter.fire(this.calculateProviderHealth(provider));
  }

  /**
   * Calculate provider health statistics
   */
  private calculateProviderHealth(provider: string): ProviderHealth {
    const metrics = this.metricsStore.get(provider) || [];

    if (metrics.length === 0) {
      return {
        provider,
        isHealthy: false,
        avgLatencyMs: 0,
        errorCount24h: 0,
        errorRate: 0,
        lastCheck: 0,
        recentLatencies: [],
      };
    }

    const recentLatencies = metrics
      .slice(-10)
      .filter((m) => m.ok)
      .map((m) => m.latencyMs);

    const avgLatencyMs = recentLatencies.length > 0
      ? Math.round(recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length)
      : 0;

    const errorCount24h = metrics.filter((m) => !m.ok).length;
    const errorRate = metrics.length > 0 ? errorCount24h / metrics.length : 0;

    return {
      provider,
      isHealthy: metrics[metrics.length - 1]?.ok ?? false,
      avgLatencyMs,
      errorCount24h,
      errorRate,
      lastCheck: metrics[metrics.length - 1]?.timestamp ?? 0,
      recentLatencies: recentLatencies.slice(-10),
    };
  }

  /**
   * Get health for a specific provider
   */
  getProviderHealth(provider: string): ProviderHealth {
    return this.calculateProviderHealth(provider);
  }

  /**
   * Get health for all providers
   */
  getAllHealth(): ProviderHealth[] {
    const providers = this.registry.getConfiguredProviders();
    return providers.map(({ id }) => this.getProviderHealth(id));
  }

  /**
   * Check if provider is currently healthy
   */
  isProviderHealthy(provider: string): boolean {
    return this.getProviderHealth(provider).isHealthy;
  }

  reset(): void {
    for (const provider of this.metricsStore.keys()) {
      this.metricsStore.set(provider, []);
      this.eventEmitter.fire(this.calculateProviderHealth(provider));
    }
  }
}
