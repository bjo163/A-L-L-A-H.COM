# Task Plan — Session Archive — Revocable Trust

Status: `completed` · Branch: existing `dev` only

## Ordered tasks
- [x] SA-001 Trace ActiveSession fields, revoke semantics, current marker, and error responses.
- [x] SA-002 Define privacy-safe display for device, IP, expiry, and timestamps.
- [x] SA-003 Distinguish current session using text/icon and color, never color alone.
- [x] SA-004 Add explicit revoke action, pending state, and duplicate-action protection.
- [x] SA-005 Update the session list only after ARSY confirms revocation.
- [x] SA-006 Handle current-session revoke, local sign-out, and navigation safely.
- [x] SA-007 Add tests for success, failure, unknown session, duplicate action, and current session.
- [x] SA-008 Verify timezone clarity, narrow-screen usability, keyboard, and screen-reader labels.

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
