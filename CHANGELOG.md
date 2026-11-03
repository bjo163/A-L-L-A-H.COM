---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CHANGELOG"
version: "0.1.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---
# CHANGELOG.md
## A-L-L-A-H.COM

This file records changes that actually happened. It is not a roadmap and must not claim unverified implementation.

## [Unreleased]

### Added
- **Architectural Linter Gate (`@moonwitness/lint`)**: Implemented standalone invariant checker `node packages/lint/src/check-architecture.mjs` (`pnpm lint:arch`) enforcing zero ORM overlap (embedded PGlite only), strict `@moonwitness/ui` usage in `apps/`, unified `@allah/sdk` client routing, and shared `@moonwitness/types` data contracts.
- **Strict TypeScript Typechecking (`pnpm typecheck`)**: Integrated deterministic TypeScript compiler gate across all packages and apps (`@allah/arsy-orm`, `@allah/arsy-core`, `@allah/arsy-plugin-llm-gateway`, `@allah/arsy-plugin-auth`, `@allah/arsy-plugin-storage`, `@allah/arsy-plugin-sdui`, `@moonwitness/types`, `@allah/sdk`, `@moonwitness/ui`, `apps/arsy`). Fixed remaining interface mismatches and dead scaffold files.
- **Enhanced Husky Pre-Commit Gate**: Upgraded `.husky/pre-commit` to synchronously enforce documentation contracts (`pnpm docs:check`), architectural invariants (`pnpm lint:arch`), and strict TypeScript type validation (`pnpm typecheck`) before commit creation.
- **Canonical Documentation Synchronization**: Synchronized `AGENTS.md`, `QUALITY.md`, `DESIGN.md`, `BLUEPRINT.md`, `BACKLOG.md`, and `DOCUMENTATION_CONTRACT.md` removing legacy rust references and establishing automated self-healing validation standards.
- **Multi-Provider AI Gateway & Fallback Router (`@allah/arsy-plugin-llm-gateway`)**: Implemented universal OpenAI, Anthropic Claude Messages, Google Gemini, and Ollama protocol adapters with zero-copy Server-Sent Events (SSE) streaming, circuit breaker protection, SSRF guards, and multi-tier fallback sequencing.
- **Persistent AI Metering & Virtual Keys**: Connected `addons/mw_llm_router` models (`ai.provider`, `ai.model`, `ai.route`, `ai.virtual_key`, `ai.usage_log`) to the gateway runtime, enforcing rate limits and monthly USD budget ceilings with real-time audit logs in PGlite.
- **Client SDK Streaming & Telemetry (`@allah/sdk`)**: Added `chatStream()`, provider catalogs, telemetry metrics, and virtual key credentials to universal SDK.
- **Headquarter AI Control Plane (`apps/headquarter/src/app/ai-gateway`)**: Added operational dashboard for provider health, route matrix, interactive SSE streaming test console, and live PGlite audit log inspections using `@moonwitness/ui`.
- **Shared UI Library (`packages/ui`)**: shadcn/ui base-nova components exposed as `@moonwitness/ui` workspace package, consumed by Dock and Headquarter.
- **Headquarter app (`apps/headquarter`)**: Next.js 16 command center (port 3002) using `@moonwitness/ui`.
- **Dock app (`apps/dock`)**: renamed from `apps/web` as the public Next.js 16 homepage (port 3001).
- **MoonWitness ID Center (apps/id)**: Built Next.js 16 + React 19 + Tailwind v4 frontend for unified authentication, registration, and active session management.
- **Native Identity & Session Models**: Added auth.user, auth.session, and auth.verification directly to @allah/arsy-orm with composite indexes on embedded PGlite.
- **Arsy Auth Plugin Endpoints**: Added remote session revocation, session listing, user-agent tracking, and unified session guard in @allah/arsy-plugin-auth.
- **Root Workspace Scripts**: Added pnpm id:dev and pnpm id:build.
- **VS Code plan workbench**: Added three-state task actions, multi-root navigation, `.plans` file refresh, four-artifact plan generation, and focused extension tests.

### Changed
- **VS Code gateway handling**: Parse Arsy's model catalog envelope and reject mock, malformed, or failed plan completions instead of reporting local fallback as AI success.
- **Plan contract**: Time and budget estimates are no longer required by plan templates or documentation validation.
- **Removed Rust Loco server (`apps/server`)**: the Fastify/TypeScript ARSY Hub (`apps/arsy`) is now the sole backend.
- **Renamed `apps/web` to `apps/dock`** and updated all CI, Docker, package manifests, and docs.
- **Updated `docker-compose.yml`** to run Dock and Headquarter images published to GHCR, removing the retired Loco server and old web service configuration.
- **Build gates**: replaced `server:migrate`/`cargo check` with `pnpm dock:build`, `pnpm headquarter:build`, and `pnpm --filter @allah/arsy build`.
- **CI (`ci-dev.yml`)**: `verify-server` job removed; replaced with `verify-dock` and `verify-headquarter` jobs.
- **CI (`publish-deploy.yml`)**: matrix now builds `dock` and `headquarter` images instead of `server` and `web`.
- **Docs**: updated `AGENTS.md`, `AUTONOMOUS.md`, `GOAL.md`, `BLUEPRINT.md`, `README.md`, `BACKLOG.md`, `DOCUMENTATION_CONTRACT.md`, and `walkthrough.md` to reflect the server-less architecture and Dock/Headquarter apps.

### Added (previous)
- **Arsy Enterprise Ecosystem**: Ultra-modular Fastify framework replacing Rust Loco backend.
- **Embedded PGlite ORM Engine (`@allah/arsy-orm`)**: In-process PostgreSQL WASM with automatic DDL schema synchronization and fail-closed multi-tenant (`company_id`) isolation.
- **Arsy Micro-kernel (`@allah/arsy-core`)**: Standardized response envelope `{ success, data, error, meta }`, DI container, error hierarchy, and structured Pino logger.
- **Arsy Technical Plugins**:
  - `@allah/arsy-plugin-auth`: Full authentication lifecycle (register, login, JWT verification, password hashing).
  - `@allah/arsy-plugin-sdui`: Dynamic view schema compilation (`tree`, `form`, `kanban`).
  - `@allah/arsy-plugin-llm-gateway`: OpenAI-compatible `/v1/chat/completions`, rate limiting, and semantic cache.
  - `@allah/arsy-plugin-storage`: Content-Addressed Storage (SHA-256 CAS).
- **Arsy Declarative Addons**:
  - `addons/base`: `res.company`, `res.partner`, `res.users`, `res.currency`, `res.country`, `ir.ui.view`.
  - `addons/mw_llm_router`: `ai.provider`, `ai.model`, `ai.route`, `ai.virtual_key`, `ai.usage_log`.
  - `addons/mw_storage`: `mw.storage.backend`, `ir.attachment`, `ir.legal.hold`.

### Added (earlier)
- Spec-Driven Planning standard (.plans/<timestamp>-<slug>/ with spec.md and task.md) and mini project management engine in allah-vscode-extension.
- GitHub Actions workflow to build and publish server/web container images to GHCR, then trigger Coolify deployment.
- CI validation gate (ci-dev.yml) to automatically test dev branch and auto-promote to main upon 100% test pass.
- Repository-wide documentation contract and updated app guides with workspace commands.
- Updated the VS Code extension package to align with the Arsy Fastify API, retain MoonWitness LLM routing and .plans management, and remove the placeholder Echolog storage item.

### Fixed
- No verified entries recorded yet.

Add dated release sections only when an actual repository milestone or release exists, with commit/release references where available.
