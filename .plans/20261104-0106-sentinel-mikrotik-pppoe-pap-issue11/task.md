# Tasks: SENTINEL Phase 2 — MikroTik PPPoE PAP Authentication End-to-End (Issue #11)

## 1. MikroTik VSA Implementation
- [ ] Define MikroTik Vendor ID `14988` dictionary in `packages/sentinel-radius`
- [ ] Implement `MikroTik-Rate-Limit` attribute formatter and parser
- [ ] Add unit tests for MikroTik VSA encoding/decoding

## 2. Authentication Pipeline & NAS Integration
- [ ] Wire incoming UDP `Access-Request` to NEXUS NAS secret resolver
- [ ] Implement PAP password extraction and verification against `sentinel.account`
- [ ] Implement subscriber access decision evaluation (accept with rate-limit vs reject)

## 3. End-to-End Testing & Verification
- [ ] Build end-to-end simulation test in `apps/arsy/test/sentinel_pppoe.test.mjs`
- [ ] Test unknown NAS rejection
- [ ] Test wrong password rejection
- [ ] Test active subscriber success with rate limit VSA
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

