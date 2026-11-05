---
contract: "DOCUMENTATION_CONTRACT.md"
id: "FEATURE-FLAG-CONFIG-SYSTEM-RULES"
version: "1.0.0"
owner: "architecture"
status: "proposed"
last_verified: "2026-11-05"
---
# Feature Flag & Configuration Management System — Invariants & Rules

These rules are drawn from this plan's own `design.md` (Implementation Constraints, Security
Architecture, Targeting Engine, Offline Fallback, Failure Scenarios) and `task.md` acceptance
criteria. They bound what any implementation of this proposal must preserve.

## Non-negotiable platform invariants (MoonWitness)

- **Fail-closed tenancy.** Every flag, config, experiment, and audit row is scoped by `company_id`;
  tenant targeting matches `company_id` and cross-tenant reads are refused.
- **No raw SQL / parameterized values only.** Store access goes through the PGlite WASM ORM with
  parameterized statements; string-built queries are prohibited.
- **Append-only audit.** Flag CRUD, toggles, targeting changes, and config edits emit append-only
  audit events with actor, timestamp, IP, and user agent; a before/after diff is stored, and
  replay is available for recovery.
- **Default-deny authentication.** All endpoints resolve auth first; unauthenticated or
  unbound-tenant requests are rejected rather than defaulted to a privileged scope.
- **UI purity.** Admin surfaces honor `PALETTE_PURITY`, `STYLE_PURITY`, `UI_PURITY`.
- **No new dependencies beyond the existing stack.** Node.js 16+/Bun, Fastify 5.x, TypeScript 5.x,
  PGlite WASM; Docker/Coolify deployment compatible.

## Authorization (RBAC)

Roles are Admin (full CRUD), Developer (read + create/update own flags), Viewer (read-only), and
Auditor (read audit logs only). Authentication reuses `@allah/sdk` and cross-app SSO; JWT tokens gate
API access; permission checks apply to every endpoint including batch evaluation and the WebSocket
stream.

## Secrets and privacy

- Configuration values **never** contain secrets. Secrets stay in existing Vault/KMS storage and
  config entries reference secret IDs only.
- Audit logs store **hashed** user IDs, never raw IDs; metrics and traces carry no PII.
- Data retention is GDPR-compliant and configurable; PII filtering applies to logs and metrics.

## Evaluation and targeting rules

- Rule precedence is fixed and ordered: user ID → user segments → percentage rollout → geo → device
  → tenant → custom attributes → default value. First match wins.
- Bucketing is hash-based and consistent (`sha256(flagKey:userId) % total`) so a user's variant is
  stable across evaluations.
- Server-side evaluation is authoritative; client-side results are advisory and validated. Targeting
  must not be bypassable by client tampering.
- Optimistic locking via a `version` field governs flag/config updates; concurrent edits resolve
  last-write-wins by version while the audit trail is preserved.
- A/B experiments require a control variant, explicit traffic allocation, and statistical gating
  (Bayesian; MDE 5%, power 80%, significance 95%) before declaring a winner.

## Caching and degraded-mode behavior

- Layered cache TTLs are enforced: in-memory 1 minute (server) / 5 minutes (client), LocalStorage
  1 hour, IndexedDB 24 hours; keys are namespaced by flag, environment, and hash.
- Cache invalidation fires on flag change (event bus → WebSocket); batch invalidation and
  stale-while-revalidate prevent stampedes.
- Degraded mode is fail-safe: when the service is unreachable use cached values; when the cache has
  expired fall back to typed defaults, and emit degraded-mode metrics. Circuit breakers isolate
  service calls to prevent cascade failures.

## Rate limiting and resilience

- Rate limit is 100 requests/minute per user/IP (1000/hour sustained) across evaluation and admin
  endpoints; input validation is enforced at every endpoint.
- Real-time propagation to clients is bounded (target: within 5 seconds of a change).
- Cached flag evaluation is targeted at <10ms (service path <50ms) with cache hit rate >95% and
  service availability 99.9% under degraded mode; load behavior is verified before release.

## Compatibility and migration

- Backward compatible with existing `@allah/sdk`; no breaking changes to the 10 integrated apps.
- Migration tools for hardcoded, environment-variable, and database-flag sources must provide
  dry-run validation and rollback.

## Gate contract

Implementation is not complete until `pnpm verify:release`, `lint:arch`, `typecheck`, `docs:check`
(100/100), `ui:test`, and `ui:contrast` pass, all app builds succeed, and security scans are clean.
