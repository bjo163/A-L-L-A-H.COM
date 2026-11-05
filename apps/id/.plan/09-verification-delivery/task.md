# Task Plan — Verification, Documentation and Delivery

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] VD-001 Review all earlier plan reports; reopen tasks without reproducible evidence.
- [ ] VD-002 Run ID typecheck and build; capture exact commands and outputs.
- [ ] VD-003 Run relevant root docs, architecture, lint, UI, and integration gates.
- [ ] VD-004 Run focused auth, onboarding, account, session, and destination tests.
- [ ] VD-005 Verify five viewport widths, keyboard, contrast, and reduced-motion behavior.
- [ ] VD-006 Reconcile README/BLUEPRINT with actual source and label proposals accurately.
- [ ] VD-007 Search and remove unsupported claims about SSO, MFA, passkeys, recovery, verification, live status, or deployment.
- [ ] VD-008 Publish final evidence report with baseline/final SHA, paths, commands, outcomes, and blockers.

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
