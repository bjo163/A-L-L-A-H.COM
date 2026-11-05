---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-REPORT"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — Completion Report

All three tracks are implemented and verified on green gates. Every number below is copied from a
command actually run in this delivery; none are estimates.

## Verified deliverables

### Track 1 — Contract centralization
- Single `packages/lint/src/contract/schema.json` + `parse.mjs` (+ `parse.d.mts`) now own every tier's
  required/optional field set; the three gate entrypoints (`check-architecture.mjs`,
  `check-unit-contracts.ts`, `check-doc-contracts.ts`) were rewired onto it with byte-identical rule
  names and exit behavior, and the divergent 8-vs-9-key hard-coded lists were consolidated to the
  9-key superset.
- `scripts/build-contract-index.ts` derives `.contracts/units.json`; `contract:index` +
  `contract:index:check` landed. `UNIT_CONTRACT_CONSISTENCY` now covers packages and apps;
  `DOCUMENTATION_CONTRACT.md` was bumped to reference `schema.json`.

### Track 2 — ORM (additive-only)
- Query layer: `buildCount`, deterministic grouping parentheses, nested `domain`, `fields` projection,
  `paginateKeyset`.
- Relational: `many2many` helper + join-table DDL, `expand`, `archive`/`unarchive`, `search()`
  (rows + total), `read_group`, `name_search`/`fields_get`, `forUpdate`, `withTransaction`.
- Computed/related fields (`compute`/`related`/`store`, bounded fixed-point).
- Perf/versioning: batched migrator boot (snapshot-once + single transaction), real `updateMany`
  (`UPDATE … FROM (VALUES)` chunked ≤1000), ordered migration runner, outbox batching with
  append-only ledger hygiene.

### Track 3 — Addons
- Views→SDUI pipeline completed (VIEW_REGISTRY + digest-gated boot seeder + `ir_ui_view`-first read
  with synthetic fallback); cron runner moved onto the `ir.cron` repository; the missing
  `res_company_views.json` authored; demo pipeline un-dead; LLM catalog drift + views existence +
  encrypted-column safe-projection arch rules landed.
- Cron as a real work queue (dispatch registry, `FOR UPDATE SKIP LOCKED`, retry columns,
  `ARSY_CRON_KINDS`); `sync_local_plans` is a real handler with a disabled seeded default (D-1).
- Outbox consumers with payload redaction preceding any secret-model sync; `nexus.nas` joined;
  sentinel `nasCache` invalidation.
- New addon `mw_notify` (models + seeded template catalog + views + CONTRACT.md + `notify_dispatch`
  cron kind + SSRF-guarded webhook + producers on works/sentinel/gateway).
- Consumer migrations: typed FK upgrades, `expand` adoption, `search()` in list routes, batched sync
  worker, batched usage rollup, end-to-end storage retention (with a real `ir.legal.hold` producer).

## Evidence (commands run for this delivery)

| Gate | Command | Result |
|---|---|---|
| ORM build | `pnpm --filter @allah/arsy-orm build` | success (tsup cjs/esm/dts) |
| Typecheck | `pnpm typecheck` | all 31 projects pass |
| Architecture | `pnpm lint:arch` | 100% compliant, 4377 files scanned |
| Contract | `pnpm contract:check` | PASS — 9 addons, 12 packages, 10 apps |
| Contract index | `pnpm contract:index` + `contract:index:check` | fresh, 31 units, digest `f196bcaaa868` |
| Docs | `pnpm docs:check` | 100/100, 114 plans audited |
| Lint | `pnpm lint` | clean (`--max-warnings 0`) |
| ORM tests | `pnpm --filter @allah/arsy-orm test` | 62/62 pass |
| Hub tests | `pnpm --filter @allah/arsy test` | 97/97 pass (includes `notify` 2/2, `storage_retention` 5/5) |

## Notes on perf claims

The batched migrator reduces boot catalog work by construction (one `information_schema.columns`,
one `pg_trigger`, one `pg_constraint` snapshot grouped into Maps before the per-model loop, DDL in a
single transaction) rather than per-model lookups. A dedicated cold-boot millisecond benchmark was
**not** re-run as part of these gates, so no wall-clock figure is asserted here — only the
statement-shape reduction and the passing idempotency behavior (second `sync()` emits no drift).

## Deferred / not shipped (see decision.md)

Per-relation FK enforcement, query-result LRU cache, pgvector/ANN cache, WAL tuning, gateway-catalog
`expand` adoption, and additional new addons — all documented with rationale and revisit conditions in
`decision.md` (D-2, D-3). One new addon per roadmap (`mw_notify`) was the deliberate scope limit.
