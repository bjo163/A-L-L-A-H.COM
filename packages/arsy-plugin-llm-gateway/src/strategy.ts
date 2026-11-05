import type { ProviderRecord, ModelRecord } from './types';

// One provider/model pairing that a strategy can rank and emit into the fallback chain.
export interface RouteCandidate {
  provider: ProviderRecord;
  model: ModelRecord;
}

// Observed (from the ai.usage_daily rollup, roadmap F1) per-(provider, model) history.
// Absent fields mean "no observation yet" and are treated fail-closed: a candidate with
// unknown latency/cost never outranks one with a real measurement.
export interface CandidateMetrics {
  latencyP50Ms?: number;
  costUsd?: number;
  requestCount?: number;
}

export type MetricsResolver = (candidate: RouteCandidate) => CandidateMetrics | undefined;

export type RoutingStrategy = 'fallback' | 'lowest_cost' | 'lowest_latency' | 'weighted_rr';

// Blended list price (input + output, per million tokens). The deterministic, DB-free
// tiebreaker and the fallback signal when no usage history exists yet.
export function listCost(model: ModelRecord): number {
  return (Number(model.input_cost_per_m) || 0) + (Number(model.output_cost_per_m) || 0);
}

function priorityOf(c: RouteCandidate): number {
  return Number(c.provider.priority ?? 0);
}

// Cheapest list-price model on a provider; used to give each provider one representative
// under strategies that optimize cost.
function pickByCost(models: ModelRecord[]): ModelRecord {
  return models.reduce((best, m) => (listCost(m) < listCost(best) ? m : best), models[0]);
}

// The model with the lowest observed p50 latency on a provider, degrading to cheapest list
// price when no latency has been recorded (fail-closed: unknown never beats known).
function pickByLatency(models: ModelRecord[], metricsFor: MetricsResolver, provider: ProviderRecord): ModelRecord {
  return models.reduce((best, m) => {
    const bLat = metricsFor({ provider, model: best })?.latencyP50Ms;
    const mLat = metricsFor({ provider, model: m })?.latencyP50Ms;
    if (mLat == null) return best;
    if (bLat == null) return m;
    return mLat < bLat ? m : best;
  }, models[0]);
}

// Weighted round-robin over providers: a provider with priority weight w occupies w slots
// in the rotation, so it comes up first more often across successive requests without ever
// starving the others. Deterministic given (providers, cursor) and always yields a full
// permutation.
export function weightedRoundRobinOrder(providers: ProviderRecord[], cursor: number): ProviderRecord[] {
  if (providers.length === 0) return [];
  const slots: ProviderRecord[] = [];
  for (const p of providers) {
    const weight = Math.max(1, Math.round(Number(p.priority ?? 1)));
    for (let k = 0; k < weight; k++) slots.push(p);
  }
  const start = ((cursor % slots.length) + slots.length) % slots.length;
  const order: ProviderRecord[] = [];
  const seen = new Set<number>();
  for (let n = 0; n < slots.length; n++) {
    const p = slots[(start + n) % slots.length];
    const id = Number(p.id);
    if (!seen.has(id)) {
      seen.add(id);
      order.push(p);
    }
  }
  return order;
}

/**
 * Realize a declared route strategy (roadmap F2) into an ordered one-candidate-per-provider
 * fallback chain. Replaces the old literal-alias special-case: the chain order now comes
 * from `route.strategy` reading F1 usage rollups + provider health.
 *
 * `providers` must already be filtered to healthy rows. Pure w.r.t. its inputs so a unit
 * test can drive every strategy with a fake clock/latency/cost source.
 */
export function buildStrategyChain(
  strategy: RoutingStrategy,
  providers: ProviderRecord[],
  modelsByProvider: Map<number, ModelRecord[]>,
  metricsFor: MetricsResolver,
  rrCursor = 0
): RouteCandidate[] {
  const eligible = providers.filter((p) => (modelsByProvider.get(Number(p.id)) || []).length > 0);

  const orderedProviders: ProviderRecord[] =
    strategy === 'weighted_rr'
      ? weightedRoundRobinOrder(eligible, rrCursor)
      : eligible; // fallback / lowest_cost / lowest_latency sort below by chosen-model metric

  const chain: RouteCandidate[] = [];
  for (const provider of orderedProviders) {
    const models = modelsByProvider.get(Number(provider.id))!;
    const model =
      strategy === 'lowest_latency'
        ? pickByLatency(models, metricsFor, provider)
        : strategy === 'lowest_cost'
          ? pickByCost(models)
          : models[0];
    chain.push({ provider, model });
  }

  if (strategy === 'lowest_cost') {
    chain.sort((a, b) => {
      const ca = metricsFor(a)?.costUsd ?? listCost(a.model);
      const cb = metricsFor(b)?.costUsd ?? listCost(b.model);
      if (ca !== cb) return ca - cb;
      return priorityOf(a) - priorityOf(b);
    });
  } else if (strategy === 'lowest_latency') {
    chain.sort((a, b) => {
      const la = metricsFor(a)?.latencyP50Ms;
      const lb = metricsFor(b)?.latencyP50Ms;
      if (la == null && lb == null) return listCost(a.model) - listCost(b.model);
      if (la == null) return 1; // fail-closed: unknown latency sorts last
      if (lb == null) return -1;
      if (la !== lb) return la - lb;
      return priorityOf(a) - priorityOf(b);
    });
  }
  // fallback and weighted_rr keep the (priority / round-robin) order produced above.

  return chain;
}
