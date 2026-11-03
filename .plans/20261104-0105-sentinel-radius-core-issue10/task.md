# Tasks: SENTINEL Phase 1 — Native RADIUS Protocol Core & Packet Test Suite (Issue #10)

## 1. Packet Codec & Data Structures (`packages/sentinel-radius`)
- [ ] Implement `RadiusPacket` interface and RFC attribute dictionary
- [ ] Implement binary parser `parsePacket` with strict length and boundary checks
- [ ] Implement binary encoder `encodePacket` with RFC 2865 response authenticator calculation
- [ ] Implement PAP password decryption / verification utilities
- [ ] Implement constant-time secret comparison via `crypto.timingSafeEqual`

## 2. Standalone UDP Socket Runtime
- [ ] Implement `RadiusServer` using Node.js `dgram` (UDP sockets)
- [ ] Configure configurable ports (default: 1812 auth, 1813 acct)
- [ ] Implement graceful startup, error handling, and shutdown hooks
- [ ] Add structured, redacted logging (secrets & passwords masked)

## 3. Test Vectors & Verification Gates
- [ ] Build RFC 2865 golden vector test suite in `packages/sentinel-radius/test/codec.test.mjs`
- [ ] Build malformed packet rejection tests (short length, invalid TLV, truncated buffers)
- [ ] Run `pnpm lint:arch` (100% compliant)
- [ ] Run `pnpm typecheck` (0 errors)
- [ ] Run `pnpm docs:check` (100/100 pts)

