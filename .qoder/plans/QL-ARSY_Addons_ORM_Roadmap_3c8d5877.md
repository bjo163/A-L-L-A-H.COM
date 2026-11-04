# QL-ARSY Addons + ORM — Deep-Dive Analysis & Implementation Roadmap

## Summary

This plan consolidates three independent architectural reviews (Simplicity, Performance, Minimal-Change lenses) whose load-bearing claims were verified directly against source. It findings-first documents the real defects, then lays a **Phase 1 Foundation/Hardening → Phase 2 Optimization → Phase 3 New Features** roadmap with per-task acceptance criteria, a dependency map, risk assessment, and rejected alternatives.

The single largest theme: **the ORM has strong primitives (parameterized builder, DB-trigger audit, content-addressed storage, fail-closed TenantScope) but the addon/plugin layer routes around them** — the LLM gateway writes raw single-quote SQL and reads unscoped; `mw_storage` models are declared but unconsumed so the Retention invariant is decorative; addons are hand-wired with silent registry collisions and two manifest schemas. Phase 1 closes those gaps; Phase 2 restores DRY/type-safety/ergonomics; Phase 3 monetizes the repaired foundation.

---

## Verified Findings (evidence base)

Each item cites the exact source that was read and confirmed. Severity: 🔴 must-fix (invariant/security/correctness), 🟠 should-fix (robustness/DRY), 🟡 nice-to-have.

### ORM — `packages/arsy-orm`
- 🔴 **Silent registry collision** — `registry.ts:register()` does `this.models.set(name, …)` with no duplicate guard, enabling the `works` dual-definition bug (see Addons).
- 🔴 **Vector dimension truncation** — `vector.ts:24-42` `dotProduct`/`euclideanDistance` use `const len = Math.min(a.length, b.length)` when lengths differ, so a wrong-dimension embedding yields a *plausible* similarity score instead of failing. Consumed by `cache.ts` `cosineSimilarity`.
- 🔴 **Migrator drops constraints on incremental columns** — `migrator.ts:95-101` `ALTER TABLE … ADD COLUMN IF NOT EXISTS "<col>" <type>;` omits `NOT NULL`/`UNIQUE` that the initial `CREATE TABLE` (`:64-72`) applies, causing schema drift with no report.
- 🟠 **`mapFieldToSqlType` has no relational case** — `migrator.ts:13-35` falls through to `default: 'TEXT'`, so `one2many`/`many2many` fields become junk TEXT columns.
- 🟠 **Engine auto-registers `ResUsers`** — `migrator.ts:38-40` patches a missing `res.users` at boot, hiding addon-wiring errors instead of surfacing them.
- 🟠 **Dead parallel field API** — `fields.ts:72-104` `fieldDecorators` is a full duplicate of `fields` with **zero callers** (grep-confirmed); `makeDecorator :30-36` mutates the parent prototype's `__fieldDefinitions` (subclass-leaks-to-parent).
- 🟠 **Dead translation cache + inferred transactions** — `repository.ts:10-47` `TranslationCache` is never read/written (`_applyTranslations :218-285` always hits DB); `withAuditContext :123-125` decides txn-vs-not by `this.executor === this.engine` identity inference, so a non-transactional executor silently degrades audit `SET LOCAL` to session scope.
- 🟠 **`RESERVED_COLUMNS` triplicated** — identical lists in `query_builder.ts:16`, `migrator.ts:55-63`, and a third in the trigger SQL — drift risk on the tenant/audit column contract.
- 🟠 **Env read at module load** — `engine.ts:85-87` `dbEngine = singleton(… new PGliteEngine({ dataDir: process.env.PG_DATA_DIR }))` evaluates `process.env` before `main.ts` dotenv runs → ordering hazard.

