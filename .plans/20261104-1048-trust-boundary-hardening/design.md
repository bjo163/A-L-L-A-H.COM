---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1048-trust-boundary-hardening-design"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---

# Design — Contracts & Behaviour

This plan touches a backend only. The visual system is untouched, so there are no UI states;
"design" here is the API/state contract.

## 1. Principal resolution

```ts
interface Principal {
  userId: number;
  email: string;
  companyId: number;   // negative namespace = personal tenant (auth plugin convention)
  sessionId: number;
  via: 'session' | 'bearer';
}
```

`request.principal` is set by the root guard and is the only tenant source any route may read.
`request.user` stays populated for compatibility with the auth plugin's own routes.

### Resolution order (one implementation, shared by guard and auth plugin)

1. `Authorization: Bearer <jwt>` → verify signature **and** `exp` → load `auth_session` by the
   token's `sessionId` → reject if `revoked`, `expires_at` in the past, or the user is not
   `status = 'active'`.
2. `x-session-token` or `arsy_session` cookie → same DB checks as above.
3. Otherwise `401 UNAUTHORIZED` with the standard envelope.

Both paths converge, so a revoked session kills a bearer token too (F-07). The session lookup is
cached in-process for a short window (≤30 s) to keep the cost at one indexed read per burst.

## 2. Public allowlist

Matched on the *raw* method + path (not prefix-on-user-input), fail-closed on anything unmatched.

| Route | Why public |
|---|---|
| `GET /health`, `GET /ready` | container/liveness probes; no data beyond engine name |
| `POST /api/auth/sign-in`, `POST /api/auth/register` | credential entry points; rate limited |
| `POST /api/auth/verification/confirm` (if added later) | token-bearing link, self-authenticating |
| device-control ingress (`/v1/agent/devices/pairing`, `/claim`, mission poll) | authenticates with its own `credential_hash`; a bad token must still 401 |

`/docs` and `/v1/mcp/*` are **not** public. `/docs` is mounted only when `NODE_ENV !== 'production'`.

## 3. Repository & QueryBuilder contract

```ts
find({ companyId: 7 })                 // tenant-scoped           → ok
find({ systemScope: true })            // deliberate cross-tenant → ok (bootstrap, seeding, ops)
find({})                               //                           → throws TENANT_SCOPE_REQUIRED
find({ filters: [{ field: 'evil"' … }] })                        → throws UNKNOWN_FIELD
find({ filters: [{ operator: 'IN;' … }] })                        → throws UNSUPPORTED_OPERATOR
create(body, companyId)  // body keys intersected with model.fields, unknown keys rejected
```

`buildUpdate` already whitelists against `model.fields` and requires `companyId`; that becomes the
uniform rule for `buildSelect` and `buildInsert` as well. Identifier validation is a whitelist
lookup, never escaping — an escaped identifier is still an identifier the caller chose.

## 4. API state contract after hardening

| State | Response |
|---|---|
| no credentials, protected route | `401` `fail('UNAUTHORIZED', …)` |
| authenticated, different tenant's row | `404` (not `403`, to avoid tenant enumeration) |
| unknown `model_name` on generic CRUD | `404 MODEL_NOT_FOUND` |
| `model_name` not in the writable allowlist | `403 MODEL_NOT_WRITABLE` |
| rate limited | `429` `fail('RATE_LIMITED', …)` with `Retry-After` |
| missing `ARSY_MASTER_KEY` on a secret write | `500 CONFIG_ERROR` (never a silent plaintext row) |

Existing routes keep their envelopes; only the auth/tenant layers are added.

## 5. Sentinel credential verification

```
Access-Request ─► resolve NAS by source IP (no fallback secret)
              ─► decrypt PAP using the NAS shared secret
              ─► account = sentinel.account WHERE username = … AND status = 'active' AND tenant
              ─► verify(account.password_hash, passwordStr, account.password_salt)
                 match   → Access-Accept (+ plan-derived rate limits)
                 mismatch → Access-Reject (+ warning log, no reason disclosure)
```

Hashing uses the same primitive as the hub (`bcryptjs`) so subscriber provisioning and
`auth.user` do not diverge into two password regimes. `password_salt` stays in the schema for the
columns' documented purpose and is validated as present; bcrypt embeds its own salt, so a
provisioning path that writes a raw-shape salt must not silently produce a non-verifiable account.

## 6. Secret envelope (F-08)

```
stored = base64( version(1 byte) ‖ salt(16) ‖ iv(12) ‖ tag(16) ‖ ciphertext )
key    = pbkdf2(ARSY_MASTER_KEY, stored.salt, 100000, 32, sha256)
```

Version byte allows a future rotation path without guessing formats. `decryptSecret` returns `null`
on auth-tag failure (wrong key or tampered payload) — the caller must treat `null` as an error, not
as "use the stored value as-is".

## 7. SSRF decision flow (F-09)

```
URL ─► protocol http/https? ─► host literal IP or hostname
    ─► hostname ─► dns.resolve4/6 (fail closed on error) ─► all addresses
    ─► each address must be globally routable  (loopback · RFC1918 · link-local 169.254/16 ·
       CGNAT 100.64/10 · IPv6 ULA fe80::/10, fc00::/7 · ::ffff:127.0.0.1 · 0.0.0.0)
    ─► ALLOW_LOCAL_AI=true permits loopback only, never the other reserved ranges
    ─► request issued to the validated address (Host header preserved)
```

## 8. Non-goals of the design

No new framework, no auth provider, no session store replacement, no microservice split, no JWT→opaque-token
migration. The existing session table is the source of truth; the bearer path is being connected to it
rather than replaced.
