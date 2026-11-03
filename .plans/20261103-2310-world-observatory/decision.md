---
id: ADR-WORLD-OBSERVATORY-001
version: 1.0.0
owner: architecture
status: proposed
date: 2026-11-03
---

# ADR-001 — World Observatory as a standalone Next.js application

## Status
PROPOSED. Validate repository patterns and integration contracts before accepting.

## Context
A-L-L-A-H.COM already contains independently scoped Next.js applications and shared packages. ROCKSOUL JIZZ owns the PERSPECTIVE domain and provides a read-only API/observatory foundation. World Observatory needs a dedicated information architecture that differs from community-facing Dock and operations-focused Headquarter.

Embedding the experience in Headquarter would mix public world intelligence with administrative operations. Embedding it in Dock would mix community access with source-grounded research. Reusing the JIZZ frontend directly as the only UI would couple the A-L-L-A-H.COM experience to a separate repository's shell and deployment.

## Decision
Create a dedicated app at apps/world-observatory/ using Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, and existing pnpm workspace conventions.

Reuse:
- @moonwitness/ui for shared UI/tokens;
- @moonwitness/types for shared contracts where appropriate;
- @allah/sdk for approved A-L-L-A-H.COM / ARSY / SSO communication only.

Public-facing product name: WORLD OBSERVATORY.  
Canonical intelligence engine and PERSPECTIVE owner: ROCKSOUL JIZZ.

Initial integration is read-only. The app consumes verified JIZZ API/data contracts and does not create or mutate canonical JIZZ records.

## Alternatives considered
1. Headquarter module — rejected; operational/admin purpose differs.
2. Dock module — rejected; Dock is the community/user portal.
3. Embed JIZZ web app — rejected as primary approach; separate app shell weakens A-L-L-A-H.COM integration.
4. New framework/backend — rejected; existing Next.js and shared platform foundations should be reused.
5. Static mock dashboard — rejected; it misrepresents source-backed observatory capability.

## Consequences
Positive:
- Clear product boundary and navigation ownership.
- Independent app build and potential deployment boundary.
- Reuse shared UI, types, and SDK.
- JIZZ remains authoritative for perspectives and observations.
- Observatory can evolve without bloating Headquarter.

Trade-offs:
- Adds an app to workspace scripts, CI, and potentially deployment configuration.
- Requires a verified cross-repository JIZZ API contract and availability strategy.
- Requires explicit visual QA to avoid duplicating existing app design.

## Constraints
- No duplicate database, auth, ORM, or AI gateway.
- No writes to JIZZ canonical data in initial scope.
- No truth ranking, universal verdict, or fabricated coverage.
- No production deployment/DNS/secrets changes in this plan.
- Do not merge/deploy without required authorization and CI evidence.

## Revisit when
- JIZZ exposes a materially different stable API contract.
- Authentication or personalized saved views become required.
- A shared observatory capability is needed by multiple apps.
- Deployment constraints require a different app boundary.
