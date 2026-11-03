# Tasks: SENTINEL Phase 3 — RADIUS Accounting & Subscriber Session Lifecycle (Issue #12)

## 1. Accounting Codec & Storage Model
- [ ] Implement RFC 2866 request/response authenticator validation
- [ ] Define `sentinel.session` table schema in `@allah/arsy-orm` (start/stop times, input/output octets, IP, MAC)
- [ ] Implement packet deduplication buffer in `packages/sentinel-radius`

## 2. Session Lifecycle Handlers
- [ ] Handle `Start` status: create session record
- [ ] Handle `Interim-Update` status: update octet counters and timestamps
- [ ] Handle `Stop` status: record final counters and terminate cause
- [ ] Implement stale session reconciliation background task

## 3. Testing & Verification Gates
- [ ] Write integration test `apps/arsy/test/sentinel_accounting.test.mjs`
- [ ] Test duplicate packet protection
- [ ] Test out-of-order packet safety
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

