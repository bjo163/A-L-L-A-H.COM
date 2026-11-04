---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening-rules"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---

# Invariants, Security & Tenant Rules

## R-A  Authorization is structural, not per-route

1. The root `onRequest` guard is default-deny. A route is reachable only if it is on the
   allowlist **or** carries a principal.
2. Adding a route must never require remembering to add a guard. If a change introduces a guard
   by hand, it is wrong.
3. The allowlist is an exact `METHOD path` set. Prefix matching, regexes on user input, and
   "starts with" checks are prohibited: `POST /api/auth/../v1/whatever` must not inherit public
   status. Matching uses the routed path, not the raw URL string.
4. `/docs` is never mounted when `NODE_ENV === 'production'`.

## R-B  Tenant isolation is fail-closed

1. Every repository read/write carries either `companyId` or an explicit `systemScope: true`.
   Silence means rejection — never "all tenants".
2. `systemScope` is reserved for bootstrap, seeding, migrations, and operator tooling. It is
   prohibited in any request-handling path.
3. The tenant value comes from `request.principal.company_id` — never from `request.body`,
   `request.query`, or a URL parameter. A caller choosing its own `company_id` is a cross-tenant
   write (seen today in `/v1/orbit/instances`, `/v1/works/*`, `POST /v1/nexus/nas`).
4. Cross-tenant row lookups answer `404`, not `403`, so the API does not confirm tenant membership.
5. The negative `company_id` namespace for personal tenants stays as-is; the guard must not
   rewrite it into a positive id.

## R-C  SQL assembly

1. Values: parameterized only.
2. Identifiers (columns, order-by fields) and operators: whitelist against `model.fields`, no
   escaping fallback.
3. No request body key becomes a column name without passing the whitelist; unknown keys are
   rejected rather than dropped.
4. Raw SQL is allowed only in packages that own the engine (`arsy-orm`, plugins' bootstrap/seed),
   and each such site is reviewed as part of this plan. `dbEngine.query` calls inside route
   handlers are removed or replaced by repository calls.
5. The agent/tool surface may not execute caller-supplied SQL. `pglite_query` is removed from the
   public tool registry; the agent gets tenant-scoped repository tools.

## R-D  Credentials & secrets

1. No default secret may exist in source, compose, CI, or docs. Missing configuration fails loudly
   at boot (production) or logs one unmistakable warning (development).
2. Passwords: bcrypt, verified on every authentication path — hub login and RADIUS alike.
3. Bearer tokens: short-lived (`exp`) and revocable via `auth_session`. Logout means the token is
   dead, not "hidden".
4. Session and verification tokens are compared through an indexed unique lookup; nothing is
   logged. A future hardening step (not in this plan) is hashing them at rest.
5. AI virtual keys: only SHA-256 of the raw key is stored; `key_prefix` is display metadata and is
   never used as an authentication factor.
6. Secret-at-rest round-trips. A write that cannot encrypt must fail. No `|| plaintext` fallback
   anywhere.
7. `two_factor_enabled` is out of scope: nothing in this plan claims 2FA.

## R-E  Outbound requests (SSRF)

1. Validation runs against **resolved IP addresses**, fail-closed on resolution failure.
2. Reserved ranges blocked: loopback, RFC1918, link-local including `169.254.169.254`,
   CGNAT `100.64.0.0/10`, IPv6 loopback/ULA/link-local, IPv4-mapped IPv6, `0.0.0.0`, and
   decimal/hex IP spellings.
3. `ALLOW_LOCAL_AI` widens **only** loopback for local model servers; it never disables the guard.
4. Upstream requests carry timeouts (connect, headers, body).
5. Redirects are not followed unless re-validated through the same routine.

## R-F  Network exposure

1. Dev default binds `127.0.0.1`. Publishing requires an explicit `HOST` override by the operator.
2. Containers run as a non-root user and declare a `HEALTHCHECK`.
3. CORS origins come from configuration; `origin: true` (reflect-any) is prohibited.
4. CSP is set, not disabled.
5. Credential endpoints are rate limited.

## R-G  Change control for this plan

1. Only files named in `task.md` change. No drive-by refactors, no formatting sweeps.
2. `packages/ui`, `packages/types`, `packages/lint` and the four content apps stay untouched unless
   a typecheck surface change requires an opt-in entry in `scripts/typecheck.ts`.
3. No dependency additions.
4. Breaking behaviour changes (anonymous API removed, seeded key rotated, loopback default) are
   recorded in `CHANGELOG.md` and `report.md`.
5. Nothing is pushed, deployed, or published without an explicit owner request.
