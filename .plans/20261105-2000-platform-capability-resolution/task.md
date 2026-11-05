# Task — Platform Capability Resolution

## Implementation Phases

### Phase 1: Type Foundations (T1-T9)
**Objective**: Establish canonical types in `@moonwitness/types` and update all packages to import from it.

| Task | Description | Dependencies | Estimated |
|------|-------------|--------------|-----------|
| **T1** | Define `TenantId` type in `@moonwitness/types/src/tenants.ts` | None | 1 day |
| **T2** | Define `SkinId` type and whitelist in `@moonwitness/types/src/skins.ts` | T1 | 1 day |
| **T3** | Define `ApiResponse<T>` generic in `@moonwitness/types/src/responses.ts` | T1 | 1 day |
| **T4** | Define `SdkError` hierarchy (base + 6 subclasses) in `@moonwitness/types/src/errors.ts` | T1 | 2 days |
| **T5** | Define `SkinConfig` interface in `@moonwitness/types/src/skins.ts` | T2 | 1 day |
| **T6** | Update `@allah/sdk/src/index.ts` to import from `@moonwitness/types` instead of inline types | T1 | 2 days |
| **T7** | Update `@moonwitness/ui/src/components/Icon.tsx` to enforce `ICON_PURITY` | T2 | 2 days |
| **T8** | Update `packages/lint/antislop-ui` rules for `data-moonframe-skin` and `ICON_PURITY`/`PALETTE_PURITY` | T2, T4 | 2 days |
| **T9** | Run `pnpm typecheck` across all packages, fix any `any` type violations | T1-T8 | 3 days |

### Phase 2: SDK Method Contracts (T10-T25)
**Objective**: Rewrite `@allah/sdk` with typed method contracts and JSDoc documentation.

| Task | Description | Dependencies | Estimated |
|------|-------------|--------------|-----------|
| **T10** | Rewrite `auth` operations with typed contracts (getOnboardingStatus, onboard, signIn, register, getCurrentUser, getSessions, revokeSession, signOut) | T6 | 3 days |
| **T11** | Rewrite `router` operations with typed contracts (chat, chatStream, embeddings, listModels, getTelemetry, getProviders, getUsageLogs) | T6 | 3 days |
| **T12** | Rewrite `health` operations with typed contracts (check, ready) | T6 | 1 day |
| **T13** | Rewrite `agentControl` operations with typed contracts (createPairing, claimPairing, listDevices, revokeDevice, submitMission, listMissions, cancelMission, getMissionEvents, nextMission, reportMissionEvent) | T6 | 3 days |
| **T14** | Rewrite `works` operations with typed contracts (listPlans, createPlan, listSubscriptions, createSubscription, activateSubscription, suspendSubscription, listInvoices) | T6 | 3 days |
| **T15** | Rewrite `publicIsp` operations with typed contracts (listPlans, listCoverage) | T6 | 1 day |
| **T16** | Rewrite `threads` operations with typed contracts (list, create, getMessages, addMessage) | T6 | 1 day |
| **T17** | Rewrite `qorpus` operations with typed contracts (ingest, search) | T6 | 1 day |
| **T18** | Rewrite `nexus` operations with typed contracts (listNas, createNas, getNas, rotateSecret) | T6 | 2 days |
| **T19** | Rewrite `mcp` operations with typed contracts (listTools, callTool, getAuditLog) | T6 | 2 days |
| **T20** | Rewrite `sdui` operations with typed contracts (render) | T6 | 1 day |
| **T21** | Rewrite `swarm` operations with typed contracts (run, stream) | T6 | 2 days |
| **T22** | Rewrite `agent` operations with typed contracts (run, stream) | T6 | 2 days |
| **T23** | Add `ApiResponse<T>` wrapper to all method return types | T6, T5 | 2 days |
| **T24** | Add `SdkError` hierarchy usage to all error paths | T6, T4 | 2 days |
| **T25** | Run `pnpm typecheck` on sdk package, fix all violations | T10-T24 | 3 days |

