---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BACKLOG"
version: "1.0.0"
owner: "product"
status: "implemented"
last_verified: "2026-11-03"
---

# BACKLOG.md

## MOONFRAME-SIX-DNA-UI-SKINS: Shared UI skin engine and app assignments
- Priority: P0
- Status: IMPLEMENTED; VISUAL VERIFICATION PENDING
- Outcome: `@moonwitness/ui` exposes six typed skin definitions, semantic token roles, a deterministic server-rendered `SkinRoot`, and shared component recipes. Dock uses Imperium Lumen, Headquarter uses Nexus Paradox, ID uses Lunar Chronicles, and WORLD OBSERVATORY uses Mycelium. The Skin Laboratory and app-specific composition remain deferred.
- Acceptance: All six IDs are registered; shared component behavior remains semantic and accessible; four consumer roots select the approved skin; `apps/web` remains unchanged; no full verification claim without Skin Laboratory evidence.
- Verification: See `.plans/20261103-2359-six-dna-ui-skins/report.md` when complete.

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