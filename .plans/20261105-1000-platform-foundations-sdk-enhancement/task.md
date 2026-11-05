# Task — Platform Foundations & SDK Enhancement

## Implementation Phases

### Phase 1: Type Foundations (`@moonwitness/types`)
**Duration**: 2 days
**Goal**: Establish canonical type definitions used across all packages

- [ ] Export `TenantId` type with SHA-256 derivation documentation
- [ ] Export `SkinId` union type with all six world values
- [ ] Export `ApiResponse<T>` generic interface with `data`, `error`, `metadata`
- [ ] Export `SdkError` base type and all subclasses (`AuthenticationError`, `NotFoundError`, `ValidationError`, `ServerError`)
- [ ] Export `SkinConfig` interface with `skinId` and `persist` fields
- [ ] Export `Principal` interface with `company_id`, `tenant_id`, `skin_id`, `user_id`
- [ ] Update all packages to import types from `@moonwitness/types` instead of defining locally
- [ ] Run `pnpm typecheck` to verify no `any` types remain in public APIs
- [ ] Verify `pnpm lint:arch` passes with new type imports

### Phase 2: SDK Method Contracts (`@allah/sdk`)
**Duration**: 3 days
**Goal**: Fully typed SDK methods with JSDoc contracts and error types

- [ ] Rewrite `src/index.ts` with explicit typed method signatures
- [ ] Implement `principal(): Promise<Principal>` with full contract
- [ ] Implement `authenticate(token: string): Promise<AuthResult>` with error handling
- [ ] Implement `setSkin(skinId: SkinId): Promise<void>` with SkinRoot integration
- [ ] Implement `getSkin(): Promise<SkinId>`
- [ ] Implement `fetchObservations(filters: ObservationFilters): Promise<ApiResponse<Observation[]>>`
- [ ] Implement `createObservation(data: ObservationForm): Promise<ApiResponse<Observation>>`
- [ ] Implement `updateObservation(id: string, data: Partial<ObservationForm>): Promise<ApiResponse<Observation>>`
- [ ] Implement `subscribeAgentEvents(tenantId: TenantId): AsyncGenerator<AgentEvent>`
- [ ] Implement `subscribeObservationUpdates(filters: ObservationFilters): AsyncGenerator<ObservationUpdate>`
- [ ] Define `SdkError` hierarchy with base and all subclasses
- [ ] Add JSDoc contracts to every method with parameter descriptions, return types, and error conditions
- [ ] Add structured trace event emission to every method
- [ ] Run `pnpm typecheck` — all packages must pass
- [ ] Run `pnpm ui:contrast` — WCAG ratios for skin token pairs

### Phase 3: UI Component Skin Recipes (`@moonwitness/ui`)
**Duration**: 3 days
**Goal**: Component skin recipes with explicit `data-moonframe-skin` patterns

- [ ] Audit all existing `@moonwitness/ui` components for `ICON_PURITY` / `PALETTE_PURITY` compliance
- [ ] Add `data-moonframe-skin` attribute support to: `PageHero`, `Card`, `Navigation`, `Dialog`, `Form`, `Kicker`, `SectionHeading`
- [ ] Ensure no component paints with Tailwind palette hues directly (`PALETTE_PURITY`)
- [ ] Source all colour from component variants or token-driven utilities in `skins.css`
- [ ] Replace any third-party icon libraries with design-system `Icon` component (`ICON_PURITY`)
- [ ] Update `skins.css` with `[data-moonframe-skin='...']` variants for all six DNA worlds
- [ ] Add lint rules: `SKIN_PURITY` (no duplicate root worlds), `ICON_PURITY`, `PALETTE_PURITY`
- [ ] Run `pnpm ui:test` — design system component and skin contracts
- [ ] Run `pnpm ui:contrast` — measured WCAG ratios
- [ ] Run `pnpm lint:arch` — arch invariants

