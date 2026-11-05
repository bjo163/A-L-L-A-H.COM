# Task Plan — Accessibility and Resilient State System

Status: `completed` · Branch: existing `dev` only

## Ordered tasks
- [x] AX-001 Audit semantic landmarks, heading order, and keyboard flow route by route.
- [x] AX-002 Verify field labels, helper/error associations, accessible names, and async announcements.
- [x] AX-003 Verify visible focus, focus restoration, and keyboard-only operation.
- [x] AX-004 Measure text/control contrast using active skin tokens and fix actual failures.
- [x] AX-005 Test 320, 375, 768, 1024, and wide desktop; remove horizontal overflow.
- [x] AX-006 Verify prefers-reduced-motion and remove motion-only state communication.
- [x] AX-007 Audit loading, empty, offline, expired, unauthorized, error, and retry states.
- [x] AX-008 Add focused accessibility/responsive regression tests and record residual limits.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run applicable root checks from AGENTS.md, QUALITY.md, and AUTONOMOUS.md.

## Evidence per task
Record source paths, exact change, focused test, exact command/output, commit SHA, and blocker. Never mark done because code was merely written.

## Completion
- [x] All acceptance criteria in spec.md verified.
- [x] Relevant tests and quality gates executed.
- [x] report.md records reproducible evidence and truthful status.
