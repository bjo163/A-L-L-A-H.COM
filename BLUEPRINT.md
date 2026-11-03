---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BLUEPRINT"
version: "1.0.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-03"
---
# BLUEPRINT.md
## Unified Product & System Architecture

This is the target architecture, not a declaration that every component already exists. Reconcile it continuously with actual code and verified runtime behavior.

## Product Architecture
A-L-L-A-H.COM is the central home of the MoonWitness and Empire of the Light ecosystem. It provides coherent identity, navigation, shared platform capabilities, integration contracts, and product experiences while allowing independent deployment boundaries where justified.

## Product Domains & Applications

| Domain / Application | Directory | Port | Responsibility |
|---|---|---|---|
| Fastify Hub & API Engine | `apps/arsy/` | 5150 | Single backend authority: PGlite ORM, AI Gateway, CAS storage, SDUI, and auth. |
| Dock Portal | `apps/dock/` | 3001 | Public ecosystem homepage and discovery portal (Next.js 16). |
| WORLD OBSERVATORY | `apps/jizz/` | 3004 | Public intelligence observatory powered by ROCKSOUL JIZZ (Next.js 16). |
| Command Headquarter | `apps/headquarter/` | 3002 | Operational command center, AI Gateway control plane, and knowledge explorer (Next.js 16). |
| MoonWitness ID | `apps/id/` | 3003 | Unified authentication, registration, and active session authority (Next.js 16). |
| Shared UI Library | `packages/ui/` | N/A | Mandatory atomic UI system (`@moonwitness/ui`: components, blocks, primitives, tokens). |
| Universal Client SDK | `packages/sdk/` | N/A | Isomorphic client (`@allah/sdk`) routing all hub calls and session tokens. |
| Shared Data Contracts | `packages/types/` | N/A | Universal shared type contracts (`@moonwitness/types`). |
| Architectural Linter | `packages/lint/` | N/A | Monorepo invariant enforcement (`@moonwitness/lint`) executed via `pnpm lint:arch`. |
| Embedded PGlite ORM | `packages/arsy-orm/` | N/A | In-process PostgreSQL WASM ORM with automatic schema sync and tenant isolation. |
| AI Gateway & Smart Router | `packages/arsy-plugin-llm-gateway/` | N/A | Multi-provider routing (OpenAI, Anthropic, Gemini, Ollama), SSE streaming, virtual keys, **ReAct cognitive agent loop**, and **generative SDUI tool registry**. |
| Qorpus Knowledge Store | `addons/mw_qorpus/` | N/A | Document chunking, vector embeddings, SHA-256 deduplication, and hybrid retrieval. |

## Architecture Layers
- Experience: public and authenticated experiences, product-specific interfaces, shared navigation (`EcosystemNavbar`), responsive accessible UI.
- Applications: domain-specific workflows, explicit ownership, stable API contracts, no duplicated business logic.
- Platform services: identity and access (`apps/id`), AI routing and usage logging, Qorpus knowledge retrieval, content-addressed storage (SHA-256), audit logs, and configuration.
- **Cognitive Agent Loop**: autonomous ReAct multi-step reasoning engine with safety guards (max_steps, loop detection, step timeouts), generative SDUI synthesis (`render_sdui` tool), zero-copy SSE streaming (`/v1/agent/stream`), and universal SDK client (`@allah/sdk`).
- **Swarm Orchestration**: hierarchical multi-agent orchestration (Supervisor, Researcher, Builder, Verifier) via `@allah/arsy-plugin-llm-gateway` endpoints `/v1/swarm/*`, consumed by `@allah/sdk` and exposed in Headquarter `/swarm` dashboard and VS Code Agent Workbench.
- Data: single embedded database engine (PGlite WASM via `@allah/arsy-orm`), zero ORM overlap, explicit schemas and migrations, tenant isolation (`company_id`), provenance, and fail-closed retention.
- Infrastructure: reproducible local, CI, staging, and production environments, health checks (`/health`, `/ready`), secrets, networking, and rollback.

## Monorepo Invariants
1. All client applications in `apps/` must import interactive components from `@moonwitness/ui`.
2. All client-to-hub communications must route through `@allah/sdk`.
3. All shared data contracts must be imported from `@moonwitness/types`.
4. Only embedded PGlite via `@allah/arsy-orm` is permitted for data persistence.
5. All commits must pass pre-commit quality gates (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`).

## Delivery and Deployment
GitHub Actions builds and publishes dock, headquarter, and id images to GHCR on pushes to `main`. A successful publish triggers Coolify through its deployment URL and API token. Production image selection is controlled by `IMAGE_PREFIX` and `IMAGE_TAG`; Coolify must have read access to GHCR when packages are private.

## Architecture Decisions
Before adding a service, application, database, framework, or abstraction: identify the user outcome; inspect existing capability; compare alternatives and operational cost; define ownership; record accepted decisions in `DECISIONS.md`; add work to `BACKLOG.md`.