### Phase 4: Platform Primitives and Integration
**Duration**: 2 days
**Goal**: Shared foundations across all apps

- [ ] Implement `resolveEcosystemEndpoints` with `NEXT_PUBLIC_*` guard (hyphenated names rejected)
- [ ] Implement `SkinRoot` provider with per-route skin scoping via `SkinScope`
- [ ] Implement `StatePanel`-based `error.tsx`, `loading.tsx`, `not-found.tsx` for all apps
- [ ] Verify `company_id` derived from principal, never from request body, on all SQL operations
- [ ] Add parameterized SQL with column/sort identifier allowlist to all database operations
- [ ] Implement SSRF guard: validate `base_url` before request, re-check resolved IP (refuse private/loopback)
- [ ] Add audit event emission for all insert/update/delete operations
- [ ] Run `pnpm lint:arch` — all arch invariants pass
- [ ] Run `pnpm docs:check` — 100/100

### Phase 5: Verification Pipeline and Capability Resolution
**Duration**: 2 days
**Goal**: Ensure all quality gates pass and empty capability plans are resolved

- [ ] Run full quality gate: `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch`, `pnpm ui:test`, `pnpm ui:contrast`
- [ ] Resolve all 13 `new-platform-capability-*` plan directories:
  - Either implement real capabilities with spec/design/task/rule documents
  - Or document as empty/skipped with explicit rationale in `report.md`
- [ ] Clean up or populate `.plans/` directories that were marked VERIFIED without evidence
- [ ] Update `evolve-loop-guard` plan with new guardrails against empty capabilities
- [ ] Document resolution status in BACKLOG.md
- [ ] Final verification: all quality gates pass

## Ordered and Independ Executable Tasks

| Task ID | Title | Phase | Dependencies | Estimated Days |
|---|---|---|---|---|
| T1 | Define canonical types in `@moonwitness/types` | Phase 1 | — | 2 |
| T2 | Update all packages to import types from `@moonwitness/types` | Phase 1 | T1 | 1 |
| T3 | Rewrite `@allah/sdk/src/index.ts` with typed methods | Phase 2 | T1, T2 | 3 |
| T4 | Add JSDoc contracts and trace events to SDK methods | Phase 2 | T3 | 1 |
| T5 | Audit `@moonwitness/ui` components for `ICON_PURITY`/`PALETTE_PURITY` | Phase 3 | T2 | 1 |
| T6 | Add `data-moonframe-skin` support to UI components | Phase 3 | T5 | 2 |
| T7 | Update `skins.css` with six-world variants | Phase 3 | T6 | 1 |
| T8 | Add lint rules: `SKIN_PURITY`, `ICON_PURITY`, `PALETTE_PURITY` | Phase 3 | T7 | 1 |
| T9 | Implement `resolveEcosystemEndpoints` with `NEXT_PUBLIC_*` guard | Phase 4 | T2 | 1 |
| T10 | Implement `SkinRoot` / `SkinScope` providers | Phase 4 | T9 | 1 |
| T11 | Implement `StatePanel`-based route states for all apps | Phase 4 | T10 | 2 |
| T12 | Add SSRF guard and parameterized SQL allowlist | Phase 4 | T2, T9 | 1 |
| T13 | Run full quality gate and report results | Phase 5 | All previous | 2 |
| T14 | Resolve/clean up 13 empty capability plans | Phase 5 | T13 | 2 |

## Dependencies and Execution Order

**Critical Path**: T1 → T2 → T3 → T4 → (T5, T9, T10 in parallel) → T6 → T7 → T8 → T11 → T12 → T13 → T14

**Parallelizable Workstreams**:
- T5 and T9 can run in parallel (types audit vs platform primitive)
- T6 can start once T5 audit completes
- T11 depends on T10 (SkinScope) completion
- T12 depends on T2 (types) and T9 (platform primitives)

