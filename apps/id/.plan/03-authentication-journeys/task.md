# Task Plan — Identity Gate — Login and Registration

Status: `proposed` · Branch: `dev` only

## Execution checklist
- [ ] IG-001 Trace auth client methods, current server policy, and existing tests before editing.
- [ ] IG-002 Define login states: idle, validating, submitting, rejected, unavailable, success.
- [ ] IG-003 Refine /login form composition, field labels, autocomplete, error association, and submit state.
- [ ] IG-004 Define registration states and preserve regular-user-only semantics.
- [ ] IG-005 Refine /register guidance, password confirmation, validation, and duplicate-submit protection.
- [ ] IG-006 Normalize user-facing errors without leaking account enumeration or provider details.
- [ ] IG-007 Add tests for validation, rejected credentials, service failure, duplicate submission, and success navigation.
- [ ] IG-008 Verify keyboard, narrow-screen, contrast, and reduced-motion behavior.

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
