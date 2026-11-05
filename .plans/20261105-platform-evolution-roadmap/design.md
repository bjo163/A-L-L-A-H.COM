---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLATFORM-EVOLUTION-ROADMAP-DESIGN"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-05"
---
# Platform Evolution Roadmap — Design

## Layering & dependency direction

`packages/arsy-orm` (data primitives) → `addons/*` (domain models, default data, views, services)
→ `apps/arsy` (HTTP hub) · `apps/sentinel` (RADIUS). Contract tooling lives in `packages/lint` and
`scripts`, consumed by the three gate entrypoints but never imported by runtime code. Addons depend
only on the ORM public surface and on other addons' *exported* services (never their internals), so
`mw_notify` reaches the gateway rollup through `modelRegistry` + `read_group`, not by importing the
router addon.

## ORM public API (additive, optional-everywhere)

- `QueryOptions`: `{ scope, filters, fields?, domain?, expand?, limit?, offset?, orderBy?,
  orderDirection?, forUpdate?, includeArchived? }`. `fields` is validated against the reserved +
  model field set; `domain` is an Odoo-prefix tree compiled through the same column allowlist as
  `filters`.
- `BaseRepository`: `find`, `search → { rows, total }`, `count`, `create`, `createMany`,
  `updateById`, `updateMany`, `deleteById`, `archive`/`unarchive`, `readGroup`, `nameSearch`,
  `fieldsGet`. `createMany` requires a shared column shape; `updateMany` groups rows by column set
  and emits one `UPDATE … FROM (VALUES)` per (group, chunk ≤1000).
- `withTransaction(run, engine?)` hands a `TransactionContext { executor, repositoryFor(model) }` so
  several model writes commit/roll back as one unit while each satisfies `assertTransactional`.
- `fields.many2many(relation, { relation_table, column1, column2 })` + join-table DDL
  (`CREATE TABLE IF NOT EXISTS … UNIQUE(pair)` + pair index).

## SDUI / views contract

`addons/views.ts` mirrors `default-data.ts` with a static `VIEW_REGISTRY`. At boot the declared view
JSON is seeded into `ir.ui.view` comparing `sha256Hex(arch_json)` — an unchanged view is a no-op, so
the pipeline never spams the audit log. `arsy-plugin-sdui` resolves `(model, view_type)` from
`ir_ui_view` first and only falls back to the previously-synthesized arch when no row exists
(non-breaking).

## `mw_notify` data model & delivery contract

- `notify.channel` — transport selection (email/sms/webhook) + `base_url` subject to the SSRF
  invariant.
- `notify.template` — translated body/subject catalog, seeded from `data/index.ts` (keyed by `code`).
- `notify.event` — append-only ledger; producers call `recordNotifyEvent(...)` which inserts the
  event and lets the existing sync-capture trigger place one outbox row per event.
- Delivery runs as the `notify_dispatch` cron kind; `ARSY_NOTIFY_DELIVERY=live` is required to make
  real outbound calls (record mode otherwise), and webhook targets pass `assertSafeBaseUrl` first.

## HTTP surface (hub)

- List routes return a real `totalItems` from `search()` instead of `records.length`.
- `POST /v1/works/invoices/:id/{open|pay|markOverdue}` transitions state and, on paid/overdue,
  appends a `notify.event` (failure is logged, never thrown to the caller).

## Storage retention contract

`PATCH /api/storage/:digest/retention` accepts `{ legal_hold?, retention_until?, reason? }`;
placement requires a non-empty `reason`, a malformed `retention_until` is refused `400` fail-closed,
and placing/releasing a hold appends/closes the matching `ir.legal.hold` provenance row. `DELETE`
stays fail-closed (`409 RETENTION_HOLD`) while a hold is active or retention has not expired.

## UI states

Route parity is unchanged: every app keeps `error.tsx` / `loading.tsx` / `not-found.tsx` built from
`StatePanel`. No new user-facing screens were introduced by this roadmap; `mw_notify` ships tree +
form views for its three models through the same SDUI pipeline.
