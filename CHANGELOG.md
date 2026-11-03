---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CHANGELOG"
version: "1.0.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---

# CHANGELOG.md

## 2026-11-03 - Six DNA Shared UI Skin Foundation

### Added
- **MoonFrame skin registry** (`packages/ui/src/skins`): typed IDs, semantic tokens, SSR-safe root selection, and package-owned style recipes for all six approved DNA worlds.
- **Application skin assignments**: Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and WORLD OBSERVATORY / Mycelium.
- **Skin contract tests**: registry/fallback, server-rendered skin selection, and semantic contrast checks.

### Changed
- Shared UI primitives and navigation now consume root-scoped skin recipes; the existing Base UI foundation and component behavior remain shared.
- Skin Laboratory comparison and full visual verification remain pending.

## 2026-11-03 - IDE Agent Workbench & Multi-Agent Swarm Orchestration (AGI Phase 5)

### Added
- **Multi-Agent Swarm Engine** (`packages/arsy-plugin-llm-gateway/src/swarm`): Hierarchical orchestration with Supervisor/Planner, Researcher, Builder, and Verifier/Reviewer agents. Inter-agent message passing, consensus verification, and SSE streaming endpoints (`/v1/swarm/run`, `/v1/swarm/stream`).
- **Universal SDK Expansion** (`packages/sdk`): Added `mwClient.swarm.run()` and `mwClient.swarm.stream()` with typed `SwarmStep`, `SwarmAgentMessage`, `SwarmExecutionResult` interfaces.
- **VS Code Extension Agent Workbench** (`packages/vscode-extension/src/agentWorkbench.ts`): Webview provider connecting to Arsy SSE streaming endpoint, live mission execution, and `.plans` artifact synchronization.
- **Headquarter Swarm Operations Dashboard** (`apps/headquarter/src/app/swarm/page.tsx`): Real-time agent role cards, inter-agent message log with latency chips, and mission result visualization using `@moonwitness/ui`.
- **Integration Test** (`apps/arsy/test/swarm.test.mjs`): End-to-end verification of swarm endpoints and coordinator singleton.

### Changed
- **Headquarter Navigation**: Added Swarm Operations link in home page header.

## 2026-11-03 - Autonomous Cognitive Agent Loop & Generative SDUI (AGI Phase 4)

### Added
- **Cognitive Agent Loop Engine** (`packages/arsy-plugin-llm-gateway/src/agent/loop.ts`): ReAct multi-step reasoning runtime with safety guards (max_steps ceiling, loop detection, step timeouts). Singleton `agentLoop` with `run()` and `streamSessionEvents()` methods.
- **Generative SDUI Tool** (`packages/arsy-plugin-llm-gateway/src/tools/sdui.ts`): `render_sdui` tool supporting view types (card, tree, table, form, stats-grid, kanban) with ORM model schema derivation and static view generation.
- **Fastify Agent Endpoints** (`packages/arsy-plugin-llm-gateway/src/index.ts`): `POST /v1/agent/run` (synchronous) and `POST /v1/agent/stream` (zero-copy SSE) with typed request/response contracts.
- **Universal SDK Agent Methods** (`packages/sdk/src/index.ts`): `mwClient.agent.run()` and `mwClient.agent.stream()` with full TypeScript typings for `AgentRunRequest`, `AgentRunResponse`, `AgentStreamEvent`.
- **Shared Type Contracts** (`packages/types/src/index.ts`): Added `AgentThought`, `AgentToolCallEvent`, `AgentToolResultEvent`, `AgentSduiEvent`, `AgentStreamEvent`, `AgentStep`, `AgentRunRequest`, `AgentRunResponse` interfaces.
- **Headquarter Agent Studio** (`apps/headquarter/src/app/agent/page.tsx`): Mission goal input with max_steps slider, live reasoning timeline (Thought/Tool/Result badges), SSE event streaming, SDUI preview container. Built exclusively with `@moonwitness/ui`.
- **Headquarter Home Page Link**: Agent Studio card with navigation to `/agent` route.
- **Integration Test** (`apps/arsy/test/agent_loop.test.mjs`): Verification of agent run/stream endpoints, SSE event emission, max_steps enforcement, and loop detection.

### Changed
- **Tool Registry**: Registered `render_sdui` tool alongside existing tools (pglite_query, storage_cas, web_fetch, qorpus_retrieve).
- **LLM Gateway Package**: Added `@moonwitness/types` dependency for agent type imports.