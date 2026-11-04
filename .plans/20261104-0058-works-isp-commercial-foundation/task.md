# Tasks: WORKS Phase 1 — ISP Commercial Foundation & Billing Lifecycle (Issue #9)

## 1. Commercial Data Models (`addons/works` & `@allah/arsy-orm`)
- [x] Define `isp.plan` model (speed limits, burst profiles, FUP, price, currency)
- [x] Define `isp.subscription` model with state machine fields and timestamps
- [x] Define `isp.invoice` model (amounts, due dates, payment references)
- [x] Register models in `@allah/arsy-orm` schema migration registry

## 2. Subscription State Machine & Event Publisher
- [x] Implement state machine logic (`activate`, `enterGrace`, `suspend`, `reactivate`, `cancel`)
- [x] Implement ARSY internal event emitter for `isp.subscription.*` entitlement updates
- [x] Create provider-neutral payment webhook receiver stub

## 3. Fastify Hub Endpoints & SDK Integration
- [x] Register `GET /v1/works/plans` & `POST /v1/works/plans`
- [x] Register `GET /v1/works/subscriptions` & `POST /v1/works/subscriptions`
- [x] Register `POST /v1/works/subscriptions/:id/activate`
- [x] Register `POST /v1/works/subscriptions/:id/suspend`
- [x] Register `GET /v1/works/invoices`
- [x] Add `mwClient.works` methods in `@allah/sdk`
- [x] Export commercial types from `@moonwitness/types`

## 4. Testing & Verification Gates
- [x] Create automated unit tests for state machine in `apps/arsy/test/works_commercial.test.mjs`
- [x] Run `pnpm lint:arch` (100% compliant)
- [x] Run `pnpm typecheck` (0 errors)
- [x] Run `pnpm docs:check` (100/100 pts)