### Phase 3: UI Component Skin Recipes (T26-T36)
**Objective**: Add `data-moonframe-skin` support and enforce skin recipe patterns across `@moonwitness/ui`.

| Task | Description | Dependencies | Estimated |
|------|-------------|--------------|-----------|
| **T26** | Add `data-moonframe-skin` prop to `Button` component | T2, T7 | 1 day |
| **T27** | Add `data-moonframe-skin` prop to `Card` component | T2, T7 | 1 day |
| **T28** | Add `data-moonframe-skin` prop to `Table` component | T2, T7 | 1 day |
| **T29** | Add `data-moonframe-skin` prop to `Badge` component | T2, T7 | 1 day |
| **T30** | Add `data-moonframe-skin` prop to `StatePanel` component | T2, T7 | 1 day |
| **T31** | Add `data-moonframe-skin` prop to `FormField` component | T2, T7 | 1 day |
| **T32** | Update `skins.css` to use CSS custom properties for all skin tokens | T2 | 2 days |
| **T33** | Add `antislop-ui` lint rules: flag Tailwind palette hues, enforce `data-moonframe-skin` usage | T8 | 2 days |
| **T34** | Add `antislop-code` rules: remove any `any` types from public API surfaces | T4, T9 | 2 days |
| **T35** | Run `pnpm ui:test` on UI components, fix all contract violations | T26-T34 | 3 days |
| **T36** | Run `pnpm ui:contrast` for every skin's token pairs, fix WCAG ratio failures | T32, T33 | 3 days |

### Phase 4: Platform Primitives (T37-T45)
**Objective**: Implement platform primitives: `resolveEcosystemEndpoints`, `SkinRoot`/`SkinScope`, SSRF guard, parameterized SQL.

| Task | Description | Dependencies | Estimated |
|------|-------------|--------------|-----------|
| **T37** | Implement `resolveEcosystemEndpoints` with `NEXT_PUBLIC_*` guard in appropriate package | None | 2 days |
| **T38** | Implement `SkinRoot` provider component with per-route skin scoping via `SkinScope` | T2, T7 | 3 days |
| **T39** | Implement `SkinScope` HOC/component for route-specific skin assignment | T38 | 2 days |
| **T40** | Add SSRF guard: validate `base_url` before request, re-check resolved IP | T37 | 2 days |
| **T41** | Implement parameterized SQL queries with column/sort identifier allowlist | None | 2 days |
| **T42** | Update hub routes to use `tenantOf(request)` and `actorOf(request)` for all `works/*` endpoints | T37 | 3 days |
| **T43** | Add audit event emission to all SDK methods (method, status, duration_ms, tenant_id) | T22, T24 | 2 days |
| **T44** | Run `pnpm lint:arch` across monorepo, fix all arch invariant violations | T37-T43 | 3 days |
| **T45** | Run full quality gate battery: typecheck, lint:arch, docs:check, ui:test, ui:contrast | T1-T44 | 5 days |

### Phase 5: Capability Resolution and Plan Cleanup (T46-T51)
**Objective**: Resolve all 13 `new-platform-capability-*` directories, update BACKLOG.md, update evolve-loop-guard.

| Task | Description | Dependencies | Estimated |
|------|-------------|--------------|-----------|
| **T46** | Resolve capability 4: verify its legitimate VERIFIED status in apps/gate, confirm BACKLOG.md status | T1-T45 | 2 days |
| **T47** | Resolve capability 5: investigate why not listed, either implement minimal capability or document as skipped | T1-T45 | 2 days |
| **T48** | Resolve capabilities 6-13: for each, either implement minimal real capability passing quality gates OR document as empty/skipped with explicit rationale in report.md | T1-T45 | 8 days |
| **T49** | Clean up capability 12 duplicate directories: keep one version (`...-12`), document other as superseded | T48 | 1 day |
| **T50** | Update BACKLOG.md capability statuses to reflect actual implementation status | T48 | 2 days |
| **T51** | Update `evolve-loop-guard` in AUTONOMOUS.md section 8 to prevent future empty VERIFIED claims | T50 | 2 days |

