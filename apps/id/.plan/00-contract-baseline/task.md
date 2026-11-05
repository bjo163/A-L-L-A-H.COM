# Task Plan — Contract and Source Baseline Audit

Status: `proposed` · Branch: `dev` only

## Execution checklist
- [ ] BL-001 Read root AGENTS.md, AUTONOMOUS.md, QUALITY.md, SECURITY.md, BLUEPRINT.md, DECISIONS.md, and relevant DNA contracts.
- [ ] BL-002 Inspect apps/id package.json, app router tree, layouts, styles, components, lib, config, and tests.
- [ ] BL-003 Trace login, registration, onboarding, account, session list, revocation, and sign-out calls to SDK definitions and server handlers.
- [ ] BL-004 Inspect @moonwitness/ui exports, SkinRoot usage, LUNAR CHRONICLES tokens, and shared layout patterns.
- [ ] BL-005 Inspect @moonwitness/types identity/session types and endpoint resolver contracts.
- [ ] BL-006 Build route/state/API ownership matrix; mark existing versus proposed routes.
- [ ] BL-007 Run available ID typecheck, build, lint, and focused tests; record exact command and result.
- [ ] BL-008 Write report.md with source paths, commit baseline, verified gaps, and recommended plan order.

## Per-task completion record
For each task, record:
- Source paths inspected and changed.
- Exact behavior or defect addressed.
- Focused test added/run.
- Relevant command and pass/fail output.
- Any dependency or blocker.

## Required package gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```

Run root-level gates required for the changed paths as specified by `AGENTS.md`, `QUALITY.md`, and `AUTONOMOUS.md`.

## Completion
- [ ] All task checkboxes are complete with evidence.
- [ ] All acceptance criteria in spec.md are verified.
- [ ] No false capability or deployment claim remains.
- [ ] report.md is complete and status is updated truthfully.
