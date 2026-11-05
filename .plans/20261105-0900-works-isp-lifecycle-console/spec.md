---
status: proposed
plan: "works-isp-lifecycle-console"
created_at: "2026-11-05"
owner: "product"
monorepo: "rocksoul-dx"
---

# Works ISP Lifecycle Console — Specification

## Executive Summary

The `works` addon already owns a commercial ISP domain: `isp.plan`, `isp.subscription`, and
`isp.invoice` (see `addons/works/models/isp_commercial.ts`), with tenant-scoped HTTP routes on the
hub (`apps/arsy/src/app.ts`, `/v1/works/*`). Today those models are reachable through raw CRUD
routes but there is no operator-facing console that presents the subscription lifecycle, its state
transitions, and the invoice ledger as a single coherent management surface.

This plan delivers a **Works ISP Lifecycle Console**: a read-and-transition surface for ISP
subscriptions and their linked plans and invoices, built exclusively on the existing ORM
repositories and the hub's tenant-scoped routes, and rendered with `@moonwitness/ui` blocks only.

## Problem Statement

1. `isp.subscription.state` is a five-value selection (`draft`, `active`, `grace`, `suspended`,
   `cancelled`) but only two transitions are currently wired (`activate`, `suspend`). `grace` and
   `cancelled` are reachable only by writing the field directly, with no guarded route or timestamp.
2. `isp.invoice` exposes a read route only; there is no create or payment-transition path, so the
   invoice ledger cannot be operated from the console.
3. Operators have no consolidated view that joins a subscription to its plan and outstanding
   invoices — they must correlate three separate list endpoints by hand.

## Goals

- Present the ISP subscription lifecycle as an explicit, state-guarded flow with an audit trail.
- Wire the missing transitions (`cancel`, and a `grace` entry driven by overdue invoices) so every
  declared state has exactly one guarded mutation route.
- Give the invoice ledger a create and a mark-paid transition, tenant-scoped and actor-attributed.
- Surface plan/subscription/invoice correlation in a single console view without new SQL.

## Non-Goals

- Multi-currency billing math, proration, or payment-gateway integration.
- RADIUS/provisioning side effects on activation (owned by `sentinel-radius`).
- Cross-tenant or platform-admin views; the console is strictly per-tenant.

## Acceptance Criteria

- Every subscription state change goes through a named transition route that stamps the matching
  timestamp field and refuses an illegal source state (fail-closed), asserted by hub tests.
- A subscription detail read returns its plan and its invoices scoped to the same `company_id`;
  a second tenant sees none of it (tenant-isolation test).
- Invoice create and mark-paid mutate only within the caller's tenant scope.
- The console renders through `StatePanel`/`Card`/`Table` blocks; no raw colors or new icon libs.
