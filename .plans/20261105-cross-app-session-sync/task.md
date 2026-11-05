# Task Checklist: Cross-Application Session & State Synchronization

## Phase 1: Types Package Enhancement (Weeks 1-3)
- [ ] Add `TenantId` type to `@moonwitness/types` with company_id pattern validation
- [ ] Add `SkinId` type to `@moonwitness/types` as union of 6 approved skin IDs
- [ ] Add `ApiResponse<T>` generic type to `@moonwitness/types`
- [ ] Add `SdkError` union type to `@moonwitness/types`
- [ ] Update `@moonwitness/types` index.ts export barrel with new types
- [ ] Write type tests for all new types in `@moonwitness/types`
- [ ] Ensure all tsconfig extends tsconfig.base.json (per R1 invariant)
- [ ] Run `pnpm typecheck` across all packages and verify zero errors

## Phase 2: SDK Method Contracts (Weeks 2-4)
- [ ] Add `principal()` method to `@allah/sdk` with full JSDoc (@param, @returns, @throws)
- [ ] Add `resolveEcosystemEndpoints()` method to `@allah/sdk` with SSRF validation and full JSDoc
- [ ] Add `setUserPreference()` method to `@allah/sdk` with full JSDoc
- [ ] Add `getUserPreference()` method to `@allah/sdk` with full JSDoc
- [ ] Update `@allah/sdk` index.ts export barrel with new methods
- [ ] Write unit tests for all new SDK methods
- [ ] Ensure all new types pass strict TypeScript typecheck with zero errors
- [ ] Update `pnpm extension:test` to include SDK method tests

## Phase 3: SSRF Validation Implementation (Weeks 3-4)
- [ ] Implement `resolveEcosystemEndpoints()` SSRF validation logic
- [ ] Validate against private/loopback address ranges:
  - 10.0.0.0/10
  - 192.168.0.0/16
  - 172.16.0.0/12
  - ::1 (loopback)
  - fe80::/10 (link-local)
  - localhost
- [ ] Return `EcosystemEndpoints` with all 7 app URLs on success
- [ ] Throw `SdkError.NETWORK_ERROR` on invalid URLs with detail message
- [ ] Cache resolution results for subsequent calls
- [ ] Test SSRF validation against all private address ranges

## Phase 4: Application Integration (Weeks 4-6)
- [ ] Integrate SDK in `apps/dock` - initialize on startup, add SDK methods to lib
- [ ] Integrate SDK in `apps/headquarter` - initialize on startup, add SDK methods to lib
- [ ] Integrate SDK in `apps/id` - initialize on startup, add SDK methods to lib (SSO context)
- [ ] Integrate SDK in `apps/jizz` - initialize on startup, add SDK methods to lib
- [ ] Integrate SDK in `apps/gate` - initialize on startup, add SDK methods to lib (RADIUS context)
- [ ] Integrate SDK in `apps/harbor` - initialize on startup, add SDK methods to lib (E-ISP portal)
- [ ] Integrate SDK in `apps/sentinel` - initialize on startup, add SDK methods to lib (RADIUS daemon)
- [ ] Add SDK initialization to each app's module loading
- [ ] Verify each app builds successfully with `pnpm build` per app
- [ ] Test cross-app session propagation between all 7 apps

## Phase 5: Documentation & Quality Gates (Weeks 6-7)
- [ ] Update `scripts/check-doc-contracts.ts` if threshold adjustment needed
- [ ] Ensure `pnpm docs:check` passes at 100/100
- [ ] Verify `pnpm lint:arch` passes with 0 violations
- [ ] Verify `pnpm lint` passes with 0 ESLint errors
- [ ] Update Husky `.husky/pre-commit` to include SDK type checks
- [ ] Update Husky `.husky/pre-push` with SDK build steps
- [ ] Run full quality gate: `pnpm dev` (lint:arch && typecheck && concurrently dev servers)
- [ ] Generate documentation for new types and SDK methods
- [ ] Update package READMEs with new SDK and types usage

## Phase 6: Downstream Plan Enablement (Weeks 7-8)
- [ ] Update all 13 previously-empty "new-platform-capability" plans to reference proper type imports
- [ ] Verify each capability plan can now reference `SkinId`, `TenantId`, `ApiResponse`, `SdkError`, `principal()`, `resolveEcosystemEndpoints()`
- [ ] Update plan task checklists to reflect enabled capabilities
- [ ] Document which plans are now enabled by this feature
- [ ] Verify no plan conflicts or duplicate capabilities

## Dependencies & Execution Order

