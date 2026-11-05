# Task Plan — LUNAR CHRONICLES Visual Foundation

Status: `proposed` · Branch: `dev` only

## Execution checklist
- [ ] VF-001 Map all existing CSS variables, skin attributes, shared components, and app-local overrides.
- [ ] VF-002 Define the ID composition tokens by referencing shared tokens; do not copy their values into a second source of truth.
- [ ] VF-003 Define typography roles for display, body, labels, helper text, and genuine data values.
- [ ] VF-004 Define geometry rules for lunar arcs, instrument marks, archive indexes, and negative space; prohibit decorative fake data.
- [ ] VF-005 Define reusable ID composition wrappers only when they compose shared primitives without duplicating behavior.
- [ ] VF-006 Define motion rules for entry, focus, success, and transitions with reduced-motion fallback.
- [ ] VF-007 Apply the foundation to one representative route and verify the skin is actually active.
- [ ] VF-008 Document usage and anti-patterns in this plan's report; list any shared-library defect separately.

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
