import { dbEngine, modelRegistry, SYSTEM_ACTOR, withTransaction } from '@allah/arsy-orm';
import { logger } from '@allah/arsy-core';

// A single grouped aggregate row for one (day, provider, model) slice of a
// tenant's usage. provider_id/model_id may be null (e.g. cached or ad-hoc calls).
interface UsageGroup {
  company_id: number;
  provider_id: number | null;
  model_id: number | null;
  request_count: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_cost_usd: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
}

/**
 * Idempotent daily usage rollup (roadmap F1). Aggregates `ai.usage_log` into the
 * `ai.usage_daily` per-(day, provider, model) totals. Re-running the same day
 * yields the same totals: the aggregate is absolute (not a delta), so the
 * routine upserts each group rather than appending, keeping the rollup
 * re-computable without double-counting.
 *
 * The read is scoped with an explicit `company_id` predicate so a tenant can
 * only ever roll up its own usage; the writes go through the ORM repository
 * (parameterized, audit-logged).
 */
export async function rollupUsageDay(day: string, companyId: number): Promise<number> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    throw new Error(`Invalid rollup day '${day}'; expected YYYY-MM-DD.`);
  }

  const dailyDef = modelRegistry.get('ai.usage_daily');
  if (!dailyDef) {
    throw new Error("ai.usage_daily model is not registered; did the mw_llm_router addon load?");
  }

  // Single parameterized aggregate read for the tenant's day. The `day` and
  // `company_id` are bound; no interpolation.
  const groups = (await dbEngine.query(
    `SELECT company_id,
            provider_id,
            model_id,
            COUNT(*)::integer AS request_count,
            COALESCE(SUM(prompt_tokens), 0)::integer AS prompt_tokens,
            COALESCE(SUM(completion_tokens), 0)::integer AS completion_tokens,
            COALESCE(SUM(cost_usd), 0) AS total_cost_usd,
            COALESCE(percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms), 0)::integer AS latency_p50_ms,
            COALESCE(percentile_cont(0.95) WITHIN GROUP (ORDER BY latency_ms), 0)::integer AS latency_p95_ms
       FROM ai_usage_log
      WHERE company_id = $1
        AND create_date >= $2::date
        AND create_date < ($2::date + INTERVAL '1 day')
      GROUP BY company_id, provider_id, model_id`,
    [companyId, day]
  )) as unknown as UsageGroup[];

  // Roadmap T3.5: the per-group find+create/update loop collapses into one
  // batched write. All existing rollup rows for this (company, day) are read once,
  // matched in memory on a null-safe composite key, then flushed through a single
  // createMany + updateMany inside one audit-context transaction (withTransaction).
  // This is the ORM-idiomatic form of the intended `INSERT … ON CONFLICT DO UPDATE`:
  // the routing-metric consumer skips rows whose provider_id/model_id are NULL, so
  // those keys must stay NULL in the columns (a plain UNIQUE/ON CONFLICT cannot match
  // NULL pairs) — matching by row id in memory keeps re-runs idempotent for the null
  // groups too, while every write still fires the per-row audit + sync triggers.
  const keyOf = (providerId: unknown, modelId: unknown): string =>
    `${providerId ?? ''}|${modelId ?? ''}`;

  let upserted = 0;
  await withTransaction(async (tx) => {
    const repo = tx.repositoryFor<Record<string, unknown>>(dailyDef);
    const existing = await repo.find({
      scope: { companyId },
      filters: [{ field: 'day', operator: '=', value: day }],
    });
    const existingByKey = new Map<string, Record<string, unknown>>(
      existing.map((row) => [keyOf(row.provider_id, row.model_id), row])
    );

    const insertRows: Record<string, unknown>[] = [];
    const updateEntries: Array<{ id: number; data: Record<string, unknown> }> = [];

    for (const g of groups) {
      const totals = {
        request_count: g.request_count,
        prompt_tokens: g.prompt_tokens,
        completion_tokens: g.completion_tokens,
        total_cost_usd: g.total_cost_usd,
        latency_p50_ms: g.latency_p50_ms,
        latency_p95_ms: g.latency_p95_ms,
      };
      const match = existingByKey.get(keyOf(g.provider_id, g.model_id));
      if (match) {
        updateEntries.push({ id: Number(match.id), data: totals });
      } else {
        insertRows.push({ day, provider_id: g.provider_id, model_id: g.model_id, ...totals });
      }
      upserted += 1;
    }

    if (insertRows.length > 0) await repo.createMany(insertRows, { companyId }, SYSTEM_ACTOR);
    if (updateEntries.length > 0) await repo.updateMany(updateEntries, { companyId }, SYSTEM_ACTOR);
  });

  if (upserted > 0) {
    logger.info(`Rolled up ${upserted} ai.usage_daily group(s) for company ${companyId} on ${day}.`);
  }
  return upserted;
}

/** The ISO date (UTC) for `offsetDays` before today, for scheduler convenience. */
export function isoDay(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}
