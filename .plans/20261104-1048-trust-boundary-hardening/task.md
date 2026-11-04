---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening-task"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---

# Task Ledger

Legend: `- [ ]` pending · `- [/]` in progress · `- [x]` done (verified)

## Phase 0 — Default-deny auth boundary (F-01, F-02)

- [ ] T0.1 `packages/arsy-core`: add `createPrincipalGuard` + public-allowlist matcher and a fixed-window limiter helper (no new dependency)
- [ ] T0.2 `packages/arsy-plugin-auth`: extract `resolveSession` / `resolvePrincipal` so the hub guard and the plugin share one implementation; add `status` enforcement
- [ ] T0.3 `apps/arsy/src/app.ts`: register root `onRequest` guard; attach `request.principal = { userId, companyId }`
- [ ] T0.4 Define and document the public allowlist (`/health`, `/ready`, `/api/auth/sign-in`, `/api/auth/register`, device-control ingress) — everything else protected by construction
- [ ] T0.5 `packages/arsy-plugin-llm-gateway`: remove `pglite_query` from the public MCP tool registry; keep it out of `tools/list`
- [ ] T0.6 `packages/arsy-plugin-llm-gateway`: agent/swarm runs use `request.principal.company_id` (never the literal `'default'`)
- [ ] T0.7 `apps/arsy/src/app.ts`: `/api/v1/models/:model_name` GET/POST tenant-scoped to the principal, model allowlist, no body-key pass-through to column names
- [ ] T0.8 Swagger UI `/docs` no longer public in production
- [ ] T0.9 Regression tests: each route group answers 401 without credentials; `tools/list` lacks `pglite_query`

## Phase 1 — Tenant fail-closed + identifier whitelist (F-03, F-04)

- [ ] T1.1 `query_builder.buildSelect`: throw unless `companyId` present or `systemScope: true`
- [ ] T1.2 `query_builder`: whitelist identifiers against `model.fields` for filters, `orderBy`, and insert columns; whitelist `operator`
- [ ] T1.3 `repository`: same contract for `find`/`findById`/`create` (`create` must resolve a tenant, never accept a caller-supplied `company_id` from a body)
- [ ] T1.4 Sweep all 39 `.find({` / `.create(` call sites: pass the principal tenant or name `systemScope` explicitly
- [ ] T1.5 Fix `updateById(id, data)` arity bugs (`apps/arsy` subscription activate/suspend silently no-oped)
- [ ] T1.6 Unit tests: fail-open branch throws, injection identifiers rejected, `systemScope` path still works
- [ ] T1.7 Wrap multi-step writes (qorpus ingest, i18n sync) in a transaction or document why per-row is safe

## Phase 2 — Sentinel RADIUS credential verification (F-05)

- [x] T2.1 Verify PAP password against `sentinel.account.password_hash` + `password_salt`; reject on mismatch (scrypt via `verifySubscriberPassword`, constant-time)
- [x] T2.2 Remove the `'testing123'` fallback; unknown/inactive NAS ⇒ drop + audit-log (no signed reply without a valid secret)
- [x] T2.3 Resolve the shared secret through `decryptSecret` (call site wired; master-key availability is finalized in Phase 3)
- [x] T2.4 Plan/rate-limit selection from account data, not substring matching on the username (no `sentinel.plan` table exists — derive from `sentinel.account.rate_limit_download/upload` Kbps)
- [x] T2.5 Unit tests: correct password accepts, wrong password rejects, malformed stored values fail closed (`packages/sentinel-radius/test/subscriber_password.test.mjs` — 11/11)

## Phase 3 — Secret management that round-trips (F-06, F-07, F-08)

