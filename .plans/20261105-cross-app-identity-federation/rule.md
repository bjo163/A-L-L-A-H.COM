# Cross-App Identity Federation & Session Synchronization

## Mandatory Architectural Invariants

### Tenant Isolation
- **Rule**: Every authentication event must include `company_id` derived from the verified principal. The `company_id` must never be taken from the request body.
- **Enforcement**: Middleware validates `company_id` presence on all auth-related requests. Requests missing `company_id` are rejected with 401.
- **Violation Detection**: Audit log must record any missing `company_id` attempt.

### Default-Deny Auth
- **Rule**: Every hub route needs a verified principal. Only explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`) is anonymous.
- **Enforcement**: Auth middleware runs on every request. Unauthenticated requests to protected routes return 401.
- **Verification**: Integration tests must confirm unauthenticated access is denied to all app routes.

### Fail-Closed Session Handling
- **Rule**: Ambiguous or failed auth state results in sign-in required, not silent failure.
- **Enforcement**: If session verification returns uncertain state, user is redirected to authenticate. No partial authentication.
- **Error Path**: All auth error paths must redirect to sign-in, not fallback to guest mode.

## Coding Conventions and Repository Standards

### TypeScript Strictness
- All new code must pass `pnpm typecheck` with zero errors
- No `any` types where explicit types exist (use `${packages/types}` conventions)
- All exported SDK methods must have JSDoc documentation

### Naming Conventions
- **SDK methods**: camelCase, verb-noun format (e.g., `verifyCrossAppAuth`, `syncSessionToApps`)
- **API routes**: `route.ts` format, grouped by feature (`cross-app/` directory)
- **Middleware**: `authMiddleware` or `withAuth` prefix
- **Components**: `Auth*` prefix for all auth-related UI components
- **Environment variables**: `NEXT_PUBLIC_` prefix strictly prohibited for auth secrets

### Package Boundaries and Dependency Rules

#### SDK Package (`@allah/sdk`)
- Can import from: `@allah/arsy-orm`, `@moonwitness/types`, `@moonwitness/ui`
- Cannot import from: Any `apps/*` package
- Must not introduce new peer dependencies without approval

#### UI Package (`@moonwitness/ui`)
- Can import from: `@moonwitness/types`, `@allah/sdk` (for auth methods)
- Cannot import from: Any `apps/*` package
- Must use design tokens only, no custom CSS colors or typography

#### App Packages (`apps/*`)
- Must integrate via provided SDK methods, not duplicate auth logic
- Can import from: `@allah/sdk`, `@moonwitness/ui`, `@moonwitness/types`
- Must not reimplement cross-app auth from scratch

### Reusability and Modularity Requirements

#### Cross-App SDK Methods
- Methods must be pure functions where possible (no side effects)
- Methods must not modify global state without explicit invocation
- Methods must be chainable and composable

#### Auth Middleware
- Middleware must be composable with other middleware
- Must not assume specific database setup (work with PGlite/Arsy-ORM)
- Must handle both API routes and page routes

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| SDK methods | `verbCrossAppNoun` | `verifyCrossAppAuth` |
| API routes | `feature/subfeature` | `/api/auth/cross-app/verify` |
| Middleware | `with*Auth` or `auth*Middleware` | `withAuth`, `authMiddleware` |
| UI components | `Auth*` prefix | `AuthButton`, `SessionStatus` |
| Environment vars | `AUTH_` prefix for auth-related | `AUTH_BASE_URL`, `AUTH_VIRTUAL_KEY` |
| Log events | `auth.*` namespace | `auth.login`, `auth.cross_app_sync` |

### API and Database Rules

#### SDK API Methods
- All methods must return typed promises, never `any`
- Error handling must use specific error types, not generic `Error`
- Must validate input parameters before making requests

#### Database Rules (Arsy-ORM/PGlite)
- All auth sessions write one append-only event per insert/update/delete
- Events store changed field names, not values
- `company_id` on every row, derived from principal, fail-closed

#### API Endpoint Rules
- All new endpoints must have OpenAPI/TypeScript types
- Rate-limiting must be applied to auth verification endpoints
- Input validation must use Zod or similar schema validator

### UI/UX and Design-System Consistency

#### Component Library Usage
- All auth UI components must use `@moonwitness/ui` components
- No hand-written `<button>` / `<input>` / `<select>` / `<textarea>` / `<a>` / `<form>` / `<label>` / `<table>` in app JSX
- Must use `Button asChild` pattern when turning router links into buttons
- Must use design-system `Icon` component, not third-party icon libraries

#### Style Purity
- App CSS must not target private `mw-*` class names (`STYLE_PURITY`)
- Colour must arrive from component variant, composition block, or token-driven utility
- Tailwind palette hues (`PALETTE_PURITY`) must not be used directly in app CSS

#### Landmark Purity
- The skip-link `id="main-content"` landmark belongs to design-system `RouteShell`
- Apps never hand-roll the main content landmark

### Security and Privacy Requirements

#### Authentication Security
- All session tokens must be HTTP-only cookies, never exposed to JavaScript
- Virtual keys must never be `NEXT_PUBLIC_`
- Must use Better Auth sign-in for browser sessions (not manual token storage)
- Cross-app tokens must be encrypted before syndication

#### Privacy Requirements
- No personal identifiers stored in cross-app session data beyond `tenant_id`
- All auth logs must be retained per organizational retention policy
- Fail-closed: reject on `legal_hold` / `retention_until`

#### Forbidden Patterns
- ❌ Storing secrets in environment variables with `NEXT_PUBLIC_` prefix
- ❌ Direct DB calls from app route handlers
- ❌ Raw string queries or arbitrary SQL
- ❌ Hand-written native HTML controls in favor of `@moonwitness/ui` components
- ❌ Bypassing tenant isolation for convenience
- ❌ Exposing auth tokens to client-side JavaScript

### Testing and Quality Requirements

#### Test Coverage Minimums
- SDK methods: 80%+ test coverage
- Auth middleware: 90%+ test coverage
- API endpoints: 80%+ test coverage
- UI components: 70%+ test coverage (includes accessibility)

#### Quality Gates (must pass)
1. `pnpm typecheck` - Zero TypeScript errors in all packages
2. `pnpm lint:arch` - 100% architectural invariant compliance
3. `pnpm docs:check` - 100/100 documentation compliance
4. `pnpm ui:contrast` - WCAG AA ratios for all token pairs
5. `pnpm arsy:build` - Arsy ORM builds successfully
6. `pnpm ui:test` - Design system component contracts pass

#### Test Requirements
- Unit tests for all new SDK methods
- Integration tests for cross-app auth flow
- End-to-end tests for sign-in across apps
- Accessibility tests for all UI components (`axe` or similar)
- Performance tests (auth check < 50ms)

### Performance Constraints

#### Auth Check Latency
- Maximum 50ms per auth check (measured from middleware start to completion)
- Target: < 20ms in production with cached sessions
- Monitoring: Alert if average exceeds 30ms over 5-minute window

#### Syndication Performance
- Session sync to all apps must complete within 2 seconds
- Failed syncs should not block app functionality
- Batch sync for multiple apps preferred over individual calls

### Backward Compatibility Requirements

#### No Breaking Changes
- Existing auth flows must continue to work unchanged
- Existing SDK methods must not have signature changes
- Existing API routes must not be modified or removed

#### Migration Path
- New cross-app features opt-in via middleware configuration
- Apps can opt-out of cross-app sync if desired
- Documentation provides migration guide for existing auth setups

### Git and Branch Workflow Requirements

#### Branch Strategy
- All work occurs on feature branches: `feature/cross-app-identity-<task-number>`
- Branches must be based on `dev` branch
- Pull requests must include: description of changes, impact analysis, test plan

#### Commit Guidelines
- Conventional commits format: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
- Commit messages must reference the task ID: `.plans/20261105-cross-app-identity-federation`
- No squash merges without explicit approval

#### Validation Requirements Before Marking Tasks Complete

Before marking any task as complete, verify:

1. **Typecheck**: `pnpm typecheck` passes with zero errors across all packages
2. **Lint**: `pnpm lint:arch` passes with 100% invariant compliance
3. **Docs**: `pnpm docs:check` passes with 100/100 score
4. **Tests**: All new tests pass (unit + integration)
5. **Build**: All affected apps build successfully (`pnpm <app>:build`)
6. **No Regressions**: Existing auth flows unchanged (manual verification)
7. **Documentation**: spec.md, design.md, task.md, rule.md all synchronized and complete

#### Task Completion Signal
A task is considered complete only when ALL of the following are true:
- [ ] All acceptance criteria from spec.md verified
- [ ] All success metrics targets met or progress clearly documented
- [ ] No open blocking issues or TODOs
- [ ] All four plan documents (spec.md, design.md, task.md, rule.md) are synchronized
- [ ] User (or product owner) sign-off obtained for the completed scope