# Agent Execution and Policy

Priority: P0 · Status: pending

## Objective
Make Workspace Agent repository-aware and capable of bounded code changes without bypassing user control.

## Execution tasks
- [ ] 04AGENTEXECUTION-01: Document observable behavior and allowed tools for every agent mode.
- [ ] 04AGENTEXECUTION-02: Build bounded context manifest with selected files, exclusions and provenance.
- [ ] 04AGENTEXECUTION-03: Enforce sensitive-file, credential, generated-file and external-path exclusions.
- [ ] 04AGENTEXECUTION-04: Require plan-first behavior for multi-step changes and expose acceptance criteria.
- [ ] 04AGENTEXECUTION-05: Generate proposed edits with expected file state and inspectable diff.
- [ ] 04AGENTEXECUTION-06: Require approval before apply; reject stale/conflicting file state.
- [ ] 04AGENTEXECUTION-07: Propagate cancellation through provider, context, tool and validation layers.
- [ ] 04AGENTEXECUTION-08: Enforce tool allowlist and approval for terminal/network/destructive operations.
- [ ] 04AGENTEXECUTION-09: Produce evidence-backed mission report with files, validation and unresolved items.

## Dependencies
00, 01, 02 and 03.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
