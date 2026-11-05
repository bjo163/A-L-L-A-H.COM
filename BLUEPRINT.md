---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BLUEPRINT"
version: "1.2.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# BLUEPRINT.md

Target architecture. Not a completion claim. Reconcile continuously against source + runtime.
Monorepo map → [AGENTS.md](AGENTS.md). Invariants → [AGENTS.md](AGENTS.md). Decisions → [DECISIONS.md](DECISIONS.md).

## Applications

| App | Dir | Port | Role |
|---|---|---|---|
| Arsy Hub | `apps/arsy/` | 5150 | Backend authority: PGlite ORM · AI Gateway · CAS storage · SDUI · auth |
| Dock | `apps/dock/` | 3001 | Public ecosystem homepage |
| Headquarter | `apps/headquarter/` | 3002 | Command center · AI Gateway control · knowledge explorer |
| MoonWitness ID | `apps/id/` | 3003 | Identity gateway · account trust · proposed secrets/API-key/environment control plane (ARSY authority) |
| World Observatory | `apps/jizz/` | 3004 | Public intelligence observatory, ROCKSOUL JIZZ API |

## Platform Packages

| Package | Import | Role |
|---|---|---|
| `packages/arsy-orm/` | `@allah/arsy-orm` | Embedded PGlite WASM ORM · schema sync · tenant isolation |
| `packages/arsy-plugin-llm-gateway/` | — | Multi-provider AI routing · SSE streaming · virtual keys · ReAct agent loop · SDUI tool registry |
| `packages/assets/` | `@moonwitness/assets` | Canonical single source for public assets (world artwork, brand emblems, favicon, font binaries); syncs per-app copies into `apps/*/public` at predev/prebuild |
| `addons/mw_qorpus/` | — | Vector embeddings · SHA-256 dedup · hybrid retrieval |

## Layer Stack

```
Experience     apps/* · EcosystemNavbar · responsive · a11y
MoonFrame      @moonwitness/ui · 6 DNA skins · SSR SkinRoot · typed tokens  → DESIGN.md
Cognitive      ReAct agent loop · SDUI synthesis · SSE /v1/agent/stream · @allah/sdk
Swarm          SwarmCoordinator(planner/researcher/builder/verifier) · /v1/swarm/* · consensus≤3→human
Data           PGlite WASM · @allah/arsy-orm · res.users identity · append-only audit events · explicit global-admin routes · company_id
Infra          GitHub Actions · GHCR · Coolify · /health · /ready
```

## Swarm

| Endpoint | Method | Description |
|---|---|---|
| `/v1/swarm/run` | POST | Sync execution |
| `/v1/swarm/stream` | POST | SSE: `swarm_agent_step` · `swarm_message` · `swarm_verdict` · `done` |

`max_turns` default: 12. Hard cap: 24. Consensus failures ≥3 → human intervention.
SDK: `mwClient.swarm.run()` / `mwClient.swarm.stream()`. Types: `SwarmStep` · `SwarmAgentMessage` · `SwarmExecutionResult`.

## VS Code Agent

Workspace context: explicit consent required. File edits: reviewable before apply.
Paired devices: poll missions outbound. Headquarter: manage devices/missions, no workspace path exposure.
Tenant IDs: negative = personal, positive = org, zero = unassigned → [DECISIONS.md](DECISIONS.md) D-008.
The ORM provisions one idempotent system identity (`bot`) for default/system-owned writes. First-run onboarding creates the initial `superuser`; ordinary registration is available after onboarding. Every persisted model row has required `create_uid` and `write_uid` references to `res.users`; database triggers also append changed-field-only insert/update/delete events atomically. Superusers use explicit, reason-required global-admin routes; ordinary tenant routes remain scoped → [DECISIONS.md](DECISIONS.md) D-013 · D-014.

## Delivery

