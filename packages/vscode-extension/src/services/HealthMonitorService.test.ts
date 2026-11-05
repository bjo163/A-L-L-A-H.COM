import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthMonitorService } from './HealthMonitorService';
import { ProviderRegistry } from '../providers';

// Mock registry
const mockRegistry = {
  getConfiguredProviders: () => [],
} as any;

describe('HealthMonitorService', () => {
  let service: HealthMonitorService;

  beforeEach(() => {
    service = HealthMonitorService.getInstance(mockRegistry);
  });

  it('should initialize with empty metrics', () => {
    expect(service.getAllHealth()).toHaveLength(0);
  });

  it('should calculate provider health', () => {
    const health = service.getProviderHealth('openai');
    expect(health.provider).toBe('openai');
    expect(health.avgLatencyMs).toBe(0);
    expect(health.errorCount24h).toBe(0);
  });

  it('should check provider health status', () => {
    expect(service.isProviderHealthy('openai')).toBe(false);
  });

  it('should start and stop monitoring', () => {
    service.start();
    expect(service.getAllHealth()).toBeDefined();
    service.stop();
  });
});
