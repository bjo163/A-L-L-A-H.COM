# Task Checklist: SDK Method Contract Completion & Types Package Enhancement

## Phase 1: Types Package Enhancement (Weeks 1-2)
- [ ] Create `packages/types/src/tenantId.ts` with `TenantId` type definition
- [ ] Create `packages/types/src/skinId.ts` with `SkinId` type definition (union of 6 approved skin IDs)
- [ ] Create `packages/types/src/apiResponse.ts` with `ApiResponse<T>` generic type
- [ ] Create `packages/types/src/sdkError.ts` with `SdkError` hierarchy (Network, Validation, Auth, Server, Ssrf)
- [ ] Update `packages/types/src/index.ts` with new exports
- [ ] Verify `pnpm typecheck` passes with zero errors in types package
- [ ] Verify `pnpm lint:arch` passes with 0 violations
- [ ] Verify `pnpm docs:check` passes at 100/100

## Phase 2: SDK Method Contract Completion (Weeks 2-4)
- [ ] Create `packages/sdk/src/principal.ts` with `principal()` method and full JSDoc
- [ ] Create `packages/sdk/src/resolveEndpoints.ts` with `resolveEcosystemEndpoints()` method and SSRF validation
- [ ] Create `packages/sdk/src/trustedOrigin.ts` with `isTrustedOrigin()` method and JSDoc
- [ ] Update `packages/sdk/src/index.ts` with new method exports and complete JSDoc
- [ ] Verify `pnpm typecheck` passes with zero errors in sdk package
- [ ] Verify `pnpm lint:arch` passes with 0 violations
- [ ] Verify `pnpm docs:check` passes at 100/100

## Phase 3: Integration & Cross-Package Wiring (Weeks 4-5)
- [ ] Integrate `TenantId` into `@allah/arsy-orm` query builder for company_id filtering
- [ ] Integrate `SkinId` into `@moonwitness/ui` SkinRoot and skin selection components
- [ ] Integrate `ApiResponse<T>` as return type for SDK methods and API routes
- [ ] Integrate `SdkError` into error boundaries and error reporting
- [ ] Update all app Typescript types to use new types from `@moonwitness/types`
- [ ] Run `pnpm typecheck` across all packages and verify zero errors
- [ ] Update CI workflows to include typecheck for new packages

## Phase 4: Documentation & Quality Gates (Weeks 5-6)
- [ ] Update type documentation in `@moonwitness/types` README
- [ ] Update SDK method documentation in `@allah/sdk` README
- [ ] Ensure `pnpm docs:check` passes at 100/100
- [ ] Verify `pnpm lint:arch` passes with 0 violations
- [ ] Verify `pnpm lint` passes with 0 ESLint errors
- [ ] Update Husky `.husky/pre-commit` to include typecheck
- [ ] Update Husky `.husky/pre-push` with typecheck and build steps
- [ ] Run full quality gate: `pnpm dev` (lint:arch && typecheck && concurrently dev servers)

## Phase 5: Downstream Plan Enablement (Weeks 6-7)
- [ ] Verify 13 previously-empty "new-platform-capability" plans can reference proper types
- [ ] Update plan references to use new `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError`
- [ ] Verify skin switching plans use `SkinId` from types
- [ ] Verify agent operation plans use `principal()` and `resolveEcosystemEndpoints()`
- [ ] Verify tenant isolation plans use `TenantId` from types
- [ ] Document type integration in each plan's spec.md

## Dependencies and Execution Order

### Dependencies Between Phases
- Phase 1 (Types) must complete before Phase 2 (SDK) - SDK methods reference new types
- Phase 2 (SDK) can run in parallel with Phase 3 (Integration) for method implementation
- Phase 3 (Integration) depends on Phases 1-2 completing - needs types and methods available
- Phase 4 (Documentation) runs in parallel with Phases 2-3
- Phase 5 (Plan Enablement) is final phase that validates all preceding work and enables the 13 empty plans

