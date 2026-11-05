---
contract: unit
id: ADDON_WORKS
tier: addon
name: works
owner: commerce
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: WORKS ISP commercial foundation and billing lifecycle
depends: [base]
models: [isp.plan, isp.subscription, isp.invoice, isp.coverage]
data: [data/index.ts]
installable: true
---

# works — Unit Contract

The ISP commercial foundation: plans, subscriptions, invoices, and coverage
footprint. The reference pattern every other addon's default data now follows.

## Default data

`data/index.ts` (`loadDefaultData`) seeds the platform ISP catalog and coverage
areas at company_id 0 through the shared ORM seed runtime, each dataset keyed on
`slug` for idempotency. Rows live in `data/default.ts`.

`loadWorksDefaultData` is retained as a thin back-compat alias over
`seedIdempotent` so pre-registry callers keep working during migration.

## Models

`isp.plan`, `isp.subscription`, `isp.invoice`, `isp.coverage`; `models` mirrors
`__manifest__.json`.
