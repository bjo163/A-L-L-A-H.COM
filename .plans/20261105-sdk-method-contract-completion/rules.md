# Rules: SDK Method Contract Completion & Types Package Enhancement

## R1 — Types Package Rules
- `TenantId` MUST be `string` type matching positive integer pattern (company_id format)
- `SkinId` MUST be union of exactly 6 approved skin IDs: "imperium-lumen", "lunar-chronicles", "rocksoul", "nexus-paradox", "riot-anarchy", "mycelium"
- `ApiResponse<T>` MUST have exactly three fields: `data: T | null`, `error: SdkError | null`, `success: boolean`
- `SdkError` hierarchy MUST have five variants: `SdkErrorNetwork`, `SdkErrorValidation`, `SdkErrorAuth`, `SdkErrorServer`, `SdkErrorSsrf`
- All new types MUST be exported from `packages/types/src/index.ts`
- All new types MUST pass strict TypeScript typecheck with zero errors
- `TenantId` derived from principal, never from request body (fail-closed)
- `SkinId` used only with `@moonwitness/ui` SkinRoot and skin selection components
- No new types that conflict with existing `@moonwitness/types` definitions

## R2 — SDK Method Contract Rules
- `principal()` MUST return `Principal` type from `@allah/arsy-core`
- `principal()` MUST throw `SdkErrorAuth` if principal cannot be derived (not authenticated)
- `resolveEcosystemEndpoints()` MUST perform SSRF validation and reject private/loopback addresses
- `resolveEcosystemEndpoints()` MUST throw `SdkErrorSsrf` with `rejectedUrl` and `reason` on SSRF failure
- `resolveEcosystemEndpoints()` MUST throw `SdkErrorValidation` for invalid URL format
- `isTrustedOrigin()` MUST validate origin format and return boolean
- All SDK methods MUST return `ApiResponse<T>` wrapper
- All SDK methods MUST have complete JSDoc (`@param`, `@returns`, `@throws`)
- No SDK method may return raw types without `ApiResponse<T>` wrapper
- SDK methods must not have side effects beyond type derivation and URL resolution

## R3 — Type Integration Rules
- `TenantId` used in `@allah/arsy-orm` query builder for fail-closed company_id filtering
- `SkinId` used in `@moonwitness/ui` SkinRoot skin prop and skin selector components
- `ApiResponse<T>` used as return type for all SDK methods and API route handlers
- `SdkError` used in error boundaries, logging, and error reporting
- All packages import `TenantId`, `SkinId`, `ApiResponse`, `SdkError` from `@moonwitness/types`, not local redefinitions
- No inline type definitions outside `@moonwitness/types` package
- Types must extend or be compatible with `tsconfig.base.json` strict mode

## R4 — SSRF Validation Rules
- `resolveEcosystemEndpoints()` MUST reject these address ranges:
  - 10.x.x.x (10.0.0.0/8)
  - 192.168.x.x (192.168.0.0/16)
  - 172.16.x.x - 172.31.x.x (172.16.0.0/12)
  - ::1 (localhost IPv6)
  - fe80::/10 (link-local IPv6)
  - 127.x.x.x (loopback IPv4)
- `resolveEcosystemEndpoints()` MUST accept these protocols: https:, http:
- `resolveEcosystemEndpoints()` MUST reject URLs without valid protocol
- SSRF validation runs at function entry, before any URL parsing
- Rejected URLs produce `SdkErrorSsrf` with `rejectedUrl` containing the original input
- Reason for rejection must be descriptive (e.g., "private address detected", "loopback address detected")

## R5 — Error Handling Rules
- All SDK methods return `ApiResponse<T>` with `success: boolean` flag
- Callers MUST check `success` before accessing `data` field
- `error` field contains `SdkError` for diagnosis and categorization
- `SdkError` code determines error handling strategy:
  - `NETWORK_ERROR`: Retry with exponential backoff
  - `VALIDATION_ERROR`: Show inline field error messages
  - `AUTH_ERROR`: Redirect to re-authentication, 401 behavior
  - `SERVER_ERROR`: Show generic error, log with correlation ID
  - `SSRF_ERROR`: Deny access, log with rejected URL, security audit
- Error boundaries display user-friendly messages, never raw SdkError details

## R6 — Git & Branch Workflow Rules
- All SDK/types development on `dev` branch only
- Feature branches created from `dev`; merge to `dev` via Pull Request
- New type files follow convention: `packages/types/src/<name>.ts`
- New SDK method files follow convention: `packages/sdk/src/<method>.ts`
- Pull Requests must pass all quality gates before merge
- Merge to `dev` only after all checks pass

