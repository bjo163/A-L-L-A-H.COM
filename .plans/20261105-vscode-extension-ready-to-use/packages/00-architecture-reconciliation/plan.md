# Architecture Reconciliation

Priority: P0 · Status: pending

## Objective
Establish an evidence-backed map of implementation, overlap, legacy and canonical ownership.

## Execution tasks
- [ ] 00ARCHITECTURERECONCILIATION-01: Inventory extension source, exports, entrypoints, scripts and generated bundles.
- [ ] 00ARCHITECTURERECONCILIATION-02: Map manifest commands, activation events, views, menus and runtime registrations.
- [ ] 00ARCHITECTURERECONCILIATION-03: Trace AgentWorkbenchProvider and LocalAgentWorkbenchProvider from registration through callers/tests.
- [ ] 00ARCHITECTURERECONCILIATION-04: Trace ProviderRegistry, ProviderIntegration, Ollama and Gateway ownership.
- [ ] 00ARCHITECTURERECONCILIATION-05: Trace MissionTimeline, remote mission service, persistence and recovery.
- [ ] 00ARCHITECTURERECONCILIATION-06: Identify dead/legacy code and monorepo-only runtime imports; do not delete yet.
- [ ] 00ARCHITECTURERECONCILIATION-07: Audit Workspace Trust, path handling, webview CSP/messages, SecretStorage and shell tools.
- [ ] 00ARCHITECTURERECONCILIATION-08: Produce source-of-truth matrix with canonical owner, duplicate, callers, tests and disposition.
- [ ] 00ARCHITECTURERECONCILIATION-09: Record decisions and exact files affected; preserve working behavior.

## Dependencies
None; first phase.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
