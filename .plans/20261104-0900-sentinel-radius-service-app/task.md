---
status: "proposed"
---
# Actionable Tasks: Sentinel Standalone Microservice Daemon (`apps/sentinel`) & High-Performance UDP RADIUS Service

## 1. Application Scaffolding & Setup
- [ ] Create `apps/sentinel` directory structure (`src/`, `test/`).
- [ ] Setup `apps/sentinel/package.json` (`@allah/sentinel`) with monorepo dependencies.
- [ ] Configure `apps/sentinel/tsconfig.json` extending root TypeScript configuration.
- [ ] Add `pnpm sentinel:dev`, `pnpm sentinel:build`, and `pnpm sentinel:start` scripts to root `package.json`.

## 2. Low-Level Native RADIUS Protocol Engine
- [ ] Implement RFC 2865 binary packet parser (`parseRadiusPacket`) using native `Buffer` operations.
- [ ] Implement RFC 2865 response packet encoder (`encodeRadiusPacket`) with cryptographic MD5 response authenticator calculation.
- [ ] Implement RFC 2866 accounting request authenticator validation and response generation.
- [ ] Implement MikroTik VSA parser and encoder (`Vendor-Id: 14988`, `MikroTik-Rate-Limit`).
- [ ] Write unit test suite verifying binary parsing against raw RFC capture fixtures.

## 3. High-Throughput UDP Socket Listeners
- [ ] Implement `RadiusAuthListener` on UDP port `1812` (configurable via `SENTINEL_AUTH_PORT`).
- [ ] Implement `RadiusAcctListener` on UDP port `1813` (configurable via `SENTINEL_ACCT_PORT`).
- [ ] Add sliding-window packet deduplication cache (`Acct-Session-Id` + `Acct-Status-Type`) to ignore retransmissions.
- [ ] Integrate NAS secret resolver against `nexus.nas` with in-memory caching.

## 4. Business Logic & Subscriber Lifecycle
- [ ] Implement PAP password verification against `sentinel.account` with SHA-256 / bcrypt hash support.
- [ ] Inject `MikroTik-Rate-Limit` attribute into `Access-Accept` based on subscriber plan speed.
- [ ] Implement accounting event processor (`Start`, `Interim-Update`, `Stop`) writing to `sentinel.session`.
- [ ] Implement Disconnect-Request (RFC 3576 / RFC 5176) client targeting MikroTik port 3799.

## 5. Observability & System Gates
- [ ] Expose Prometheus metrics endpoint (`GET /metrics`) on HTTP port 9181.
- [ ] Add healthcheck and readiness endpoint (`GET /healthz`).
- [ ] Verify `pnpm docs:check` passes at 100/100.
- [ ] Verify `pnpm lint:arch` passes without architectural violations.
- [ ] Verify `pnpm typecheck` compiles cleanly.
