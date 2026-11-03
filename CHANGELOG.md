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
- **MoonFrame Six Master DNA specifications:** Added the canonical DNA directory with the shared engine contract, six world-specific design specifications, component mapping, and quality gates. This is approved design documentation; runtime skin implementation remains pending.
- **Six Master DNA implementation task:** Added SKIN-001 to track the Skin Laboratory, token systems, component recipes, integration, and verification.
- **Multi-Provider AI Gateway & Fallback Router:** Implemented universal OpenAI, Anthropic Claude Messages, Google Gemini, and Ollama protocol adapters with SSE streaming, circuit breaker protection, SSRF guards, and multi-tier fallback sequencing.
- **Persistent AI Metering & Virtual Keys:** Connected the mw_llm_router models to gateway runtime, enforcing rate limits and monthly USD budget ceilings with audit logs in PGlite.
- **Client SDK Streaming & Telemetry:** Added chatStream(), provider catalogs, telemetry metrics, and virtual key credentials to the universal SDK.
- **Headquarter AI Control Plane:** Added provider health, route matrix, streaming test console, and PGlite audit log views using @moonwitness/ui.
- **Shared UI Library:** Added the @moonwitness/ui workspace package with shadcn/ui base-nova components for Dock and Headquarter.
- **Headquarter and Dock apps:** Added the Next.js 16 command center and public homepage.
- **MoonWitness ID Center:** Added Next.js 16 / React 19 account, registration, and session-management frontend.
- **Native Identity & Session Models:** Added auth.user, auth.session, and auth.verification to @allah/arsy-orm.
- **Arsy Auth Plugin Endpoints:** Added remote session revocation, session listing, user-agent tracking, and unified session guard.
- **VS Code plan workbench:** Added plan navigation, task lifecycle actions, multi-root support, four-artifact plan creation, and focused extension tests.

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
