---
status: proposed
plan: "works-isp-lifecycle-console"
owner: "product"
---

# Works ISP Lifecycle Console — Task Breakdown

Ordered so each task has an independently checkable gate. Depends on the `works` addon being
registered via the shared loader (roadmap T8) and on T2 having reconciled the `isp_*` definitions.

## W1 — Guarded subscription transition map
- Replace the flat `subscriptionTransitions` record in `apps/arsy/src/app.ts` with a table that
  carries `legalFrom: state[]` per action and enforces it fail-closed (409 `INVALID_TRANSITION`).
- Add `resume`, `grace`, and `cancel` actions; wire `cancel` to stamp `cancelled_at`.
- Gate: hub test asserts activate-from-cancelled is refused and activate-from-draft stamps
  `started_at`; existing activate/suspend routes stay behavior-compatible from legal sources.

## W2 — Invoice create + mark-paid
- `POST /v1/works/invoices` (open, in-scope subscription) and `POST /v1/works/invoices/:id/pay`.
- Gate: hub tests for create and pay paths, both scoped to `tenantOf(request)`.

## W3 — Correlated subscription detail read
- `GET /v1/works/subscriptions/:id` returning subscription + plan + invoices via scoped reads.
- Gate: second-tenant request for the same id yields 404 (tenant-isolation test).

## W4 — Console surface (blocks only)
- Build the operator view with `StatePanel`, `Card`, `Table`, `Badge`, `Button`.
- Gate: `pnpm lint:arch` (palette/icon/skin/state-parity) EXIT=0; `pnpm ui:contrast` PASS.

## W5 — Roll-up verification
- Run the full battery: typecheck, lint, build, docs:check, hub + gateway tests.
- Gate: all EXIT=0.

## Definition of Done
- Every declared `isp.subscription` state has exactly one guarded transition route with a timestamp
  (or a documented no-timestamp rationale for `grace`).
- No raw SQL added; all reads/writes flow through `BaseRepository` within the caller's tenant scope.
- New routes covered by hub tests; trust-boundary and tenant-isolation suites unchanged and green.
