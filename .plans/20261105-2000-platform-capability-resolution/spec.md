# Spec — Platform Capability Resolution

## Objective

Resolve the 13 `new-platform-capability` entries in `.plans/` that have been marked `VERIFIED` or `DISCOVERED` without substantive product code, and establish concrete platform foundations for the MoonWitness ecosystem. This plan bridges the gap between unverifiable claims and implementation-ready specifications for SDK contracts, type-safe shared types, and UI skin engine hardening.

## Problem Statement

The `.plans/` directory contains 13 `new-platform-capability-*` plan directories that have been marked `VERIFIED` or `DISCOVERED` without real code or measured output:

- **Capability 4**: Has legitimate implementation in `apps/gate` — accepted as VERIFIED
- **Capabilities 5-8, 10-13**: Marked VERIFIED without product code — empty plan templates, BACKLOG updates only, or trivial theme.css edits
- **Capability 9**: Not listed in BACKLOG.md
- **Capability 12**: Has duplicate directories (`...-12` and `...-12-new-platform-capability`)

The `evolve-loop-guard` plan (20261104-175034) exists to guard against this pattern but does not resolve existing entries. Additionally, 12 of 13 capabilities have `DISCOVERED` or `VERIFIED` status that cannot be substantiated through quality gates (`pnpm typecheck`, `pnpm lint:arch`, `pnpm ui:contrast` all fail or are unverified).

## Expected Outcomes

