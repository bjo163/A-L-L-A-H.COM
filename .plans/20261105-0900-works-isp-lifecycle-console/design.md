---
status: proposed
plan: "works-isp-lifecycle-console"
owner: "architecture"
---

# Works ISP Lifecycle Console — Design

## Current-state inventory (verified against source)

Models — `addons/works/models/isp_commercial.ts`:

- `isp.plan` (`isp_plan`): `company_id` (required), `name`, `download_mbps`, `upload_mbps`, `price`,
  `currency` (default `IDR`), `burst_profile`, `fup_limit_gb`; index on `company_id`.
- `isp.subscription` (`isp_subscription`): `company_id`, `customer_id`, `plan_id` → `many2one
  isp.plan`, `state` ∈ {`draft`,`active`,`grace`,`suspended`,`cancelled`} (default `draft`),
  `started_at`, `suspended_at`, `cancelled_at`; indexes on `company_id` and `state`.
- `isp.invoice` (`isp_invoice`): `company_id`, `subscription_id` → `many2one isp.subscription`,
  `amount`, `currency`, `due_date`, `payment_ref`, `state` ∈ {`draft`,`open`,`paid`,`overdue`}
  (default `draft`); index on `company_id`.

Hub routes — `apps/arsy/src/app.ts` (`/v1/works/*`), all resolved through `repository(...)` with
`tenantOf(request)` / `actorOf(request)`:

- `GET  /v1/works/plans`, `POST /v1/works/plans`
- `GET  /v1/works/subscriptions`, `POST /v1/works/subscriptions` (plan read by `findById` in-scope,
  unknown foreign `plan_id` → 404 `PLAN_NOT_FOUND`)
- `POST /v1/works/subscriptions/:id/activate` → state `active`, stamps `started_at`
- `POST /v1/works/subscriptions/:id/suspend`   → state `suspended`, stamps `suspended_at`
- `GET  /v1/works/invoices`

The transition table today is a plain `Record<string, {state, timestampField}>` iterated to register
routes, with no source-state guard — `activate` from `cancelled` succeeds.

## Target design

### Guarded transition map

Replace the flat map with a per-transition rule that declares the set of legal source states and the
timestamp field, applied fail-closed inside the tenant scope:

| action    | to state    | legal from            | timestamp field |
|-----------|-------------|-----------------------|-----------------|
| activate  | active      | draft, grace          | started_at      |
| suspend   | suspended   | active, grace         | suspended_at    |
| resume    | active      | suspended             | started_at      |
| grace     | grace       | active                | (none)          |
| cancel    | cancelled   | draft, active, grace, suspended | cancelled_at |

A transition whose current state is not in `legal from` returns `409 INVALID_TRANSITION` and writes
nothing. Because the ORM trigger already records an append-only audit event on every update, the
console needs no separate audit table.

### Invoice lifecycle

Add `POST /v1/works/invoices` (create in `open` for an in-scope subscription) and
`POST /v1/works/invoices/:id/pay` (`open`/`overdue` → `paid`, stamps `payment_ref` from the body).
`grace` entry for a subscription is offered as an operator action derived from the presence of an
`overdue` invoice, not an automatic job, to keep this plan's blast radius to the console surface.

### Correlated read

`GET /v1/works/subscriptions/:id` returns the subscription with its `isp.plan` and its `isp.invoice`
rows fetched by three scoped `findById`/`find` calls (no raw joins, no new SQL). A second tenant
requesting the same id gets 404 because every read is scoped by `tenantOf(request)`.

### Console UI

Rendered with `@moonwitness/ui` blocks only: `StatePanel` for the lifecycle states (STATE_PARITY:
error/loading/not-found), `Card` + `Table` for the plan and invoice correlation, `Badge` for state,
and `Button` for the guarded transitions. No Tailwind palette colors, no new icon library, one skin
root.

## Data-integrity invariants preserved

- All mutations run through `BaseRepository` within a transaction so `withAuditContext` records the
  actor; no raw SQL is introduced.
- `company_id` is stamped from the authenticated principal, never from the request body.
- Platform catalog reads (if any) use the `{ systemScope: true }` + `company_id IN [0, tenant]`
  pattern already used by the i18n catalog routes.