### Addons + wiring — `apps/arsy/src/app.ts`
- 🔴 **`works` dual model definitions + dead/broken subscription machine** — `addons/works/index.ts` registers `isp.plan/isp.subscription/isp.invoice` from `models/isp_commercial.ts` (fields `state`, `customer_id`, `started_at`), while `models/isp_plan.ts`, `models/isp_subscription.ts`, `models/isp_invoice.ts` redefine the *same names* with a *different schema* (`status`, `username`, `partner_id`, `start_date`) — never registered (dead). `subscription.ts:42,45,61` is broken three ways (`new ModelDefinition(undefined)` throws; `findById` without scope throws; reads `.status` on a `.state` model) and `transitionSubscription` has **zero callers**.
- 🟠 **Sentinel divergent boot** — `apps/sentinel/src/server.ts:502` calls `registerNexusAddon()` alone, never `registerBaseAddon()`; a different registration path from the hub means `res.*`/base models may be absent.
- 🟠 **Hand-wired addon boot** — `app.ts:138-148` calls seven `register*Addon()` in a literal order before `migrator.sync()`; no dependency resolution, no manifest-driven load.
- 🟠 **qorpus brute-force search + N+1 writes** — `app.ts:336-371` loads `limit:100` docs + `limit:1000` chunks, scores by JS substring, and `docs.find()` per chunk (O(N×M)); `app.ts:322-330` creates chunks one `create()` at a time (each its own txn+trigger); embeddings always written `null` (`:307,:328`).
- 🟠 **i18n sync N+1** — `app.ts:804-821` loops `find` → `updateById`/`create` per term.

### LLM gateway — `packages/arsy-plugin-llm-gateway`
- 🔴 **Raw + unscoped SQL bypassing the ORM** — `router.ts:68-90` seeds providers/models/routes via **single-quote `+`-concatenated raw INSERTs**; `:124,:136,:140` `SELECT * FROM ai_route/ai_provider/ai_model` carry **no `company_id` predicate** and re-run on every `routeChat`.
- 🔴 **Retention invariant not enforced** — `packages/arsy-plugin-storage/src/index.ts` `ContentAddressedStorage` never writes an `ir.attachment` row and never checks `legal_hold`/`retention_until`, so AGENTS.md "reject on legal_hold/retention_until" is decorative; `addons/mw_storage`'s `IrAttachment`/`IrLegalHold` are unconsumed.
- 🟠 **Routing strategy is decorative** — `router.ts:152-158` special-cases only literal aliases `dx-fast`/`dx-reasoning` and never reads `route.strategy`; 3 of the 4 seeded strategies (`lowest_cost`/`lowest_latency`/`weighted_rr`) are unimplemented.
- 🟠 **Unbounded + dead cache** — `cache.ts:11 inMemoryCache = new Map()` has no eviction (`set :105` never evicts); `getVector/setVector :32-103` have **zero callers** (grep-confirmed) and `getVector` does `find(limit:100)` + JS cosine + an extra `updateById` audit txn per hit.

### Addon manifests & lint
- 🟠 **Two incompatible manifest schemas** — `addons/base/__manifest__.json` uses `depends`/`summary`/`installable`/`application`/`views`/`models`; `addons/nexus` and `addons/works` use `dependencies`/`description`; `addons/mw_qorpus` has none of these keys.
- 🟠 **`mw_llm_router` manifest lies** — registers **8** models (`AiProvider, AiModel, AiRoute, AiVirtualKey, AiUsageLog, AiSemanticCache, AiThread, AiMessage`) but declares **5**; `AiThread/AiMessage` use `fields.many2one('res.user')` (singular) — a **dangling reference** vs the actual `res.users`. Function name typo `registerMlLlmRouterAddon`.
- 🟠 **Lint blind spots** — `packages/lint/src/check-architecture.mjs:342` SQL detection matches interpolation only inside **backtick** template literals, so single-quote `+` concat (`router.ts`) and `.exec()` are invisible; `:303-330 checkTenantIsolation` only asserts that files with `defineModel` *mention* `company_id`, not that reads are scoped; `:459-505 checkAddonManifests` validates only existence+parse+`name`+`version`, ignoring `depends`/`models`.

### Shared logic
- 🟡 **SHA-256 reimplemented ~11×** across `mw_qorpus/chunker.ts`, storage, and elsewhere; no shared `sha256Hex`.

---

## Phase 1 — Foundation & Hardening (must-fix; invariant, security, correctness)

Ordered so each task's acceptance gate is checkable independently. T1–T4 are prerequisites for later phases.

### T1. Collision-safe model registry
- **File:** `packages/arsy-orm/src/registry.ts`
- Make `register()` throw (or take an explicit `{ overwrite: true }`) when `model.name` already exists; log the previous source location. Keep `Symbol.for` singleton behavior.
- **Acceptance:** registering two models with the same name throws a typed `ModelCollisionError`; a unit test in `packages/arsy-orm` asserts it; existing boot (all addons) still passes because no true duplicates remain after T2.

