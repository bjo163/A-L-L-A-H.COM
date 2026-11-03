# Tasks: WORKS Phase 1 — ISP Commercial Foundation & Billing Lifecycle (Issue #9)

## 1. Commercial Data Models (`addons/works` & `@allah/arsy-orm`)
- [ ] Define `isp.plan` model (speed limits, burst profiles, FUP, price, currency)
- [ ] Define `isp.subscription` model with state machine fields and timestamps
- [ ] Define `isp.invoice` model (amounts, due dates, payment references)
- [ ] Register models in `@allah/arsy-orm` schema migration registry

## 2. Subscription State Machine & Event Publisher
- [ ] Implement state machine logic (`activate`, `enterGrace`, `suspend`, `reactivate`, `cancel`)
- [ ] Implement ARSY internal event emitter for `isp.subscription.*` entitlement updates
- [ ] Create provider-neutral payment webhook receiver stub

## 3. Fastify Hub Endpoints & SDK Integration
- [ ] Register `GET /v1/works/plans` & `POST /v1/works/plans`
- [ ] Register `GET /v1/works/subscriptions` & `POST /v1/works/subscriptions`
- [ ] Register `POST /v1/works/subscriptions/:id/activate`
- [ ] Register `POST /v1/works/subscriptions/:id/suspend`
- [ ] Register `GET /v1/works/invoices`
- [ ] Add `mwClient.works` methods in `@allah/sdk`
- [ ] Export commercial types from `@moonwitness/types`

## 4. Testing & Verification Gates
- [ ] Create automated unit tests for state machine in `apps/arsy/test/works_commercial.test.mjs`
- [ ] Run `pnpm lint:arch` (100% compliant)
- [ ] Run `pnpm typecheck` (0 errors)
- [ ] Run `pnpm docs:check` (100/100 pts)

