# Task Plan — First Light — Initial Owner Onboarding

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] FL-001 Trace onboarding status/create SDK calls to ARSY handlers and record exact response semantics.
- [ ] FL-002 Define states: checking, available, closed, unavailable, submitting, created, sign-in-failed.
- [ ] FL-003 Refine page composition and explain why this setup is exceptional; avoid privilege theatre.
- [ ] FL-004 Keep form disabled unless ARSY explicitly reports available; prevent duplicate submission.
- [ ] FL-005 Handle race/already-completed responses without automatic retry or repeated create.
- [ ] FL-006 If create succeeds but sign-in fails, direct to login and state account was created.
- [ ] FL-007 Add tests for closed, unavailable, race, validation, success, and sign-in failure.
- [ ] FL-008 Verify keyboard, responsive, contrast, and reduced-motion behavior.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run root-level checks required by AGENTS.md / QUALITY.md / AUTONOMOUS.md for changed paths.

## Evidence per task
Record source paths, exact behavior changed, test name, command/output, commit SHA, and blocker. Do not mark a task complete because code was written.

## Completion
- [ ] Every acceptance criterion in spec.md verified.
- [ ] Tests and quality gates executed.
- [ ] report.md includes evidence and final status.