### T2. Reconcile `works` isp_* dual definitions; delete dead subscription machine
- **Files:** `addons/works/index.ts`, delete `addons/works/subscription.ts` and the dead `addons/works/models/isp_plan.ts`·`isp_subscription.ts`·`isp_invoice.ts` (the non-registered duplicates).
- Keep `models/isp_commercial.ts` as the single source of truth (`state`/`customer_id`/`started_at`) to match the live inline machine in `app.ts:730-756`. If the richer `status`/`username`(unique RADIUS)/`partner_id` schema is actually wanted, migrate it *into* `isp_commercial` and delete the other — decide once, don't keep both.
- **Acceptance:** grep for `isp.plan`/`isp.subscription`/`isp.invoice` yields exactly one definition each; `pnpm typecheck` clean; with T1 enabled, boot throws if any name still collides (regression guard).

### T3. Route LLM gateway SQL back through the ORM, tenant-scoped
- **Files:** `packages/arsy-plugin-llm-gateway/src/router.ts`, `packages/arsy-plugin-llm-gateway/src/index.ts` (plugin wiring to receive `dbEngine`/repository).
- Replace raw seed INSERTs (`:68-90`) with an idempotent ORM `create`/upsert path; replace `:124,:136,:140` unscoped `SELECT *` with `BaseRepository.find({ scope })` (or an explicit `systemScope` singleton seed with a documented reason). Add the missing `company_id` predicate or mark the seed as system-scope.
- **Acceptance:** no `.exec(`/raw SQL remains in `router.ts`; a new lint rule (T7) fails on backtick-free concat SQL; `routeChat` reads are scoped; existing `trust_boundary.test.mjs` still passes and a new test asserts cross-tenant route isolation.

### T4. Fail-closed vector dimensions
- **File:** `packages/arsy-orm/src/vector.ts`
- Throw on `a.length !== b.length` in both `dotProduct` and `euclideanDistance` (no `Math.min`). Update `cache.ts cosineSimilarity` caller to handle/catch.
- **Acceptance:** unit test asserts mismatched-dim throws; a wrong-embedding test no longer returns a plausible score.

### T5. Storage layer enforces the Retention invariant
- **Files:** `packages/arsy-plugin-storage/src/index.ts`, `addons/mw_storage/index.ts`
- Have `ContentAddressedStorage.put` write an `ir.attachment` row (digest, company_id, retention_until) and **reject** `get`/`delete` when `legal_hold` is set or `retention_until` is active (fail-closed), reusing the ORM repository. Replace synchronous `fs.existsSync` hot-path checks with the DB truth.
- **Acceptance:** a test proves a `legal_hold` attachment cannot be deleted and a stored byte has a matching `ir.attachment`; the AGENTS.md Retention invariant is now backed by code, not just declared.

### T6. Correct `mw_llm_router` manifest + dangling relation + typo
- **Files:** `addons/mw_llm_router/__manifest__.json`, `addons/mw_llm_router/index.ts`
- Declare all **8** models; fix `res.user` → `res.users` in `AiThread`/`AiMessage`; rename `registerMlLlmRouterAddon` → `registerMwLlmRouterAddon` (update `app.ts:27-33,140` import/call).
- **Acceptance:** manifest `models` array length == registered-model count (asserted by T7 lint); no dangling `res.user` reference; typecheck clean.

### T7. Strengthen the architecture lint gates
- **File:** `packages/lint/src/check-architecture.mjs`
- Extend SQL detection beyond backticks: flag `.exec(` and `.query(`/`.execute(` with any string concatenation or non-allowlisted template. Upgrade `checkTenantIsolation` to require that any `SELECT`/`find` on a `company_id` model carries a scope. Add a manifest-consistency check: registered model names (from `index.ts`) ⊆ declared `models`, single schema keys (`depends` canonical), `many2one` targets must exist in the registry.
- **Acceptance:** `pnpm lint:arch` fails against a deliberately-bad fixture (single-quote concat, unscoped select, manifest under-declaration) and passes on the repaired tree.

### T8. One manifest schema + generated, dependency-ordered loader
- **Files:** all `addons/*/__manifest__.json`, new `packages/arsy-orm/src/loader.ts` (or `apps/arsy/src/addons.ts`), `apps/arsy/src/app.ts:138-148`, `apps/sentinel/src/server.ts:502`
- Normalize every manifest to the `base` schema (`depends`, `version`, `models`, `installable`). Generate a topologically-ordered loader that reads manifests, resolves `depends`, and calls each addon's `register*()` in dependency order — replacing the hand-wired sequence. Point sentinel's boot at the same loader so it pulls `base` transitively.
- **Acceptance:** boot logs the resolved load order; sentinel registers `base` models transitively; removing the manual `register*` list from `app.ts` doesn't break `pnpm --filter @allah/arsy build` or the hub test suite.

