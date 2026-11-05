# Tasks: SENTINEL Phase 3 — RADIUS Accounting & Subscriber Session Lifecycle (Issue #12)

## 1. Accounting Codec & Storage Model
- [x] Implement RFC 2866 request/response authenticator validation
- [x] Define `sentinel.session` table schema in `@allah/arsy-orm` (start/stop times, input/output octets, IP, MAC)
- [x] Implement packet deduplication buffer in `packages/sentinel-radius`

## 2. Session Lifecycle Handlers
- [x] Handle `Start` status: create session record
- [x] Handle `Interim-Update` status: update octet counters and timestamps
- [x] Handle `Stop` status: record final counters and terminate cause
- [x] Implement stale session reconciliation background task

## 3. Testing & Verification Gates
- [x] Write integration test `apps/arsy/test/sentinel_accounting.test.mjs`
- [x] Test duplicate packet protection
- [x] Test out-of-order packet safety
- [x] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

