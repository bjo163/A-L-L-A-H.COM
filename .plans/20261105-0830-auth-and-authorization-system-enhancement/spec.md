# Spec: Authentication & Authorization System Enhancement

## Status
`proposed`

## Overview
This feature enhances the Better Auth integration across the A-L-L-A.H.COM monorepo, improving onboarding flows, global admin routes, and tenant isolation while preserving all MoonWitness ecosystem invariants. The enhancement addresses gaps in the current auth system and provides a foundation for future platform integration.

## Problem Statement
The current Better Auth implementation has several deficiencies:
- Onboarding flow is incomplete - first-run superuser creation lacks proper validation
- Global admin routes (`/v1/admin/*`) require explicit reason and target tenant but lack proper audit trail integration
- Tenant isolation via `company_id` is inconsistent across some packages
- Better Auth configuration (secret, URLs, CORS origins) has no centralized validation
- No migration path for backfilling credential accounts from existing password hashes
- Superuser access patterns need strengthening to prevent unauthorized cross-tenant access

## Objectives
1. Enhance Better Auth onboarding with proper validation and migration paths
2. Strengthen global admin route security with required reason recording and tenant targeting
3. Ensure consistent `company_id` enforcement across all storage models
4. Centralize Better Auth configuration validation at startup
5. Provide clear migration guidelines for credential account backfilling
6. Maintain full compatibility with existing `@allah/arsy-orm` and `@moonwitness/ui` invariants

## Functional Requirements
- **FR-1**: Better Auth configuration validation at application startup (BETTER_AUTH_URL, BETTER_AUTH_SECRET, CORS_ORIGINS)
- **FR-2**: Onboarding flow creates initial superuser without seeded password, records `create_uid`/`write_uid`
- **FR-3**: Global admin routes (`/v1/admin/*`) require non-zero `company_id` and a reason; audit event stores reason hash, actor, target, request ID, operation, changed field names
- **FR-4**: All storage models include `company_id` for multi-tenant isolation, derived from principal and fail-closed
- **FR-5**: Better Auth registration receives only the regular `user` role (not superuser) unless explicitly promoted
- **FR-6**: Production startup fails closed if Better Auth secret, public URL, or trusted origins are missing
- **FR-7**: Auth startup migration backfills credential accounts from existing password hashes; must be rehearsed against restorable data copy before deploying

## Non-Functional Requirements
- **NFR-1**: All auth-related TypeScript must pass strict typecheck with zero errors
- **NFR-2**: Architectural lint (`pnpm lint:arch`) passes with 0 violations
- **NFR-3**: Documentation contracts (`pnpm docs:check`) at 100/100
- **NFR-4**: No new raw HTML elements (`<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>`) in app JSX
- **NFR-5**: All new code follows `@moonwitness/ui` component patterns and skin token usage
- **NFR-6**: Zero database migration downtime; all changes are idempotent and backward-compatible

## Scope
### In-Scope
- Better Auth configuration schema and validation scripts
- Onboarding flow enhancements (first-run superuser creation)
- Global admin route handlers with audit event recording
- `company_id` enforcement middleware and lint rules
- Credential account backfill migration script
- TypeScript type enhancements for auth contexts
- Documentation updates for auth flows

### Out-of-Scope
- Password hashing algorithm changes (remains BCrypt/Argon2)
- OAuth provider integration (Google, GitHub, etc. - handled by Better Auth)
- Database schema changes beyond `company_id` additions
- Frontend redesign of login pages
- Removal of existing auth functionality

## User Stories & Use Cases

### US-1: First-Run Onboarding
**Actor**: New system deployer
**Goal**: Initialize the platform for the first time
**Scenario**:
1. Deploy fresh instance
2. System prompts for initial superuser creation
3. Superuser provides email/password (no seeded default)
4. System creates superuser with `create_uid`/`write_uid` references
5. Onboarding completes and system redirects to dashboard

### US-2: Global Admin Access
**Actor**: Superuser
**Goal**: Perform cross-tenant administration
**Scenario**:
1. Superuser navigates to `/v1/admin/tenants/:companyId`
2. System requires explicit reason for the action
3. Action recorded in audit event with reason hash, actor, target company_id, request ID, operation, changed field names
4. Operation proceeds or denied based on audit policy

### US-3: Tenant Isolation
**Actor**: Multi-tenant application user
**Goal**: Access only their tenant's data
**Scenario**:
1. User authenticated per tenant
2. All API requests include `company_id` derived from principal
3. Storage queries fail-closed if `company_id` missing or invalid
4. Cross-tenant access denied without explicit global admin route

### US-4: Credential Backfill Migration
**Actor**: Operations team
**Goal**: Migrate existing users to new auth system
**Scenario**:
1. Team has existing user database with password hashes
2. Run auth startup migration script
3. Script backfills credential accounts from password hashes
4. Migration rehearsed against restorable data copy first
5. Production deployment after successful rehearsal

## Dependencies & Constraints

### Dependencies
- `@allah/arsy-orm` - ORM layer with PGlite embedded database
- `@better-auth/core` - Better Auth core (v1.7.16)
- `@moonwitness/ui` - UI component system with skin tokens
- `@moonwitness/types` - Shared data contracts
- `@allah/sdk` - Cross-app session handling
- GitHub Actions CI pipeline

### Constraints
- Must preserve `STYLE_PURITY` - no raw HTML elements in apps
- Must preserve `PALETTE_PURITY` - no Tailwind palette hues in app JSX
- Must preserve `ICON_PURITY` - only `@moonwitness/ui` Icon component
- Must preserve `LANDMARK_PURITY` - skip-link `id="main-content"` belongs to `RouteShell`
- Must preserve `NO_PUBLIC_CLIENT_SECRETS` - no `NEXT_PUBLIC_*` secrets in `'use client'` files
- All `tsconfig.json` must extend `tsconfig.base.json`
- All storage models require `company_id` for multi-tenant isolation
- Fail-closed on `legal_hold` / `retention_until`

## Acceptance Criteria
- `pnpm typecheck` passes with 0 TS errors across all packages/apps
- `pnpm lint:arch` passes with 0 violations
- `pnpm docs:check` passes at 100/100
- Better Auth configuration validation fails startup if required env vars missing
- Onboarding creates superuser with proper `create_uid`/`write_uid` references
- Global admin routes require `company_id` and reason; audit events recorded
- All storage models include `company_id` for tenant isolation
- `pnpm lint` passes with 0 ESLint errors
- Auth startup migration script documented and rehearsable
- Production startup fails closed if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or CORS_ORIGINS missing