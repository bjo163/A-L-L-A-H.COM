---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CHANGELOG"
version: "1.1.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---

# CHANGELOG.md

## 2026-11-04 - UI Purity Wave: Shared Primitives and a Gate That Actually Gates

### Added
- `Select`, `Table` family (`Table`, `TableScroll`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`), `Dialog` on native `<dialog>`, `Form` + `FormField`, and `Link` in `@moonwitness/ui`, each skinned through the existing `--mw-*` tokens and differentiated per DNA world.
- `Button asChild` and `Link asChild`, so a router link can carry the variant contract without hand-writing class names.
- `resolveEcosystemEndpoints()` for cross-app navigation, driven by `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` and per-app `NEXT_PUBLIC_*_URL` instead of embedded `localhost` literals.
- `SkinLaboratory` styles in `skins.css` and a Headquarter route at `/skin-lab` that mounts the showcase.
- `ToolExecutionRecord` in `@moonwitness/types` as the shared MCP audit contract used by the SDK and Headquarter.

### Changed
- `UI_PURITY` now matches a tag at end of line, blocks `button`, `input`, `select`, `textarea`, `a`, `form`, `label`, `table`, scans `packages/` as well as `apps/`, and flags hand-written `mw-*` class names. `collectFiles` no longer skips every `lib` directory.
- Migrated every raw control out of `apps/headquarter`, `apps/id`, and `apps/dock`, including the device-revoke flow from `window.confirm` to `Dialog`.
- Enabled TypeScript `strict` for `packages/ui`, `dock`, `headquarter`, `id`, and `jizz`, and made the type-check gate report its real strict coverage instead of claiming it for the whole monorepo.
- Scoped ESLint `no-restricted-imports` to `apps/**` so UI primitives cannot be assembled straight from `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, `cn`, or `shadcn`.
- Parameterized the `company_id` filter in the ORM translation query instead of interpolating it into SQL.

## 2026-11-04 - Production Docker Gate and Release Automation

### Changed
- Retired the unused Rust/Loco server from the active tree; Arsy Fastify remains the canonical backend.
- Included the shared TypeScript config in Arsy, Dock, Headquarter, and ID container builds.
- Included the Arsy addon sources in its container build context.
- Added Jizz and Sentinel so all six active services are built and published to GHCR; Coolify receives its GitHub webhook independently of image publishing.
- Dispatch image publishing after successful dev-to-main promotion and create the versioned GitHub release only after all images publish.

## 2026-11-04 - VS Code Extension Deep Runtime Hardening

### Added
- Activation failure logging through the `A-L-L-A-H.COM Extension` VS Code output channel.
- Manifest, source registration, activation coverage, standalone bundle, and runtime dependency checks.
- Local VSIX packaging support with runtime parity validation before installation.

### Changed
- Rebuilt and installed the VS Code extension standalone bundle.
- Verified workspace, VSIX, and installed `extension.js` SHA-256 parity.
- Verified Arsy `/health`, `/ready`, and `/v1/models` responses during extension gateway smoke checks.

## 2026-11-04 - Windows VS Code Agent and Remote Operations

### Added
- Windows-local VS Code agent modes with workspace-scoped file operations, explicit context consent, reviewable edits, local session history, and allowlisted validation commands.
- Outbound device pairing and tenant-scoped remote missions, cancellation, and event history in Headquarter.
- Isolated personal tenant assignment for new accounts; organization sharing requires explicit tenant membership.

### Changed
- Device-control tenant validation accepts non-zero safe integer IDs so isolated personal tenants and positive organization tenants both remain scoped.

## 2026-11-04 - DNA App Visual Transformation

### Added
- **App-specific compositions and original artwork** for Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and WORLD OBSERVATORY / Mycelium.
- **Accessible shared textarea** with connected labels and inline error announcements.
- **Opt-in sound controls and mobile navigation** across the four app shells, with keyboard dismissal and focus return.

### Changed
- Redesigned all 12 in-scope routes with distinct application identities, responsive layouts, and honest loading, empty, authentication, and unavailable states.
- Added descriptive Headquarter page titles, explicit form labels, semantic main landmarks, and primary page headings.
- Added an account-page heading and announced loading and empty-session states for assistive technology.
- Removed unsupported AGI capability claims and nonfunctional presentation controls.
- Verified the four required production build gates; architecture lint currently reports unrelated violations in other worktree files.

## 2026-11-03 - Six DNA Shared UI Skin Foundation

### Added
- **MoonFrame skin registry** (`packages/ui/src/skins`): typed IDs, semantic tokens, SSR-safe root selection, and package-owned style recipes for all six approved DNA worlds.
- **Application skin assignments**: Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and WORLD OBSERVATORY / Mycelium.
- **Skin contract tests**: registry/fallback, server-rendered skin selection, and semantic contrast checks.

### Changed
- Shared UI primitives and navigation now consume root-scoped skin recipes; the existing Base UI foundation and component behavior remain shared.
- Skin Laboratory comparison and full visual verification remain pending.

## 2026-11-03 - IDE Agent Workbench & Multi-Agent Swarm Orchestration (AGI Phase 5)

### Added
- **Multi-Agent Swarm Engine** (`packages/arsy-plugin-llm-gateway/src/swarm`): Hierarchical orchestration with Supervisor/Planner, Researcher, Builder, and Verifier/Reviewer agents. Inter-agent message passing, consensus verification, and SSE streaming endpoints (`/v1/swarm/run`, `/v1/swarm/stream`).
- **Universal SDK Expansion** (`packages/sdk`): Added `mwClient.swarm.run()` and `mwClient.swarm.stream()` with typed `SwarmStep`, `SwarmAgentMessage`, `SwarmExecutionResult` interfaces.
- **VS Code Extension Agent Workbench** (`packages/vscode-extension/src/agentWorkbench.ts`): Webview provider connecting to Arsy SSE streaming endpoint, live mission execution, and `.plans` artifact synchronization.
- **Headquarter Swarm Operations Dashboard** (`apps/headquarter/src/app/swarm/page.tsx`): Real-time agent role cards, inter-agent message log with latency chips, and mission result visualization using `@moonwitness/ui`.
- **Integration Test** (`apps/arsy/test/swarm.test.mjs`): End-to-end verification of swarm endpoints and coordinator singleton.

### Changed
- **Headquarter Navigation**: Added Swarm Operations link in home page header.

## 2026-11-03 - Autonomous Cognitive Agent Loop & Generative SDUI (AGI Phase 4)

### Added
- **Cognitive Agent Loop Engine** (`packages/arsy-plugin-llm-gateway/src/agent/loop.ts`): ReAct multi-step reasoning runtime with safety guards (max_steps ceiling, loop detection, step timeouts). Singleton `agentLoop` with `run()` and `streamSessionEvents()` methods.
- **Generative SDUI Tool** (`packages/arsy-plugin-llm-gateway/src/tools/sdui.ts`): `render_sdui` tool supporting view types (card, tree, table, form, stats-grid, kanban) with ORM model schema derivation and static view generation.
- **Fastify Agent Endpoints** (`packages/arsy-plugin-llm-gateway/src/index.ts`): `POST /v1/agent/run` (synchronous) and `POST /v1/agent/stream` (zero-copy SSE) with typed request/response contracts.
- **Universal SDK Agent Methods** (`packages/sdk/src/index.ts`): `mwClient.agent.run()` and `mwClient.agent.stream()` with full TypeScript typings for `AgentRunRequest`, `AgentRunResponse`, `AgentStreamEvent`.
- **Shared Type Contracts** (`packages/types/src/index.ts`): Added `AgentThought`, `AgentToolCallEvent`, `AgentToolResultEvent`, `AgentSduiEvent`, `AgentStreamEvent`, `AgentStep`, `AgentRunRequest`, `AgentRunResponse` interfaces.
- **Headquarter Agent Studio** (`apps/headquarter/src/app/agent/page.tsx`): Mission goal input with max_steps slider, live reasoning timeline (Thought/Tool/Result badges), SSE event streaming, SDUI preview container. Built exclusively with `@moonwitness/ui`.
- **Headquarter Home Page Link**: Agent Studio card with navigation to `/agent` route.
- **Integration Test** (`apps/arsy/test/agent_loop.test.mjs`): Verification of agent run/stream endpoints, SSE event emission, max_steps enforcement, and loop detection.

### Changed
- **Tool Registry**: Registered `render_sdui` tool alongside existing tools (pglite_query, storage_cas, web_fetch, qorpus_retrieve).
- **LLM Gateway Package**: Added `@moonwitness/types` dependency for agent type imports.