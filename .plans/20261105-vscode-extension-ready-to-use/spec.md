# Specification — VS Code Extension Ready-to-Use Evolution

**Status:** proposed master specification.

## Problem and goal
The extension has a meaningful implementation base, but end-user readiness is not established by unit tests and packaging alone. Interactive Mission Timeline/recovery verification remains pending in the inspected plan trail. Multiple workbench/provider surfaces and a broad command/view surface must be reconciled against manifest contributions and runtime registrations.

Deliver a dependable standalone extension for local-first, plan-driven AI-assisted engineering in real repositories.

## Primary user journey
Open a repository → configure Ollama or optional remote provider → explicitly choose model → ask agent to inspect repository → receive project summary and executable plan → review proposed edits → approve/reject → run permitted validation → inspect mission report and evidence.

## Functional requirements
- **Activation:** works without monorepo, network, ARSY, database or remote account for local core; missing optional services do not break activation; clean disposal.
- **Workspace:** single/multi-root support; all file/plan operations scoped to selected workspace; preserve existing plan conventions and user data.
- **Providers:** one registry/adapter contract; explicit provider/model selection; Ollama discovery and offline checks; Gateway optional; credentials in SecretStorage; normalized errors, streaming, timeout and cancellation.
- **Agent:** one primary Workspace Agent; documented Ask/Plan/Ideate/Code/Debug/Autopilot boundaries; bounded/redacted/inspectable context; plan-first multi-step changes; reviewable proposed edits; conflict detection; propagated cancellation.
- **Missions:** typed legal state transitions; redacted timeline; interruption never silently replays; explicit idempotent resume; replay protection; bounded approval-gated repair.
- **Validation:** trusted allowlist/configuration; display and approve commands; record exit code/duration/redacted summary; distinguish unit/integration/extension-host/manual evidence.
- **UX:** predictable entry point; discoverable setup, plans, mission, timeline, usage and audit; loading/empty/error/offline/permission states; keyboard and theme support.
- **Security:** Workspace Trust; path traversal and symlink protection; sensitive-file exclusion; strict webview CSP/message validation; no arbitrary model-generated shell; no silent network uploads; redact logs/timeline/telemetry.
- **Packaging:** complete VSIX runtime; no monorepo-only imports; manifest parity; clean install/upgrade; docs match verified behavior.

## Non-functional
Typecheck/lint pass for changed scope; no duplicate provider/mission/policy source of truth; bounded memory/context/concurrency; responsive UI; graceful offline behavior; deterministic tests; no credentials in CI; preserve user data.

## Out of scope for 0.4.0
Unbounded multi-agent autonomy, mandatory cloud/ARSY, automatic push/deploy, replacing native Git, or new backend services solely for extension.

## Acceptance gates
G0 architecture inventory and legacy disposition. G1 100% manifest/runtime parity. G2 extension-host smoke suite. G3 Ollama journey offline. G4 plan-to-approved-edit-to-validation journey. G5 cancellation/restart/recovery/replay. G6 security/workspace boundaries. G7 clean VSIX and standalone activation. G8 documentation parity.

A gate is PASS only with reproducible command, environment, result and evidence location.