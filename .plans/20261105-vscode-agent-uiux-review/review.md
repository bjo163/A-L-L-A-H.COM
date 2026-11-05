# Ultra-review findings

## HIGH, confirmed

### UI-001: Duplicate agent workbenches create competing entry points

- Evidence: `package.json` contributes both `allah.agentWorkbench` (`Swarm
  Operations`) and `allah.localAgentWorkbench` (`Workspace Agent`).
- Evidence: `extension.ts` registers both providers.
- Impact: users can enter two different agent workflows with different safety
  and connectivity behavior. This conflicts with the standalone product
  boundary and makes the primary path unclear.
- Fix: expose and register only the local Workspace Agent.

## MEDIUM, confirmed

### UI-002: Status language describes a cloud gateway instead of the usable local product

- Evidence: activation initializes the status item as `MoonWitness (offline)`;
  the local agent and plans remain usable.
- Impact: users can infer that the extension is broken when its offline
  capabilities are available.
- Fix: label status as local/offline-first and use it to focus the agent.

## MEDIUM, confirmed

### UI-003: Legacy cloud handlers remain in activation source

- Evidence: `extension.ts` still registers `syncPlansToHub`,
  `pullPlanFromHub`, `syncPlansToTurso`, and `openArsyDocs`; README says cloud
  synchronization is not part of the standalone product.
- Impact: future maintenance can accidentally re-expose or invoke a path that
  contradicts the standalone contract.
- Fix: remove stale registrations or move them behind an explicitly optional,
  separately owned adapter after the local UX is stable.

## Readiness verdict

**Conditionally usable.** Local plan navigation, context selection, safe edit
review, and approved validation are usable. The extension is not yet a
cohesive production UX until UI-001 and UI-002 are fixed. UI-003 is a boundary
hardening task.