- [x] T3.1 `encryption.ts`: persist the KDF salt inside the payload (`version‖salt‖iv‖tag‖ciphertext`) so derivation is reproducible across processes (verified `secret_encryption.test.mjs` reproducible-round-trip)
- [x] T3.2 Fail closed: `encryptSecret` throws on empty; `masterSecret()` uses `resolveLocalSecret('ARSY_MASTER_KEY')` which throws in production when absent; no `|| secret` plaintext fallbacks remain in `apps/arsy`
- [x] T3.3 NAS secret rotation endpoint `PUT /v1/nexus/nas/:id/secret` writes `encryptSecret(...)` via `updateById` + records `nexus.nas_secret_log` (`isEncrypted` guard for legacy plaintext rows)
- [x] T3.4 JWT: `jwt.sign(..., { expiresIn })`, session rows carry `expires_at`/`revoked`; bearer path filters `revoked=false`, validates session `revoked`/`expires_at`/`status==='active'`
- [x] T3.5 JWT secret from `resolveLocalSecret('JWT_SECRET', ...)` — no published default; aborts boot in production when missing
- [x] T3.6 AI virtual keys: `key_hash = sha256(rawKey)`, looked up by hash with `revoked IS NOT TRUE`; no `key_prefix = rawKey` match remains
- [x] T3.7 Seeded literal `mw_live_master*` no longer present in source (only a stale test fixture, fixed in Phase 6); `ai.virtual_key` schema has `key_hash unique`, no plaintext column
- [x] T3.8 `docker-compose.yml`: production topology requires `JWT_SECRET` + shared `ARSY_MASTER_KEY` (arsy↔sentinel) via `${VAR:?...}`; insecure `${JWT_SECRET:-arsy-master-secret-key}` default removed
- [x] T3.9 `isEncrypted` requires the version byte + minimum header length, so arbitrary base64 is no longer misreported as encrypted
- [x] T3.10 Unit tests: encryption round-trip, wrong-master-key throws, tampered envelope throws, empty secret refused (`packages/arsy-orm/test/secret_encryption.test.mjs` — 5/5). Revoked-key + forged/expired-JWT rejection covered by hub integration tests in Phase 6.

## Phase 4 — SSRF against resolved IPs (F-09)

- [x] T4.1 `ssrf.ts`: parse → resolve → validate the IP (loopback, RFC1918, link-local incl. `169.254.169.254`, CGNAT `100.64.0.0/10`, ULA/IPv6-mapped, decimal/hex/octal forms, 6to4/Teredo/NAT64)
- [x] T4.2 `ALLOW_LOCAL_AI` widens only the loopback case (private/link-local stay blocked); fails closed on resolution failure / empty records
- [x] T4.3 Validates the actual resolved IPs via a custom undici lookup (`ssrfSafeLookup`) + dispatcher that pins the address and closes the rebinding window; `web_fetch` sets `headersTimeout`/`bodyTimeout`, does not follow redirects, and truncates to `max_bytes`
- [x] T4.4 Unit tests with an injected resolver — public name returning a loopback record is rejected (`packages/arsy-plugin-llm-gateway/test/ssrf.test.mjs` — 9/9)

## Phase 5 — Transport & runtime hardening (F-10)

- [x] T5.1 `apps/arsy/src/main.ts`: `HOST` default `127.0.0.1`; explicit override documented for publishing
- [x] T5.2 Fixed-window limiter on `sign-in` / `register` / secret-rotation routes (`RATE_LIMITS` in `app.ts`)
- [x] T5.3 CSP header on every JSON route (Swagger UI exempted); CORS origin from `CORS_ORIGINS`, fails closed to `[]` in production (`resolveCorsOrigins`)
- [x] T5.4 `sign-in`/`authenticate` enforce `auth.user.status === 'active'`
- [x] T5.5 Storage `GET /api/storage/:digest` validates `^[0-9a-f]{64}$` before `path.join` (400 on reject)
- [x] T5.6 No `/api/auth/login` `inject()` alias remains — canonical `POST /api/auth/sign-in` only
- [x] T5.7 `apps/arsy/Dockerfile`: `USER node` + `HEALTHCHECK /health`; `/docs` dropped from `PUBLIC_ROUTES` in production so the guard requires auth
- [x] T5.8 Global error handler returns a generic `INTERNAL_SERVER_ERROR` — no `err.message` echoed

## Phase 6 — Typecheck surface & tests

- [ ] T6.1 `apps/arsy` (and `apps/sentinel`) inside `scripts/typecheck.ts` / strict build filters
- [ ] T6.2 Shared test helper: register → sign-in → `x-session-token` header injection
- [ ] T6.3 Update `apps/arsy/test/*.mjs` to authenticate; no test may keep asserting anonymous access to a protected route
- [ ] T6.4 ORM tests cover the fail-closed branch and identifier whitelist
- [ ] T6.5 `pnpm lint:arch` · `pnpm typecheck` · `pnpm docs:check` · `pnpm --filter @allah/arsy build` · `pnpm ui:test` · arsy test suite · sentinel build — all green

## Phase 7 — Documentation reconciliation

- [ ] T7.1 `SECURITY.md`: keep only claims the code now enforces; state what is still open
- [ ] T7.2 `AGENTS.md` monorepo map vs `ls packages addons apps` (6 undocumented packages, `nexus`/`orbit`/`works` addons, empty `apps/server`)
- [ ] T7.3 `CHANGELOG.md` entry for the breaking changes (anonymous API access removed, seeded virtual key rotated, hub binds loopback by default)
- [ ] T7.4 `report.md`: verified deliverables, command evidence, remaining unknowns
