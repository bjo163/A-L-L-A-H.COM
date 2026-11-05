---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-TASKS"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-05"
---

# Execution Backlog — MoonWitness ID Next Evolution

Legend: `[ ]` pending · `[/]` in progress · `[x]` completed with evidence. Execute sequentially by dependency; small tasks are deliberately narrow.

Execution update: Wave 0 is recorded in [capability-matrix.md](./capability-matrix.md) and [report.md](./report.md). ID-001–008, ID-010, ID-017, and ID-071 are complete; ID-009 remains in progress pending production-origin evidence. ID-020 and later feature work remain pending until their accessibility gates, ARSY contracts, and product decisions are verified.

## Wave 0 — Baseline and contract discovery (P0)
- [x] ID-001 Inventory every current `apps/id/src/app/**` route and record route purpose/access.
- [x] ID-002 Inventory all `mwClient.auth.*` methods used by ID and link each to SDK source.
- [x] ID-003 Map Better Auth client calls to ARSY route handlers and server plugin implementation.
- [x] ID-004 Map identity, credential, session, verification, audit, and tenant models; record data ownership.
- [x] ID-005 Verify current session cookie attributes per environment from server source (HttpOnly, Secure, SameSite, Path, Domain, expiry).
- [x] ID-006 Inventory existing auth and identity tests; map each product requirement to evidence.
- [x] ID-007 Verify route-level loading/error/not-found parity and current shared UI usage.
- [x] ID-008 Create capability matrix: implemented, tested, integration-verified, unsupported, proposed.
- [/] ID-009 Document current public origins, trusted origins, callback URLs, and deployment domains without exposing secrets.
- [x] ID-010 Produce baseline report with exact file references and reproducible commands.

## Wave 1 — Security & Trust Center (ID-N01, P0)
- [ ] ID-011 Define trust-center information architecture; distinguish confirmed facts from unavailable signals.
- [ ] ID-012 Define typed security-posture contract in `packages/types` using only evidence-backed fields.
- [ ] ID-013 Define ARSY read endpoint contract for security summary; default-deny and authenticated principal required.
- [ ] ID-014 Add SDK method for security summary with typed success/error outcomes.
- [ ] ID-015 Add focused tests for missing principal, expired session, unavailable authority, and tenant isolation.
- [ ] ID-016 Build ID trust-center route using shared UI components and truthful empty/unavailable states.
- [x] ID-017 Add explicit confirmation dialog for sensitive session actions; retain server confirmation as source of truth.
- [ ] ID-018 Add security event timeline only after event schema, redaction, and retention are approved.
- [ ] ID-019 Add event pagination and stable ordering with bounded page size.
- [ ] ID-020 Add security-center keyboard, screen-reader, responsive, and reduced-motion checks.

## Wave 2 — Recovery & verification (ID-N04, P0)
- [ ] ID-021 Audit ARSY support for verification and password-reset flows; do not infer from dependency features.
- [ ] ID-022 Write recovery threat model: enumeration, token theft, replay, expiry, rate abuse, delivery failure.
- [ ] ID-023 Specify one-time, expiring, single-purpose recovery token contract; token never appears in logs.
- [ ] ID-024 Specify generic request responses to prevent account enumeration.
- [ ] ID-025 Specify server-side rate limits and abuse telemetry for recovery endpoints.
- [ ] ID-026 Implement SDK contracts only after ARSY endpoints and policies are accepted.
- [ ] ID-027 Build request-recovery UI with generic response and accessible status.
- [ ] ID-028 Build reset-password UI with strength guidance, confirmation, and safe error handling.
- [ ] ID-029 Build verification-pending and resend states only if email delivery is operational.
- [ ] ID-030 Add tests for expiry, replay, invalid token, throttling, enumeration resistance, and successful recovery.
- [ ] ID-031 Add end-to-end tests across real ARSY + ID origins; document provider/delivery prerequisites.

## Wave 3 — Universal SSO & federation (ID-N02, P0)
- [ ] ID-032 Write federation decision record: protocol, issuer, audience, signing keys, expiry, logout, rotation.
- [ ] ID-033 Define exact supported app/client registry and allowed redirect URI policy.
- [ ] ID-034 Define authorization-code hand-off with PKCE/state/nonce or document selected equivalent.
- [ ] ID-035 Define replay prevention, one-time code consumption, clock skew, and error responses.
- [ ] ID-036 Define destination-side token validation and authorization responsibilities.
- [ ] ID-037 Define cross-domain deployment matrix and cookie behavior; explicitly reject cookie-sharing assumptions.
- [ ] ID-038 Add SDK hand-off methods only after the server contract is implemented.
- [ ] ID-039 Add integration tests for valid, expired, replayed, wrong-audience, wrong-redirect, and wrong-origin flows.
- [ ] ID-040 Add logout semantics and document whether logout is local, app-wide, or global.
- [ ] ID-041 Add federation diagnostics that expose safe status only, never tokens or signing material.

