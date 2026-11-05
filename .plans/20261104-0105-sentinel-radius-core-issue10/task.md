# Tasks: SENTINEL Phase 1 — Native RADIUS Protocol Core & Packet Test Suite (Issue #10)

## 1. Packet Codec & Data Structures (`packages/sentinel-radius`)
- [x] Implement `RadiusPacket` interface and RFC attribute dictionary
- [x] Implement binary parser `parsePacket` with strict length and boundary checks
- [x] Implement binary encoder `encodePacket` with RFC 2865 response authenticator calculation
- [x] Implement PAP password decryption / verification utilities
- [x] Implement constant-time secret comparison via `crypto.timingSafeEqual`

## 2. Standalone UDP Socket Runtime
- [x] Implement `RadiusServer` using Node.js `dgram` (UDP sockets)
- [x] Configure configurable ports (default: 1812 auth, 1813 acct)
- [x] Implement graceful startup, error handling, and shutdown hooks
- [x] Add structured, redacted logging (secrets & passwords masked)

## 3. Test Vectors & Verification Gates
- [x] Build RFC 2865 golden vector test suite in `packages/sentinel-radius/test/codec.test.mjs`
- [x] Build malformed packet rejection tests (short length, invalid TLV, truncated buffers)
- [x] Run `pnpm lint:arch` (100% compliant)
- [x] Run `pnpm typecheck` (0 errors)
- [x] Run `pnpm docs:check` (100/100 pts)

