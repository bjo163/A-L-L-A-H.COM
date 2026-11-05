# Spec — Platform Foundations & SDK Enhancement

## Objective

Concrete specification and implementation of platform foundations and SDK enhancements to replace the pattern of "new-platform-capability" plans that have been marked VERIFIED without real code or measured output. This plan establishes authoritative foundations for the `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`, and shared platform primitives that can be verified through quality gates.

## Problem Statement

The `.plans/` directory contains 13 "new-platform-capability" entries (capability-4 through capability-13) that have been marked VERIFIED without substantive product changes. Each added only empty plan templates, a BACKLOG update, or trivial theme.css edits — none implemented actual capabilities. The `evolve-loop-guard` plan exists specifically to guard against this pattern, but the root issue remains: platform foundations and SDK contracts are underspecified, leading to unverifiable claims and duplicated ad-hoc implementations across apps.

## Expected Outcomes

- **Concrete SDK contract**: `@allah/sdk` index.ts fully typed with explicit method signatures, request/response contracts, and error types
- **Type-safe shared contracts**: `@moonwitness/types` provides canonical type definitions used consistently across all packages and apps
- **UI skin engine hardening**: `@moonwitness/ui` components with explicit skin recipe contracts, no arbitrary Tailwind variants, and enforced `ICON_PURITY` / `PALETTE_PURITY` invariants
- **Verification-ready specifications**: Each capability has a spec.md + design.md + task.md + rule.md package that passes `pnpm docs:check`, `pnpm typecheck`, and `pnpm lint:arch`
- **Eliminated empty capability templates**: The 13 capability-* plan directories either contain real implementations or are cleaned up with documented rationale

## Functional Requirements

1. **SDK Method Contracts** — Every exported method in `@allah/sdk` must have:
   - Explicit TypeScript return types (never `any`)
   - Documented request/response shapes
   - Error type hierarchy with `SdkError` base and specific subclasses
   - SSE/event stream contracts where applicable

2. **Type System Foundation** — `@moonwitness/types` must export:
   - `TenantId` (SHA-256 content-addressed, derived from principal)
   - `SkinId` (one of: `imperium-lumen`, `lunar-chronicles`, `rocksoil`, `nexus-paradox`, `riot-anarchy`, `mycelium`)
   - `ApiResponse<T>` generic wrapper with `data`, `error`, `metadata`
   - `SkinConfig` token for route-specific skin scoping

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

5. **Verification Pipeline** — All new capabilities must pass:
   - `pnpm docs:check` (100/100)
   - `pnpm lint:arch` (arch invariants)
   - `pnpm typecheck` (TS strict in packages/ui, dock, headquarter, id, jizz, gate)
   - `pnpm ui:test` (design system component and skin contracts)
   - `pnpm ui:contrast` (WCAG ratios for every skin's token pairs)

## Non-Functional Requirements

- **Modularity**: No package may import from another package outside its defined boundary. `@allah/sdk` may import from `@moonwitness/types` and `@moonwitness/ui` only; apps may import from all three shared packages.
- **Strong typing**: Zero `any` types in public API surfaces. Full TypeScript strict mode compliance.
- **Backward compatibility**: New SDK methods must not break existing integrations. Versioned exports with deprecation path.
- **Performance**: SDK method calls must not introduce measurable overhead (>5ms per call) as measured in CI.
- **Observability**: Every SDK method must emit a structured trace event with `method`, `status`, `duration_ms`, and `tenant_id`.

## Scope

### In Scope

- Full rewrite of `@allah/sdk/src/index.ts` with typed method contracts
- Expansion of `@moonwitness/types/src/index.ts` with canonical type definitions
- UI component contracts in `@moonwitness/ui/src/components/` with explicit skin recipe patterns
- Platform primitive functions in a new `packages/platform/` directory (or appropriate existing location)
- Verification scripts and quality gate enhancements
- Documentation updates per `DOCUMENTATION_CONTRACT.md`

### Out of Scope

- Runtime skin selector / CSS token implementation (marked pending in Six Master DNA plan)
- Replacing Base UI or migrating to Radix
- Refactoring Dock, Headquarter, or ID application layouts
- New font, image, audio, shader, or 3D dependencies
- Production deployment or merging into dev/main
- Any changes to existing app route handlers or page components

## User Stories

1. **As a developer**, I want `@allah/sdk` methods to have explicit typed contracts so I can type-safe-ly call SDK methods without guessing parameter shapes or return types.

2. **As a developer**, I want `@moonwitness/types` to provide canonical type definitions (TenantId, SkinId, etc.) so that all packages and apps share the same type foundation.

3. **As a developer**, I want `@moonwitness/ui` components to enforce skin recipes so that I can assign a world skin via `data-moonframe-skin` without arbitrary Tailwind overrides.

4. **As a CI system**, I want all new capabilities to pass `pnpm docs:check`, `pnpm typecheck`, and `pnpm lint:arch` so that unverifiable VERIFIED claims are caught before merge.

5. **As a maintainer**, I want the 13 empty `new-platform-capability-*` plan directories to be either populated with real implementations or cleaned up with documented rationale.

## Dependencies and Constraints

- **Depends on**: Existing `DOCUMENTATION_CONTRACT.md`, `AGENTS.md`, `BLUEPRINT.md` conventions
- **Constrained by**: MoonWitness ecosystem invariants (storage, SQL, auth, tenant, ORM, audit, global admin, style source, markup colour, icon source, landmark purity, client secrets, composition blocks, route states, skin ownership, retention, SSRF)
- **Requires**: `pnpm` workspace setup, TypeScript strict mode, Tailwind v4
- **Conflicts with**: The 13 existing `new-platform-capability-*` plans that are marked VERIFIED without evidence — these must be resolved (either implemented or documented as empty/skipped) before this plan is considered complete

## Acceptance Criteria

- [ ] `@allah/sdk/src/index.ts` exports typed methods with full JSDoc contracts, error types, and SSE event schemas where applicable
- [ ] `@moonwitness/types/src/index.ts` exports `TenantId`, `SkinId`, `ApiResponse<T>`, and `SkinConfig` types
- [ ] `@moonwitness/ui` components enforce `data-moonframe-skin` skin recipe pattern and `ICON_PURITY`/`PALETTE_PURITY` lint rules
- [ ] `pnpm docs:check` passes 100/100 on the monorepo
- [ ] `pnpm typecheck` passes all packages (ui, dock, headquarter, id, jizz, gate, sdk, arsy-orm, lint, types)
- [ ] `pnpm lint:arch` passes all arch invariants
- [ ] `pnpm ui:test` passes design system component and skin contracts
- [ ] `pnpm ui:contrast` passes measured WCAG ratios for every skin's token pairs
- [ ] All 13 `new-platform-capability-*` plan directories are resolved (implemented or documented as empty/skipped with rationale)
- [ ] No new `any` types in public API surfaces

## Success Metrics

- **Code quality**: 100% pass on `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch`
- **SDK coverage**: 100% of `@allah/sdk` methods have explicit TypeScript return types and JSDoc contracts
- **Type system**: All packages import and use `@moonwitness/types` canonical types without `any`
- **UI compliance**: `@moonwitness/ui` components pass `antislop-ui` and design-system contract checks
- **Capability resolution**: 0 empty VERIFIED capability plans remaining in `.plans/` (resolved or cleaned up)