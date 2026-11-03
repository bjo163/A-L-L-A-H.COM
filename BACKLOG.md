---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BACKLOG"
version: "1.0.0"
owner: "product"
status: "implemented"
last_verified: "2026-11-03"
---

# BACKLOG.md

## SWARM-ORCHESTRATION: Autonomous IDE Agent Workbench & Multi-Agent Swarm Orchestration
- Priority: P0
- Status: VERIFIED
- Outcome: Hierarchical multi-agent swarm with Supervisor, Researcher, Builder, and Verifier agents orchestrated via Fastify Hub. Includes Arsy endpoints, SDK methods, VS Code webview, and Headquarter dashboard.
- Acceptance: All swarm endpoints respond, SDK methods exported, extension compiles, dashboard renders with `@moonwitness/ui`, lint:arch passes, docs:check passes.
- Verification: pnpm typecheck (plugin, sdk, headquarter, vscode), pnpm lint:arch, pnpm docs:check all pass.

## WORLD-OBSERVATORY: Create WORLD OBSERVATORY Next.js app (apps/jizz)
- Priority: P0
- Status: VERIFIED
- Outcome: Public intelligence observatory app deployed at apps/jizz, port 3004, consuming ROCKSOUL JIZZ read-only API and @moonwitness/ui components.
- Acceptance: Working app with home page, observations, perspectives, navigation, responsive layout.
- Verification: pnpm jizz:build, pnpm docs:check, pnpm lint:arch, pnpm typecheck all pass.

## COGNITIVE-AGENT-LOOP: Autonomous Cognitive Agent Loop & Generative SDUI (Phase 4)
- Priority: P0
- Status: VERIFIED
- Outcome: ReAct multi-step cognitive agent loop with safety guards, generative SDUI synthesis tool, Fastify SSE endpoints, universal SDK client, and Headquarter Agent Studio dashboard.
- Acceptance: POST /v1/agent/run and /v1/agent/stream execute multi-step tool chains; render_sdui tool generates valid SDUI schemas; SDK provides typed agentRun/agentStream; Agent Studio renders live reasoning timeline and SDUI preview; all quality gates pass.
- Verification: pnpm typecheck (all packages), pnpm lint:arch (100%), pnpm docs:check (100/100), pnpm arsy:build, pnpm headquarter:build, pnpm dock:build, pnpm id:build all succeed.