### Parallelizable Workstreams
- Phase 1 type file creation can run independently of Phase 2-3 implementation
- Phase 2 method implementation can start once type definitions are drafted
- Phase 4 documentation can reference draft types and methods
- Phase 5 plan enablement waits for all prior phases to complete

### Required Files & Affected Modules
- `packages/types/src/tenantId.ts` - New
- `packages/types/src/skinId.ts` - New
- `packages/types/src/apiResponse.ts` - New
- `packages/types/src/sdkError.ts` - New
- `packages/types/src/index.ts` - Modified (add exports)
- `packages/sdk/src/principal.ts` - New
- `packages/sdk/src/resolveEndpoints.ts` - New
- `packages/sdk/src/trustedOrigin.ts` - New
- `packages/sdk/src/index.ts` - Modified (add exports and JSDoc)
- `packages/arsy-orm/src/query_builder.ts` - Modified (add TenantId integration)
- `packages/ui/src/skins/` - Modified (add SkinId integration)
- `packages/sdk/src/index.ts` - Primary export file (modified throughout)
- `.husky/pre-commit` - Modified
- `.husky/pre-push` - Modified
- `.github/workflows/ci-dev.yml` - Modified

## Testing and Validation Procedures

### Unit Tests
- `TenantId` type constraints and validation
- `SkinId` type accepts only 6 approved values, rejects others
- `ApiResponse<T>` generic type preserves T correctly
- `SdkError` hierarchy: each variant has correct code, message, structure
- `principal()` method returns correct Principal type
- `resolveEcosystemEndpoints()` SSRF validation edge cases
- `isTrustedOrigin()` origin validation

### Integration Tests
- End-to-end: principal() returns typed Principal from auth context
- End-to-end: resolveEcosystemEndpoints() produces valid endpoints for safe URLs
- End-to-end: ApiResponse<T> handling in SDK method call chains
- Cross-package: TenantId flows from auth → query builder → storage
- Cross-package: SkinId flows from types → UI SkinRoot → app rendering
- Cross-package: SdkError flows from SDK methods → error boundaries → logs

### Validation Commands
- `pnpm typecheck` - zero TS errors across all packages
- `pnpm lint:arch` - zero violations
- `pnpm docs:check` - 100/100
- `pnpm lint` - zero ESLint errors
- Manual: Verify `resolveEcosystemEndpoints("http://127.0.0.1")` throws SdkErrorSsrf
- Manual: Verify `resolveEcosystemEndpoints("http://192.168.1.1")` throws SdkErrorSsrf
- Manual: Verify `resolveEcosystemEndpoints("http://10.0.0.1")` throws SdkErrorSsrf
- Manual: Verify `resolveEcosystemEndpoints("http://[::1]")` throws SdkErrorSsrf
- Manual: Verify `principal()` returns typed Principal with correct fields

## Completion Checklist
- [ ] All four plan documents (spec.md, design.md, task.md, rules.md) created and synchronized
- [ ] `@moonwitness/types` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` types
- [ ] `@allah/sdk` exports `principal()`, `resolveEcosystemEndpoints()`, `isTrustedOrigin()` methods with full JSDoc
- [ ] `pnpm typecheck` passes with 0 errors across all packages
- [ ] `pnpm lint:arch` passes with 0 violations
- [ ] `pnpm docs:check` passes at 100/100
- [ ] `resolveEcosystemEndpoints` performs SSRF validation and rejects private/loopback addresses
- [ ] `principal()` returns typed Principal from auth context
- [ ] `ApiResponse<T>` properly typed and used across all SDK methods
- [ ] `SdkError` hierarchy properly classifies all error paths
- [ ] All 7 apps (dock, headquarter, id, jizz, gate, harbor, sentinel) build successfully
- [ ] Type integration with `@allah/arsy-orm` and `@moonwitness/ui` verified
- [ ] 13 previously-empty capability plans now have concrete type references
- [ ] No raw HTML elements in any new package code
- [ ] SDK methods follow STYLE_PURITY and PALETTE_PURITY invariants