# Rules: Authentication & Authorization System Enhancement

## R1 — Better Auth Configuration Validation
- `BETTER_AUTH_SECRET` MUST be present and at least 32 characters long; startup fails if missing or too short
- `BETTER_AUTH_URL` MUST be a public HTTPS URL; startup fails if missing or invalid
- `CORS_ORIGINS` MUST be an array of trusted origins; startup fails if missing or empty
- Configuration validation runs at application startup before any routes are registered
- Failed validation results in clear error message identifying which variable is missing/invalid
- No default or fallback values — production startup aborted until vars are set

## R2 — Onboarding Flow Rules
- Onboarding creates exactly one initial superuser; subsequent runs detect existing superuser and skip
- Superuser password must NOT be seeded or stored in source code; user provides during onboarding
- `create_uid` and `write_uid` MUST be recorded in `res.users` for every user write in the same transaction
- Onboarding records audit event on superuser creation (actor: system, operation: "onboarding_complete")
- After onboarding completes, session cookie set as HttpOnly, never exposed to client JS
- Onboarding page uses only `@moonwitness/ui` components (STYLE_PURITY, PALETTE_PURITY, ICON_PURITY)
- No `NEXT_PUBLIC_*` environment variables may carry auth keys/secrets (NO_PUBLIC_CLIENT_SECRETS)

## R3 — Global Admin Route Rules
- Every `/v1/admin/*` route requires verified principal with `role: "superuser"`
- Non-zero `company_id` MUST be supplied in route path (e.g., `/v1/admin/tenants/123`)
- Explicit `reason` parameter REQUIRED in request body; route rejects if missing or empty
- Audit event MUST be recorded in same transaction as the operation:
  - `reason_hash`: SHA-256 of the reason string
  - `actor`: superuser ID from authenticated principal
  - `target`: target company_id number
  - `request_id`: UUID v4 generated per request
  - `operation`: descriptive operation name (e.g., "tenant_suspend", "user_promote")
  - `changed_field_names`: array of field names changed (no before/after values)
- If principal is not superuser → 403 Forbidden, audit event recorded "unauthorized_admin_access"
- If `company_id` is zero → 403 Forbidden, audit event recorded "zero_company_id_attempt"
- Operations fail-closed: any validation failure denies the request and records audit event
- Global admin routes must not expose identity, audit, or credential-bearing models to generic CRUD

## R4 — company_id Enforcement Rules
- `company_id` derived from authenticated principal, never from request body
- Fail-closed: if `company_id` cannot be derived, request denied (403) and audit event recorded
- Every storage model row MUST include `company_id` for multi-tenant isolation
- Storage queries without `company_id` filter automatically append fail-closed condition
- `company_id` on `res.users` row derived from principal at login; never overridden by request
- Cross-tenant access denied without explicit global admin route with valid reason
- Personal tenants (negative company_id) isolated from organizational tenants (positive company_id)
- Zero company_id indicates unassigned personal account; access to personal data only

## R5 — Audit Event Rules
- Every model insert/update/delete writes ONE append-only event in same transaction
- Events store changed field NAMES, not values (per AGENTS.md audit invariant)
- Event schema: `{ id, model, operation, changed_field_names, actor, target_company_id, request_id, timestamp, reason_hash }`
- No automatic purge of audit events; retention policy configured separately
- Fail-closed on `legal_hold` / `retention_until` — reject writes if legal_hold active
- Audit events MUST include `request_id` (UUID v4) for traceability
- Reason hash (SHA-256) stored for global admin operations (R3)

## R6 — Credential Migration Rules
- `scripts/migrate-credentials.ts` MUST accept `--rehearsal` flag
- Rehearsal mode runs against a restorable data copy — production deployment BLOCKED if rehearsal not performed
- Migration is idempotent: re-running skips already-migrated users
- New credential accounts stored with HttpOnly cookie sessions
- Existing user IDs preserved; no user data lost during migration
- Migration script documents procedure and requirements for ops team
- Migration report output includes: total users, migrated count, failed count, error list

## R7 — TypeScript & Type Rules
- All `tsconfig.json` in `packages/*`, `apps/*`, `addons/*` MUST extend `tsconfig.base.json`
- No inline `strict: true`, `skipLibCheck`, `esModuleInterop`, or `forceConsistentCasingInFileNames` duplicates outside base config
- Auth-related TypeScript must pass strict typecheck with zero errors
- `@moonwitness/types` auth types are the single source of truth for auth context typing
- All packages import auth types from `@moonwitness/types`, not local redefinitions
- `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch` all enabled in base config

