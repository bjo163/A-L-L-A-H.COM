---
contract: "DOCUMENTATION_CONTRACT.md"
id: "VSCODE-READY-TO-USE-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# VS Code Extension — Ready-to-Use Design

## Design intent

Make the extension feel like one dependable, local-first workspace agent. A developer should be able to discover the agent, choose a provider and model, inspect the proposed plan and edits, approve bounded work, and review evidence without depending on the monorepo, a network connection, ARSY, or an account for the local core.

This document defines the target experience and system boundaries. It does not claim that current runtime behavior has passed the acceptance gates in `spec.md`.

## Primary journey

1. The developer opens a trusted repository and discovers one primary Workspace Agent entry point.
2. A setup/readiness view explains the selected provider, model, and connection state. The developer explicitly chooses a provider and model.
3. The developer asks for repository inspection. The agent shows which bounded workspace context it used and returns a concise summary.
4. For multi-step work, the agent creates a plan before proposing edits. Each proposal is reviewable and can be accepted or rejected.
5. The developer approves validation commands from the trusted allowlist. The extension records command outcome and bounded evidence.
6. The mission timeline shows state changes and evidence. Interrupted work remains interrupted until the developer explicitly resumes it.

## Information architecture

| Surface | Responsibility | Entry behavior |
|---|---|---|
| Workspace Agent | Conversation, mode, context summary, plan and proposed edits | Single primary activity-bar/workbench entry |
| Setup and provider status | Provider/model selection, discovery, health and configuration | Reachable from the agent's readiness row and command palette |
| Plans | Browse, create, inspect and update `.plans` tasks | Reuse existing plan Explorer and task conventions |
| Active mission and timeline | Current mission state, history, resume/cancel and evidence | Linked from the agent and plan task context |
| Usage and audit | Token/budget summary and redacted action history | Secondary navigation; never duplicates mission state |

When existing contributed views or commands duplicate these responsibilities, reconcile registrations and navigation before removing capabilities. Keep contributed command IDs stable where possible.

## Runtime architecture boundaries

- The extension host owns activation, workspace-scoped file operations, trust checks, command registration, secrets, provider lifecycle, validation approval and persistence.
- One provider registry and adapter contract own provider selection, model discovery, streaming, errors, timeout and cancellation. Ollama is usable without network; remote Gateway support remains optional.
- One Workspace Agent owns mode boundaries, bounded context, plan-first multi-step work, diff proposals and user-visible progress.
- One mission service owns typed state transitions, redacted persistence, interruption, explicit resume and replay protection.
- Webviews render typed view models only. Their message boundary validates command names and payload schemas; Content Security Policy denies inline/eval and untrusted remote content.
- Native VS Code APIs own editor, tree, command, theme and accessibility integration. Avoid a second application shell or duplicated state owner.

## Interaction and state model

| State | User-facing meaning | Available next action |
|---|---|---|
| Not configured | No provider/model has been selected | Choose provider and model |
| Checking | A bounded provider check is running | Cancel check |
| Ready | Selected provider and model can accept a request | Ask, plan, or inspect |
| Offline | Selected provider is unreachable | Retry or change provider; local work remains available where configured |
| Working | A request or approved tool is running | Cancel and inspect current step |
| Needs review | A plan, diff, or command awaits a decision | Inspect, approve, or reject |
| Interrupted | Work stopped before completion | Inspect state, then explicitly resume or discard |
| Error / permission required | A bounded operation failed or trust is insufficient | Show cause and a safe, concrete recovery action |

Every long-running operation exposes progress and cancellation. Errors and empty states identify their cause and next step. A provider fallback that changes the data boundary requires an explicit user choice.

## Trust and data flow

- Require Workspace Trust for repository inspection and all file-writing or command-execution actions.
- Resolve paths against the selected workspace; reject traversal, unsafe symlink escapes and sensitive files defined by the exclusion policy.
- Show bounded context sources and destinations before any remote request. No silent upload or remote execution.
- Keep credentials in VS Code SecretStorage. Redact secrets and sensitive workspace values from logs, timelines, reports and telemetry.
- Never execute arbitrary model-generated shell. Commands must be allowlisted/configured and individually approved, with cancellation and recorded exit status.
- Validate webview messages against strict schemas and bind each request to its originating panel/session.

## Verification design

Keep evidence classes distinct: unit tests, integration tests, extension-host tests, standalone VSIX checks and manual user-journey checks. Record command, environment, result and evidence path for each acceptance gate. A build or unit test alone does not certify offline operation, workspace safety, recovery or clean-profile installation.

## Out of scope

Unbounded autonomous agents, mandatory cloud or ARSY services, automatic push/deploy, replacing native Git, and backend services created only to support the extension.