## Wave 4 — Profile & preferences (ID-N03, P1)
- [ ] ID-042 Define canonical editable profile fields and immutable identity fields.
- [ ] ID-043 Define locale, time-zone, date-format, and accessibility preference contracts.
- [ ] ID-044 Add SDK read/update methods backed by ARSY validation and audit.
- [ ] ID-045 Add profile read/edit form with field-level validation and optimistic UI only where safe.
- [ ] ID-046 Add avatar upload contract with size/type limits, content validation, and storage ownership review.
- [ ] ID-047 Add profile change confirmation and conflict handling for stale updates.
- [ ] ID-048 Add Indonesian and English copy for all ID routes and validation messages.
- [ ] ID-049 Add tests for unauthorized fields, invalid locale/time zone, stale writes, and tenant boundary.

## Wave 5 — Trusted devices & session intelligence (ID-N05, P1)
- [ ] ID-050 Audit actual session metadata available from ARSY; do not infer browser/device identity.
- [ ] ID-051 Define stable device metadata contract and privacy limits.
- [ ] ID-052 Add last-seen and created-at display only when returned by the authority.
- [ ] ID-053 Add revoke-all-other-sessions action only if server supports atomic semantics.
- [ ] ID-054 Add device rename flow only if metadata persistence is authority-backed.
- [ ] ID-055 Add anomaly signal taxonomy with explainable evidence; no opaque risk score.
- [ ] ID-056 Add tests for concurrent revoke, stale list, current-session revoke, and authority failure.

## Wave 6 — Privacy & data rights (ID-N06, P1)
- [ ] ID-057 Inventory personal data categories and processing purposes with product owner.
- [ ] ID-058 Define versioned privacy notice and consent records; separate required processing from optional consent.
- [ ] ID-059 Define export request lifecycle, ownership checks, expiry, and secure download delivery.
- [ ] ID-060 Define deletion request lifecycle, retention, legal hold, identity continuity, and audit obligations.
- [ ] ID-061 Add ARSY/SDK contracts only after policy and data inventory approval.
- [ ] ID-062 Build privacy dashboard with clear consent history and request status.
- [ ] ID-063 Add tests for cross-tenant export denial, legal hold, expiry, and deletion idempotency.

## Wave 7 — Lunar experience & quality (ID-N07, P1)
- [ ] ID-064 Create route-by-route composition brief for arrival, login, registration, account, trust, recovery, and privacy.
- [ ] ID-065 Preserve LUNAR CHRONICLES DNA while ensuring every control remains legible and accessible.
- [ ] ID-066 Audit all form labels, descriptions, error association, focus order, and keyboard submission.
- [ ] ID-067 Audit all routes at 360, 390, 768, 1024, and 1440 CSS px.
- [ ] ID-068 Verify reduced-motion and sound preference behavior; no required action depends on sound.
- [ ] ID-069 Verify localization, long strings, date/time zones, and RTL readiness without claiming full RTL until tested.
- [ ] ID-070 Add route-level browser smoke tests for guest, authenticated, expired, and unavailable states.
- [x] ID-071 Audit metadata, icons, page titles, robots policy, and accidental indexing of private routes.
- [ ] ID-072 Capture visual regression baselines and document intentional differences.

## Wave 8 — Developer & integration center (ID-N08, P2)
- [ ] ID-073 Define safe client-application metadata schema; never store client secrets in browser-readable records.
- [ ] ID-074 Define scope/claim documentation and least-privilege rules.
- [ ] ID-075 Build read-only connected-app inventory from an authority-backed registry.
- [ ] ID-076 Add redirect URI review and validation workflow for administrators in the correct control plane.
- [ ] ID-077 Add integration test harness for login hand-off and callback validation.
- [ ] ID-078 Publish developer integration guide with local and production examples.

## Final release gates
- [ ] ID-079 Run ID unit tests and ARSY identity integration tests.
- [ ] ID-080 Run ID typecheck, architecture lint, docs check, and production build.
- [ ] ID-081 Run security tests and dependency/security review for changed auth surfaces.
- [ ] ID-082 Run browser tests on configured real origins; capture evidence and environment details.
- [ ] ID-083 Update `apps/id/README.md`, root `BACKLOG.md`, `ROADMAP.md`, and `CHANGELOG.md` only for verified scope.
- [ ] ID-084 Publish report with implemented vs blocked vs deferred capabilities; no unsupported VERIFIED claims.

## AI-local execution protocol
Each microtask is one bounded change. Before editing: read AGENTS.md, AUTONOMOUS.md, QUALITY.md, relevant Antislop skills, and the referenced source. Change only the task's declared scope. Run the smallest relevant test, then required repository gates. Update this file and report only with actual evidence. If the server contract is absent, produce a discovery/spec artifact and mark implementation BLOCKED; never fabricate a frontend-only feature.
