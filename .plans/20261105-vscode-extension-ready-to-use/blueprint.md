# Technical Blueprint — Developer Cockpit

## Experience
One primary Workspace Agent view is home. Supporting surfaces: Projects/Plans, Missions, Providers, Diagnostics. Avoid duplicate dashboards; prefer native VS Code views/status items and a coherent webview only when rich interaction is necessary.

## Logical ownership
| Component | Owns |
|---|---|
| Extension Host | activation, commands, views, workspace APIs, lifecycle |
| Cockpit UI | interaction and presentation |
| Provider Registry | provider registration, discovery, selection |
| Provider Adapter | provider transport and normalized responses |
| Local Agent Core | context, model calls, tool orchestration |
| Plan Engine | plan schema, task graph and progress |
| Mission Engine | lifecycle, checkpoints, recovery, timeline |
| Policy Engine | trust, path, tools, approvals and network policy |
| Validation Engine | permitted validation and evidence |
| Persistence | versioned, redacted state |
| Remote Adapter | optional Gateway/ARSY integration |

## Dependency direction
UI → application services → domain contracts → adapters. Keep domain logic testable without VS Code where practical. Avoid circular imports and monorepo-only runtime imports.

## Contracts to reuse or verify
ProviderDescriptor, ProviderCapabilities, ModelDescriptor, SelectedModel, AgentMode, AgentRequest/Response, ContextManifest, ProposedEdit, ApprovalDecision, Mission/Event/Checkpoint/Status, ValidationRequest/Result, EvidenceReference, PolicyDecision. Reuse equivalent existing contracts; do not duplicate schemas.

## Mission states
queued → planning → awaiting-approval → executing → validating → completed. Exception states: cancelled, failed, blocked, interrupted. Resume must be explicit; extension activation never automatically repeats a tool call.

## Provider rules
Explicit selection; SecretStorage credentials; visible failure; fallback only through explicit setting/approval; normalized timeout/retry/cancellation/streaming; local tests independent of cloud.

## Security
Canonicalize workspace paths; reject escapes unless separately approved; treat symlinks as boundary risks; exclude secrets before context; validate webview messages with schema and nonce; never execute model-generated shell text without policy, display and approval; redact telemetry/events.

## Persistence
Version schemas; store minimum recovery state; never persist raw prompts, credentials, raw file contents or absolute workspace paths in event details; idempotent migrations; safe corruption handling.

## Verification
Unit tests for policies/state machines/adapters; integration tests with fake providers/temp workspaces; VS Code extension-host tests; manual Ollama/Gateway acceptance; VSIX inspection and clean install.