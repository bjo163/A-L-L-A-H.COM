# Runtime and Extension-Host Verification

Priority: P0 · Status: pending

## Objective
Prove real VS Code lifecycle, command/view parity, workspace variants, reload and clean install.

## Execution tasks
- [ ] 01RUNTIMEE2EVERIFICATION-01: Extend runtime parity to every contributed command and view; fail on missing/duplicate IDs.
- [ ] 01RUNTIMEE2EVERIFICATION-02: Add extension-host test harness using supported tooling already in repository.
- [ ] 01RUNTIMEE2EVERIFICATION-03: Test activate/deactivate, missing optional services, no workspace and empty workspace.
- [ ] 01RUNTIMEE2EVERIFICATION-04: Test single-root and multi-root workspace selection and path isolation.
- [ ] 01RUNTIMEE2EVERIFICATION-05: Test plan Explorer create/read/update and task progress.
- [ ] 01RUNTIMEE2EVERIFICATION-06: Test Ollama/Gateway success, failure, timeout, offline and cancellation.
- [ ] 01RUNTIMEE2EVERIFICATION-07: Test diff review, approval/rejection, stale file conflict and safe apply.
- [ ] 01RUNTIMEE2EVERIFICATION-08: Test validation approval/cancellation and bounded repair.
- [ ] 01RUNTIMEE2EVERIFICATION-09: Test timeline, reload, interruption, explicit resume and replay protection.
- [ ] 01RUNTIMEE2EVERIFICATION-10: Install VSIX in clean profile without monorepo checkout; execute core user journey.

## Dependencies
00-architecture-reconciliation.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
