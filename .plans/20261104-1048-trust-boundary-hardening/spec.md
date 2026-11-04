---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
source: "ultra-review scan (security & trust boundary)"
---

# Trust Boundary Hardening — Arsy Hub, Sentinel RADIUS, AI Gateway

## 1. Problem Statement

A Level-1 ultra-review pass focused on security and trust boundaries produced ten findings.
Four are CRITICAL and all four were **CONFIRMED**, two of them with live read-only probes
against the developer machine's running hub (`127.0.0.1:5150`).

| ID | Severity | Finding | Evidence class |
|---|---|---|---|
| F-01 | CRITICAL | Unauthenticated SQL execution as DB superuser through the MCP tool endpoint | CONFIRMED (live probe returned `current_user = postgres`) |
| F-02 | CRITICAL | 15 hub routes + 12 gateway routes with zero auth guard | CONFIRMED (live probe: `GET /api/v1/models/auth.user` → 200 with no credentials; `grep -c authenticate apps/arsy/src/app.ts` = 0) |
| F-03 | CRITICAL | Tenant isolation fail-open: no `company_id` clause when `companyId` is omitted | CONFIRMED by code; contradicts its own `// Fail-closed tenant isolation` comment |
| F-04 | CRITICAL | SQL identifier injection through unquoted-escaped column names in `buildSelect` / `buildInsert` | CONFIRMED reachable (`POST /api/v1/models/:model_name` → `repo.create(request.body)`); not exploited |
| F-05 | CRITICAL | RADIUS `Access-Accept` without any password verification, plus hardcoded `'testing123'` NAS secret | CONFIRMED by code (comment admits it; `passwordStr` never read) |
| F-06 | HIGH | Hardcoded default credentials: JWT fallback secret (two different published defaults), seeded AI virtual key stored unhashed and compared literally | CONFIRMED by code |
| F-07 | HIGH | Bearer JWT signed without expiry and never checked against `auth_session.revoked` | CONFIRMED by code |
| F-08 | HIGH | Secret-at-rest is inert end to end: KDF salt random and never persisted, `decryptSecret` has zero callers, silent plaintext fallback, master key absent from compose | CONFIRMED by code + grep |
| F-09 | HIGH | SSRF guard is hostname-string matching; no post-resolution IP validation, no link-local/CGNAT coverage, `ALLOW_LOCAL_AI=true` disables every check | CONFIRMED by code |
| F-10 | MEDIUM | Transport/runtime hardening: `HOST=0.0.0.0` default, published hub port, CSP disabled, reflective CORS, no rate limiting, `user.status` never enforced, root container | CONFIRMED by code |

The goal of this plan is not a rewrite. The hub's plugin architecture, content-addressed
storage, gateway resilience (circuit breaker, fallback chain, budget metering) and
optimistic-concurrency update builder are assets and stay. What is missing is the enforcement
layer between a network client and those subsystems.

## 2. Scope

**In scope**

1. One default-deny authentication boundary at the Fastify composition root, with an explicit
   public allowlist, replacing 27 opt-in sites that were each individually forgettable.
2. Tenant scoping made mandatory and fail-closed in `@allah/arsy-orm`, with an explicit
   `systemScope` escape for bootstrap and seeding paths.
3. Identifier whitelisting in every SQL builder path (select filters, order-by, insert columns,
   update columns — the last one already exists and becomes the template).
4. Removal of the raw-SQL tool from the public MCP surface; agent and swarm runs get a
   tenant-scoped read path instead.
5. Real RADIUS credential verification against the columns `sentinel.account` already declares
   (`password_hash`, `password_salt`).
6. Secret management that actually round-trips: persisted salt, no plaintext fallback, and
   `decryptSecret` wired into the only consumer.
7. Credential hygiene: no published default secrets, hashed AI virtual keys, expiring and
   revocable bearer tokens.
8. SSRF validation against resolved IPs.
9. Transport hardening: loopback default, fixed-window limiter on credential endpoints, CSP and
   CORS sourced from configuration, account status enforcement, content-addressed digest
   validation.
10. `apps/arsy` inside the strict typecheck surface (it currently hides a real arity bug).
11. Test updates and new regression tests for every closed boundary.
12. Documentation reconciliation: `SECURITY.md` currently claims three invariants that the code
    does not enforce, and the `AGENTS.md` monorepo map is missing six packages, three addons and
    an empty `apps/server`.

**Out of scope**

- UI/design-system audit (`packages/ui`, 44 files), the four content apps, `vscode-extension`
  internals, addon business logic, retention/`legal_hold` enforcement, backup/recovery, CI
  workflow consolidation, and any deployment or DNS change.
