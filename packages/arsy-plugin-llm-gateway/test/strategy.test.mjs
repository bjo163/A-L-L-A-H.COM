import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildStrategyChain, weightedRoundRobinOrder, listCost } from '../src/strategy.js';
import { embedPrompt, EMBEDDING_DIMS } from '../src/embedding.js';
import { cosineSimilarity } from '@allah/arsy-orm';

// Minimal provider/model fixtures. The strategy module only reads id/priority (provider)
// and id/provider_id/cost fields (model), so these stay small and dependency-free — the
// whole point of a pure, fake-latency-testable decision function (roadmap F2).
function provider(id, priority, slug = `p${id}`) {
  return { id, priority, slug, base_url: `http://${slug}`, provider_type: 'openai_compatible', is_healthy: true };
}
function model(id, providerId, inputCost, outputCost, modelId = `m${id}`) {
  return { id, provider_id: providerId, model_id: modelId, name: modelId, input_cost_per_m: inputCost, output_cost_per_m: outputCost, context_window: 1000 };
}

describe('strategy-realized LLM routing (F2)', () => {
  const providers = [provider(1, 10), provider(2, 20), provider(3, 30)];
  // provider1 = pricey, provider2 = cheap, provider3 = mid.
  const modelsByProvider = new Map([
    [1, [model(101, 1, 5.0, 20.0)]],
    [2, [model(102, 2, 0.1, 0.4)]],
    [3, [model(103, 3, 1.0, 4.0)]],
  ]);
  const noMetrics = () => undefined;

  it('fallback orders by provider priority', () => {
    const chain = buildStrategyChain('fallback', providers, modelsByProvider, noMetrics, 0);
    assert.deepEqual(chain.map((c) => c.provider.id), [1, 2, 3]);
  });

  it('lowest_cost prefers the cheaper healthy provider given seeded list prices', () => {
    const chain = buildStrategyChain('lowest_cost', providers, modelsByProvider, noMetrics, 0);
    // blended costs: p2=0.5 < p3=5.0 < p1=25.0 → cheapest first.
    assert.equal(chain[0].provider.id, 2, 'cheapest provider must be picked first');
    assert.deepEqual(chain.map((c) => c.provider.id), [2, 3, 1]);
  });

  it('lowest_cost uses observed cost from the rollup over list price', () => {
    // Observed metrics say provider1 is actually cheapest per request despite high list price.
    const metrics = (c) =>
      c.provider.id === 1 ? { costUsd: 0.001 } : c.provider.id === 2 ? { costUsd: 0.5 } : { costUsd: 0.3 };
    const chain = buildStrategyChain('lowest_cost', providers, modelsByProvider, metrics, 0);
    assert.equal(chain[0].provider.id, 1, 'observed-cheapest must beat list-price-cheapest');
  });

  it('lowest_latency prefers the faster provider and fail-closes on unknown latency', () => {
    // provider3 has no observation; it must sort AFTER measured providers, not first.
    const metrics = (c) =>
      c.provider.id === 1 ? { latencyP50Ms: 800 } : c.provider.id === 2 ? { latencyP50Ms: 120 } : undefined;
    const chain = buildStrategyChain('lowest_latency', providers, modelsByProvider, metrics, 0);
    assert.deepEqual(chain.map((c) => c.provider.id), [2, 1, 3], 'unknown-latency provider sorts last');
  });

  it('weighted_rr is a deterministic permutation that favors high weight over many rotations', () => {
    const w = [provider(1, 3, 'a'), provider(2, 1, 'b')];
    const models = new Map([[1, [model(1, 1, 1, 1)]], [2, [model(2, 2, 1, 1)]]]);
    const first = weightedRoundRobinOrder(w, 0);
    const second = weightedRoundRobinOrder(w, 1);
    // Every provider appears exactly once per call.
    assert.equal(new Set(first.map((p) => p.id)).size, 2);
    assert.equal(new Set(second.map((p) => p.id)).size, 2);
    // Higher-weight provider (id 1) leads more often across the cycle.
    let leadByOne = 0;
    for (let cursor = 0; cursor < 4; cursor++) {
      if (weightedRoundRobinOrder(w, cursor)[0].id === 1) leadByOne++;
    }
    assert.ok(leadByOne >= 3, `expected provider id1 to lead most rotations, got ${leadByOne}`);
    // buildStrategyChain with weighted_rr returns a full permutation too.
    const chain = buildStrategyChain('weighted_rr', w, models, noMetrics, 2);
    assert.equal(chain.length, 2);
  });

  it('listCost sums blended input+output rates', () => {
    assert.equal(listCost(model(1, 1, 2.5, 10.0)), 12.5);
  });
});

describe('deterministic semantic embedding (F2)', () => {
  it('produces a fixed-length unit vector', () => {
    const v = embedPrompt('what is the capital of france');
    assert.equal(v.length, EMBEDDING_DIMS);
    const mag = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
    assert.ok(Math.abs(mag - 1) < 1e-9, 'embedding must be L2-normalized');
  });

  it('is stable and identical for the same prompt (cosine 1.0)', () => {
    const a = embedPrompt('Summarize the quarterly revenue report please');
    const b = embedPrompt('Summarize the quarterly revenue report please');
    assert.equal(cosineSimilarity(a, b), 1);
  });

  it('separates unrelated prompts below the near-duplicate threshold', () => {
    const a = embedPrompt('how do I reset my wifi router password');
    const b = embedPrompt('write a sonnet about autumn leaves falling');
    assert.ok(cosineSimilarity(a, b) < 0.5, 'unrelated prompts must not be near-duplicates');
  });

  it('scores a light rephrase higher than an unrelated prompt', () => {
    const base = embedPrompt('Summarize the quarterly revenue report for stakeholders');
    const rephrase = embedPrompt('Summarize the quarterly revenue report for stakeholders today');
    const unrelated = embedPrompt('how do I reset my wifi router password');
    assert.ok(cosineSimilarity(base, rephrase) > cosineSimilarity(base, unrelated));
    assert.ok(cosineSimilarity(base, rephrase) > 0.9, 'light rephrase should be very close');
  });
});
