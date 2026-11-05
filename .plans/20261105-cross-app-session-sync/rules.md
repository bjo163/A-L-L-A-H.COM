# Rules: Cross-Application Session & State Synchronization

## R1 — SDK Method Contract Rules
- `principal()` MUST return a typed `Principal` from arsy-core auth context, or `null` if no valid session exists
- `principal()` MUST be callable without await on module load; result cached after first call
- `principal()` MUST NOT expose sensitive data (passwords, tokens, raw session IDs) in its return value
- `resolveEcosystemEndpoints()` MUST perform SSRF validation and reject private/loopback addresses
- `resolveEcosystemEndpoints()` MUST reject addresses: 10.x, 192.168.x, 172.16-31.x, ::1, fe80::, localhost
- `resolveEcosystemEndpoints()` MUST throw `SdkError.NETWORK_ERROR` with detail message on invalid URLs
- `resolveEcosystemEndpoints()` results MUST be cached after first successful call
- `setUserPreference()` MUST async persist preference to server-side storage
- `setUserPreference()` MUST NOT block request processing; failure is best-effort
- `getUserPreference()` MUST return `undefined` for missing keys (not throw)
- All SDK methods MUST have complete JSDoc contracts (`@param`, `@returns`, `@throws`)
- SDK methods MUST NOT introduce new raw HTML elements in any package code

## R2 — TenantId Type Rules
- `TenantId` type MUST be a string matching company_id pattern: negative values for personal tenants, positive for organizational
- `TenantId` derived from principal's `companyId` field, never from request body
- Fail-closed: if `companyId` cannot be derived, `TenantId` type evaluates to `never`
- Every storage model row MUST include `company_id` for multi-tenant isolation (preserved from R4 in auth rules)
- Cross-tenant access denied without explicit global admin route with valid reason (preserved)
- Personal tenants (negative `company_id`) isolated from organizational tenants (positive `company_id`)

## R3 — SkinId Type Rules
- `SkinId` type MUST be a union of exactly 6 approved skin IDs: `'moon' | 'sun' | 'star' | 'snow' | 'ocean' | 'lava'`
- No additional skin IDs permitted; type system prevents invalid skin ID usage at compile time
- All skin values MUST be sourced from `packages/ui/src/theme.css` skin tokens (`--mw-canvas`, `--mw-text`, `--mw-surface`, etc.)
- No Tailwind palette hues (`PALETTE_PURITY`) in app JSX (preserved from R8 in auth rules)
- Skin selection propagated via SDK `setUserPreference('skin', SkinId)`
- Skin preference persists across app boundaries via SDK synchronization

## R4 — ApiResponse<T> and SdkError Rules
- `ApiResponse<T>` MUST be a union type: `{ success: true; data: T } | { success: false; error: SdkError }`
- `SdkError` MUST be a union of exactly 8 error variants: `'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT' | 'RATE_LIMITED'`
- All SDK methods that can return errors MUST use `ApiResponse<T>` return type
- Error variants MUST be classified properly: network, validation, auth, not found, unauthorized, forbidden, conflict, rate-limited
- `SdkError` used consistently across all packages and apps for error reporting
- No arbitrary string error messages; all errors use classified `SdkError` variants

## R5 — Session Propagation Rules
- Session state is managed centrally by ARSY (Better Auth server); SDK subscribes to changes
- When a session is created, renewed, or revoked, SDK propagates the update to all running app instances
- User preferences are stored in a centralized location and synchronized via SDK method calls
- Session revocation in one app triggers propagation to all others within 5 seconds
- Preference changes are idempotent: re-running `setUserPreference()` with same value is no-op
- SDK initialization on app start: each instance calls `sdk.principal()` to derive authenticated principal
- Principal derivation failure: app falls back to unauthenticated state; user re-authenticates via normal flow

## R6 — SSRF Validation Rules
- `resolveEcosystemEndpoints()` MUST reject private IP ranges:
  - 10.0.0.0/10 (10.0.0.0 - 10.255.255.255)
  - 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
  - 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
- `resolveEcosystemEndpoints()` MUST reject loopback:
  - ::1 (IPv6 loopback)
  - localhost (127.0.0.1)
- `resolveEcosystemEndpoints()` MUST reject link-local:
  - fe80::/10 (IPv6 link-local)
- `resolveEcosystemEndpoints()` MUST use Node.js built-in `crypto` for URL validation where needed
- On invalid URL → throws `SdkError.NETWORK_ERROR` with detail message identifying blocked range
- On valid URL → returns `EcosystemEndpoints` with all 7 app URLs constructed from validated host

## R7 — Type Extension Constraints
- All `tsconfig.json` in `packages/*`, `apps/*`, `addons/*` MUST extend `tsconfig.base.json`
- No inline `strict: true`, `skipLibCheck`, `esModuleInterop`, or `forceConsistentCasingInFileNames` duplicates outside base config
- Auth-related TypeScript must pass strict typecheck with zero errors
- `@moonwitness/types` auth types are the single source of truth for auth context typing
- All packages import auth/types from `@moonwitness/types`, not local redefinitions
- `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch` all enabled in base config

