---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-DECISION"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — Decisions (ADRs)

Each decision records the conclusion, the rationale/trade-off, the alternatives rejected, and the
boundary/expiry condition under which it should be revisited.

## D-1 · `sync_local_plans`: real handler, seeded disabled

**Conclusion.** The cron dispatch branch that used to call a deliberate no-op through raw SQL became
a genuine `sync_local_plans` handler (`addons/project/services/cron_jobs.ts`) registered in the
dispatch table, but the *seeded default schedule ships `state: 'disabled'`*. The handler performs a
DB-only, bounded reconciliation and never scans the local filesystem — full sync arrives through the
Extension push route.

**Rationale / trade-off.** `reconcilePlans` is provably read-only-bounded over the hub's own tables,
so making the dispatch real was safe; shipping it enabled by default was not, because an unattended
poll on every boot is surprising operational behavior. The disabled seed keeps the capability present
and provable without scheduling work no one asked for.

**Rejected alternatives.** Leaving the no-op (fails the "wire it up" objective); enabling it blindly
(ops risk + filesystem-scan temptation).

**Revisit when** an operator explicitly enables the schedule or a real pull-scan use case is proven.

## D-2 · Track 2.5 deferrals

**Conclusion.** Deferred, documented, not built: per-relation FK enforcement, query-result LRU cache,
pgvector/ANN semantic cache, WAL/checkpoint tuning, Redis/BullMQ.

**Rationale.** FK constraints risk orphan-backfill on live DBs; they belong *after* the ordered
migration runner (T2.4c) so they can be made reversible. A result cache's invalidation correctness
cost exceeds its benefit now that projection + keyset + `expand` remove the real hot-path waste.
pgvector/WAL/Redis either violate the no-new-deps invariant or lack a measured need — the current
`LIMIT 100` cosine scan is adequate until `ai.semantic_cache` row counts say otherwise.

**Rejected alternatives.** Plan A's big-bang FK + LRU cache in `BaseRepository`.

**Revisit when** a specific query is measurably hot and correct invalidation is provable.

## D-3 · Gateway hand-rolled joins: expand deferred

**Conclusion.** The ORM `expand` migration in T3.5b converted the hub's chunk→document join in
`apps/arsy/src/app.ts`. The gateway's joins in `packages/arsy-plugin-llm-gateway/src/index.ts`
(`ai_model` / `ai_provider` / `ai_usage_log`) were **not** converted.

**Rationale.** Those tables are plugin-owned raw tables created through `router.initialize`, not ORM
models registered in `modelRegistry`, so `expand` (which resolves a field's relation via the
registry) cannot operate on them without first re-modeling the entire gateway catalog — a large,
high-risk surface change with no correctness bug to fix. The existing gateway joins are already
parameterized and correct; converting them for purity's sake would expand blast radius well beyond
the roadmap's additive discipline.

**Rejected alternatives.** Silently skipping the bullet; converting only half the joins; pulling the
gateway catalog into ORM models inside this roadmap.

**Revisit when** the gateway models are registered in `modelRegistry` (a separate, self-contained
migration), at which point `expand` becomes applicable.

## D-4 · Usage rollup: batched repository upsert, not a literal single `INSERT … ON CONFLICT`

**Conclusion.** T3.5e replaced the per-group `find` + `create`/`updateById` loop with a
read-once + in-memory key match + single `createMany`/`updateMany` inside one `withTransaction`, and
added a UNIQUE `(company_id, day, provider_id, model_id)` index.

**Rationale.** The literal "one `INSERT … ON CONFLICT DO UPDATE`" cannot be made both correct and
invariant-safe here. The routing-metric consumer (`router.ts` `loadUsageMetrics`) *skips rows whose
`provider_id`/`model_id` are NULL*, so those keys must stay NULL in the columns; a default UNIQUE
index / `ON CONFLICT` cannot match NULL pairs (they are distinct), which would silently create
duplicate ad-hoc/cached rows every re-run. Matching by row id in memory keeps re-runs idempotent for
NULL groups *and* preserves the append-audit-per-row guarantee that the ORM's batched primitives
already provide (proven in T2.4b). The performance intent — kill the N+1 — is fully met.

**Rejected alternatives.** A raw single `INSERT … ON CONFLICT` (NULL-key correctness + audit-context
handling); coalescing NULL keys to 0 (breaks the routing-metric skip logic).

**Revisit when** a Postgres version with `NULLS NOT DISTINCT` unique indexes is guaranteed and a
raw batched upsert is desired, provided the audit-context wrapper is preserved.

## D-5 · Outbox: redaction precedes sync; ledger is append-only

**Conclusion.** `nexus.nas` was added to `ARSY_SYNC_MODELS` only *after* `arsy_capture_sync_event`
strips `*_encrypted`/`*_hash` from the payload, and delivery-ledger rows are never compacted by
`DELETE` — retention is handled by a partial index on `delivered_at`.

**Rationale.** Secrets must never enter an append-only, cross-replica ledger; ordering the redaction
first (with a lint rule enforcing a declared safe projection for any encrypted-column table) makes
that structural rather than procedural. Deleting ledger rows would break the append-only invariant,
so growth is bounded by an index instead of compaction.

**Rejected alternatives.** Syncing `nexus.nas` then redacting later; DELETE-based ledger retention.

**Revisit when** a genuine compaction requirement is measured and an append-only-safe retention model
is designed.
