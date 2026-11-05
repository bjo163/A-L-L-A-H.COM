import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ProviderFallbackChain } from './ProviderFallbackChain';

function provider(id: 'openai' | 'ollama', ok: boolean) {
  return {
    id,
    name: id,
    async validateCredentials() { return ok; },
    async getHealth() { return { ok, latencyMs: 1 }; },
  };
}

test('fallback is opt-in and does not cross providers by default', async () => {
  const registry = {
    getProvider(id: 'openai' | 'ollama') {
      return id === 'openai' ? provider('openai', false) : provider('ollama', true);
    },
  };
  const chain = ProviderFallbackChain.getInstance(registry as never);
  chain.configure({ primaryProvider: 'openai', fallbackOrder: ['ollama'], allowFallback: false });

  assert.equal(await chain.getFirstAvailableProvider(), null);
  assert.deepEqual(chain.getChainOrder(), ['openai']);
});

test('configured fallback can be explicitly enabled', async () => {
  const registry = {
    getProvider(id: 'openai' | 'ollama') {
      return id === 'openai' ? provider('openai', false) : provider('ollama', true);
    },
  };
  const chain = ProviderFallbackChain.getInstance(registry as never);
  chain.configure({ primaryProvider: 'openai', fallbackOrder: ['ollama'], allowFallback: true });

  assert.equal((await chain.getFirstAvailableProvider())?.id, 'ollama');
  assert.deepEqual(chain.getChainOrder(), ['openai', 'ollama']);
});
