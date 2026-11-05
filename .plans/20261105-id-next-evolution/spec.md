---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-SPEC"
version: "1.0.0"
owner: "product-architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# MoonWitness ID — Next Evolution

## Mission
Evolve `apps/id` from a working authentication and account surface into the human-facing Identity, Trust, Privacy, and Federation Center for A-L-L-A-H.COM and MoonWitness.

## Verified baseline
Inspected on `dev`, baseline commit `539d3abb5d728f1f3a8c60671eb4b50b50bc7b93`:
- Next.js 16.4.3, React 19.3, TypeScript, ESM; local port 3003.
- Better Auth client connects to ARSY at `/api/auth/better/*`.
- Login, regular registration, first-owner onboarding, account summary, active sessions, session revocation, sign-out, destination links, and route-level loading/error/not-found states exist.
- `apps/id/test/identity-ui.test.ts` covers core state resolution, password-pair validation, onboarding failure, account reads, revocation, destination URL safety, and generic auth errors.
- Shared boundaries: `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`; ARSY is the only identity/auth/session/tenant/role authority.

## Product outcome
A member can understand their identity, protect access, recover an account through verified authority-backed flows, control privacy choices, and enter connected products without confusing authentication with authorization.

## Eight strategic initiatives
1. **ID-N01 — Security & Trust Center (P0):** security overview, actionable posture, risk explanations, security event timeline, secure action confirmations.
2. **ID-N02 — Universal SSO & Federation (P0):** explicit cross-app hand-off contract, audience and redirect validation, state/nonce/replay protection, destination-side authorization, domain matrix.
3. **ID-N03 — Personal Identity Profile (P1):** editable profile fields supported by canonical APIs, avatar lifecycle, locale/time-zone preferences, profile completeness without invented identity claims.
4. **ID-N04 — Recovery & Verification (P0):** email verification and password recovery only after ARSY capability, delivery, expiry, single-use, abuse controls, and end-to-end tests are confirmed.
5. **ID-N05 — Trusted Devices & Session Intelligence (P1):** device naming, last-seen/created/expiry metadata, current-device clarity, revoke-one/revoke-others where supported, anomaly signals based on real evidence.
6. **ID-N06 — Privacy, Consent & Data Rights (P1):** consent ledger, privacy notice version, data export request, deletion request, retention/legal-hold behavior; no direct browser database access.
7. **ID-N07 — Lunar Identity Experience (P1):** route-specific LUNAR CHRONICLES compositions, responsive and accessible interaction, localization, empty/loading/error states, reduced-motion behavior.
8. **ID-N08 — Developer & Integration Center (P2):** approved client applications, redirect URI inventory, integration health, scopes/claims documentation, test hand-off flow; never expose secrets.

## Non-goals
- No second identity backend, database, credential store, or session authority.
- No direct database access from `apps/id`.
- No assumption that Better Auth dependency features are enabled.
- No automatic cross-registrable-domain cookie sharing.
- No role/tenant/permission editing in the browser.
- No fake risk scores, security badges, device fingerprints, or audit events.
- No new app or microservice for these capabilities.

## Delivery strategy
Ship in dependency order: (A) evidence and contract inventory, (B) recovery/security foundations, (C) federation contract, (D) profile and privacy, (E) experience polish, (F) developer integration surfaces. Small tasks must be independently executable by a local/small AI model and must state exact files, constraints, acceptance, and verification.

## Global acceptance
- ARSY remains sole authority; every new capability has typed SDK contracts and server-side enforcement.
- Unsupported capabilities are clearly marked proposed/unsupported, not rendered as active controls.
- No secrets, tokens, raw session IDs, or credentials in URLs, logs, analytics, or client-visible diagnostics.
- Tenant isolation and default-deny behavior remain intact.
- UI uses `@moonwitness/ui`; shared contracts use `@moonwitness/types`; transport uses `@allah/sdk`.
- Unit, integration, security, accessibility, localization, typecheck, architecture lint, docs, and production build evidence are recorded.
- A feature is VERIFIED only after real implementation and captured command/test evidence.

## Risks and dependencies
- Recovery, verification, MFA/passkeys, risk events, consent, export, and deletion require ARSY endpoint/schema/policy review first.
- Federation requires a protocol decision and real host/domain matrix; do not treat shared cookies as SSO.
- Security events require privacy-aware redaction and retention policy.
- Data export/deletion must respect legal hold, retention, tenant ownership, and audit invariants.

## Status
Proposed planning package. No product feature is claimed implemented by this plan.
