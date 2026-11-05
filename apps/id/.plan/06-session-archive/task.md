# Task Plan — Session Archive — Revocable Trust

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] SA-001 Trace ActiveSession fields, revoke semantics, current marker, and error responses.
- [ ] SA-002 Define privacy-safe display for device, IP, expiry, and timestamps.
- [ ] SA-003 Distinguish current session using text/icon and color, never color alone.
- [ ] SA-004 Add explicit revoke action, pending state, and duplicate-action protection.
- [ ] SA-005 Update the session list only after ARSY confirms revocation.
- [ ] SA-006 Handle current-session revoke, local sign-out, and navigation safely.
- [ ] SA-007 Add tests for success, failure, unknown session, duplicate action, and current session.
- [ ] SA-008 Verify timezone clarity, narrow-screen usability, keyboard, and screen-reader labels.

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