CI promotion → validate Compose and build/publish all images to GHCR → versioned GitHub release. Coolify independently receives its GitHub webhook and may deploy concurrently with image publication.

## Decision Rule

New service / DB / framework / abstraction:
`outcome → inspect existing → compare alternatives → define ownership → DECISIONS.md + BACKLOG.md`


## Identity & Secrets Control Plane

MoonWitness ID is the human-facing control plane; ARSY is the sole authority and custody boundary. This separation is mandatory.

| Domain | ID responsibility | ARSY / runtime responsibility |
|---|---|---|
| Human identity | Login, registration, profile, account trust | Canonical identity, credentials, sessions, tenant and role authorization |
| Service identity | Create/manage workflow and metadata UI | Service principal issuance, scope enforcement, disable/revoke, audit |
| API credentials | Create-once display, metadata, rotation/revoke UX | Generate, hash or encrypt appropriately, validate, rate-limit, revoke, audit |
| Secrets vault | Secret metadata, access request, masked state, rotation workflow | Envelope encryption, key custody, decrypt-on-demand, access policy, audit |
| Environment management | Project/environment views, variable metadata, version/diff workflow | Encrypted values, RBAC, injection into approved runtime, deployment hand-off |
| Integration access | Approved app registry and scopes UI | OAuth/client registry, redirect validation, token issuance and policy enforcement |

### Secret and credential classes

- **Human credentials:** Better Auth/ARSY managed; never exportable or viewable.
- **Personal API keys:** user-owned, scoped, expiring, revocable; plaintext shown once at issuance only if the issuing contract explicitly supports it; store verifier/hash where validation permits.
- **Service API keys:** service principal-owned, scoped to service/project/environment; never tied to a human session for runtime use.
- **Upstream provider secrets:** encrypted at rest with envelope encryption; decrypt only in server-side execution context that needs them.
- **Environment variables:** values treated as secrets by default unless explicitly classified public; `NEXT_PUBLIC_*` values are public and must never contain credentials.
- **Signing/encryption keys:** managed outside ordinary secret records; key-encryption keys supplied by deployment secret manager/KMS, with versioning and rotation.

### Mandatory security architecture

1. ARSY owns all secret APIs and data models. No secret CRUD through generic ORM routes.
2. Tenant and project context are derived from the authenticated principal and server-side membership; never trust request body identifiers.
3. Encrypt recoverable secrets with authenticated envelope encryption; store key version, nonce, ciphertext, and algorithm metadata. Never store plaintext fallback.
4. One-way API-key verifiers use cryptographically secure random tokens and a keyed verifier/HMAC or password-hash design selected by threat model; do not assume SHA-256 alone is adequate for every credential class.
5. Show plaintext only at creation/rotation, never on later reads. Mask identifiers and redact all request/response/error logs.
6. Use least-privilege scopes, environment binding, expiry, rate limits, last-used metadata, immediate revocation, and audit events.
7. Secret access is explicit and server-authorized; high-risk reveal/copy/rotate/delete actions require re-authentication or step-up MFA when available.
8. Environment changes are versioned, diffable without exposing values, approval-gated where policy requires, and deployed through a controlled runtime integration—not arbitrary shell execution.
9. Rotation supports overlap windows, consumer migration status, revocation, rollback policy, and evidence. Never silently replace a live credential.
10. Secrets must not enter browser bundles, client props, URLs, telemetry, crash reports, AI prompts, agent context, or generated plans.

### Environment management boundaries

ID manages logical project/environment configuration and approvals. It does not become a terminal, arbitrary remote shell, or generic production deployment console. Approved adapters (for example deployment providers) receive only the minimum secret references required, with scoped credentials and auditable hand-off. Values remain server-side.

### Status

The control-plane direction is **proposed**. Existing encrypted NAS secret storage and hashed AI virtual keys are separate current foundations. No generalized vault, API-key portal, environment manager, or end-to-end KMS integration is claimed implemented by this blueprint update.
