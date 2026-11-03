---
title: "Windows VS Code Agent and Remote Operations"
status: "in_progress"
timestamp: "2026-11-04T01:38:00+07:00"
author: "Copilot"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

# Windows VS Code Agent and Remote Operations

## Problem and context

The VS Code extension currently manages `.plans`, calls the gateway, and displays a server-side swarm stream. It does not execute workspace file tools or PowerShell locally, pair a Windows extension with Headquarter, persist agent sessions, or provide an agent permission model. The SDK has agent/swarm/MCP methods but stores session tokens through browser `localStorage`; the extension currently bypasses the SDK with direct `fetch`.

The product needs a usable Windows coding-agent workflow similar in capability to Kilo Code while preserving A-L-L-A-H.COM's existing gateway, plan workflow, Headquarter dashboards, authentication, and UI system.

## Scope

- Add a VS Code agent dashboard and Windows-local agent host.
- Add Ask, Plan, Code, Debug, Ideate/Brainstorm, and Autopilot modes.
- Support workspace-scoped reads, edits with diff review, validation commands, cancellation, and session history.
- Add authenticated pairing between a Windows extension and Headquarter. Headquarter can submit and stop missions for a paired extension and view persisted session events.
- Route extension-to-Hub traffic through a VS Code-compatible `@allah/sdk` transport and VS Code `SecretStorage`.
- Require explicit per-session approval before workspace context is sent to the configured model gateway.
- Preserve the existing `.plans` workflow and Headquarter changes already present in the worktree.

## Out of scope

- Unrestricted machine-wide shell execution or file access.
- Server-side execution of commands on a developer's Windows machine.
- Access to secrets, arbitrary paths outside the explicitly selected workspace, or silent Git commit/push/deploy.
- Replacing Arsy, Qorpus, MCP, the existing SDK, or the existing Headquarter Agent/Swarm pages.
- Publishing, committing, pushing, or deploying.

## Functional requirements

- **FR-001 Pairing:** An authenticated user can pair a Windows extension with Headquarter using a short-lived, single-use pairing flow. A user can view and revoke a paired device. No inbound listener is opened on Windows.
- **FR-002 Remote mission control:** Headquarter can submit, observe, and request cancellation of missions for a paired extension. The extension initiates the connection and remains the final authority for local execution permissions.
- **FR-003 Local execution:** The extension host provides workspace-contained file read/search/edit/diff/apply tools and bounded PowerShell execution on Windows. The extension validates canonical paths, workspace containment, symlink escapes, timeouts, output size, and cancellation.
- **FR-004 Agent modes:** Ask and Plan are read-only; Ideate/Brainstorm produces proposals and plans without applying source edits; Code and Debug use the configured local tool policy; Autopilot can complete scoped coding/fixing and validation without prompting for each safe action after the user explicitly starts a trusted-workspace mission.
- **FR-005 Policy enforcement:** Tool permissions support `allow`, `ask`, and `deny` per mode/tool. Policy is checked in the extension host for local actions and cannot be widened by a model response or a Headquarter mission.
- **FR-006 Context consent:** Before each session sends workspace-derived context, the extension identifies the context scope and requests explicit user consent. Secrets and ignored files are excluded by default.
- **FR-007 Session lifecycle:** Sessions expose typed states and events for queued, running, awaiting approval, completed, cancelled, failed, and blocked. Users can inspect history and stop an active session. Model-reported completion is not represented as independently verified.
- **FR-008 VS Code dashboard:** The extension UI exposes agent mode, selected workspace, connection/pairing state, mission input, live trajectory, pending approvals, diff review, and cancellation with empty/loading/error/offline states.
- **FR-009 Headquarter dashboard:** Headquarter uses `@moonwitness/ui` to pair/revoke devices, submit missions to a paired extension, observe real session events, and request cancellation. It does not choose arbitrary local paths or issue shell commands itself.
- **FR-010 Existing capabilities:** Existing plans, model catalog, Arsy health/readiness, MCP and server-side swarm remain usable and clearly distinguish local agent execution from server-side tools.

## Non-functional and security requirements

- Enforce tenant and user ownership on device, mission, and event records.
- Store extension credentials in `SecretStorage`, never workspace settings or logs.
- Use authenticated, outbound-only transport from the extension. Persist mission/control state using existing PGlite/ORM patterns; do not rely on an in-memory queue for remote commands.
- Bound tool invocations with timeouts, cancellation, output limits, and auditable state transitions.
- Keep non-Windows extension features functional; report local Windows execution as unavailable on unsupported hosts.
- Preserve existing user worktree changes. Review current diffs before changing overlapping Headquarter or design files.
- Reuse existing dependencies and contracts where possible; justify any new dependency.

## Acceptance criteria

- A Windows VS Code extension can pair, authenticate, receive a Headquarter mission over an outbound channel, and revoke/disconnect cleanly.
- The extension can run Ask, Plan, Code, Debug, Ideate, and Autopilot sessions and render meaningful running, approval, blocked, completed, failed, cancelled, offline, and empty states.
- The local host can read and modify files only within the selected workspace, present diffs before applying when policy requires, run bounded PowerShell tasks, and stop active work.
- A remote mission cannot bypass the local permission policy; paths outside the workspace, secrets, destructive/system-wide actions, and Git write/deploy actions are blocked or require the designated explicit gate.
- Workspace context is sent to a configured gateway only after session consent; ignored and secret files are not included by default.
- Headquarter displays real paired-device/missions/events, can submit and stop a mission, and cannot control unpaired devices.
- Unit, contract, integration, and Windows extension-host checks cover pairing, ownership, path escape, policy, cancellation, and remote-control behavior.
- `pnpm extension:test`, extension/SDK typechecks and builds, `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`, and all documented application builds pass.

## Implementation readiness

**Conditionally ready.** User-approved scope and operating model are established. Before finalizing endpoint and persistence contracts, inspect the existing auth and PGlite ORM patterns, current dirty Headquarter diffs, and the extension host APIs. Stop and record a conflict if they cannot support secure pairing or reliable cancellation without weakening existing boundaries.
