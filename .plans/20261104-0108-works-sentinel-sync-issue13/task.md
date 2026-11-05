# Tasks: ISP Integration Phase 1 — Synchronize WORKS Entitlement with SENTINEL Access Policy (Issue #13)

## 1. Policy Synchronization Consumer
- [x] Implement event listeners for `isp.subscription.*` events in `packages/sentinel-radius`
- [x] Implement fast policy cache in SENTINEL runtime
- [x] Implement Disconnect-Request (RFC 3576) trigger for session termination upon suspension

## 2. Race Condition & Reconciliation Guards
- [x] Implement event sequence numbers to prevent out-of-order event overwrites
- [x] Implement periodic full reconciliation audit between active subscriptions and policy cache

## 3. Testing & Verification Gates
- [x] Write integration test `apps/arsy/test/works_sentinel_sync.test.mjs`
- [x] Verify instant policy update from active to suspended
- [x] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

