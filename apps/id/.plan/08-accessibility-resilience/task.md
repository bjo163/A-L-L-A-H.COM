# Task Plan — Accessibility and Resilient State System

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] AX-001 Audit semantic landmarks, heading order, and keyboard flow route by route.
- [ ] AX-002 Verify field labels, helper/error associations, accessible names, and async announcements.
- [ ] AX-003 Verify visible focus, focus restoration, and keyboard-only operation.
- [ ] AX-004 Measure text/control contrast using active skin tokens and fix actual failures.
- [ ] AX-005 Test 320, 375, 768, 1024, and wide desktop; remove horizontal overflow.
- [ ] AX-006 Verify prefers-reduced-motion and remove motion-only state communication.
- [ ] AX-007 Audit loading, empty, offline, expired, unauthorized, error, and retry states.
- [ ] AX-008 Add focused accessibility/responsive regression tests and record residual limits.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run applicable root checks from AGENTS.md, QUALITY.md, and AUTONOMOUS.md.

## Evidence per task
Record source paths, exact change, focused test, exact command/output, commit SHA, and blocker. Never mark done because code was merely written.

## Completion
- [ ] All acceptance criteria in spec.md verified.
- [ ] Relevant tests and quality gates executed.
- [ ] report.md records reproducible evidence and truthful status.