## Ordered and Independently Executable Tasks

### Critical Path: T1 → T2 → T3 → T4 → (T5, T9, T10 in parallel) → T6 → T7 → T8 → T11 → T12 → T13 → T14

### Parallelizable Workstreams

| Parallel Group | Tasks | Dependencies | Notes |
|---------------|-------|--------------|-------|
| **Group A** | T5, T9 | T4 completed | Types audit and typecheck can run once T4 defines SkinId |
| **Group B** | T10, T13, T14 | T6 completed | SDK method contracts can run in parallel once types are imported |
| **Group C** | T11, T18, T22 | T6 completed | Other SDK modules parallelize independently |
| **Group D** | T26-T31 | T7 completed | All skin recipe props can be implemented in parallel |
| **Group E** | T33, T34 | T8 completed | Lint rules run after component updates |
| **Group F** | T38, T40 | T37 completed | Platform primitives: SSRF guard parallel with endpoint resolver |
| **Group G** | T46, T47, T50 | T45 completed | Capability resolution can start once quality gates pass |
| **Group H** | T48 (partial) | T47 completed | Capabilities 6-13 can be worked on in parallel subgroups |

### Detailed Dependencies

```
T1 → T2 → T3 → T4 → T5, T9
     ↓
     T6 → T7 → T8
     ↓
     T10 → T11 → T12 → T13 → T14
     ↓
     T22 → T23, T24
     ↓
     T26-T31 → T32-T36 → T37-T45 → T46-T51
```

### Required Files and Affected Modules

**New Files**:
- `packages/types/src/tenants.ts` — `TenantId` type definition
- `packages/types/src/skins.ts` — `SkinId`, `SkinConfig` type definitions
- `packages/types/src/responses.ts` — `ApiResponse<T>` generic
- `packages/types/src/errors.ts` — `SdkError` hierarchy
- `packages/sdk/src/[auth|router|health|agentControl|works|publicIsp|threads|qorpus|nexus|mcp|sdui|swarm|agent-run].ts` — rewritten with typed contracts
- `packages/ui/src/components/[Button|Card|Table|Badge|StatePanel|FormField].tsx` — with `data-moonframe-skin`
- `packages/ui/src/components/Icon.tsx` — enhanced `ICON_PURITY` enforcement
- `packages/ui/src/theme.css` — updated with CSS custom properties
- `packages/lint/antislop-ui[.] rule files` — new rules for skin enforcement

**Modified Files**:
- `packages/sdk/src/index.ts` — update imports, add typed method signatures
- `packages/types/src/index.ts` — re-export new types
- `packages/ui/src/index.ts` — update public API
- `AUTONOMOUS.md` — section 8 update (evolve-loop-guard)
- `BACKLOG.md` — capability status updates
- `.plans/capability-*` — all 13 directories resolved

### Testing and Validation Procedures

**Unit Tests**:
- Each SDK method has unit test verifying typed contract (input/output shapes)
- Each UI component has unit test for `data-moonframe-skin` prop rendering
- `SdkError` hierarchy has tests for each subclass instantiation

**Integration Tests**:
- SDK method end-to-end test (happy path + error path)
- Skin recipe test (component renders with correct skin token)
- Typecheck integration: `pnpm typecheck` passes all packages

