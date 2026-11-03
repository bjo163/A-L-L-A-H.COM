# Tasks: Phase 4 Autonomous Cognitive Agent Loop & Generative SDUI

## 1. Cognitive Agent Engine Core (`packages/arsy-plugin-llm-gateway`)
- [x] Implement `AgentLoop` cognitive runtime in `packages/arsy-plugin-llm-gateway/src/agent/loop.ts`
- [x] Implement safety guards (loop detection, max step ceilings, step timeouts)
- [x] Add `render_sdui` native tool in `packages/arsy-plugin-llm-gateway/src/tools/sdui.ts`
- [x] Register `/v1/agent/run` endpoint in Fastify plugin
- [x] Register `/v1/agent/stream` zero-copy SSE endpoint with thought/tool/result/message events
- [x] Export agent types and loop runner from package index

## 2. Universal Client SDK Expansion (`packages/sdk`)
- [x] Add `agentRun(options)` to `AllahClient` in `packages/sdk/src/index.ts`
- [x] Add `agentStream(options, onEvent)` with SSE parser in `packages/sdk/src/index.ts`
- [x] Export `AgentStep`, `AgentStreamEvent`, `AgentRunResponse` types

## 3. Headquarter Autonomous Agent Studio (`apps/headquarter/src/app/agent`)
- [x] Create `/agent` page route in `apps/headquarter/src/app/agent/page.tsx`
- [x] Build Agent Mission input with `@moonwitness/ui` components (Input, Button, Slider, Badge, Card)
- [x] Build live reasoning timeline (Thought, Tool Call, Observation, Response)
- [x] Build dynamic Generative SDUI viewport for synthesized views
- [x] Wire navigation link in Headquarter navigation bar / layout

## 4. Verification, Testing & Quality Gates
- [x] Create automated integration test `apps/arsy/test/agent_loop.test.mjs`
- [x] Verify test suite against live Fastify instance
- [x] Run `pnpm lint:arch` (Monorepo Architectural Invariants Gate)
- [x] Run `pnpm typecheck` (Strict TypeScript Gate)
- [x] Run `pnpm docs:check` (Documentation Contract Score 100/100)
- [x] Run production builds (`dock:build`, `headquarter:build`, `id:build`, `@allah/arsy build`)
- [x] Update canonical documentation (`CHANGELOG.md`, `BACKLOG.md`, `QUALITY.md`, `BLUEPRINT.md`)
- [x] Generate `report.md`, mark `spec.md` completed, commit, and push to `dev`

