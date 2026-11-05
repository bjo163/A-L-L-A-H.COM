---
title: "LUNAR CHRONICLES Visual Foundation"
status: "proposed"
owner: "engineering"
plan_id: "ID-01-LUNAR-VISUAL-FOUNDATION"
---

# LUNAR CHRONICLES Visual Foundation

## Goal
Translate the approved LUNAR CHRONICLES DNA into an ID-specific composition grammar using the existing shared skin engine, without creating a parallel design system.

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

## Scope
Inspect and use @moonwitness/ui, SkinRoot, existing design tokens, and current app styling. Define only app-level composition and component usage. Shared primitives/tokens are changed only when a concrete shared defect is proven and a separate shared-scope change is justified.

## Explicit non-goals
- No ARSY backend or database redesign.
- No new identity provider, password store, or client-owned authorization.
- No production DNS, proxy, TLS, deployment, secret, or migration changes.
- No new routes, dependencies, or shared primitives without source-backed justification.
- No fake functionality or unsupported product claims.

## Acceptance criteria
- [ ] ID renders through the approved lunar-chronicles skin and shared runtime.
- [ ] No app-local duplicate palette, token registry, primitive library, or theme engine exists.
- [ ] A documented type, spacing, surface, border, focus, and motion grammar is applied consistently.
- [ ] The identity archive has a recognizable visual signature distinct from GATE and HEADQUARTER.
- [ ] Forms and data remain legible at narrow widths and under reduced motion.

## Definition of done
- All in-scope tasks are checked with evidence.
- Relevant tests and quality gates actually run and pass, or blockers are precisely documented.
- No out-of-scope security/production boundary was crossed.
- `report.md` contains changed paths, commands, outcomes, final commit, and remaining risks.
- Status is changed to `completed` only when all acceptance criteria are proven.
