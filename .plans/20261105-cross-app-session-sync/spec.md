# Spec: Cross-Application Session & State Synchronization

## Status
`proposed`

## Overview
This feature implements cross-application session and state synchronization across all 7 applications in the A-L-L-A.H.COM monorepo (dock, headquarter, id, jizz, gate, harbor, sentinel). The architecture enables consistent authentication state, user preferences, and UI state synchronization using `@allah/sdk` and `@moonwitness/types` packages, with proper type contracts and SSRF-safe endpoint resolution. This eliminates the current fragmented state where each application manages authentication and user state independently, creating blind spots in cross-application user experience and requiring duplicate implementation of common auth patterns.

## Problem Statement
- **Fragmented authentication state**: Each application independently manages user session state, leading to inconsistent UI behavior when navigating between apps
- **No shared user preferences**: User preferences (skin selection, theme, layout) must be re-implemented in each app
- **Duplicate session management**: Session creation, revocation, and renewal logic is duplicated across 7 applications
- **Inconsistent principal derivation**: Each app derives the authenticated principal differently, causing type mismatches and runtime errors
- **No centralized endpoint resolution**: Application-specific URL construction lacks SSRF validation, creating security risks
- **13 platform capability plans marked VERIFIED without code**: The SDK and types gaps prevent implementation of downstream features including skin switching, agent operations, and observability flows

## Objectives and Expected Outcomes
1. **Unified authentication state**: Single source of truth for user session across all apps, propagated via `@allah/sdk`
2. **Shared user preferences**: Skin selection, language, and layout preferences synchronized across all applications
3. **Consistent principal derivation**: Typed `principal()` method in `@allah/sdk` provides authenticated principal from auth context
4. **SSRF-safe endpoint resolution**: `resolveEcosystemEndpoints()` validates all URLs against private/loopback address ranges
5. **Enable downstream features**: All 13 previously-empty "new-platform-capability" plans now have concrete type references and can be implemented
6. **Type-safe cross-app operations**: All SDK methods have complete JSDoc contracts with `@param`, `@returns`, `@throws`

## Functional Requirements
- **FR-1**: `@allah/sdk` exports `principal()` method returning typed `Principal` from arsy-core auth context
- **FR-2**: `@allah/sdk` exports `resolveEcosystemEndpoints(baseUrl: string): EcosystemEndpoints` with SSRF validation
- **FR-3**: `@allah/sdk` exports `setUserPreference(key: string, value: any): Promise<void>` for preference synchronization
- **FR-4**: `@allah/sdk` exports `getUserPreference(key: string): Promise<any>` for preference retrieval
- **FR-5**: `@moonwitness/types` exports `SkinId` type (union of 6 approved skin IDs for moon, sun, star, snow, ocean, lava themes)
- **FR-6**: `@moonwitness/types` exports `TenantId` type (string matching company_id pattern with negative/positive semantics)
- **FR-7**: `@moonwitness/types` exports `ApiResponse<T>` generic type with `data`, `error`, `success` fields and `SdkError` union type
- **FR-8**: All SDK methods have complete JSDoc contracts (`@param`, `@returns`, `@throws`)

## Non-Functional Requirements
- **NFR-1**: All TypeScript must pass `pnpm typecheck` with zero errors across all packages and apps
- **NFR-2**: Architecture lint (`pnpm lint:arch`) passes with 0 violations
- **NFR-3**: Documentation contracts (`pnpm docs:check`) at 100/100
- **NFR-4**: No new raw HTML elements in any package code
- **NFR-5**: All new code follows `@moonwitness/ui` component patterns where applicable
- **NFR-6**: Zero database migration downtime; all changes are idempotent
- **NFR-7**: `resolveEcosystemEndpoints` must perform SSRF validation (reject private/loopback addresses: 10.x, 192.168.x, 172.16-31.x, ::1, fe80::, localhost)
- **NFR-8**: Preference synchronization is async and best-effort; failure must not block request processing

## Scope

### In-Scope
- `@allah/sdk` method contracts: `principal()`, `resolveEcosystemEndpoints()`, `setUserPreference()`, `getUserPreference()`
- `@moonwitness/types` type enhancements: `SkinId`, `TenantId`, `ApiResponse<T>`, `SdkError`
- Cross-application session synchronization via SDK
- User preference persistence and propagation across 7 apps
- SSRF validation in endpoint resolution
- Type integration with `@allah/arsy-orm` and `@moonwitness/ui`
- Documentation updates for new types and methods

