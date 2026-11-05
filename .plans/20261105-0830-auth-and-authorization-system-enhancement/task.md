# Task Checklist: Authentication & Authorization System Enhancement

## Phase 1: Configuration & Validation (Weeks 1-2)
- [ ] Create `packages/arsy-plugin-auth/src/config.ts` with Better Auth config validation schema
- [ ] Implement startup validation that fails if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or CORS_ORIGINS missing
- [ ] Add `scripts/check-better-auth-config.ts` for config validation verification
- [ ] Update root `pnpm typecheck` to include `packages/arsy-plugin-auth`
- [ ] Ensure all tsconfigs extend `tsconfig.base.json` (per R1 invariant)

## Phase 2: Onboarding Flow (Weeks 2-4)
- [ ] Implement `packages/arsy-plugin-auth/src/onboarding.ts` with onboarding flow
- [ ] Create `apps/id/src/app/api/auth/onboarding/route.ts` - Onboarding API endpoint
- [ ] Design onboarding page using `@moonwitness/ui` components (SkinRoot, Form, Button, StatusMessage)
- [ ] Implement superuser creation with `create_uid`/`write_uid` recording via `@allah/arsy-orm`
- [ ] Add onboarding completion tracking (skip on subsequent visits)
- [ ] Write unit tests for onboarding flow
- [ ] Update `pnpm extension:test` to include onboarding tests

## Phase 3: Global Admin Routes (Weeks 4-6)
- [ ] Implement `packages/arsy-plugin-auth/src/admin/routes.ts` - Global admin route handlers
- [ ] Create `apps/headquarter/src/app/api/admin/tenants/route.ts` - Tenant management API
- [ ] Implement `packages/arsy-plugin-auth/src/middleware/company-id.ts` - company_id enforcement middleware
- [ ] Add audit event recording (reason_hash, actor, target, request_id, operation, changed_field_names)
- [ ] Verify principal is superuser before allowing admin access
- [ ] Add 403 failure paths for non-superuser access
- [ ] Write integration tests for global admin routes
- [ ] Update CI `.github/workflows/ci-dev.yml` with `verify-auth` job

## Phase 4: Credential Backfill Migration (Weeks 6-8)
- [ ] Create `scripts/migrate-credentials.ts` with rehearsal mode
- [ ] Implement existing user database reading and credential account creation
- [ ] Add idempotent migration (skips already-migrated users)
- [ ] Implement `--rehearsal` flag that blocks production deployment if not run against copy
- [ ] Document migration procedure and requirements
- [ ] Test migration against restorable data copy
- [ ] Add migration script to `pnpm extension:build` workflow

## Phase 5: SDK & Type Enhancements (Weeks 7-8)
- [ ] Extend `@moonwitness/types` with auth types:
  - `AuthContext` type with `company_id`, `role`, `tenant`
  - `BetterAuthConfig` validation schema
  - `AuditEvent` type
- [ ] Add SDK methods in `@allah/sdk`:
  - `mwClient.auth.onboard()`
  - `mwClient.admin.gate()`
  - `mwClient.tenant.isolate()`
- [ ] Update all app Typescript types to use new auth types
- [ ] Run `pnpm typecheck` across all packages and verify zero errors

## Phase 6: Documentation & Quality Gates (Weeks 8-9)
- [ ] Update `scripts/check-doc-contracts.ts` threshold from 95 → 100 if needed
- [ ] Add auth-related documentation to app READMEs
- [ ] Ensure `pnpm docs:check` passes at 100/100
- [ ] Verify `pnpm lint:arch` passes with 0 violations
- [ ] Verify `pnpm lint` passes with 0 ESLint errors
- [ ] Update Husky `.husky/pre-commit` to include auth-related checks
- [ ] Update Husky `.husky/pre-push` with auth build steps
- [ ] Run full quality gate: `pnpm dev` (lint:arch && typecheck && concurrently dev servers)

## Dependencies & Execution Order
### Dependencies Between Phases
- Phase 2 (Onboarding) depends on Phase 1 (Config Validation) - needs Better Auth config validated first
- Phase 3 (Global Admin) depends on Phase 1 (Config) and Phase 2 (Onboarding) - needs authenticated users
- Phase 4 (Migration) depends on Phase 2 (Onboarding) - needs superuser creation pattern established
- Phase 5 (SDK Types) can run in parallel with Phases 2-4
- Phase 6 (Documentation/Quality) is final phase that validates all preceding work

### Parallelizable Workstreams
- Phase 5 SDK types can run independently of Phase 3-4 implementation
- Unit tests for onboarding can run once Phase 2 starts
- Integration tests need complete system but can test individual components

### Required Files & Affected Modules
- `packages/arsy-plugin-auth/src/config.ts` - New
- `packages/arsy-plugin-auth/src/onboarding.ts` - New
- `packages/arsy-plugin-auth/src/admin/routes.ts` - New
- `packages/arsy-plugin-auth/src/middleware/company-id.ts` - New
- `scripts/migrate-credentials.ts` - New
- `apps/id/src/app/api/auth/onboarding/route.ts` - Modified
- `apps/headquarter/src/app/api/admin/tenants/route.ts` - New
- `packages/sdk/src/index.ts` - Modified (add auth methods)
- `@moonwitness/types` - Modified (add auth types)
- `.husky/pre-commit` - Modified
- `.husky/pre-push` - Modified
- `.github/workflows/ci-dev.yml` - Modified

## Testing & Validation Procedures
### Unit Tests
- Better Auth config validation edge cases
- Onboarding flow step-by-step
- company_id middleware with various principals
- Audit event schema validation

### Integration Tests
- End-to-end onboarding flow
- Global admin route with proper auth
- Credential migration script (rehearsal mode)
- Cross-tenant isolation verification

### Validation Commands
- `pnpm typecheck` - zero TS errors
- `pnpm lint:arch` - zero violations
- `pnpm docs:check` - 100/100
- `pnpm lint` - zero ESLint errors
- `pnpm extension:test` - all 28/28 tests pass
- Manual: Run migration script in rehearsal mode against copy, verify it blocks production without --rehearsal

## Completion Checklist
- [ ] All four plan documents (spec.md, design.md, task.md, rules.md) created and synchronized
- [ ] `pnpm typecheck` passes with 0 errors across all packages/apps
- [ ] `pnpm lint:arch` passes with 0 violations
- [ ] `pnpm docs:check` passes at 100/100
- [ ] Better Auth config validation fails startup if required env vars missing
- [ ] Onboarding creates superuser with proper `create_uid`/`write_uid` references
- [ ] Global admin routes require `company_id` and reason; audit events recorded
- [ ] All storage models include `company_id` for tenant isolation
- [ ] `pnpm lint` passes with 0 ESLint errors
- [ ] Auth startup migration script documented and rehearsable
- [ ] Production startup fails closed if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or CORS_ORIGINS missing
- [ ] All new code follows STYLE_PURITY and PALETTE_PURITY invariants
- [ ] No raw HTML elements in app JSX (STYLE_PURITY)
- [ ] SDK auth methods exported and typed