- **13 capability plans resolved**: Each directory either contains real implementations verified through quality gates, or is documented as empty/skipped with explicit rationale
- **`@allah/sdk` fully typed**: Every method has explicit TypeScript return types, JSDoc contracts, and `ApiResponse<T>` shapes
- **`@moonwitness/types` canonical types**: Exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SkinConfig`, and `SdkError` hierarchy used consistently across all packages
- **`@moonwitness/ui` skin recipe enforcement**: Components accept `data-moonframe-skin`, enforce `ICON_PURITY`/`PALETTE_PURITY`, source colours from tokens only
- **Quality gate enforcement**: All new capabilities must pass `pnpm docs:check` (100/100), `pnpm typecheck`, `pnpm lint:arch`, `pnpm ui:test`, `pnpm ui:contrast`
- **`evolve-loop-guard` updated**: AUTONOMOUS.md section 8 prevents future empty VERIFIED claims
- **BACKLOG.md statuses corrected**: Capability statuses updated from DISCOVERED/VERIFIED to appropriate states based on actual implementation status

## Functional Requirements

1. **SDK Method Contracts** — Every exported method in `@allah/sdk` must have:
   - Explicit TypeScript return types (never `any`)
   - Documented request/response shapes with JSDoc
   - Error type hierarchy with `SdkError` base and specific subclasses
   - SSE/event stream contracts where applicable
   - Integration with `@moonwitness/types` canonical types

2. **Type System Foundation** — `@moonwitness/types` must export:
   - `TenantId` (SHA-256 content-addressed, derived from principal)
   - `SkinId` (one of: `imperium-lumen`, `lunar-chronicles`, `rocksoil`, `nexus-paradox`, `riot-anarchy`, `mycelium`)
   - `ApiResponse<T>` generic wrapper with `data`, `error`, `metadata`
   - `SkinConfig` token for route-specific skin scoping
   - `SdkError` base and subclass hierarchy

3. **UI Component Skin Recipes** — `@moonwitness/ui` components must:
   - Accept a `data-moonframe-skin` attribute for world assignment
   - Not paint with Tailwind palette hues directly (`PALETTE_PURITY`)
   - Source all colour from component variants or token-driven utilities
   - Use only design-system `Icon` component (`ICON_PURITY`)

4. **Platform Primitives** — Shared foundations across all apps:
   - `resolveEcosystemEndpoints` with proper `NEXT_PUBLIC_*` guard (hyphenated names cannot enter)
   - `SkinRoot` provider with per-route skin scoping via `SkinScope`
   - Parameterized SQL queries only, with column/sort identifier allowlist
   - Default-deny auth: every hub route needs verified principal

5. **Capability Resolution and Plan Cleanup** — All 13 `new-platform-capability-*` directories must be resolved:
   - Either contain real implementations passing all quality gates
   - Or be documented as empty/skipped with explicit rationale in `report.md`
   - Duplicate directories (capability 12) cleaned up, keeping one version
   - BACKLOG.md statuses updated accordingly

## Non-Functional Requirements

- **Modularity**: No package may import from another package outside its defined boundary. `@allah/sdk` may import from `@moonwitness/types` and `@moonwitness/ui` only; apps may import from all three shared packages.
- **Strong typing**: Zero `any` types in public API surfaces. Full TypeScript strict mode compliance.
- **Backward compatibility**: New SDK methods must not break existing integrations. Versioned exports with deprecation path.
- **Performance**: SDK method calls must not introduce measurable overhead (>5ms per call) as measured in CI.
- **Observability**: Every SDK method must emit a structured trace event with `method`, `status`, `duration_ms`, and `tenant_id`.

## Scope

### In Scope

- Full rewrite of `@allah/sdk/src/index.ts` with typed method contracts and JSDoc
- Expansion of `@moonwitness/types/src/index.ts` with canonical type definitions (TenantId, SkinId, ApiResponse, SdkError hierarchy, SkinConfig)
- UI component contracts in `@moonwitness/ui/src/components/` with explicit skin recipe patterns (7 core components)
- Platform primitive functions in appropriate existing packages (`resolveEcosystemEndpoints`, `SkinRoot`/`SkinScope`, SSRF guard)
- All 13 `new-platform-capability-*` plan directories resolved (implemented or documented as empty/skipped)
- BACKLOG.md status updates for all capabilities
- AUTONOMOUS.md section 8 update (evolve-loop-guard) to prevent future empty VERIFIED claims
- Quality gate enhancements (docs:check, typecheck, lint:arch, ui:test, ui:contrast)
- Documentation updates per `DOCUMENTATION_CONTRACT.md`

### Out of Scope

- Runtime skin selector / CSS token implementation (marked pending in Six Master DNA plan)
- Replacing Base UI or migrating to Radix
- Refactoring Dock, Headquarter, or ID application layouts
- New font, image, audio, shader, or 3D dependencies
- Production deployment or merging into dev/main
- Any changes to existing app route handlers or page components outside the four plan documents
- New third-party icon libraries beyond `lucide-react` and the design-system `Icon` component

## User Stories

1. **As a developer**, I want `@allah/sdk` methods to have explicit typed contracts so I can type-safe-ly call SDK methods without guessing parameter shapes or return types.

2. **As a developer**, I want `@moonwitness/types` to provide canonical type definitions (TenantId, SkinId, etc.) so that all packages and apps share the same type foundation.

3. **As a developer**, I want `@moonwitness/ui` components to enforce skin recipes so that I can assign a world skin via `data-moonframe-skin` without arbitrary Tailwind overrides.

4. **As a CI system**, I want all new capabilities to pass `pnpm docs:check`, `pnpm typecheck`, and `pnpm lint:arch` so that unverifiable VERIFIED claims are caught before merge.

5. **As a maintainer**, I want the 13 `new-platform-capability-*` plan directories to be either populated with real implementations or cleaned up with documented rationale.

6. **As a platform architect**, I want the `evolve-loop-guard` to prevent future empty VERIFIED claims so that the planning system remains trustworthy.

7. **As a contributor**, I want BACKLOG.md capability statuses to be accurate so I can make informed decisions about which plans to pursue.

## Dependencies and Constraints

- **Depends on**: Existing `DOCUMENTATION_CONTRACT.md`, `AGENTS.md`, `BLUEPRINT.md` conventions; `20261105-1000-platform-foundations-sdk-enhancement` plan for reference architecture
- **Constrained by**: MoonWitness ecosystem invariants (storage: SHA-256 content-addressed, SQL: parameterized values only, Auth: default-deny, Tenant: `company_id` on every row, ORM: `@allah/arsy-embed` only, Audit: append-only events, Global admin: server-authorized, Style source: `packages/ui/src/theme.css`, Markup colour: no Tailwind palette hues, Icon source: `packages/ui/src/components/icon.tsx` only, Landmark purity: skip-link belongs to `RouteShell`, Client secrets: no `NEXT_PUBLIC_*` keys in `use client` files, Composition blocks: composed from `packages/ui/src/blocks/`, Route states: `error.tsx`/`loading.tsx`/`not-found.tsx` from `StatePanel`, Skin ownership: each app declares valid `SkinRoot`, Retain: fail-closed on `legal_hold`/`retention_until`, SSRF: validate `base_url` before request)
- **Requires**: `pnpm` workspace setup, TypeScript strict mode, Tailwind v4, `antislop-ui`, `antislop-code`
- **Conflicts with**: The 13 existing `new-platform-capability-*` plans that are marked VERIFIED without evidence — these must be resolved (implemented or documented) before this plan is complete

## Acceptance Criteria

- [ ] `@allah/sdk/src/index.ts` exports typed methods with full JSDoc contracts, error types, and SSE event schemas where applicable
- [ ] `@moonwitness/types/src/index.ts` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` hierarchy, and `SkinConfig` types
- [ ] `@moonwitness/ui` components enforce `data-moonframe-skin` skin recipe pattern and `ICON_PURITY`/`PALETTE_PURITY` lint rules
- [ ] `pnpm docs:check` passes 100/100 on the monorepo
- [ ] `pnpm typecheck` passes all packages (ui, dock, headquarter, id, jizz, gate, sdk, arsy-orm, lint, types)
- [ ] `pnpm lint:arch` passes all arch invariants
- [ ] `pnpm ui:test` passes design system component and skin contracts
- [ ] `pnpm ui:contrast` passes measured WCAG ratios for every skin's token pairs
- [ ] All 13 `new-platform-capability-*` plan directories are resolved (implemented or documented as empty/skipped with rationale)
- [ ] BACKLOG.md capability statuses updated to reflect actual implementation status
- [ ] `evolve-loop-guard` in AUTONOMOUS.md updated to prevent future empty VERIFIED claims
- [ ] No new `any` types in public API surfaces

## Success Metrics

- **Code quality**: 100% pass on `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch`
- **SDK coverage**: 100% of `@allah/sdk` methods have explicit TypeScript return types and JSDoc contracts
- **Type system**: All packages import and use `@moonwitness/types` canonical types without `any`
- **UI compliance**: `@moonwitness/ui` components pass `antislop-ui` and design-system contract checks
- **Capability resolution**: 0 empty VERIFIED capability plans remaining in `.plans/` (resolved or cleaned up with documented rationale)
- **Evolve loop guard**: AUTONOMOUS.md section 8 updated with guardrails preventing future empty VERIFIED claims