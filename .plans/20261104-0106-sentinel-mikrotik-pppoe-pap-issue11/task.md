# Tasks: SENTINEL Phase 2 — MikroTik PPPoE PAP Authentication End-to-End (Issue #11)

## 1. MikroTik VSA Implementation
- [x] Define MikroTik Vendor ID `14988` dictionary in `packages/sentinel-radius`
- [x] Implement `MikroTik-Rate-Limit` attribute formatter and parser
- [x] Add unit tests for MikroTik VSA encoding/decoding

## 2. Authentication Pipeline & NAS Integration
- [x] Wire incoming UDP `Access-Request` to NEXUS NAS secret resolver
- [x] Implement PAP password extraction and verification against `sentinel.account`
- [x] Implement subscriber access decision evaluation (accept with rate-limit vs reject)

## 3. End-to-End Testing & Verification
- [x] Build end-to-end simulation test in `apps/arsy/test/sentinel_pppoe.test.mjs`
- [x] Test unknown NAS rejection
- [x] Test wrong password rejection
- [x] Test active subscriber success with rate limit VSA
- [x] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

