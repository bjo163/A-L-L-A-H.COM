---
id: "VSCODE-AGENT-UIUX-REVIEW"
status: completed
---

# VS Code Agent UI/UX Remediation

## Problem

The extension can run the local workspace agent, but the activity bar exposes
two agent workbenches and the activation source still contains legacy cloud
surfaces. This makes the product boundary unclear and increases the chance
that a user chooses the wrong workflow.

## Verified current state

- Local Workspace Agent supports Ask, Plan, Ideate, Code, Debug, and Autopilot.
- Context consent, diff preview, approval-gated validation, and session history
  are implemented.
- `Swarm Operations` remains a second discoverable webview with a different
  remote workflow.
- The status bar is labeled MoonWitness and reports offline gateway state even
  though local repository work is available.
- Cloud sync handlers remain registered in activation source while absent from
  the manifest.

## Target

Expose one primary agent surface, make local/offline state honest, and remove
discoverability ambiguity without weakening approvals or workspace boundaries.

## Acceptance criteria

- Only `Workspace Agent` is visible as the agent view.
- The legacy swarm provider is not registered during activation.
- Status bar copy identifies the local workspace agent and links to the agent
  view or local context action.
- Workspace Agent can route completions to Ollama without a gateway.
- Standalone checker, typecheck, tests, package, and installation pass.
