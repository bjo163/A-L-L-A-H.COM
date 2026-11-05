---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-SPEC"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — ORM · Addons · Contracts

## Mission

Close the platform's real gaps — which are **half-built wiring, not missing features** — without
changing any stable surface that CI or the AGENTS invariants depend on. Gate command names,
arch rule IDs, and exit codes are fixed contracts; only the implementations beneath them move.

## Problem Statement

Deep analysis (three parallel architecture passes plus direct source verification) found the
codebase declared more than it wired:

- View JSON was declared but never read by the SDUI plugin (which synthesized arch from fields).
- `DEMO_DATA_REGISTRY` was empty, so the demo seed branch was dead code.
- `ir.cron` dispatch had a single branch calling a deliberate no-op through raw SQL, bypassing the
  registered repository and the append-only audit invariant.
- `arsy_sync_outbox` had producers but zero consumers.
- Contract frontmatter validation was implemented **three times** with divergent required-field
  sets (8 vs 9 keys).
- The ORM lacked relational primitives, so addons kept hand-rolling joins and fake totals.

## Objectives

1. **Track 1 — Contract Centralization**: one schema + one parser behind three separate gate
   commands; a machine-derived contract index; consistency coverage extended to packages and apps.
2. **Track 2 — ORM Enhancement**: additive-only public API — query-layer correctness, relational
   traversal, computed/related fields, and batched migration/perf primitives.
3. **Track 3 — Addon Expansion**: fix broken wiring, turn cron into a real work queue, add outbox
   consumers with secret redaction, ship one new capability (`mw_notify`), and migrate consumers off
   their workarounds.

## Functional Requirements

- FR-001 A single `schema.json` and `parse.mjs` own every required/optional field per tier; the
  three gate entrypoints keep byte-identical rule names and exit behavior.
- FR-002 `contract:index` derives `.contracts/units.json` from CONTRACT.md + manifests + code scans;
  CONTRACT.md remains canonical and the index is a derived, freshness-checkable artifact.
- FR-003 The ORM exposes `buildCount`, deterministic filter grouping, nested `domain`, field
  `fields` projection, keyset pagination, `expand` relation traversal, `archive`/`search`,
  `read_group`, `name_search`/`fields_get`, `forUpdate`, and `withTransaction` — all optional so
  existing call sites compile and behave identically.
- FR-004 Computed/related fields (`compute`/`related`/`store`) resolve through the traversal path;
  `store: true` recomputes in a bounded fixed-point loop inside the same transaction.
- FR-005 Boot migrator emits DDL from snapshot-once catalogs in a single transaction; `updateMany`
  is a real set-based batch that still fires per-row audit + sync triggers; ordered migrations run
  after `sync()`; the outbox drains in batches with append-only ledger hygiene.
- FR-006 Declared view JSON seeds into `ir.ui.view` digest-gated (zero audit churn on unchanged
  views) and the SDUI plugin reads it first, falling back to synthetic arch.
- FR-007 Cron dispatch becomes a handler registry with `FOR UPDATE SKIP LOCKED` claim, retry
  columns, and `ARSY_CRON_KINDS` partitioning; the runner writes through the `ir.cron` repository.
- FR-008 Encrypted/hash columns are stripped from outbox payloads **before** any secret-bearing model
  joins `ARSY_SYNC_MODELS`; a lint rule enforces a declared safe projection.
- FR-009 `mw_notify` ships `notify.channel` / `notify.template` / `notify.event`, a seeded template
  catalog, views + CONTRACT.md, a `notify_dispatch` cron kind, an SSRF-guarded webhook service, and
  producers on invoice transitions, RADIUS auth failures, and gateway spend thresholds.
- FR-010 Consumers migrate off workarounds: typed FK upgrades, `expand` adoption, `search()` in list
  routes, batched sync worker, batched usage rollup, and end-to-end storage retention enforcement.

## Non-Functional Requirements

- **Backward compatibility**: every ORM addition is optional; no existing call site breaks.
- **Security**: parameterized SQL only, column/aggregate allowlists, fail-closed tenancy derived
  from the principal, append-only audit in the same transaction, SSRF-validated `base_url`.
- **Verifiability**: each track ends on a green gate checkpoint; nothing is claimed that a gate does
  not prove.

## Acceptance Criteria

- `pnpm docs:check` = 100/100; `pnpm contract:check` PASS; `pnpm contract:index:check` fresh;
  `pnpm lint:arch` 100% compliant; `pnpm lint` clean; `pnpm typecheck` all projects green;
  `pnpm --filter @allah/arsy-orm build` + ORM tests + `pnpm --filter @allah/arsy test` all pass.
- Net deletion of duplicated contract-validation code; a single schema file is the only place a
  required field is ever listed.
- One new addon per roadmap (`mw_notify`); no secret ever enters the outbox ledger.

## Out of Scope (documented deferrals)

Per-relation FK enforcement, query-result LRU cache, pgvector/ANN semantic cache, WAL/checkpoint
tuning, and additional new addons (ticket/inventory/crm) — recorded in `decision.md`.