## R7 — Performance Constraints
- `principal()`: O(1) lookup from AsyncLocalStorage, < 1ms overhead
- `resolveEcosystemEndpoints()`: O(1) URL parsing + SSRF check, < 5ms overhead
- `ApiResponse<T>`: Zero runtime overhead, pure type enrichment at compile time
- `SdkError`: Minimal overhead, error classification only at throw sites
- SSRF validation: O(1) regex/ip-check, < 1ms per call

## R8 — Backward Compatibility Rules
- Existing type definitions remain unchanged; only new types added
- Existing SDK methods unchanged; only new methods added
- All new types backward-compatible: existing code compiles without modification
- `resolveEcosystemEndpoints` additive: existing URL construction unchanged, new method added
- All TypeScript changes backward-compatible: existing code compiles without modification
- No removal of existing type exports; new ones added as additions

## R9 — Forbidden Patterns & Anti-Patterns

### Forbidden
- **FP-1**: Raw HTML elements `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in package source
- **FP-2**: `NEXT_PUBLIC_*` environment variables carrying keys, secrets, or tokens
- **FP-3**: `company_id` derived from request body instead of principal
- **FP-4**: `resolveEcosystemEndpoints` without SSRF validation
- **FP-5**: SDK methods returning types without `ApiResponse<T>` wrapper
- **FP-6**: Type definitions outside `packages/types/src/`
- **FP-7**: `SdkError` hierarchy with fewer than 5 variants
- **FP-8**: `SkinId` used outside `@moonwitness/ui` component context
- **FP-9**: `TenantId` used without fail-closed company_id enforcement
- **FP-10**: Inline type definitions that duplicate `@moonwitness/types` exports

### Anti-Patterns
- **AP-1**: Duplicate type definitions across packages
- **AP-2**: `SdkError` variants without proper `SdkErrorBase` structure
- **AP-3**: `ApiResponse<T>` used without checking `success` flag first
- **AP-4**: `principal()` called without checking authentication status
- **AP-5**: `resolveEcosystemEndpoints` called with untrusted input
- **AP-6**: Type assertions that bypass `ApiResponse<T>` wrapper
- **AP-7**: `SkinId` values beyond the 6 approved IDs
- **AP-8**: `TenantId` derived from URL parameters or request body

## R10 — Agent Execution Boundaries

### What Agents CAN Do
- Create, modify, and read plan documents in `.plans/`
- Run `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`, `pnpm lint`
- Create new files in `packages/types/src/` and `packages/sdk/src/`
- Modify TypeScript configurations and ESLint configurations
- Add SDK methods and type definitions
- Write unit and integration tests
- Modify Husky hooks
- Update GitHub Actions workflow files
- Run migration scripts in rehearsal mode
- Generate audit events per established schema

### What Agents CANNOT Do
- **NC-1**: Modify production runtime configuration (env vars, URLs - from env only)
- **NC-2**: Deploy to production without following all quality gates
- **NC-3**: Commit secrets, `.env` files, or local database files
- **NC-4**: Bypass `company_id` fail-closed enforcement
- **NC-5**: Remove or modify existing audit event invariants
- **NC-6**: Create onboarding that doesn't record proper type references
- **NC-7**: Modify `tsconfig.base.json` in ways that break existing packages
- **NC-8**: Add raw HTML elements to package source code
- **NC-9**: Skip the SSRF validation requirement for `resolveEcosystemEndpoints`
- **NC-10**: Bypass STYLE_PURITY or PALETTE_PURITY invariants

## R11 — Type Tracing Requirements
- Every `TenantId` value traceable to: authenticated principal → company_id → storage query
- Every `SkinId` value traceable to: user selection → localStorage → SkinRoot prop
- Every `ApiResponse<T>` value traceable to: SDK method call → success/data/error handling
- Every `SdkError` value traceable to: error origin → code → handling strategy
- All type traces must be verifiable through typecheck and test output
- Type traces must not have gaps or unresolved dependencies

## R12 — Plan Enablement Requirements
- All 13 previously-empty "new-platform-capability" plans must reference proper types from this enhancement
- Each plan's spec.md must import and use `TenantId`, `SkinId`, `ApiResponse<T>`, or `SdkError` as appropriate
- Plan task.md must have type-related tasks checked where types apply
- Plan rule.md must not contradict these rules
- Plan design.md must reference type integration architecture where applicable
- Completion requires evidence that plans can now be implemented with proper typing