**Phase 1 gate:** `pnpm lint:arch` (with new rules) · `pnpm typecheck` · `pnpm lint` · `pnpm --filter @allah/arsy build` · `pnpm --filter @allah/arsy test` all EXIT=0.

---

## Phase 2 — Optimization & Ergonomics (should-fix; DRY, performance, type-safety)

Depends on Phase 1 (T1/T3/T7 must land first so refactors don't reintroduce the same gaps).

### T9. Shared invariant constants + one SHA-256
- Extract `RESERVED_COLUMNS` to a single exported const (e.g. `packages/arsy-orm/src/constants.ts`) consumed by `query_builder.ts:16`, `migrator.ts:55-63`, and the trigger; add a shared `sha256Hex(buffer|string)` and replace the ~11 reimplementations (start with `mw_qorpus/chunker.ts`, storage).
- **Acceptance:** grep shows one definition each; behavior unchanged (covered by existing tests).

### T10. DRY the tenant scope clause in the query builder
- **File:** `packages/arsy-orm/src/query_builder.ts:92-97,247-258,309-320,332-341`
- The identical 12-line `companyId` resolution is triplicated across `buildUpdate`/`buildIncrementUpdate`/`buildDelete` while only `buildSelect` reuses `scopeClause`. Generalize `scopeClause` to all four builders.
- **Acceptance:** one code path produces the tenant predicate; snapshot/property tests confirm identical SQL + params before/after.

### T11. Migrator relational-awareness + constraint-drift report
- **Files:** `packages/arsy-orm/src/migrator.ts:13-35,95-101,38-40,104-118`
- Add `one2many`/`many2many` handling in `mapFieldToSqlType` (skip physical column; relations are virtual). Apply `NOT NULL`/`UNIQUE` on incremental `ADD COLUMN`. Emit a drift report (added/changed columns) instead of silent `IF NOT EXISTS`. Remove the `ResUsers` auto-register (T1/T8 now guarantee wiring) and index churn (only create when missing — already guarded; drop the every-boot work).
- **Acceptance:** a model with a `many2one` field produces no junk TEXT column; adding a `unique`/`required` field to an existing table yields the constraint; boot prints a schema diff.

### T12. Delete dead ORM code + explicit transaction assertion
- **Files:** `packages/arsy-orm/src/fields.ts:72-104` (remove dead `fieldDecorators`, fix `makeDecorator` prototype mutation), `packages/arsy-orm/src/repository.ts:10-47,123-125` (remove dead `TranslationCache` or actually wire it; replace identity-inferred txn with an explicit `assertTransactional(executor)` that throws rather than silently degrading audit), `packages/arsy-orm/src/model.ts:54-88` (drop the unused class-based `Model` if confirmed dead).
- **Acceptance:** no dead exports (verified by `knip`/grep); a test asserts `withAuditContext` on a non-transactional executor throws instead of falling back.

### T13. LLM gateway caching + batched writes
- **Files:** `packages/arsy-plugin-llm-gateway/src/router.ts:124-140`, `cache.ts:11,105,32-103`
- Cache resolved route/provider/model config (short TTL or event-invalidated) instead of 3 SELECTs per request; bound `inMemoryCache` with an LRU + max entries; delete dead `getVector/setVector` or wire them to the real semantic-cache path used by T16.
- **Acceptance:** steady-state `routeChat` issues ≤1 config read (cached); cache memory is bounded (test with >max inserts); dead code removed.

### T14. Batch the qorpus/i18n write paths and give search a real index
- **Files:** `apps/arsy/src/app.ts:322-330,804-821,336-371`
- Add `createMany`/`updateMany` to `BaseRepository` (single txn, multi-row) and use them for chunk creation and i18n sync. Replace JS substring scoring with SQL `ILIKE`/`pg_trgm` (or trigram index) with a `company_id` scope and push-down limit; stop the O(N×M) `docs.find` by joining.
- **Acceptance:** chunk ingest for 1000 chunks = 1 txn (not 1000); search returns scoped, ranked results without loading 1000 rows into JS; latency test shows improvement.

### T15. Engine env timing
- **File:** `packages/arsy-orm/src/engine.ts:85-87`
- Defer `dataDir` resolution to first `connect()` (lazy) so dotenv-before-engine ordering is guaranteed.
- **Acceptance:** setting `PG_DATA_DIR` after import but before `connect()` is honored; boot test passes.

**Phase 2 gate:** full Quality Gate battery from AGENTS.md (`docs:check`, `lint:arch`, `lint`, `typecheck`, `ui:test`, `ui:contrast`, all app builds, `--filter @allah/arsy build` + `test`) EXIT=0.

---

## Phase 3 — New Features (leverage the repaired ORM + addon base)

Only start after Phase 1 gates pass; each is an addon or ORM extension that inherits tenant/audit/fail-closed invariants automatically.

### F1. AI usage telemetry rollup (`ai.usage_daily`) → dashboards + budgets
- **Design:** a new append-only aggregate model `ai.usage_daily` (company_id, date, provider, model, alias, request_count, prompt/completion tokens, cost, latency p50/p95) populated from `ai.usage_log` by a scheduled ORM rollup (batched via T14 `createMany`). Expose a read route on the hub; surface in `apps/dock`/`apps/headquarter` Analytics via `@moonwitness/ui` blocks only. Add optional per-tenant daily budget check in `router.ts` (fail-closed 429 when exceeded).
- **Why now:** `ai.usage_log` already exists but nothing aggregates it; `AiRoute.strategy` (T3) needs cost/latency history to become real (feeds F2).
- **Acceptance:** rollup is idempotent (re-run for a day yields same totals); dashboard reads are tenant-scoped; a budget test returns 429 past threshold; STATE_PARITY route states via `StatePanel`.

### F2. Strategy-realized LLM routing + wired semantic cache
- **Design:** implement the 4 declared strategies in `router.ts` (`fallback`, `lowest_cost`, `lowest_latency`, `weighted_rr`) reading from F1 rollups + provider health, replacing the literal-alias special-case. Wire the semantic cache (`ai.semantic_cache`, previously dead `getVector/setVector` in T13) with the fail-closed vector math (T4) so a near-duplicate prompt short-circuits a provider call, tenant-scoped.
- **Acceptance:** selecting `lowest_cost` demonstrably prefers the cheaper healthy provider given seeded usage; a semantic-cache hit avoids a provider call; every decision is unit-tested with a fake clock/latency source.

### F3. Append-only cross-app data-sync outbox
- **Design:** reuse the proven DB-trigger family (`migrator.ts:196-493`) with a new `arsy_sync_outbox` table written by an AFTER trigger carrying `{model, record_id, company_id, op, changed_fields, emitted_at, consumed_at}`. A drain worker (hub + sentinel via shared loader T8) publishes to other apps (gate/dock/id/jizz/moonsky/harbor) over `@allah/sdk`; consumers mark rows consumed idempotently (dedupe key = model+record+op+seq). Mirrors the audit-event pattern, so it stays append-only and tenant-tagged.
- **Why this shape:** it satisfies "cross-app data synchronization patterns" without inventing a new consistency model — the outbox is the audit trigger's sibling; immutability triggers already exist to copy.
- **Acceptance:** a `res.users` update in `id` produces one outbox row, delivered exactly-once (idempotent) to `dock` after a simulated crash/retry; outbox rows are append-only (immutable trigger); every row carries `company_id`.

**Phase 3 gate:** new routes covered by hub tests; features are additive (existing trust-boundary + tenant-isolation tests unchanged and green); all builds pass.

---

## Dependencies

```
T1 ──┬─► T2 ─► T8 ─► (sentinel boot) ─► F3
     └─► T6 ─► T7 ─► Phase-1 gate
T3 ─► T7 (lint proves no-raw-SQL) ─► F2
T4 ─► T13/F2 (vector consumers)
T5 (independent, needs T14 batch for perf later)
Phase 1 (T1–T8) ─► Phase 2 (T9–T15) ─► Phase 3
F1 ─► F2 (needs usage rollups for lowest_cost/latency)
T8 ─► F3 (shared loader used by hub + sentinel drain)
T14 ─► F1 (createMany used by rollup) & T13 (batched cache writes)
```
- **Critical path:** T1 → T2/T6 → T7 → Phase-1 gate → T3 → T13 → F2.
- **Can parallelize:** T4, T5, T9, T10, T11, T12 are largely independent once T1 exists.

## Risk Assessment & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| T1 collision-guard breaks boot because a real duplicate survives after T2 | Medium | High (hub won't start) | Land T2 before enabling T1 throw; run full boot test locally before the lint gate. |
| T3 router refactor changes model resolution / breaks `routeChat` | Medium | High | Add golden tests for provider selection before refactor; keep `dx-fast`/`dx-reasoning` behavior parity, then layer strategies in F2 behind a flag. |
| T7 new lint rules produce false positives across the repo | Medium | Medium | Ship rules with an allowlist/fixture; run `lint:arch` in report-only mode first, fix real hits, then flip to fail-closed. |
| T5 attaching storage to `ir.attachment` changes storage semantics / breaks existing digests | Medium | High | Migration writes attachment rows for existing digests backfill-once; keep content-addressed bytes untouched; only add metadata + guards. |
| T8 generated loader mis-orders `depends` (cycle or missing edge) | Low | High | Loader detects cycles and throws; manifests normalized in same PR (T6/T8 co-dependent). |
| T10/T14 SQL changes alter query plans / results | Low | Medium | Property/snapshot tests compare pre/post SQL + params; verify row counts on fixture data. |
| F1/F3 new trigger tables add write amplification | Medium | Medium | Rollups and outbox drain batched (T14); monitor per-commit txn cost in tests. |
| Concurrent-agent drift on shared files (`app.ts`, QUALITY.md) | Medium | Medium | Update live in `task.md`; re-run docs:check/lint:arch after each edit (matches established self-heal pattern). |
| Feature-flag leakage (F2 strategies, F3 delivery) in prod | Low | High | Default-off; explicit opt-in per tenant; tests assert the off-path is byte-identical to today. |

## Assumptions (to confirm at implementation time)
- `isp_commercial` schema (`state`/`customer_id`/`started_at`) is the desired one for `works`; the alternative richer `status`/`username` schema in the dead files is intentionally dropped — confirm with product before deleting (record in a `decision.md`).
- `pg_trgm` is available in the embedded PGlite build; if not, F/T14 search falls back to a tsvector column.
- The dead class-based `Model` (`model.ts:54-88`) and `fieldDecorators` are truly unused — grep-confirmed but re-verify with `knip` before deletion.
- Addons stay **non-workspace** (resolved via root `@allah/arsy-orm: workspace:*`) to avoid `Symbol.for` singleton duplication — do NOT add `addons/*` to `pnpm-workspace.yaml` (Minimal-Change lens flagged this as a trap).
- The stale note in `.plans/20261104-2359-workspace-build-gate-integrity/` claiming moonsky should be excluded is now obsolete (moonsky builds green); fold a one-line doc correction into Phase 1 docs.

## Rejected Alternatives
- **Make addons real workspace packages** — rejected: multiple addon entry files importing `@allah/arsy-orm` as separate instances risk duplicate `Symbol.for` registries/`dbEngine` singletons across processes, and would require per-addon `package.json`/tsconfig churn with no functional gain over the manifest-driven loader (T8).
- **Add a generic "raw SQL tool" to the public ORM surface for the router** — rejected: violates the "Parameterized values only / no arbitrary-SQL on the public surface" invariant; the fix is to route *through* the ORM (T3), not widen the escape hatch.
- **Keep `mw_llm_router` seed as-is but just add `company_id` inline** — rejected: leaves raw `+`-concatenated INSERTs invisible to the backtick-only lint rule and duplicates schema the ORM already owns; full ORM migration (T3) plus lint hardening (T7) removes the class of bug, not the instance.
- **Redis/external cache for semantic + route config** — rejected for now: the hub runs on embedded PGlite with no external dependency; an in-process bounded LRU (T13) + `ai.semantic_cache` table (F2) keeps the single-process, no-extra-infra invariant. Revisit only if horizontal scaling is a requirement.
- **Rewriting `query_builder` as a fully fluent type-safe DSL from scratch** — rejected: high blast radius against a working, parameterized core; targeted DRY/ergonomic fixes (T10, relational types) preserve the audited SQL surface while improving it.
- **Streaming/multipart storage rewrite** — deferred: real for large files but orthogonal to the invariant gaps; Phase 1 makes Retention enforceable (T5) with buffered I/O; streaming is a Phase 2+ performance option, not a correctness need.