**Required Files and Affected Modules**:
- `packages/types/src/index.ts` — new canonical types
- `packages/sdk/src/index.ts` — rewritten with typed methods
- `packages/ui/src/components/` — skin recipe updates
- `packages/ui/src/skins.css` — six-world variants
- `packages/ui/src/lib/` — lint rule updates
- `apps/dock/`, `apps/headquarter/`, `apps/id/`, `apps/jizz/`, `apps/gate/` — route state updates, skin integration
- `.plans/` — resolution of 13 capability plans

## Testing and Validation Procedures

### Unit Tests
- Type checks: `pnpm typecheck` must pass 100%
- SDK method contract tests: each method called with valid/invalid inputs, verifies correct ApiResponse shape
- Skin recipe tests: components render correctly with each of the six `data-moonframe-skin` values

### Integration Tests
- Skin switching flow: verify `SkinRoot` → `SkinScope` → CSS variable substitution works across apps
- API route handlers: parameterized SQL with allowlist, `company_id` derived from principal
- SSRF guard: verify private/loopback URLs are blocked
- Auth flow: verified principal flows through SDK to API routes

### Contract Tests
- `pnpm docs:check` — 100/100
- `pnpm lint:arch` — all arch invariants pass
- `pnpm ui:test` — design system component and skin contracts pass
- `pnpm ui:contrast` — WCAG ratios for every skin's token pairs pass

## Documentation Requirements

- `spec.md` — Already created (feature specification)
- `design.md` — Already created (technical & UX design)
- `task.md` — This document (implementation breakdown)
- `rule.md` — To be created (implementation rules & agent guardrails)
- Update `DOCUMENTATION_CONTRACT.md` if new conventions introduced
- Update `BACKLOG.md` with capability resolution status
- Update `.plans/` report.md files for resolved/cleaned capability plans

## Quality Gates

Must pass all of the following before any task marked complete:

- [ ] `pnpm docs:check` — 100/100 required
- [ ] `pnpm lint:arch` — arch invariants (zero violations)
- [ ] `pnpm typecheck` — TS strict in packages/ui, dock, headquarter, id, jizz, gate, sdk, arsy-orm, lint, types
- [ ] `pnpm ui:test` — design system component and skin contracts
- [ ] `pnpm ui:contrast` — measured WCAG ratios for every skin's token pairs
- [ ] No `any` types in public API surfaces of `@allah/sdk`, `@moonwitness/ui`, `@moonwitness/types`
- [ ] All 13 `new-platform-capability-*` plan directories resolved or documented as empty/skipped

## Completion Checklist

- [ ] `@moonwitness/types/src/index.ts` exports `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError`, `SkinConfig`, `Principal`
- [ ] `@allah/sdk/src/index.ts` exports typed methods with JSDoc contracts and trace event emission
- [ ] `@moonwitness/ui` components support `data-moonframe-skin` and comply with `ICON_PURITY`/`PALETTE_PURITY`
- [ ] `skins.css` has `[data-moonframe-skin='...']` variants for all six DNA worlds
- [ ] `resolveEcosystemEndpoints` rejects hyphenated `NEXT_PUBLIC_*` names and validates SSRF
- [ ] `SkinRoot` / `SkinScope` providers functional across all apps
- [ ] `error.tsx`, `loading.tsx`, `not-found.tsx` built from `StatePanel` in all apps
- [ ] `pnpm docs:check` passes 100/100
- [ ] `pnpm typecheck` passes all packages
- [ ] `pnpm lint:arch` passes all arch invariants
- [ ] `pnpm ui:test` passes design system component and skin contracts
- [ ] `pnpm ui:contrast` passes WCAG ratios for all skin token pairs
- [ ] All 13 `new-platform-capability-*` plan directories resolved (implemented) or documented as empty/skipped with rationale
- [ ] `evolve-loop-guard` plan updated with new guards against empty VERIFIED capabilities
- [ ] No backward-incompatible SDK changes without deprecation path documented