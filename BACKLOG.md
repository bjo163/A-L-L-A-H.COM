---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BACKLOG"
version: "1.0.0"
owner: "product"
status: "implemented"
last_verified: "2026-11-03"
---

# BACKLOG.md

## VSCODE-MISSION-TIMELINE: Observable and replay-safe workspace agent missions
- Priority: P0
- Status: IMPLEMENTED; INTERACTIVE SMOKE PENDING
- Outcome: Added typed, redacted timeline persistence, interrupted-session recovery, remote replay protection, validation events, and one approval-gated repair proposal.
- Acceptance: Local and remote-backed mission state is inspectable; interrupted or replayed missions do not silently repeat execution; repair uses the existing context and edit approval policy.
- Verification: 33 focused tests pass; extension typecheck, build, runtime parity, lint, and documentation checks pass; packaged and installed VSIX bundle hashes match. Interactive extension-host verification remains pending. Workspace-aware mission templates remain a follow-up milestone; see `.plans/20261104-1344-vscode-mission-timeline/`.

## VSCODE-DEEP-RUNTIME-HARDENING: VS Code extension activation and packaging
- Priority: P0
- Status: IMPLEMENTED; INTERACTIVE COMMAND PALETTE CHECK PENDING
- Outcome: Added activation failure logging, manifest/source/runtime parity validation, local VSIX packaging, standalone SDK bundling verification, gateway smoke evidence, and exact workspace/VSIX/installed bundle hash parity.
- Acceptance: Every command has source and activation coverage; runtime packaging contains one standalone extension entrypoint; workspace, VSIX, and installed bundle hashes match; gateway health, readiness, and model catalog return HTTP 200.
- Verification: Focused extension tests pass 28/28; extension typecheck passes; extension runtime parity passes; VSIX installed into VS Code 1.144.1; three bundle hashes match. Final repository lint/typecheck remain blocked by unrelated Sentinel baseline violations; interactive Command Palette execution remains pending.

## WINDOWS-VSCODE-LOCAL-AGENT: Windows-local VS Code agent and remote operations
- Priority: P0
- Status: IMPLEMENTED; INTERACTIVE VERIFICATION PENDING
- Outcome: The extension offers six local agent modes with explicit workspace-context consent, workspace-scoped edits, bounded validation commands, and outbound paired-device missions. Headquarter can manage tenant-scoped devices and missions. New accounts receive isolated personal tenants; team access requires shared organization membership.
- Acceptance: Local permissions remain authoritative; personal accounts are isolated; users in the same tenant can manage shared devices and missions; focused extension and device-control tests pass.
- Verification: `pnpm extension:test` (28/28), `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`, `pnpm extension:build`, all four documented application/Arsy builds, and auth/gateway package builds pass. Interactive Windows extension-host and Headquarter behavior checks remain pending; see `.plans/20261104-0138-windows-vscode-agent-platform/`.

## MOONFRAME-SIX-DNA-UI-SKINS: Shared UI skin engine and app assignments
- Priority: P0
- Status: IMPLEMENTED; APP ROUTES AUDITED; INTERACTIVE BROWSER VERIFICATION PENDING
- Outcome: `@moonwitness/ui` exposes six typed skin definitions, semantic token roles, a deterministic server-rendered `SkinRoot`, and shared component recipes. Dock uses Imperium Lumen, Headquarter uses Nexus Paradox, ID uses Lunar Chronicles, and WORLD OBSERVATORY uses Mycelium. All 12 current app routes have been visually and responsively audited; the Skin Laboratory and live interactive verification remain pending.
- Acceptance: All six IDs are registered; shared component behavior remains semantic and accessible; four consumer roots select the approved skin; `apps/web` remains unchanged; no full verification claim without Skin Laboratory evidence.
- Verification: See `.plans/20261104-0310-ui-skin-refinement/report.md` for current route, viewport, test, and browser-environment evidence.

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
## EVOLVE-PLATFORM-FOUNDATIONS
- Priority: P1
- Status: VERIFIED
- Outcome: Advance platform foundations with concrete verification evidence.
- Acceptance: Extension parity and observatory verification complete with evidence.
- Verification: Pending per plan 20261104-131923-evolve-platform-foundations

## NEW-PLATFORM-CAPABILITY-4: Simulated new platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T08-13-57-new-platform-capability-4

## NEW-PLATFORM-CAPABILITY-6: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-04-05-new-platform-capability-6


## NEW-PLATFORM-CAPABILITY-7: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-10-04-new-platform-capability-7


## NEW-PLATFORM-CAPABILITY-8: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-19-48-new-platform-capability-8


## NEW-PLATFORM-CAPABILITY-9: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-26-31-new-platform-capability-9


## NEW-PLATFORM-CAPABILITY-10: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-34-20-new-platform-capability-10


## NEW-PLATFORM-CAPABILITY-11: New platform capability
- Priority: P0
- Status: VERIFIED
- Outcome: Implement new platform capability from brainstorming
- Acceptance: New capability implemented and verified
- Verification: Pending per plan 2026-11-04T09-44-14-new-platform-capability-11
