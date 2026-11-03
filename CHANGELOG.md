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
- **VS Code gateway handling:** Parse Arsy's model catalog envelope and reject mock, malformed, or failed plan completions instead of reporting local fallback as AI success.
- **Plan contract:** Time and budget estimates are no longer required by plan templates or documentation validation.
- **Backend architecture:** The Fastify/TypeScript ARSY Hub under apps/arsy is the active backend; the former Rust Loco server is retired.
- **Web application structure:** The former apps/web application was replaced by apps/dock; apps/headquarter is the command center.
- **Deployment:** docker-compose and publish workflow target Dock and Headquarter images from GHCR.
- **Build gates:** Current frontend and backend gates use pnpm dock:build, pnpm headquarter:build, and pnpm --filter @allah/arsy build.
- **CI:** The dev workflow verifies current applications and promotes dev to main only after required checks pass.
- **Documentation:** Root engineering and product documentation was reconciled with the current app and backend structure.

### Historical platform foundations
- **Arsy Enterprise Ecosystem:** Modular Fastify framework, embedded PGlite ORM, micro-kernel, and declarative business addons.
- **Arsy Technical Plugins:** Authentication, SDUI, LLM gateway, and content-addressed storage.
- **Repository governance:** Spec-driven plans under .plans/, documentation contracts, CI validation, and the VS Code plan workbench.
- **Deployment foundation:** GitHub Actions builds and publishes container images to GHCR before triggering Coolify.

### Fixed
- No additional verified fix entries recorded in this section.

Add dated release sections only when an actual repository milestone or release exists, with commit/release references where available.
