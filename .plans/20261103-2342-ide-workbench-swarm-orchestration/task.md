# Tasks: Autonomous IDE Agent Workbench & Multi-Agent Swarm Orchestration

## 1. Multi-Agent Swarm Engine Core (`packages/arsy-plugin-llm-gateway`)
- [x] Implement `SwarmCoordinator` in `packages/arsy-plugin-llm-gateway/src/swarm/coordinator.ts`
- [x] Define specialized agent roles (`planner`, `researcher`, `builder`, `verifier`)
- [x] Implement inter-agent message passing protocol and consensus verification
- [x] Register `POST /v1/swarm/run` and `POST /v1/swarm/stream` Fastify endpoints
- [x] Export swarm engine and types from package root

## 2. Universal Client SDK Expansion (`packages/sdk`)
- [x] Add `mwClient.swarm.run(options)` to `AllahClient`
- [x] Add `mwClient.swarm.stream(options, onEvent)` with SSE parser
- [x] Export `SwarmStep`, `SwarmAgentMessage`, `SwarmExecutionResult` interfaces
- [x] Compile dual CJS/ESM SDK builds

## 3. VS Code Extension Agent Workbench (`allah-vscode-extension`)
- [x] Add Agent Workbench webview provider in `allah-vscode-extension/src/agentWorkbench.ts`
- [x] Connect webview to `@allah/sdk` or Arsy streaming endpoint
- [x] Implement live `.plans` artifact synchronization directly from agent stream
- [x] Package and verify extension compilation with `pnpm --filter allah-vscode-extension compile`

## 4. Headquarter Swarm Operations Dashboard (`apps/headquarter/src/app/swarm`)
- [x] Create `/swarm` page in `apps/headquarter/src/app/swarm/page.tsx`
- [x] Build Agent Role cards (Supervisor, Researcher, Builder, Reviewer) using `@moonwitness/ui`
- [x] Build Live Inter-Agent Message Log with role avatars and latency chips
- [x] Wire navigation link in Headquarter navigation bar

## 5. Verification, Documentation & Quality Gates
- [x] Create automated integration test `apps/arsy/test/swarm.test.mjs`
- [x] Run `pnpm lint:arch` (100% compliant)
- [x] Run `pnpm typecheck` (0 errors)
- [x] Run `pnpm docs:check` (100/100 pts)
- [x] Run all 4 production builds (`dock:build`, `headquarter:build`, `id:build`, `@allah/arsy build`)
- [x] Update canonical documentation (`CHANGELOG.md`, `BACKLOG.md`, `QUALITY.md`, `BLUEPRINT.md`)
- [ ] Commit and push to `dev`

