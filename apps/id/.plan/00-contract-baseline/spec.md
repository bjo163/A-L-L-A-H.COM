---
title: "Contract and Source Baseline Audit"
status: "proposed"
owner: "engineering"
plan_id: "ID-00-CONTRACT-BASELINE"
---

# Contract and Source Baseline Audit

## Goal
Create a verified map of the existing ID implementation, shared contracts, auth calls, routes, styles, and quality gates before any visual or behavioral change.

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
- None; this is the first audit package.

## Scope
Read-only audit of apps/id, its package manifest, shared UI/types/SDK exports, relevant root architecture/security docs, and existing tests. Produce evidence-backed findings and identify contract gaps without changing runtime code.

## Explicit non-goals
- No ARSY backend or database redesign.
- No new identity provider, password store, or client-owned authorization.
- No production DNS, proxy, TLS, deployment, secret, or migration changes.
- No new routes, dependencies, or shared primitives without source-backed justification.
- No fake functionality or unsupported product claims.

## Acceptance criteria
- [ ] A route-to-source inventory lists every current route and its owning file.
- [ ] Every auth/account/session call is traced to its SDK/client contract and error behavior.
- [ ] Shared skin, UI, type, and endpoint-resolution APIs are cited by exact source path and export.
- [ ] Existing test/lint/type/build commands are verified from manifests and root docs.
- [ ] Every finding is labelled VERIFIED, INFERRED, PROPOSED, or UNKNOWN with evidence.
- [ ] No capability or route is claimed based only on a plan or dependency.

## Definition of done
- All in-scope tasks are checked with evidence.
- Relevant tests and quality gates actually run and pass, or blockers are precisely documented.
- No out-of-scope security/production boundary was crossed.
- `report.md` contains changed paths, commands, outcomes, final commit, and remaining risks.
- Status is changed to `completed` only when all acceptance criteria are proven.
