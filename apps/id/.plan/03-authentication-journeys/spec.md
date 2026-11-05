---
title: "Identity Gate — Login and Registration"
status: "proposed"
owner: "engineering"
plan_id: "ID-03-AUTHENTICATION-JOURNEYS"
---

# Identity Gate — Login and Registration

## Goal
Make login and regular registration distinct, accessible, resilient journeys while preserving ARSY as the authentication authority.

## Product and architecture context
MoonWitness ID is the personal identity gateway for the A-L-L-A-H.COM ecosystem. LUNAR CHRONICLES is its visual DNA. ARSY is the sole authority for identity, authentication, session state, tenant, role, authorization, and one-time initial-owner setup. The app presents and consumes those capabilities; it never replaces them.

## Baseline
- Repository: `bjo163/A-L-L-A-H.COM`
- App: `apps/id`
- Package: `@moonwitness/id`
- Branch: existing `dev`
- Local port: 3003
- Current stack: Next.js 16, React 19, TypeScript, pnpm
- Shared integration: `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`
- Visual skin: `lunar-chronicles`
- Read `../README.md`, `../BLUEPRINT.md`, root `AGENTS.md`, `AUTONOMOUS.md`, `QUALITY.md`, `SECURITY.md`, and `DECISIONS.md` before work.

## Dependencies
- `00-contract-baseline`
- `01-lunar-visual-foundation`

## Scope
Modify existing /login and /register routes, their tests, and narrowly scoped composition styles. Use existing Better Auth client and current policy. Do not add new providers, password recovery, MFA, passkeys, email verification, or a new auth service.

## Explicit non-goals
- No ARSY backend or database redesign.
- No new identity provider, password store, or client-owned authorization.
- No production DNS, proxy, TLS, deployment, secret, or migration changes.
- No new routes, dependencies, or shared primitives without source-backed justification.
- No fake functionality or unsupported product claims.

## Acceptance criteria
- [ ] Login and registration have distinct information hierarchy and supporting copy.
- [ ] Email/password inputs use correct labels, autocomplete, validation, and focus behavior.
- [ ] Registration only creates regular user accounts and exposes no role/tenant/privilege input.
- [ ] Errors do not expose account existence or raw provider internals.
- [ ] Pending state prevents duplicate submit; successful navigation follows authoritative response only.
- [ ] Existing password minimums remain aligned with ARSY policy unless source evidence proves the server contract changed.

## Definition of done
- All in-scope tasks are checked with evidence.
- Relevant tests and quality gates actually run and pass, or blockers are precisely documented.
- No out-of-scope security/production boundary was crossed.
- `report.md` contains changed paths, commands, outcomes, final commit, and remaining risks.
- Status is changed to `completed` only when all acceptance criteria are proven.
