# Task Plan — Arrival — Observatory Threshold

Status: `proposed` · Branch: `dev` only

## Execution checklist
- [ ] AR-001 Trace current home route session and onboarding-status reads; identify loading and failure behavior.
- [ ] AR-002 Define the guest, authenticated, onboarding, and unavailable state transition table.
- [ ] AR-003 Create the arrival composition with one strong landmark, editorial title, concise explanation, and primary action.
- [ ] AR-004 Add state-specific secondary links without duplicate calls to action.
- [ ] AR-005 Ensure unknown/unavailable authority state never falls back to a guessed signed-in or onboarding state.
- [ ] AR-006 Add focused tests for state selection, action destinations, and unavailable behavior.
- [ ] AR-007 Verify 320px, 375px, 768px, 1024px, and wide desktop layouts plus keyboard/reduced motion.
- [ ] AR-008 Update README/report only with observed implementation evidence.

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
