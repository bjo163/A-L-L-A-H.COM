---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-RULES"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — Invariants & Rules

These are the AGENTS.md invariants the roadmap had to preserve. Every step kept the gate commands,
arch rule IDs, and exit codes unchanged.

## Non-negotiable invariants

- **No new dependencies.** The roadmap ships zero new packages; batching, traversal, and the work
  queue are built on PGlite + the existing ORM.
- **Parameterized SQL + allowlists.** All new query paths (`buildCount`, `domain`, `fields`,
  `read_group`, `expand`, keyset) route through `assertColumn` / `assertWritableField`; aggregate
  functions are restricted to `count|sum|avg|min|max` over numeric-typed fields. Injection tests
  live in `query_safety.test.mjs`.
- **Fail-closed tenancy.** `company_id` is always derived from the verified principal, never from
  request payloads. `expand` builds the related-model scope from the principal's company exactly as
  `scopeClause` does — a dedicated isolation test guards cross-tenant leakage.
- **Default-deny auth.** New routes (`POST /v1/works/invoices/:id/*`,
  `PATCH /api/storage/:digest/retention`) resolve `principalOf`/`tenantOf` first and reject when no
  tenant is bound.
- **Append-only audit, same transaction.** Batched writes (`createMany`, `updateMany`, the rollup,
  the sync worker) run inside `withTransaction`/audit-context so row-level triggers emit per-row
  audit + sync events; field *names* are recorded, not values.
- **Single embedded PGlite** via `@allah/arsy-orm`; boot resilience; kebab-case file names.

## Secret handling (Track 3 redaction rule)

`arsy_capture_sync_event` strips `*_encrypted` / `*_hash` columns from the outbox payload. A model
may join `ARSY_SYNC_MODELS` only after that redaction exists, and an architecture lint rule refuses
a table with encrypted columns unless it declares a safe projection. No secret ever enters the
append-only ledger.

## SSRF

Webhook delivery validates `base_url` before any upstream call. The gateway's resolver-aware guard is
not importable from an addon, so `mw_notify` ships its own static `assertSafeBaseUrl` that blocks
loopback, link-local (169.254.169.254), private ranges, `::1`, non-HTTP schemes, and octal-encoded
addresses; the notify test asserts all of these are refused while public hosts pass.

## Cron work-queue correctness

Claim uses `FOR UPDATE SKIP LOCKED`; `attempt_count` / `next_retry_at` drive exponential backoff;
`ARSY_CRON_KINDS` lets a second process run only its assigned kinds. The runner reads/writes through
the registered `ir.cron` repository (not raw SQL) so the audit invariant holds, and idle→running
transition is guarded so a crashed claim is recoverable.

## Views / SDUI integrity

`ADDON_VIEWS_CONSISTENCY` requires every manifest-declared view file to exist and be registered in
`VIEW_REGISTRY`; boot seeding is digest-gated so an unchanged view writes nothing.

## Gate contract

`docs:check` (100/100) · `contract:check` · `contract:index:check` · `lint:arch` (100%) · `lint` ·
`typecheck` · ORM build + tests · `arsy` tests must stay green across every commit; new arch rules
land *after* their required artifacts, never before.
