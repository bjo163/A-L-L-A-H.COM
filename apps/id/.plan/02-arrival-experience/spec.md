---
title: "Arrival — Observatory Threshold"
status: "completed"
owner: "engineering"
plan_id: "ID-02-ARRIVAL-EXPERIENCE"
---

# Arrival — Observatory Threshold

## Goal
Turn the existing / route into a distinctive, session-aware identity threshold with one obvious next action and honest authority states.

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
Modify only the home route and the smallest supporting app-level composition/styles/tests. Keep current route ownership and use existing SDK/session contracts. Do not introduce new identity endpoints or destination permissions.

## Explicit non-goals
- No ARSY backend or database redesign.
- No new identity provider, password store, or client-owned authorization.
- No production DNS, proxy, TLS, deployment, secret, or migration changes.
- No new routes, dependencies, or shared primitives without source-backed justification.
- No fake functionality or unsupported product claims.

## Acceptance criteria
- [x] Guest, authenticated, onboarding-available, onboarding-closed, and authority-unavailable states are deterministic and truthful.
- [x] Exactly one primary action is visually dominant for each state.
- [x] Home explains what ID does in concise, plain language without claiming unverified SSO.
- [x] The landmark/artwork is original or existing licensed shared artwork and never carries fake security or astronomy facts.
- [x] The route passes keyboard, responsive, contrast, and reduced-motion checks.

## Definition of done
- All in-scope tasks are checked with evidence.
- Relevant tests and quality gates actually run and pass, or blockers are precisely documented.
- No out-of-scope security/production boundary was crossed.
- `report.md` contains changed paths, commands, outcomes, final commit, and remaining risks.
- Status is changed to `completed` only when all acceptance criteria are proven.
