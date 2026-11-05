# Spec: SDK Method Contract Completion & Types Package Enhancement

## Status
`proposed`

## Overview
This feature completes the architectural contracts between `@allah/sdk` and `@moonwitness/types` packages, establishing explicit method contracts, return types, and type hierarchies that enable all other features in the A-L-L-A.H.COM monorepo. The `@allah/sdk` and `@moonwitness/types` packages are foundational to every application (dock, headquarter, id, jizz, gate, harbor, sentinel), yet their actual implementation lags behind the existing 13 "new-platform-capability" plans marked VERIFIED without code. This spec closes that gap while addressing the `evolve-loop-guard` concern.

## Problem Statement
The `@allah/sdk` package provides cross-app session handling, device pairing, and swarm orchestration methods, but lacks:
- Explicit return type definitions for all public methods
- Proper JSDoc contracts with `@param` and `@returns` tags
- `ApiResponse<T>` wrapper for consistent error/success handling
- `SdkError` hierarchy for structured error reporting
- `principal()` method for principal derivation from auth context
- `tenantId` type for multi-tenant isolation
- `skinId` type for skin selection

The `@moonwitness/types` package similarly lacks:
- `TenantId` type for company_id derivation
- `SkinId` type for the six approved skin definitions
- `ApiResponse<T>` generic for API contract consistency
- `SdkError` union type for error classification
- Proper type hierarchies for auth context and session data

This gap means 13 platform capability plans are marked VERIFIED without actual implementation code, and downstream features (skin switching, agent operations, observability flows) cannot be properly typed or tested.

## Objectives
1. Complete `@moonwitness/types` type definitions with `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError`
2. Complete `@allah/sdk` method contracts with explicit return types and JSDoc
3. Add `principal()` method for principal derivation from auth context
4. Add `resolveEcosystemEndpoints()` SSRF-safe platform primitive
5. Ensure all type definitions integrate with existing MoonWitness invariants
6. Enable all downstream features through proper typing

## Functional Requirements
- **FR-1**: `@moonwitness/types` exports `TenantId` type (string matching company_id pattern)
- **FR-2**: `@moonwitness/types` exports `SkinId` type (union of 6 approved skin IDs)
- **FR-3**: `@moonwitness/types` exports `ApiResponse<T>` generic type with `data`, `error`, `success` fields
- **FR-4**: `@moonwitness/types` exports `SdkError` union type with network, validation, auth, and server variants
- **FR-5**: `@allah/sdk` exports `principal()` method returning `Principal` type from arsy-core
- **FR-6**: `@allah/sdk` exports `resolveEcosystemEndpoints(baseUrl: string): EcosystemEndpoints` with SSRF validation
- **FR-7**: All new types pass strict TypeScript typecheck with zero errors
- **FR-8**: All new methods have complete JSDoc contracts (`@param`, `@returns`, `@throws`)

## Non-Functional Requirements
- **NFR-1**: All TypeScript must pass `pnpm typecheck` with zero errors across all packages
- **NFR-2**: Architecture lint (`pnpm lint:arch`) passes with 0 violations
- **NFR-3**: Documentation contracts (`pnpm docs:check`) at 100/100
- **NFR-4**: No new raw HTML elements in any package code
- **NFR-5**: All new code follows `@moonwitness/ui` component patterns where applicable
- **NFR-6**: Zero database migration downtime; all changes are idempotent
- **NFR-7**: `resolveEcosystemEndpoints` must perform SSRF validation (reject private/loopback addresses)

## Scope

### In-Scope
- `@moonwitness/types` type definitions: `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError`
- `@allah/sdk` method contracts with explicit return types and JSDoc
- `principal()` method for principal derivation
- `resolveEcosystemEndpoints()` SSRF-safe platform primitive
- Type integration with `@allah/arsy-orm` and `@moonwitness/ui`
- Documentation updates for new types and methods

### Out-of-Scope
- Changing existing type definitions (only adding new ones)
- Modifying `@better-auth/core` integration
- Database schema changes beyond type additions
- Frontend UI components (these go through `@moonwitness/ui`)
- Performance optimizations beyond type scaffolding

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
- `resolveEcosystemEndpoints` must reject private/loopback addresses (10.x, 192.168.x, 172.16-31.x, ::1, fe80::, localhost)

### Ecosystem and Roadmap Alignment
- Aligns with MoonWitness vision of "six worlds, one engine"
- Enables all 13 "new-platform-capability" plans currently marked VERIFIED without code
- Supports the existing skin system via `SkinId` type
- Consistent with the MoonFrame Six DNA architecture pattern
- No conflict with existing quality gates (docs:check, lint:arch, typecheck)

## Acceptance Criteria
- `@moonwitness/types` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` types
- `@allah/sdk` exports `principal()` and `resolveEcosystemEndpoints()` methods with full JSDoc
- All new types pass `pnpm typecheck` with zero errors across all packages
- `pnpm lint:arch` passes with 0 violations
- `pnpm docs:check` passes at 100/100
- `resolveEcosystemEndpoints` performs SSRF validation and rejects private addresses
- Principal derivation from auth context works correctly
- All 13 previously-empty capability plans can now reference proper types

## Success Metrics
- **Type Safety**: 0 TypeScript errors across all packages after changes
- **Integration**: All 7 apps (dock, headquarter, id, jizz, gate, harbor, sentinel) build successfully
- **Downstream Enablement**: 13 previously-empty plans now have concrete type references
- **SSRF Safety**: `resolveEcosystemEndpoints` correctly rejects all private/loopback addresses
- **Error Handling**: `SdkError` properly classifies all error paths
- **Bundle Impact**: < 2KB increase in gzip-compressed JavaScript size for type additions only