## R8 — UI/UX Design System Rules
- No raw `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in app JSX or package code
- Use `@moonwitness/ui` components: `Button`, `Form`, `Input`, `Select`, etc.
- All colour from `packages/ui/src/theme.css` skin tokens (`--mw-canvas`, `--mw-text`, `--mw-surface`, etc.)
- No Tailwind palette hues (`PALETTE_PURITY`) in app JSX
- Skip-link `id="main-content"` landmark belongs to design-system `RouteShell` (LANDMARK_PURITY)
- All new pages ship `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel` (STATE_PARITY)
- SkinRoot declared per app; duplicate root worlds require explicit lint-baseline exception

## R9 — SDK & Cross-App Rules
- Client apps MUST route auth requests through `@allah/sdk`, not direct `fetch` or Better Auth internal
- SDK provides typed methods: `mwClient.auth.onboard()`, `mwClient.admin.gate()`, `mwClient.tenant.isolate()`
- SDK methods export typed interfaces compatible across all apps (dock, headquarter, id, jizz, gate)
- No direct database calls from `'use client'` files; all data goes through API routes
- `NEXT_PUBLIC_*` environment variables cannot carry auth keys, secrets, or tokens

## R10 — Git & Branch Workflow Rules
- New auth-related features developed on `dev` branch only
- Feature branches created from `dev`; merge to `dev` via Pull Request
- Commit message format follows conventional commits (`feat`, `fix`, `docs`, `refactor`, `chore`)
- Pre-commit: `pnpm docs:check` → `pnpm lint` → `pnpm lint:arch` → `pnpm typecheck`
- Pre-push: all build gates + `pnpm ui:test` + `pnpm ui:contrast`
- Commit-msg: commitlint validation required
- No secrets or `.env` files committed; `.env` in `.gitignore`
- Plan directory created in `.plans/` with timestamp slug format: `YYYYMMDD-HHMM-feature-slug`

## R11 — Performance Constraints
- Better Auth config validation at startup: O(1), fails fast, < 100ms overhead
- company_id derivation from principal: O(1) lookup, < 1ms overhead per request
- Audit event write: append-only, minimal overhead (field names only, no before/after values)
- Onboarding: single user creation, no persistent performance impact beyond normal user creation
- Global admin: single audit event per operation, bounded frequency (max 10 ops/min per superuser)
- Migration script: O(n) where n = number of users; documented max runtime for rehearsal mode

## R12 — Backward Compatibility Rules
- Existing auth functionality remains intact during enhancement
- No breaking changes to `@better-auth/core@1.7.16` integrations
- Existing user sessions remain valid; new onboarding creates additional superuser
- Global admin routes additive: existing admin functionality unchanged, new routes added
- Migration script backward-compatible: re-running skips already-migrated users
- All TypeScript changes backward-compatible: existing code compiles without modification
- No removal of existing environment variables; new ones added as optional with validation

## Forbidden Patterns & Anti-Patterns

### Forbidden
- **FP-1**: Raw HTML elements `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in app JSX
- **FP-2**: Hardcoded `BETTER_AUTH_SECRET` or other secrets in source code
- **FP-3**: `NEXT_PUBLIC_*` environment variables carrying auth keys or tokens
- **FP-4**: `company_id` derived from request body instead of principal
- **FP-5**: Global admin routes without required `company_id` or `reason` parameter
- **FP-6**: Audit events storing before/after values instead of field names only
- **FP-7**: Onboarding creating more than one superuser
- **FP-8**: Production deployment without running migration rehearsal against copy
- **FP-9**: `tsconfig.json` with inline `strict: true` outside `tsconfig.base.json`
- **FP-10**: Direct database calls from `'use client'` components

### Anti-Patterns
- **AP-1**: Duplicate `company_id` derivation logic across packages
- **AP-2**: Hardcoded default superuser credentials
- **AP-3**: Audit events with before/after values leaking sensitive data
- **AP-4**: Global admin routes that don't record audit events
- **AP-5**: Onboarding flow that doesn't fail-closed on missing config
- **AP-6**: TypeScript that doesn't extend `tsconfig.base.json`
- **AP-7**: UI components that don't follow `@moonwitness/ui` patterns
- **AP-8**: SDK methods that bypass `@moonwitness/types` type contracts

## Agent Execution Boundaries

### What Agents CAN Do
- Create, modify, and read plan documents in `.plans/`
- Run `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`, `pnpm lint`
- Create new files in `packages/`, `apps/`, `scripts/`
- Modify TypeScript configurations and ESLint configurations
- Add SDK methods and type definitions
- Create API routes and route handlers
- Write unit and integration tests
- Modify Husky hooks
- Update GitHub Actions workflow files
- Run migration scripts in rehearsal mode
- Generate audit events per R5 schema

### What Agents CANNOT Do
- **NC-1**: Modify production runtime configuration (BETTER_AUTH_SECRET, etc. - from env only)
- **NC-2**: Deploy to production without following all quality gates
- **NC-3**: Commit secrets, `.env` files, or local database files
- **NC-4**: Bypass `company_id` fail-closed enforcement
- **NC-5**: Remove or modify existing audit event invariants
- **NC-6**: Create onboarding that doesn't record `create_uid`/`write_uid`
- **NC-7**: Modify `tsconfig.base.json` in ways that break existing packages
- **NC-8**: Add raw HTML elements to app JSX
- **NC-9**: Skip the `--rehearsal` flag requirement for migration scripts
- **NC-10**: Bypass STYLE_PURITY or PALETTE_PURITY invariants

## Git & Branch Workflow Requirements

### Branch Strategy
- All auth-related development on `dev` branch
- Feature branches: `auth/enhancement/<description>` created from `dev`
- Pull Requests must pass all quality gates before merge
- Merge to `dev` only after all checks pass

### Commit Requirements
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- All auth-related commits must update relevant plan task checklist
- Never commit `.env` files or local database files
- `.env` included in `.gitignore` at repo root

### Validation Requirements Before Marking Tasks Complete
- `pnpm typecheck` passes with 0 TS errors across all packages/apps
- `pnpm lint:arch` passes with 0 violations
- `pnpm docs:check` passes at 100/100
- `pnpm lint` passes with 0 ESLint errors
- All new code follows STYLE_PURITY and PALETTE_PURITY invariants
- No raw HTML elements in app JSX
- SDK auth methods typed and exported
- Migration script documented and tested in rehearsal mode
- Better Auth config validation fails startup if required env vars missing
- Onboarding creates superuser with proper `create_uid`/`write_uid` references
- Global admin routes require `company_id` and reason; audit events recorded
- Production startup fails closed if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or CORS_ORIGINS missing