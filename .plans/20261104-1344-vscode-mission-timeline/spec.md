---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261104-VSCODE-MISSION-TIMELINE"
title: "VS Code Mission Timeline"
status: "in_progress"
author: "developer"
---

# VS Code Mission Timeline

## Goal

Make local and remote-backed workspace sessions observable, resumable, and reviewable through typed timeline events, safe persistence, and one bounded validation repair proposal.

## Scope

- Typed mission events with stable IDs, sequence numbers, and timestamps.
- Persist only redacted event details, never credentials, raw context, or validation output.
- Restore interrupted missions as blocked and do not resume execution silently.
- Associate remote mission IDs with local sessions to prevent replayed missions from repeating edits.
- Show mission events and restored history in the Workspace Agent view.
- Offer one repair proposal for a failed validation signature, through existing context consent and edit approval.

## Acceptance criteria

- [x] Local mission lifecycle, context, edit, approval, validation, repair, and completion states are represented by typed ordered events.
- [x] Timeline records persist and restore safely.
- [x] An interrupted mission is blocked after reload and is not executed again automatically.
- [x] Replayed remote mission IDs return their prior state rather than repeat local actions.
- [x] A repeated validation failure cannot request more than one repair proposal for the same workspace and command.
- [x] Repair uses normal context consent and edit review; it cannot execute a terminal command.
- [x] Credentials, raw context, raw validation output, and workspace paths are not persisted in event details or repair keys.
- [ ] Interactive VS Code extension-host smoke test confirms timeline, repair, reload, and replay behavior.
- [ ] Workspace-aware mission templates are a follow-up milestone.

## Out of scope

- Automatic edit application or automatic repair execution.
- Arbitrary command execution without explicit approval.
- Git writes, machine-wide writes, privilege escalation, commits, pushes, or deployment.
- Persistence of raw model context or terminal output.
