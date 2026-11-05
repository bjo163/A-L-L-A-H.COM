import assert from 'node:assert/strict';
import test from 'node:test';
import { OllamaProvider } from './OllamaProvider';

const originalFetch = globalThis.fetch;

test('discovers installed Ollama models and reads advertised capabilities', async () => {
  const requests: Array<{ url: string; body?: string }> = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requests.push({ url, body: init?.body?.toString() });
    return url.endsWith('/api/tags')
      ? new Response(JSON.stringify({ models: [{ name: 'vision-tools:latest' }, { name: '' }] }))
      : new Response(JSON.stringify({
        capabilities: ['completion', 'vision', 'tools'],
        model_info: { 'llama.context_length': 131072 },
      }));
  };

  try {
    const models = await new OllamaProvider().listModels();

    assert.deepEqual(models, [{
      id: 'vision-tools:latest',
      name: 'vision-tools:latest',
      provider: 'ollama',
      capabilities: {
        supportsVision: true,
        supportsFunctionCalling: true,
        maxContextWindow: 131072,
      },
      ownedBy: 'ollama',
    }]);
    assert.deepEqual(requests.map(({ url }) => url), [
      'http://localhost:11434/api/tags',
      'http://localhost:11434/api/show',
    ]);
    assert.deepEqual(JSON.parse(requests[1].body ?? '{}'), { model: 'vision-tools:latest' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('leaves unreported Ollama capabilities unknown', async () => {
  globalThis.fetch = async (input) => String(input).endsWith('/api/tags')
    ? new Response(JSON.stringify({ models: [{ name: 'minimal:latest' }] }))
    : new Response(JSON.stringify({ model_info: {} }));

  try {
    const [model] = await new OllamaProvider().listModels();
    assert.deepEqual(model.capabilities, {});
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('surfaces Ollama model discovery HTTP failures', async () => {
  globalThis.fetch = async () => new Response('unavailable', { status: 503 });

  try {
    await assert.rejects(new OllamaProvider().listModels(), /model discovery failed: HTTP 503/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
