---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-TASK"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — Task Register

All items below are `- [x]` and each was verified on a green gate checkpoint before the next track
began. Sequencing: Track 1 (contracts, smallest blast radius) → Track 2 (ORM, additive-only) →
Track 3 (addons/perf, consumes both).

## Track 1 — Contract Centralization

- [x] T1.1 Shared contract module: `packages/lint/src/contract/schema.json` + `parse.mjs`
  (+ `parse.d.mts`); rewire the three entrypoints keeping byte-identical rule names and exit codes.
- [x] T1.2 `scripts/build-contract-index.ts` → `.contracts/units.json`; add `contract:index` +
  `contract:index:check`; CONTRACT.md stays canonical.
- [x] T1.3 Extend `UNIT_CONTRACT_CONSISTENCY` to packages (`publicSurface` ⊆ exports) and apps
  (route dirs / `skin` vs `<SkinRoot>`); bump `DOCUMENTATION_CONTRACT.md` to reference `schema.json`.

## Track 2 — ORM Enhancement (additive-only)

- [x] T2.1 Query-layer: dedicated `buildCount`, deterministic grouping parentheses, nested `domain`,
  `fields` projection, `paginateKeyset`.
- [x] T2.2 Relational: `many2many` helper + join-table DDL, `expand` traversal, `archive`/`unarchive`,
  `search()` (rows + total), `read_group`, `name_search`/`fields_get`, `forUpdate`, `withTransaction`.
- [x] T2.3 Computed & related fields: `compute` / `related` / `store` (bounded fixed-point, batched).
- [x] T2.4 Perf & versioning: batched migrator boot (snapshot-once, single tx), real `updateMany`
  (`UPDATE … FROM (VALUES)` chunked ≤1000), ordered migration runner, outbox batching + ledger hygiene.

## Track 3 — Addon Expansion

- [x] T3.1 Wiring: author missing `res_company_views.json`; `views` existence arch gate; correct the
  stale `default-data.ts` comment; `addons/views.ts` VIEW_REGISTRY + digest-gated boot seeder;
  SDUI reads `ir_ui_view` first with synthetic fallback; cron runner onto the `ir.cron` repository;
  demo pipeline un-dead; LLM catalog drift arch gate.
- [x] T3.2 Cron work queue: dispatch registry, `FOR UPDATE SKIP LOCKED` claim, retry columns,
  `ARSY_CRON_KINDS` partitioning.
- [x] T3.3 Outbox consumers: redact `*_encrypted`/`*_hash` from `arsy_capture_sync_event` payload
  before any secret model syncs; add `nexus.nas` to `ARSY_SYNC_MODELS`; sentinel `nasCache`
  invalidation via outbox drain; encrypted-column safe-projection lint rule.
- [x] T3.4 New addon `mw_notify`: models, seeded template catalog, views + CONTRACT.md,
  `notify_dispatch` cron kind, SSRF-guarded webhook service, event API, and producers on works
  invoice transitions, sentinel RADIUS auth failures, and gateway spend thresholds.
- [x] T3.5 Consumer migration off workarounds:
  - [x] T3.5a typed FK upgrades (`isp.subscription.customer_id`, `orbit.partner_id` → `many2one('res.partner')`).
  - [x] T3.5b replace hand-rolled join with `expand` in `app.ts` (gateway joins deferred — see `decision.md`).
  - [x] T3.5c adopt `search()` in the hub list routes (rows + real total).
  - [x] T3.5d batch `sync_worker` per-plan loops with `createMany`/`updateMany` inside one `withTransaction`.
  - [x] T3.5e batch `usage_rollup` (read-once + batched upsert) behind a UNIQUE `(company_id, day,
    provider_id, model_id)` index (single `INSERT … ON CONFLICT` deviation — see `decision.md`).
  - [x] T3.5f `mw_storage` retention truth-up: `PATCH /api/storage/:digest/retention` writes
    `ir_attachment.legal_hold`/`retention_until` end-to-end and gives `ir.legal.hold` a real producer.

## Gate & Plans

- [x] Plans artifacts authored in `.plans/20261105-platform-evolution-roadmap/`.
- [x] Final gate suite: docs / contract / arch / lint / typecheck / tests.