**Contract Tests**:
- `pnpm docs:check` (100/100)
- `pnpm lint:arch` (all arch invariants pass)
- `pnpm ui:test` (design system component and skin contracts)
- `pnpm ui:contrast` (WCAG ratios for every skin's token pairs)

**Edge Case Tests**:
- Invalid SkinId passed to UI component → falls back to default, no crash
- `NEXT_PUBLIC_*` name in `resolveEcosystemEndpoints` → 400 error, graceful handling
- SSRF guard blocks private/IP loopback URLs → 403 error, graceful handling
- `company_id` stamped from principal, not request body → 403 for cross-tenant access

### Documentation Requirements

- All new TypeScript types have JSDoc documentation
- All new SDK methods have JSDoc contracts documenting request/response shapes
- All new UI components documented with `data-moonframe-skin` usage patterns
- `report.md` in each resolved capability directory documents the resolution rationale
- BACKLOG.md updated with corrected capability statuses
- AUTONOMOUS.md section 8 updated with evolve-loop-guard guardrails

### Quality Gates

Five mandatory quality gates must pass before any task is marked complete:

1. **Gate 1 - Type Check**: `pnpm typecheck` passes for all affected packages (sdk, types, ui, and all apps)
2. **Gate 2 - Architecture Lint**: `pnpm lint:arch` passes all arch invariants (no raw SQL, skin token source, skin ID whitelist, no duplicate functionality)
3. **Gate 3 - Documentation Check**: `pnpm docs:check` passes 100/100 points
4. **Gate 4 - UI Tests**: `pnpm ui:test` passes design system component and skin contracts
5. **Gate 5 - UI Contrast**: `pnpm ui:contrast` passes measured WCAG ratios for every skin's token pairs

All five gates must EXIT=0 before a task can be marked complete. If any gate fails, the task returns to `in_progress` status and the failing area must be fixed before proceeding.

### Completion Checklist

**Phase 1 Complete** (all T1-T9 done):
- [ ] `T1` → `T9` all marked complete with `pnpm typecheck` passing
- [ ] `TenantId` type defined and used across packages
- [ ] `SkinId` type defined with six canonical values
- [ ] `ApiResponse<T>` generic defined and used
- [ ] `SdkError` hierarchy defined with 6 subclasses
- [ ] `SkinConfig` interface defined
- [ ] `@allah/sdk` imports from `@moonwitness/types`
- [ ] `ICON_PURITY` enforced in UI components
- [ ] `antislop-ui` rules updated and passing

**Phase 2 Complete** (all T10-T25 done):
- [ ] All 22 SDK method contracts have explicit TypeScript return types
- [ ] All 22 SDK methods return `ApiResponse<T>` or throw `SdkError`
- [ ] All 22 methods have JSDoc contracts documenting request/response
- [ ] `pnpm typecheck` passes on sdk package
- [ ] No `any` types in public API surfaces of sdk

**Phase 3 Complete** (all T26-T36 done):
- [ ] All 7 UI components have `data-moonframe-skin` prop
- [ ] `skins.css` uses CSS custom properties for all skin tokens
- [ ] `antislop-ui` rules flag palette hues and enforce skin usage
- [ ] `pnpm ui:test` passes 100%
- [ ] `pnpm ui:contrast` passes all skin token pairs

**Phase 4 Complete** (all T37-T45 done):
- [ ] `resolveEcosystemEndpoints` with `NEXT_PUBLIC_*` guard implemented
- [ ] `SkinRoot` provider with `SkinScope` implemented
- [ ] SSRF guard validates base_url and checks resolved IP
- [ ] Parameterized SQL queries with allowlist implemented
- [ ] All `works/*` hub routes scoped by tenant
- [ ] All SDK methods emit structured trace events
- [ ] `pnpm lint:arch` passes all invariants
- [ ] Full quality gate battery passes (5 gates EXIT=0)

**Phase 5 Complete** (all T46-T51 done):
- [ ] Capability 4 VERIFIED status confirmed in BACKLOG.md
- [ ] Capability 5 resolved (implemented or documented as skipped)
- [ ] Capabilities 6-13 all resolved (implemented or documented)
- [ ] Capability 12 duplicate directories cleaned up
- [ ] BACKLOG.md capability statuses updated
- [ ] AUTONOMOUS.md section 8 updated with evolve-loop-guard
- [ ] All 13 `.plans/capability-*` directories have proper four-document structure
- [ ] Final quality gate battery passes (5 gates EXIT=0)

**Overall Complete** when all 51 tasks are marked complete and all quality gates pass.