### Dependencies Between Phases
- Phase 2 (SDK methods) depends on Phase 1 (types) - needs new types from @moonwitness/types first
- Phase 3 (SSRF validation) runs in parallel with Phase 2 - independent implementation
- Phase 4 (app integration) depends on Phase 2-3 - needs SDK methods and SSRF logic first
- Phase 5 (documentation/quality) depends on Phase 2-4 - needs completed implementation first
- Phase 6 (plan enablement) depends on Phase 5 - needs verified types and SDK methods

### Parallelizable Workstreams
- Phase 1 type definitions can run independently of Phase 2-3 implementation
- Type tests for @moonwitness/types can run once Phase 1 starts
- SSRF validation implementation can run independently of app integration
- Unit SDK method tests can run once Phase 2 starts (may mock type dependencies)

### Required Files & Affected Modules
- `packages/types/src/index.ts` - Modified (add new type exports)
- `packages/types/src/tenant.ts` - New (TenantId type)
- `packages/types/src/skin.ts` - New (SkinId type)
- `packages/types/src/api-response.ts` - New (ApiResponse<T> + SdkError)
- `packages/types/index.test.ts` - Modified (add type tests)
- `packages/sdk/src/index.ts` - Modified (add new method exports)
- `packages/sdk/src/principal.ts` - New (principal() method)
- `packages/sdk/src/endpoints.ts` - New (resolveEcosystemEndpoints() method)
- `packages/sdk/src/preferences.ts` - New (setUserPreference() + getUserPreference())
- `packages/sdk/index.test.ts` - Modified (add SDK method tests)
- `apps/dock/src/lib/sdk-init.ts` - New (SDK initialization)
- `apps/headquarter/src/lib/sdk-init.ts` - New (SDK initialization)
- `apps/id/src/lib/sdk-init.ts` - New (SDK initialization with SSO)
- `apps/jizz/src/lib/sdk-init.ts` - New (SDK initialization)
- `apps/gate/src/lib/sdk-init.ts` - New (SDK initialization for RADIUS)
- `apps/harbor/src/lib/sdk-init.ts` - New (SDK initialization for E-ISP)
- `apps/sentinel/src/lib/sdk-init.ts` - New (SDK initialization for daemon)
- `.husky/pre-commit` - Modified (add typecheck)
- `.husky/pre-push` - Modified (add build steps)

## Testing & Validation Procedures

### Unit Tests
- `TenantId` type validation: valid company_id patterns, invalid patterns rejected
- `SkinId` type validation: valid skin IDs, invalid IDs rejected at compile time
- `ApiResponse<T>` type tests: success and error variants
- `SdkError` union type tests: all 8 error variants
- `principal()` method: authenticated principal return, null for unauthenticated
- `resolveEcosystemEndpoints()`: valid URL returns endpoints, invalid URL throws
- `setUserPreference()`: preference persistence, async completion
- `getUserPreference()`: preference retrieval, undefined for missing keys

### Integration Tests
- End-to-end session propagation across all 7 apps
- Preference synchronization: set in one app, get in all others
- SSRF validation: all private/loopback addresses rejected, valid URLs accepted
- Cross-app navigation: session state persists across app boundaries
- Typecheck: all packages and apps compile with zero errors

### Validation Commands
- `pnpm typecheck` - zero TS errors across all packages/apps
- `pnpm lint:arch` - zero violations
- `pnpm docs:check` - 100/100
- `pnpm lint` - zero ESLint errors
- `pnpm extension:test` - all SDK and type tests pass
- Manual: Verify SDK methods work across all 7 apps
- Manual: Verify SSRF validation blocks private addresses
- Manual: Verify preference sync across app boundaries

## Completion Checklist
- [ ] All four plan documents (spec.md, design.md, task.md, rules.md) created and synchronized
- [ ] `@moonwitness/types` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` types
- [ ] `@allah/sdk` exports `principal()`, `resolveEcosystemEndpoints()`, `setUserPreference()`, `getUserPreference()` methods with full JSDoc
- [ ] All new types pass `pnpm typecheck` with zero errors across all packages
- [ ] `pnpm lint:arch` passes with 0 violations
- [ ] `pnpm docs:check` passes at 100/100
- [ ] `resolveEcosystemEndpoints` performs SSRF validation and rejects private addresses
- [ ] Principal derivation from auth context works correctly
- [ ] All 7 apps (dock, headquarter, id, jizz, gate, harbor, sentinel) build successfully
- [ ] Cross-application session synchronization works across all apps
- [ ] All 13 previously-empty capability plans now have concrete type references
- [ ] No raw HTML elements in any package code
- [ ] SDK preference synchronization is async and best-effort
- [ ] Documentation generated and published to package registry