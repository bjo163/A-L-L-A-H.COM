---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening-report"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
---

# Trust Boundary Hardening — Completion Report

Scope: close every P0/P1/P2 finding raised by the ultra-review security pass over the Arsy hub,
Sentinel RADIUS daemon, and AI gateway, with tests and documentation synchronized.

## Verified deliverables

### P0

- Default-deny root `onRequest` guard at the hub composition root, with an exact public allowlist
  (`/health`, `/ready`, `/api/auth/sign-in`, `/api/auth/register`, device-control ingress). Every other
  route is protected by construction, including encapsulated plugin routes via `fastify-plugin` wrapping.
- Unauthenticated raw-SQL MCP tool `pglite_query` removed from the registry; it no longer appears in
  `tools/list` (asserted `-32601`). Agent/swarm runs resolve `company_id` from `request.principal`, never
  the literal `'default'`.
- Tenant isolation is fail-closed: `buildSelect`/`buildInsert` throw unless `companyId` is present or the
  caller writes `systemScope: true`. The 39 repository `.find({`/`.create(` sites were swept to pass the
  principal tenant or name the escape explicitly.
- SQL identifiers whitelisted against `model.fields` for filters, `orderBy`, and insert columns; operators
  whitelisted; unknown field/operator raises instead of interpolating.
- Sentinel RADIUS verifies the PAP password against the stored hash (constant-time scrypt/bcrypt) with no
  `'testing123'` fallback; unknown or inactive NAS drops and audit-logs rather than signing a reply.

### P1

- Secrets fail closed: `encryptSecret` throws on empty, `masterSecret()` resolves through
  `resolveLocalSecret('ARSY_MASTER_KEY')` and aborts in production when absent; all `|| secret` plaintext
  fallbacks removed from `apps/arsy`.
- KDF salt persisted inside the payload (`version‖salt‖iv‖tag‖ciphertext`), making derivation reproducible
  across processes; `isEncrypted` requires the version byte plus minimum header length.
- JWT signed with `expiresIn`; session rows carry `expires_at`/`revoked`; the bearer path filters
  `revoked=false` and validates session expiry, revocation, and `status==='active'`. `JWT_SECRET` has no
  published default and aborts boot in production when missing.
- AI virtual keys stored as `key_hash = sha256(rawKey)` with `revoked IS NOT TRUE` lookup; no
  `key_prefix = rawKey` match and no plaintext column remain.
- SSRF validated against resolved IPs: parse → resolve → validate (loopback, RFC1918, link-local incl.
  `169.254.169.254`, CGNAT, ULA/IPv6-mapped, decimal/hex/octal, 6to4/Teredo/NAT64). `ssrfSafeLookup` pins
  the resolved address through a custom undici dispatcher to close the DNS-rebinding window; `web_fetch`
  sets header/body timeouts, does not follow redirects, and truncates to `max_bytes`. `ALLOW_LOCAL_AI`
  widens only loopback.

### P2

- Hub binds `127.0.0.1` by default (`HOST` override documented); Dockerfile runs `USER node` with a
  `/health` HEALTHCHECK; `/docs` dropped from `PUBLIC_ROUTES` in production.
- Fixed-window rate limiter on sign-in / register / secret-rotation (no new dependency).
- CSP header on every JSON route (Swagger UI exempted); CORS origin from `CORS_ORIGINS`, failing closed to
  `[]` in production.
- sign-in / authenticate enforce `auth.user.status === 'active'`; storage `GET /api/storage/:digest`
  validates `^[0-9a-f]{64}$` before `path.join`; global error handler returns a generic
  `INTERNAL_SERVER_ERROR` without echoing `err.message`; no `/api/auth/login` alias remains.
- `apps/arsy` and `apps/sentinel` brought into the typecheck surface.

## Command evidence

All gates run locally and green at completion:

| Gate | Result |
|---|---|
| `pnpm docs:check` | 100/100, no violations |
| `pnpm lint:arch` | all invariants pass |
| `pnpm lint` (eslint, `--max-warnings 0`) | exit 0 |
| `pnpm typecheck` | 25/25 projects |
| `pnpm ui:test` | 35/35 |
| `apps/arsy` hub suite (`trust_boundary` etc.) | 56/56 |
| `packages/arsy-orm` suite | 21/21 |
| `packages/sentinel-radius` (`subscriber_password`) | 11/11 |
| `packages/arsy-plugin-llm-gateway` (`ssrf`) | 9/9 |
| `pnpm --filter @allah/arsy build` | pass |
| `dock` / `headquarter` / `id` / `jizz` / `gate` builds | pass |

Notable non-production-code corrections: the `PARAMETERIZED_QUERIES` linter was fixed to scope template
interpolation to the query's own literal (removing a false positive on `repository.ts` while keeping true
positives); the `trust_boundary` audit assertion was scoped to admin-authorized events (those carrying a
`reason_hash`), since normal tenant writes correctly have `global_access=false`. Neither weakened an
actual security invariant.

## Remaining unknowns / open items

- Distributed rate limiting is per-process only; the AI-key limiter is an unbounded in-process `Map`, which
  is both a leak and a multi-instance bypass. Correct fix is Redis, deferred until horizontal scaling is a
  real requirement (D-6).
- No automatic audit-event retention/purge is configured pending a retention duration and legal-hold policy.
- The `sentinel.account.password_salt` column is validated as present but bcrypt verification matches
  `auth.user`, so a second subscriber-password regime was deliberately avoided (D-7); provisioning that
  writes these columns is still needed before production RADIUS enrollment.
- VS Code extension device flows and `apps/id` SSO rely on allowlisted ingress with their own credential
  checks; exercised at the unit/integration layer but not against a live external NAS.
- Changes are committed locally only; nothing was pushed, per the standing approval requirement.
