# Rules: Autonomous IDE Agent Workbench & Multi-Agent Swarm Orchestration

## 1. Multi-Agent Boundaries & Safety Invariants
1. **Hierarchical Command Isolation**:
   - Only the **Supervisor / Planner** can delegate subtasks to workers (`researcher`, `builder`, `verifier`).
   - Workers cannot launch unbounded recursive swarms.
2. **Mandatory Verifier Consensus**:
   - No swarm mission can finish with `success: true` without explicit sign-off from the **Verifier** agent.
   - If the Verifier discovers documentation contract failures, type errors, or architectural lint violations, the mission is routed back to the **Builder** for revision.
3. **Turn Limits & Anti-Thrashing Guard**:
   - `max_turns` is strictly enforced (capped at 24 turns; default: 12).
   - If the Builder and Verifier cycle between rejection and revision 3 times consecutively without resolution, the swarm stops and requests human operator intervention.

## 2. Monorepo Architectural Invariants
1. **UI Purity**: All components in `apps/headquarter/src/app/swarm/page.tsx` must be imported from `@moonwitness/ui`. No un-styled HTML elements.
2. **Universal SDK Routing**: Both Headquarter and `allah-vscode-extension` must communicate with Fastify Hub using `@allah/sdk` (`mwClient.swarm.run` and `mwClient.swarm.stream`).
3. **Documentation Contract Synchronization**: All canonical documentation (`AGENTS.md`, `BLUEPRINT.md`, `QUALITY.md`, `CHANGELOG.md`, `BACKLOG.md`) must be kept in sync with score 100/100.

