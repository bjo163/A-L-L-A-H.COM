---
id: "VSCODE-AGENT-USABLE-REVIEW"
status: proposed
---

# VS Code Agent Usability Remediation

## Executive verdict

**Conditionally usable, not first-run ready.** The extension installs, activates,
and its local workspace tools work. The primary AI workflow still requires a
user to know which backend to configure and how to configure it before the
first agent request can succeed.

## Verified current state

- Manifest exposes one Workspace Agent view.
- Workspace Agent supports Ask, Plan, Ideate, Code, Debug, and Autopilot.
- Context consent, bounded workspace reads, diff preview, approval-gated
  validation, session history, and repair proposal state exist.
- `allah.agentProvider` supports `gateway` and `ollama`, but defaults to
  `gateway`.
- Ollama routing is implemented in `MoonWitnessClient.completeAgent`, with a
  configurable URL and model.
- The provider registry and provider configuration surface exist separately
  from the local agent request path.
- No verified end-to-end Ollama request was executed because the availability
  and installed model state of the user's local Ollama service are unknown.

## Target

On a clean install, a user can discover the available backend, select a valid
model, run a read-only Ask request, understand failures, and then opt into
Code or Debug with the existing approval safeguards.

## Scope

### Included

- First-run provider readiness and model discovery.
- Honest offline/local/remote state communication.
- Agent request routing and error recovery.
- Read-only smoke path and safe code path verification.
- Tests for provider selection and failure states.

### Excluded

- Multi-hunk patch editor.
- Symbol graph indexing.
- Autonomous unbounded repair.
- Remote cloud synchronization.
- New external dependencies.

## Acceptance criteria

- The agent does not silently assume a remote gateway is ready.
- The panel offers a discoverable provider setup/readiness action.
- Ollama availability and installed models are checked before a request.
- A missing provider/model produces one actionable error with a next step.
- A clean install can complete a read-only Ask smoke flow with a configured
  local provider.
- Code and Debug continue to require workspace context consent and edit review.
- The existing standalone, typecheck, test, build, and package gates remain
  green.
