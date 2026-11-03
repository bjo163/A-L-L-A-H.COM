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
- **MoonWitness ID Center (pps/id)**: Built Next.js 16 + React 19 + Tailwind v4 frontend for unified authentication, registration, and active session management.
- **Native Identity & Session Models**: Added uth.user, uth.session, and uth.verification directly to @allah/arsy-orm with composite indexes on embedded PGlite.
- **Arsy Auth Plugin Endpoints**: Added remote session revocation, session listing, user-agent tracking, and unified session guard in @allah/arsy-plugin-auth.
- **Root Workspace Scripts**: Added pnpm id:dev and pnpm id:build.


### Added
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


### Added
- Spec-Driven Planning standard (.plans/<timestamp>-<slug>/ with spec.md and task.md) and mini project management engine in allah-vscode-extension.
- GitHub Actions workflow to build and publish server/web container images to GHCR, then trigger Coolify deployment. The first production runs published the web image but failed while building the server image; see the deployment task in `BACKLOG.md`.
- CI validation gate (ci-dev.yml) to automatically test dev branch and auto-promote to main upon 100% test pass.
- Repository-wide documentation contract and updated app guides with workspace commands.
- Updated the VS Code extension package to align with the Arsy Fastify API, retain MoonWitness LLM routing and .plans management, and remove the placeholder Echolog storage item.

### Changed
- Production Compose now pulls prebuilt GHCR images instead of building on the Coolify host.
- `pnpm dev` now starts the backend first and waits for its HTTP endpoint before starting the web app.

### Fixed
- No verified entries recorded yet.

Add dated release sections only when an actual repository milestone or release exists, with commit/release references where available.
