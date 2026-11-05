---
title: "MoonWitness ID Autonomous Work Plans"
version: "1.0.0"
status: "proposed"
owner: "engineering"
---

# MoonWitness ID — Autonomous Work Plans

This folder decomposes the ID product/technical blueprint into small, bounded work packages for coding agents with limited context and capability.

## Execution contract

- Repository: `bjo163/A-L-L-A-H.COM`
- Branch: existing `dev` only; no new branches.
- Authority: ARSY owns identity/auth/session/tenant/role/authorization.
- Scope: app-level ID experience and its tests; no production operations.
- Work style: autonomous within each plan; no routine user confirmation.
- Stop condition: security/authority contradiction, missing server contract, irreversible data operation, production change, or permission boundary.
- Quality: anti-slop, source-first, shared UI/skin reuse, exact evidence, accessibility.

## Dependency order

| Order | Plan | Deliverable | Depends on |
|---:|---|---|---|
| 00 | [Contract and Source Baseline](00-contract-baseline/spec.md) | Verified source and API map | — |
| 01 | [LUNAR Visual Foundation](01-lunar-visual-foundation/spec.md) | ID-specific shared-skin grammar | 00 |
| 02 | [Arrival Experience](02-arrival-experience/spec.md) | Session-aware observatory threshold | 00, 01 |
| 03 | [Authentication Journeys](03-authentication-journeys/spec.md) | Login and registration | 00, 01 |
| 04 | [First Owner Onboarding](04-first-owner-onboarding/spec.md) | Safe one-time setup UX | 00, 01 |
| 05 | [Personal Orbit](05-personal-orbit-account/spec.md) | Account identity space | 00, 01 |
| 06 | [Session Archive](06-session-archive/spec.md) | Authoritative session governance | 00, 01, 05 |
| 07 | [Destination Handoff](07-destination-handoff/spec.md) | Safe product navigation | 00, 01, 05 |
| 08 | [Accessibility and Resilience](08-accessibility-resilience/spec.md) | Cross-route quality | 02–07 |
| 09 | [Verification and Delivery](09-verification-delivery/spec.md) | Evidence-backed completion | 00–08 |

## File contract

Every plan contains:
- `spec.md`: goal, scope, non-goals, dependencies, acceptance criteria.
- `design.md`: composition/interaction contract and anti-slop guardrails.
- `task.md`: small, ordered, independently verifiable tasks.
- `rules.md`: autonomous execution constraints.
- `report.md`: baseline, progress, commands, evidence, and blockers.

## How a small agent should execute

1. Read this index, the plan's five files, `../README.md`, `../BLUEPRINT.md`, and root engineering instructions.
2. Inspect current source and HEAD; never assume prior plan completion.
3. Select the next unchecked task whose dependencies are satisfied.
4. Implement only that task's smallest complete change.
5. Run its focused tests and relevant package gates.
6. Update task status and report exact evidence.
7. Commit a coherent batch to existing `dev`; never force-push.
8. Continue with the next safe task. Do not wait for user confirmation for routine decisions.
9. Stop only at the hard boundaries in each plan's rules; document the blocker and continue independent work.

A plan is not complete until all acceptance criteria pass and report.md contains reproducible evidence. A visual mockup alone is not implementation evidence.
