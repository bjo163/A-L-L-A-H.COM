import { describe, it, expect, beforeEach } from 'vitest';
import { ProviderRegistry } from './ProviderRegistry';

describe('ProviderRegistry', () => {
  let registry: ProviderRegistry;

  beforeEach(() => {
    registry = ProviderRegistry.getInstance();
    registry.clear();
  });

  it('should register OpenAI provider', () => {
    registry.registerCredentials({ openai: 'sk-test' });
    const provider = registry.getProvider('openai');
    expect(provider).toBeTruthy();
  });

  it('should return null for unregistered provider', () => {
    const provider = registry.getProvider('openai');
    expect(provider).toBeNull();
  });

  it('should get configured providers', () => {
    registry.registerCredentials({
      openai: 'sk-test',
      anthropic: 'sk-ant-test',
    });
    const providers = registry.getConfiguredProviders();
    expect(providers.length).toBeGreaterThan(0);
  });

  it('should clear all providers', () => {
    registry.registerCredentials({ openai: 'sk-test' });
    registry.clear();
    expect(registry.getConfiguredProviders()).toHaveLength(0);
  });
});
