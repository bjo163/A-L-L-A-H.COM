import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

// Semantic cache (roadmap F2) is opt-in. Enable it for this file's process only; each test
// file runs in its own process (node --test default), so the env toggle never leaks.
process.env.LLM_SEMANTIC_CACHE = '1';
process.env.LLM_SEMANTIC_THRESHOLD = '0.95';

const { app, headers } = await buildAuthenticatedApp();
const authed = (extra = {}) => ({ ...headers, 'content-type': 'application/json', ...extra });
const post = (payload) =>
  app.inject({ method: 'POST', url: '/v1/chat/completions', headers: authed(), body: JSON.stringify(payload) });

test('wired semantic cache short-circuits a provider call (F2)', async (t) => {
  const prompt = 'Explain the difference between TCP and UDP in one sentence';

  await t.test('first request is a miss (provider is called, entry stored)', async () => {
    // temperature 0.1 makes the exact-cache key distinct from the second request's key,
    // so the semantic (content-only) layer is what proves the near-duplicate match.
    const res = await post({ model: 'dx-default', messages: [{ role: 'user', content: prompt }], temperature: 0.1 });
    assert.equal(res.statusCode, 200, res.payload);
    assert.equal(res.headers['x-semantic-cache'], undefined, 'first call must not be a semantic hit');
  });

  await t.test('a near-duplicate prompt is served from the semantic cache without a provider call', async () => {
    // Same content, different temperature → exact-cache miss → semantic-vector hit.
    const res = await post({ model: 'dx-default', messages: [{ role: 'user', content: prompt }], temperature: 0.9 });
    assert.equal(res.statusCode, 200, res.payload);
    assert.equal(res.headers['x-semantic-cache'], 'hit', 'semantic cache must serve the near-duplicate');
    assert.equal(res.headers['x-cache-hit'], 'true');
  });

  await t.test('an unrelated prompt is not a semantic hit', async () => {
    const res = await post({
      model: 'dx-default',
      messages: [{ role: 'user', content: 'Compose a limerick about a purple kangaroo named Gary' }],
      temperature: 0.1,
    });
    assert.equal(res.statusCode, 200, res.payload);
    assert.equal(res.headers['x-semantic-cache'], undefined, 'unrelated prompt must miss the semantic cache');
  });

  await app.close();
});
