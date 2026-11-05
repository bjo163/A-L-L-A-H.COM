# Task Plan — Personal Orbit — Account Identity Space

Status: `completed` · Branch: existing `dev` only

## Ordered tasks
- [x] PO-001 Trace UserSubject, ActiveSession, endpoint resolver, and current account reads.
- [x] PO-002 Define safe identity display fields from the actual API contract.
- [x] PO-003 Compose an Identity Anchor with name/email and no decorative internal IDs.
- [x] PO-004 Compose session preview as a trust relationship, not a KPI card.
- [x] PO-005 Present destinations with distinct purpose and independent-authorization notice.
- [x] PO-006 Verify sign-out only reports success after auth service success; preserve failure context.
- [x] PO-007 Add tests for loading, signed-out, partial data, API failure, and sign-out outcomes.
- [x] PO-008 Verify mobile reading order, keyboard, and assistive technology.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run root-level checks required by AGENTS.md / QUALITY.md / AUTONOMOUS.md for changed paths.

## Evidence per task
Record source paths, exact behavior changed, test name, command/output, commit SHA, and blocker. Do not mark a task complete because code was written.

## Completion
- [x] Every acceptance criterion in spec.md verified.
- [x] Tests and quality gates executed.
- [x] report.md includes evidence and final status.