## R8 — UI/UX Design System Rules
- No raw `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in app JSX or package code
- Use `@moonwitness/ui` components: `Button`, `Form`, `Input`, `Select`, etc.
- All colour from `packages/ui/src/theme.css` skin tokens (`--mw-canvas`, `--mw-text`, `--mw-surface`, etc.)
- No Tailwind palette hues (`PALETTE_PURITY`) in app JSX
- Skip-link `id="main-content"` landmark belongs to design-system `RouteShell` (LANDMARK_PURITY)
- All new pages ship `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel` (STATE_PARITY)
- SkinRoot declared per app; duplicate root worlds require explicit lint-baseline exception
- UI state (skin, language, layout) synchronized via SDK, not duplicated per app

## R9 — Cross-App SDK Usage Rules
- Client apps MUST route auth requests through `@allah/sdk`, not direct `fetch` or Better Auth internal
- SDK provides typed methods: `mwClient.auth.principal()`, `mwClient.resolveEcosystemEndpoints()`, `mwClient.setUserPreference()`, `mwClient.getUserPreference()`
- SDK methods export typed interfaces compatible across all apps (dock, headquarter, id, jizz, gate, harbor, sentinel)
- No direct database calls from `'use client'` files; all data goes through API routes
- `NEXT_PUBLIC_*` environment variables cannot carry auth keys, secrets, or tokens
- SDK initialization must occur on module load in each app, not per-component

## R10 — Git & Branch Workflow Rules
- New SDK and types features developed on `dev` branch only
- Feature branches created from `dev`; merge to `dev` via Pull Request
- Pull Requests must pass all quality gates before merge
- Merge to `dev` only after all checks pass
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- All SDK-related commits must update relevant plan task checklist
- Never commit `.env` files or local database files
- `.env` included in `.gitignore` at repo root

## R11 — Performance Constraints
- SDK method invocation overhead: < 1ms per operation in production
- `principal()` derivation: O(1) lookup, < 1ms overhead per request
- `resolveEcosystemEndpoints()`: O(1) with result caching after first call
- `setUserPreference()` / `getUserPreference()`: async, best-effort, no block on request processing
- Preference synchronization: async, may fail silently; app uses local cached preference
- Bundle impact: < 2KB increase in gzip-compressed JavaScript size for type additions only

## R12 — Backward Compatibility Rules
- Existing SDK methods and type definitions remain intact during enhancement
- No breaking changes to existing `@allah/sdk` or `@moonwitness/types` public API
- Existing user sessions remain valid; new SDK methods additive
- Existing user preferences preserved; new preference keys additive only
- All TypeScript changes backward-compatible: existing code compiles without modification
- No removal of existing environment variables; new ones added as optional with validation
- All 7 apps backward-compatible: existing build and runtime behavior unchanged

## Forbidden Patterns & Anti-Patterns

### Forbidden
- **FP-1**: Raw HTML elements `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in app JSX
- **FP-2**: Hardcoded `BETTER_AUTH_SECRET` or other secrets in source code
- **FP-3**: `NEXT_PUBLIC_*` environment variables carrying auth keys or tokens
- **FP-4**: `company_id` derived from request body instead of principal
- **FP-5**: `resolveEcosystemEndpoints()` without SSRF validation
- **FP-6**: `SdkError` with arbitrary string messages instead of classified variants
- **FP-7**: `SkinId` with values outside the 6 approved union members
- **FP-8**: `TenantId` derived from anything other than principal's `companyId`
- **FP-9**: SDK methods without complete JSDoc contracts (`@param`, `@returns`, `@throws`)
- **FP-10**: Direct database calls from `'use client'` components

### Anti-Patterns
- **AP-1**: Duplicate `company_id` derivation logic across packages
- **AP-2**: Hardcoded default skin or preference values in source code
- **AP-3**: Audit events with before/after values leaking sensitive data
- **AP-4**: Global admin routes that don't record audit events (preserved from R3)
- **AP-5**: Onboarding flow that doesn't fail-closed on missing config (preserved from R6)
- **AP-6**: TypeScript that doesn't extend `tsconfig.base.json` (preserved from R7)
- **AP-7**: UI components that don't follow `@moonwitness/ui` patterns (preserved from R8)
- **AP-8**: SDK methods that bypass `@moonwitness/types` type contracts
- **AP-9**: Preference synchronization that blocks request processing
- **AP-10**: `resolveEcosystemEndpoints()` accepting unvalidated URLs

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
- Generate audit events per R5 schema (auth rules)

### What Agents CANNOT Do
- **NC-1**: Modify production runtime configuration (BETTER_AUTH_SECRET, etc. - from env only)
- **NC-2**: Deploy to production without following all quality gates
- **NC-3**: Commit secrets, `.env` files, or local database files
- **NC-4**: Bypass `company_id` fail-closed enforcement
- **NC-5**: Remove or modify existing audit event invariants
- **NC-6**: Create onboarding that doesn't record `create_uid`/`write_uid`
- **NC-7**: Modify `tsconfig.base.json` in ways that break existing packages
- **NC-8**: Add raw HTML elements to app JSX
- **NC-9**: Skip the SSRF validation requirement for `resolveEcosystemEndpoints()`
- **NC-10**: Bypass STYLE_PURITY or PALETTE_PURITY invariants
- **NC-11**: Create SDK methods without complete JSDoc contracts
- **NC-12**: Bypass `TenantId` derived from principal only
- **NC-13**: Bypass `SkinId` union type restriction to 6 approved values

## Git & Branch Workflow Requirements

### Branch Strategy
- All SDK and types development on `dev` branch
- Feature branches: `sdk/types/<description>` created from `dev`
- Pull Requests must pass all quality gates before merge
- Merge to `dev` only after all checks pass

### Commit Requirements
- Conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- All SDK-related commits must update relevant plan task checklist
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
- Migration script documented and tested in rehearsal mode (auth rules)
- Better Auth config validation fails startup if required env vars missing (auth rules)
- Onboarding creates superuser with proper `create_uid`/`write_uid` references (auth rules)
- Global admin routes require `company_id` and reason; audit events recorded (auth rules)
- Production startup fails closed if BETTER_AUTH_SECRET, BETTER_AUTH_URL, or CORS_ORIGINS missing (auth rules)