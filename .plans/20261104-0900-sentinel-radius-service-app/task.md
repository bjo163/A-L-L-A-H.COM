---
status: "proposed"
---
# Actionable Tasks: Sentinel Standalone Microservice Daemon (`apps/sentinel`) & High-Performance UDP RADIUS Service

## 1. Application Scaffolding & Setup
- [x] Create `apps/sentinel` directory structure (`src/`, `test/`).
- [x] Setup `apps/sentinel/package.json` (`@allah/sentinel`) with monorepo dependencies.
- [x] Configure `apps/sentinel/tsconfig.json` extending root TypeScript configuration.
- [x] Add `pnpm sentinel:dev`, `pnpm sentinel:build`, and `pnpm sentinel:start` scripts to root `package.json`.

## 2. Low-Level Native RADIUS Protocol Engine
- [x] Implement RFC 2865 binary packet parser (`parseRadiusPacket`) using native `Buffer` operations.
- [x] Implement RFC 2865 response packet encoder (`encodeRadiusPacket`) with cryptographic MD5 response authenticator calculation.
- [x] Implement RFC 2866 accounting request authenticator validation and response generation.
- [x] Implement MikroTik VSA parser and encoder (`Vendor-Id: 14988`, `MikroTik-Rate-Limit`).
- [x] Write unit test suite verifying binary parsing against raw RFC capture fixtures.

## 3. High-Throughput UDP Socket Listeners
- [x] Implement `RadiusAuthListener` on UDP port `1812` (configurable via `SENTINEL_AUTH_PORT`).
- [x] Implement `RadiusAcctListener` on UDP port `1813` (configurable via `SENTINEL_ACCT_PORT`).
- [x] Add sliding-window packet deduplication cache (`Acct-Session-Id` + `Acct-Status-Type`) to ignore retransmissions.
- [x] Integrate NAS secret resolver against `nexus.nas` with in-memory caching.

## 4. Business Logic & Subscriber Lifecycle
- [x] Implement PAP password verification against `sentinel.account` with SHA-256 / bcrypt hash support.
- [x] Inject `MikroTik-Rate-Limit` attribute into `Access-Accept` based on subscriber plan speed.
- [x] Implement accounting event processor (`Start`, `Interim-Update`, `Stop`) writing to `sentinel.session`.
- [x] Implement Disconnect-Request (RFC 3576 / RFC 5176) client targeting MikroTik port 3799.

## 5. Observability & System Gates
- [x] Expose Prometheus metrics endpoint (`GET /metrics`) on HTTP port 9181.
- [x] Add healthcheck and readiness endpoint (`GET /healthz`).
- [x] Verify `pnpm docs:check` passes at 100/100.
- [x] Verify `pnpm lint:arch` passes without architectural violations.
- [x] Verify `pnpm typecheck` compiles cleanly.