- New dependencies. Nothing here needs one: the limiter is ~40 lines of fixed window, the
  SSRF check uses built-in `node:net` and `dns.promises`.
- Pushing, publishing, deploying, or opening GitHub issues. Review-derived changes stay local
  until the owner approves.

## 3. Architecture

```
                        BEFORE                          AFTER
 network ──► Fastify root ──► route handler     network ──► Fastify root
             (no guard)                            │
                                                   ├─ onRequest guard (default-deny)
                                                   │    ├─ public allowlist (health, auth, docs?)
                                                   │    ├─ session-token → DB (revoked/expiry/status)
                                                   │    └─ bearer JWT → exp + session alive
                                                   ├─ fixed-window limiter on credential routes
                                                   └─ request.principal { userId, companyId }
                                                        │
                                                        ▼
                                            BaseRepository(model, engine)
                                            find/create/update  ← companyId REQUIRED
                                            QueryBuilder         ← identifier + operator whitelist
```

The guard lives at the composition root because every plugin in this hub is wrapped in
`fastify-plugin` (no encapsulation), so one root `onRequest` hook covers hub routes, gateway
routes, storage routes, sdui routes and the MCP surface simultaneously. A per-route `preHandler`
strategy would have to be remembered 27 times, which is exactly how F-02 happened.

`request.user.company_id` is already read by the agent routes
([packages/arsy-plugin-llm-gateway/src/index.ts:351](../../packages/arsy-plugin-llm-gateway/src/index.ts))
and has always been `undefined`, so the guard also fixes a latent tenant bug rather than only
adding a check.

## 4. Requirements

| # | Requirement | Verification |
|---|---|---|
| R1 | Every non-allowlisted route returns 401 without credentials | integration test per route group |
| R2 | `tools/call` with `pglite_query` is not reachable over HTTP at all | live/probe test asserting the tool is absent from `tools/list` |
| R3 | `SELECT`/`INSERT` without tenant context throws unless `systemScope` is explicit | unit test in `query_builder.test.ts` |
| R4 | Non-whitelisted identifier or operator is rejected before SQL assembly | unit tests for select/insert/order-by |
| R5 | RADIUS accepts only the correct PAP password; unknown NAS is rejected with no fallback secret | unit test on the handler |
| R6 | `encryptSecret` → `decryptSecret` round-trips across a process boundary (fresh module state) | unit test |
| R7 | Missing `ARSY_MASTER_KEY` throws instead of storing plaintext; missing `JWT_SECRET` in production aborts boot | unit test + boot test |
| R8 | Bearer tokens carry `exp` and stop working after `sessions/revoke` | integration test |
| R9 | AI virtual keys are stored as SHA-256; only the prefix is display metadata; revoked keys fail | unit test |
| R10 | SSRF rejects hostnames resolving to loopback/link-local/CGNAT/ULA; `ALLOW_LOCAL_AI` only widens loopback | unit test with injected resolver |
| R11 | Hub binds `127.0.0.1` unless `HOST` is explicitly overridden | code review of default + compose |
| R12 | `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`, `pnpm --filter @allah/arsy build`, `pnpm ui:test`, arsy test suite all pass | gate commands |

## 5. Acceptance Criteria

- No endpoint except the documented public allowlist answers without a principal.
- No code path can issue SQL that omits a tenant predicate without naming `systemScope: true`.
- No credential, secret, or key default is published in source, compose, or docs.
- `SECURITY.md` statements match enforced behaviour; `AGENTS.md` monorepo map matches `ls`.
- `report.md` in this directory records commands, results, and anything left unverified.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Default-deny breaks the VS Code extension's device pairing/mission polling | device routes authenticate with their own `credential_hash`; they are allowlisted for ingress and validated inside `device_control`, and a regression test pins that a bad device token still fails |
| Mandatory `companyId` breaks ~39 existing call sites | mechanical pass per site; bootstrap/seed paths use `systemScope`; `pnpm --filter @allah/arsy build` + tests prove the sweep is complete |
| Frontend apps lose data they were reading unauthenticated | only `apps/id` calls the hub today (verified by grep), and it exclusively uses `auth.*`, which stays reachable |
| Rotating the seeded virtual key invalidates an operator's stored key | the seed writes a freshly generated key and logs its prefix once; documented as a breaking change in `report.md` |
| Existing `apps/arsy/test/*.mjs` assume unauthenticated 200s | shared test helper that registers/signs in and injects `x-session-token`; no test keeps asserting public access to a protected route |
