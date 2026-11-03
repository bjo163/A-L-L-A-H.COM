# Tasks: PULSE Phase 1 — Network Operation Job Lifecycle (Issue #19)

## 1. Job Queue Data Models
- [ ] Define `pulse.job` model in `@allah/arsy-orm` (status, attempts, idempotency_key, payload)
- [ ] Implement atomic job reservation and status transition queries in PGlite
- [ ] Implement exponential backoff retry calculation

## 2. Dispatcher & Concurrency Engine
- [ ] Implement worker loop in ARSY Fastify Hub
- [ ] Implement job cancellation endpoint (`POST /v1/pulse/jobs/:id/cancel`)
- [ ] Connect job handlers for session reconciliation and probe sweep

## 3. Testing & Verification Gates
- [ ] Write integration test `apps/arsy/test/pulse_jobs.test.mjs`
- [ ] Test retry backoff and failure boundaries
- [ ] Test idempotency key deduplication
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