### Out-of-Scope
- Changing existing type definitions (only adding new ones)
- Modifying `@better-auth/core` integration
- Database schema changes beyond type additions
- Frontend UI components (these go through `@moonwitness/ui`)
- Performance optimizations beyond type scaffolding
- Building dashboards or visualization interfaces

## User Stories & Use Cases

### US-1: Agent Operation Typing
**Actor**: Autonomous coding agent
**Goal**: Type-safe execution of agent operations across all apps
**Scenario**:
1. Agent calls `sdk.principal()` to get authenticated principal
2. Agent calls `sdk.resolveEcosystemEndpoints(baseUrl)` to get validated endpoints
3. Agent uses typed return values with proper error handling via `ApiResponse<T>`
4. Agent's operations are type-safe across dock, headquarter, id, jizz apps

### US-2: Skin Preference Integration
**Actor**: User switching skins across apps
**Goal**: Type-safe skin preference propagation
**Scenario**:
1. User selects skin via UI, SDK provides typed `SkinId`
2. All apps receive properly typed skin preference
3. Type system prevents invalid skin ID usage
4. Skin selector components use `SkinId` from types package

### US-3: Multi-Tenant Operations
**Actor**: Superuser managing tenants
**Goal**: Type-safe tenant isolation operations
**Scenario**:
1. Operations derive `TenantId` from principal
2. Storage queries use typed `company_id` as `TenantId`
3. Cross-tenant access is type-safe enforced
4. Audit events include properly typed tenant references

### US-4: Cross-Application Navigation
**Actor**: User navigating between apps
**Goal**: Consistent authentication state across app boundaries
**Scenario**:
1. User authenticates in one app, state propagates to all other apps
2. Skin preference persists when navigating between apps
3. User remains logged in across app switch without re-authentication
4. Session revocation in one app propagates to all others

## Dependencies and Constraints

### Dependencies
- `@allah/arsy-orm` - ORM layer with PGlite embedded database
- `@moonwitness/ui` - UI component system with skin tokens
- `@moonwitness/types` - Shared data contracts (to be enhanced)
- `@better-auth/core` - Better Auth core (v1.7.16)
- Node.js built-in `crypto` for SSRF validation

### Constraints
- Must preserve `STYLE_PURITY` - no raw HTML elements in apps
- Must preserve `PALETTE_PURITY` - no Tailwind palette hues in app JSX
- Must preserve `ICON_PURITY` - only `@moonwitness/ui` Icon component
- Must preserve `LANDMARK_PURITY` - skip-link `id="main-content"` belongs to `RouteShell`
- Must preserve `NO_PUBLIC_CLIENT_SECRETS` - no `NEXT_PUBLIC_*` secrets in `'use client'` files
- All `tsconfig.json` must extend `tsconfig.base.json`
- Fail-closed on `legal_hold` / `retention_until`
- `resolveEcosystemEndpoints` must reject private/loopback addresses

### Ecosystem and Roadmap Alignment
- Aligns with MoonWitness vision of "six worlds, one engine"
- Enables all 13 "new-platform-capability" plans currently marked VERIFIED without code
- Supports the existing skin system via `SkinId` type
- Consistent with the MoonFrame Six DNA architecture pattern
- No conflict with existing quality gates (docs:check, lint:arch, typecheck)

## Acceptance Criteria
- `@moonwitness/types` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` types
- `@allah/sdk` exports `principal()`, `resolveEcosystemEndpoints()`, `setUserPreference()`, `getUserPreference()` methods with full JSDoc
- All new types pass `pnpm typecheck` with zero errors across all packages
- `pnpm lint:arch` passes with 0 violations
- `pnpm docs:check` passes at 100/100
- `resolveEcosystemEndpoints` performs SSRF validation and rejects private addresses
- Principal derivation from auth context works correctly
- All 13 previously-empty capability plans now have concrete type references
- Cross-application session synchronization works across dock, headquarter, id, jizz, gate, harbor, sentinel

## Success Metrics
- **Type Safety**: 0 TypeScript errors across all packages after changes
- **Integration**: All 7 apps (dock, headquarter, id, jizz, gate, harbor, sentinel) build successfully
- **Downstream Enablement**: 13 previously-empty plans now have concrete type references
- **SSRF Safety**: `resolveEcosystemEndpoints` correctly rejects all private/loopback addresses
- **Error Handling**: `SdkError` properly classifies all error paths
- **Bundle Impact**: < 2KB increase in gzip-compressed JavaScript size for type additions only