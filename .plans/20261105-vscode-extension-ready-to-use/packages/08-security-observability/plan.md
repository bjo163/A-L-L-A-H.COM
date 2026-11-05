# Security and Observability

Priority: P1 · Status: pending

## Objective
Measure reliability and enforce privacy/security boundaries without collecting sensitive workspace content.

## Execution tasks
- [ ] 08SECURITYOBSERVABILITY-01: Threat-model extension host, webview, providers, context, tools and persistence.
- [ ] 08SECURITYOBSERVABILITY-02: Test path traversal, symlink escape, Workspace Trust and external roots.
- [ ] 08SECURITYOBSERVABILITY-03: Test webview CSP, message validation, nonce and command invocation boundaries.
- [ ] 08SECURITYOBSERVABILITY-04: Test secret redaction in prompts, errors, timeline, logs and telemetry.
- [ ] 08SECURITYOBSERVABILITY-05: Record token usage/model latency only when provider supplies reliable values.
- [ ] 08SECURITYOBSERVABILITY-06: Record mission outcomes and validation evidence without raw source or prompts.
- [ ] 08SECURITYOBSERVABILITY-07: Add opt-in budget controls and explain estimation uncertainty.
- [ ] 08SECURITYOBSERVABILITY-08: Provide local diagnostics export with redaction preview and user approval.

## Dependencies
Cross-cutting; coordinate with all phases.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
