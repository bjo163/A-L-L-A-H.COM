---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BACKLOG"
version: "1.0.0"
owner: "product-management"
status: "implemented"
last_verified: "2026-11-03"
---
# BACKLOG.md
## Single Source of Actionable Work

Statuses: DISCOVERED, READY, IN_PROGRESS, IMPLEMENTED, VERIFIED, RELEASED, BLOCKED, DEFERRED. Priority: P0 critical, P1 high, P2 medium, P3 normal, P4 opportunistic.

## Tasks

### DOC-001: Reconcile documentation with implementation
- Priority: P1
- Status: READY
- Outcome: Current-state claims in README, BLUEPRINT, CHANGELOG, and app docs match source, manifests, tests, and workflows.
- Acceptance: Audit claims; correct unsupported statements; verify CI paths and commands; record gaps as tasks.
- Verification: File/path and command checks plus documentation review.

### LEG-001: Inventory MoonWitness legacy sources
- Priority: P1
- Status: DISCOVERED
- Outcome: Traceable inventory of accessible and inaccessible historical sources.
- Acceptance: Record exact source, generation, provenance, status, relationships, access limitations, and disposition.
- Verification: Source references are reviewable.

### LEG-002: Reconcile Reborn and XV
- Priority: P1
- Status: DISCOVERED
- Dependencies: LEG-001
- Outcome: Evidence-backed map of shared, unique, superseded, conflicting, and missing material.
- Acceptance: Compare trees, docs, history, assets, issues; preserve unique content; document conflicts; propose reversible migration.
- Verification: Reviewable source-to-destination reconciliation matrix.

### ARCH-001: Validate product boundaries and ownership
- Priority: P1
- Status: DISCOVERED
- Outcome: Validated responsibilities and integration boundaries for the ecosystem.
- Acceptance: Purpose, domain/data owner, and integration contract documented for each product or decision not to separate it.

### ENG-001: Verify build and CI baseline
- Priority: P1
- Status: VERIFIED
- Outcome: Reproducible frontend, extension, and CI baseline.
- Acceptance: Inspect actual scripts/workflows; run available checks; fix broken CI wiring after confirming commands; record environmental limitations.
- Verification: Dock, Headquarter, and VS Code extension builds pass. CI gate runs pnpm dock:build, pnpm headquarter:build, and pnpm extension:build in parallel and promotes dev to main on 100% pass.

### AUTH-003: MoonWitness ID Native Authentication & SSO Center (GitHub Issue #3)
- Priority: P0
- Status: VERIFIED
- Outcome: Universal account, identity and remote session management center deployed under apps/id consuming canonical apps/arsy Fastify Hub and native embedded @allah/arsy-orm PGlite engine without ORM overlap or redundant auth servers.
- Acceptance: Canonical identity models in @allah/arsy-orm (auth.user, auth.session, auth.verification), Fastify session endpoints, apps/id Next.js frontend with active session manager, and cross-app invalidation verified.
- Verification: Automated integration test, cross-app invalidation test, pnpm id:build, and 100/100 doc contract score.

### AI-001: Universal Multi-Provider AI Gateway & Resilient Routing Engine (Phase 1)
- Priority: P0
- Status: VERIFIED
- Outcome: Production multi-provider gateway in `@allah/arsy-plugin-llm-gateway` supporting OpenAI, Anthropic, Gemini, and Ollama with zero-copy SSE streaming, circuit breaker protection, virtual keys with USD caps, and Headquarter control plane.
- Verification: 9 automated integration tests in `apps/arsy/test/ai_gateway.test.mjs`, all builds passing, pushed in commit `bbf93bc`.

### MEM-001: Cognitive Memory, Qorpus RAG & Vector Semantic Cache (Phase 2)
- Priority: P0
- Status: VERIFIED
- Outcome: Universal `/v1/embeddings` endpoint, real cosine similarity semantic caching in PGlite ($s \ge 0.95$), Qorpus document ingestion addon (`addons/mw_qorpus`), and persistent conversation threads with auto-summarization.
- Verification: Tested in `apps/arsy/test/ai_gateway.test.mjs`, Headquarter `/knowledge` page built, pushed in commit `c01b5f8`.

### LINT-001: Strict Monorepo Architectural Linter & Quality Gates
- Priority: P0
- Status: VERIFIED
- Outcome: Monorepo architectural invariant checker (`pnpm lint:arch` via `@moonwitness/lint`), strict TypeScript compilation (`pnpm typecheck`), and pre-commit husky gate integration.
- Verification: Zero lint violations, zero typecheck errors across all workspaces, pre-commit enforcement verified.

### TOOL-001: Executive Hands & Model Context Protocol (MCP) Tools (Phase 3)
- Priority: P1
- Status: READY
- Outcome: Function calling schema normalization across OpenAI, Anthropic, and Gemini; native Arsy tools (`pglite_query`, `storage_cas`, `web_fetch`, `qorpus_retrieve`); Fastify MCP Server (`/v1/mcp/sse`); Headquarter tools console.
- Dependencies: AI-001, MEM-001.

### DEP-001: Publish container images before Coolify deployment
- Priority: P1
- Status: BLOCKED
- Outcome: GitHub Actions publishes versioned dock and headquarter images to GHCR and triggers Coolify.
- Acceptance: Publish on pushes to `main`, preserve a commit-specific rollback tag, and fail clearly if required Coolify secrets are absent.
- Verification: Pending first production publish of the dock and headquarter images.

### ENG-002 — Implement Arsy Modular Ecosystem
- Priority: P1
- Status: VERIFIED
- Outcome: Modular Fastify runtime, embedded PGlite ORM, technical plugins (auth, sdui, llm-gateway, storage), and declarative business addons.
- Verification: End-to-end HTTP smoke tests on /health, /ready, /api/auth/register, /api/auth/current, /v1/models, /v1/chat/completions, /api/storage/upload.

### EXT-001: Integrate the VS Code plan workbench
- Priority: P1
- Status: VERIFIED
- Problem: The extension does not preserve all checklist states, route multi-root plan operations explicitly, or distinguish gateway catalog/mock responses from configured AI providers.
- Expected outcome: Native VS Code plan navigation and task lifecycle with four-artifact plan creation, reliable gateway errors, and focused verification.
- Evidence/source: `.plans/20261103-213240-vscode-extension-workbench/`
- Verification: `pnpm extension:test` (12/12), `pnpm --filter allah-vscode-extension typecheck`, `pnpm extension:build`, `pnpm docs:check` (100/100).

## Rules
One stable ID per task; merge duplicates; roadmap stays strategic; distinguish evidence from hypothesis; update status only when its definition is met; record blockers and next action.
