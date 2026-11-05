# Task Plan — Personal Orbit — Account Identity Space

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] PO-001 Trace UserSubject, ActiveSession, endpoint resolver, and current account reads.
- [ ] PO-002 Define safe identity display fields from the actual API contract.
- [ ] PO-003 Compose an Identity Anchor with name/email and no decorative internal IDs.
- [ ] PO-004 Compose session preview as a trust relationship, not a KPI card.
- [ ] PO-005 Present destinations with distinct purpose and independent-authorization notice.
- [ ] PO-006 Verify sign-out only reports success after auth service success; preserve failure context.
- [ ] PO-007 Add tests for loading, signed-out, partial data, API failure, and sign-out outcomes.
- [ ] PO-008 Verify mobile reading order, keyboard, and assistive technology.

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
