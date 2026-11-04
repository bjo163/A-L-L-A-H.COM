---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening-decision"
version: "1.0.0"
owner: "architecture"
status: "accepted"
last_verified: "2026-11-04"
---

# Decisions

## D-1 · Default-deny root hook instead of per-route `preHandler`

**Context.** 27 routes across hub and gateway had no guard. The auth decorator already existed and
was used by the auth plugin's own four routes, which proves intent: guards were meant to be there
and were simply not applied.

| Option | Assessment |
|---|---|
| Add `preHandler: authenticate` to all 27 routes | Works today, silently fails tomorrow. Every new route is a new chance to repeat F-02 — that is the same failure mode, not a fix |
| `onRequest` hook at the composition root + exact public allowlist | Chosen. One decision point, default-deny, and `fastify-plugin` wrapping means it covers encapsulated plugin routes too |
| Move to a gateway/WAF in front | Rejected: adds an operational component, does not fix tenant scoping, and the hub is embedded PGlite single-process |

**Consequence.** VS Code extension device flows and `apps/id` must be exercised after the change;
their ingress routes are on the allowlist but still carry their own credential checks.

## D-2 · `pglite_query` leaves the tool registry entirely

**Context.** The tool's guard is a keyword regex over uppercased SQL, and it executed live as the
`postgres` superuser over an unauthenticated endpoint. It also produced false positives —
`SELECT … WHERE tablename like '%update%'` was rejected.

| Option | Assessment |
|---|---|
| Keep the tool, add auth in front | Rejected: an authenticated superuser `SELECT` still reads every tenant's rows and can reach `pg_read_file`, and a text filter will never be a sound read-only boundary |
| Run it inside a read-only transaction as a non-superuser role | Rejected for now: PGlite is a single embedded process with one `postgres` role, so role separation would need an external Postgres — a bigger change than the risk justifies |
| Remove it from the registry; give the agent tenant-scoped repository tools | Chosen. Deletes the capability instead of gating it; agent tests keep asserting that tool calls route through a principal |

## D-3 · Tenant scoping becomes a required argument, with a named escape

**Context.** `buildSelect` skips the `company_id` clause when `companyId` is `undefined`, while
`buildUpdate` requires it. Two builders, two rules — the inconsistency is the evidence that the
optional form was an oversight.

**Decision.** `buildSelect`/`buildInsert` throw unless `companyId` is supplied or the caller writes
`systemScope: true`. Grep showed 39 repository `.find({` sites and **zero** of them pass a tenant,
so the honest reading is that tenant filtering was never wired in at all — this is the sweep that
makes the `AGENTS.md` invariant real rather than aspirational.

**Consequence.** Bootstrap, seeding, migrations and any operator-level cross-tenant read must name
`systemScope` explicitly, which turns a silent default into a reviewable string.

## D-4 · Secrets fail loudly, never silently fall back

**Context.** `encryptSecret(secret) || secret` stores a RADIUS shared secret in plaintext whenever
`ARSY_MASTER_KEY` is unset — and compose never sets it. Meanwhile the KDF used a fresh random salt
per process and never stored it, so even the encrypted case could not be decrypted after a restart;
`decryptSecret` had no callers at all.

**Decision.** Persist the salt inside the payload with a version byte; throw on a missing master key;
wire `decryptSecret` into sentinel. Chosen over "just require the env var", because a random-salt KDF
is broken independently of configuration and a versioned envelope is what makes later rotation
possible without format guessing.

## D-5 · Bearer tokens stay, but inherit session state

**Context.** Two parallel credential types exist (bearer JWT and DB-backed session token). The SDK
uses the session header; the bearer path bypasses revocation.

**Decision.** Keep bearer (the extension and third-party clients expect it) but sign with `exp` and
validate `sessionId` against `auth_session`. Chosen over deleting bearer support, which would break
external clients for no security gain once revocation is enforced.

## D-6 · No new dependencies

**Context.** Standard fixes would be `@fastify/rate-limit` and an SSRF/IP library.

**Decision.** Implement a fixed-window limiter and IP-range validation locally. Roughly 40 lines
each, no supply-chain surface, and the owner's standing preference is thin tooling over elaborate
infrastructure. Revisit only if distributed rate limiting becomes a requirement — at which point the
correct answer is Redis, not a bigger in-process map (the current AI-key limiter is already an
unbounded per-process `Map`, which is both a leak and a multi-instance bypass).

## D-7 · RADIUS verification reuses bcrypt, not the `password_salt` column

**Context.** `sentinel.account` declares `password_hash` **and** `password_salt`, but no code reads
either, and no provisioning path writes them.

**Decision.** Verify with bcrypt (matching `auth.user`, so one password regime exists) and validate
that `password_salt` is present rather than inventing a second SHA-based scheme that would make
provisioning ambiguous. Reconsidered alternative: a raw `sha256(salt ‖ password)` matching the column
name — rejected because it would create two incompatible subscriber-password formats in one product.
