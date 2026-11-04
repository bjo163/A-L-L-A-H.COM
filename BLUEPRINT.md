---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BLUEPRINT"
version: "1.2.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# BLUEPRINT.md

Target architecture. Not a completion claim. Reconcile continuously against source + runtime.
Monorepo map → [AGENTS.md](AGENTS.md). Invariants → [AGENTS.md](AGENTS.md). Decisions → [DECISIONS.md](DECISIONS.md).

## Applications

| App | Dir | Port | Role |
|---|---|---|---|
| Arsy Hub | `apps/arsy/` | 5150 | Backend authority: PGlite ORM · AI Gateway · CAS storage · SDUI · auth |
| Dock | `apps/dock/` | 3001 | Public ecosystem homepage |
| Headquarter | `apps/headquarter/` | 3002 | Command center · AI Gateway control · knowledge explorer |
| MoonWitness ID | `apps/id/` | 3003 | Auth · registration · SSO |
| World Observatory | `apps/jizz/` | 3004 | Public intelligence observatory, ROCKSOUL JIZZ API |

## Platform Packages

| Package | Import | Role |
|---|---|---|
| `packages/arsy-orm/` | `@allah/arsy-orm` | Embedded PGlite WASM ORM · schema sync · tenant isolation |
| `packages/arsy-plugin-llm-gateway/` | — | Multi-provider AI routing · SSE streaming · virtual keys · ReAct agent loop · SDUI tool registry |
| `addons/mw_qorpus/` | — | Vector embeddings · SHA-256 dedup · hybrid retrieval |

## Layer Stack

```
Experience     apps/* · EcosystemNavbar · responsive · a11y
MoonFrame      @moonwitness/ui · 6 DNA skins · SSR SkinRoot · typed tokens  → DESIGN.md
Cognitive      ReAct agent loop · SDUI synthesis · SSE /v1/agent/stream · @allah/sdk
Swarm          SwarmCoordinator(planner/researcher/builder/verifier) · /v1/swarm/* · consensus≤3→human
Data           PGlite WASM · @allah/arsy-orm · company_id · fail-closed retention
Infra          GitHub Actions · GHCR · Coolify · /health · /ready
```

## Swarm

| Endpoint | Method | Description |
|---|---|---|
| `/v1/swarm/run` | POST | Sync execution |
| `/v1/swarm/stream` | POST | SSE: `swarm_agent_step` · `swarm_message` · `swarm_verdict` · `done` |

`max_turns` default: 12. Hard cap: 24. Consensus failures ≥3 → human intervention.
SDK: `mwClient.swarm.run()` / `mwClient.swarm.stream()`. Types: `SwarmStep` · `SwarmAgentMessage` · `SwarmExecutionResult`.

## VS Code Agent

Workspace context: explicit consent required. File edits: reviewable before apply.
Paired devices: poll missions outbound. Headquarter: manage devices/missions, no workspace path exposure.
Tenant IDs: negative = personal, positive = org, zero = unassigned → [DECISIONS.md](DECISIONS.md) D-008.

## Delivery

CI promotion → validate Compose and build/publish all images to GHCR → versioned GitHub release. Coolify independently receives its GitHub webhook and may deploy concurrently with image publication.

## Decision Rule

New service / DB / framework / abstraction:
`outcome → inspect existing → compare alternatives → define ownership → DECISIONS.md + BACKLOG.md`
