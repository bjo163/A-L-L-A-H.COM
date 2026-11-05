# Provider Consolidation and Local-First

Priority: P0 · Status: pending

## Objective
Deliver explicit secure model selection with Ollama first-class and Gateway optional.

## Execution tasks
- [ ] 03PROVIDERCONSOLIDATION-01: Document current provider interfaces and preserve compatible settings.
- [ ] 03PROVIDERCONSOLIDATION-02: Make ProviderRegistry the single discovery and selection owner.
- [ ] 03PROVIDERCONSOLIDATION-03: Verify Ollama endpoint configuration, connection test and actionable diagnostics.
- [ ] 03PROVIDERCONSOLIDATION-04: Verify model discovery/capabilities; handle no model and malformed responses.
- [ ] 03PROVIDERCONSOLIDATION-05: Persist selected provider/model IDs without credentials; make fallback explicit.
- [ ] 03PROVIDERCONSOLIDATION-06: Normalize streaming, timeout, retry, cancellation and provider errors.
- [ ] 03PROVIDERCONSOLIDATION-07: Move credentials to SecretStorage and verify no plaintext leakage.
- [ ] 03PROVIDERCONSOLIDATION-08: Run local agent journey with network disabled and ARSY unavailable.
- [ ] 03PROVIDERCONSOLIDATION-09: Run Gateway journey and prove Gateway outage does not block local mode.

## Dependencies
00 and 01.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
