# Rule — Platform Foundations & SDK Enhancement

## Mandatory Architectural Invariants

| Rule | Description | Enforcement |
|---|---|---|
| **Storage Invariant** | SHA-256 content-addressed · write-once · `data/storage/<digest>` | All SDK trace events and audit events written to content-addressed storage |
| **SQL Invariant** | Parameterized values only, plus column/sort identifier allowlist. No raw string queries. | DB operations in `@allah/sdk` and app API routes use parameterized queries only; column allowlist enforced via `sql` helper |
| **Auth Invariant** | Default-deny: every hub route needs a verified principal. Only `/health`, `/ready`, onboarding, non-prod `/docs` are anonymous. | Middleware verifies principal on every hub route; `company_id` derived from principal, never request body |
| **Tenant Invariant** | `company_id` on every row, derived from the principal and fail-closed — never taken from the request body. | SDK `principal()` method provides `company_id`; API routes must not accept `company_id` from request |
| **ORM Invariant** | Embedded PGlite via `@allah/arsy-orm` only. Zero overlap. | All database operations go through `@allah/arsy-orm`; raw Prisma/Sequelize prohibited |
| **Audit Invariant** | Every model insert/update/delete writes one append-only event in the same transaction; events store changed field names, not values. | Database trigger or SDK wrapper ensures one audit event per operation; event schema: `{action, field_names, timestamp, tenant_id}` |
| **Global Admin Invariant** | Superuser access is server-authorized per admin route, requires a reason, and records the target tenant; generic CRUD never exposes identity, audit, or credential-bearing models. | Admin routes require explicit `X-Reason` header; audit event records target tenant ID |
| **Style Source Invariant** | `packages/ui/src/theme.css` maps Tailwind utilities onto skin tokens. Apps define no colour, type, or theme variables and target no private `mw-*` class (`STYLE_PURITY`). | ESLint rule `style-purity` monitors; violations block merge |
| **Markup Colour Invariant** | App JSX never paints with a Tailwind palette hue (`PALETTE_PURITY`). Colour arrives from a component variant, a composition block, or a token-driven utility. | PostCSS lint rule; components use `data-moonframe-skin` variants or token-driven utilities only |
| **Icon Source Invariant** | Third-party icon libraries (`lucide-react`, `react-icons`, `@tabler/icons-react`, `heroicons`) are imported only by `packages/ui/src/components/icon.tsx`; apps consume the design-system `Icon` component (`ICON_PURITY`). | Import lint rule; `icon.tsx` is the sole entry point for icon libraries |
| **Landmark Purity Invariant** | The skip-link `id="main-content"` landmark belongs to the design-system `RouteShell`; apps never hand-roll it (`LANDMARK_PURITY`). | ESLint rule `landmark-purity`; `RouteShell` component owns the skip-link |
| **Client Secrets Invariant** | No `'use client'` file may read a `NEXT_PUBLIC_*` value carrying a key/secret/token (`NO_PUBLIC_CLIENT_SECRETS`). Upstream credentials live server-side only — apps proxy through a same-origin route handler. | `no-restricted-imports` ESLint rule; CI fails if violated |
| **Composition Blocks Invariant** | Hero, kicker, section heading, route shell, status message, destination card, and state panel exist once in `packages/ui/src/blocks/`. Applications compose them instead of redefining the same vocabulary per app. | Import analysis; each block imported from `@moonwitness/ui` in every app |
| **Route States Invariant** | Every app ships `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel` (`STATE_PARITY`). | Enforced by `route-states` ESLint rule; each app must have these three files derived from `StatePanel` |

## Coding Conventions and Repository Standards

### TypeScript Conventions

1. **No `any` in public APIs**: Every public function, method, or component prop must have an explicit TypeScript type. `any` is only permitted in internal implementation details hidden behind typed interfaces.

2. **JSDoc contracts**: Every exported method must have JSDoc with:
   - `@param` for each parameter with type and description
   - `@returns` with type and description
   - `@throws` for each error condition with `SdkError` subclass name
   - `@example` for complex usage patterns

3. **Interface-first design**: Define interfaces/types before implementation. The type defines the contract; implementation conforms to it.

4. **Generic typing**: Use `ApiResponse<T>` for all SDK method returns. Never return raw objects or `Promise<any>`.

### Component Conventions

1. **Skin recipe pattern**: All UI components accept an optional `data-moonframe-skin` prop/attribute. When skin is set, styling is applied through CSS variable substitution in `skins.css`, never arbitrary Tailwind variants.

2. **No direct Tailwind palette hues**: Components must not use `bg-red-500`, `text-blue-600`, etc. directly. Colour must come from:
   - Component variants (e.g., `variant="primary"`)
   - Token-driven utilities (e.g., `token("color.crimson")`)
   - `[data-moonframe-skin='...']` rules in `skins.css`

3. **Design-system Icon only**: Import only from `@moonwitness/ui/src/components/Icon`. No direct imports of `lucide-react`, `react-icons`, etc. in app code.

4. **[data-slot] attributes**: Shared components expose `data-slot` attributes as the supported CSS hook. App CSS must not target private `mw-*` class names.

### SDK Conventions

1. **Error hierarchy**: All SDK errors extend `SdkError` base type with a `type` discriminator field.

2. **Trace events**: Every SDK method emits a structured trace event via `sdkTrace({ method, status, duration_ms, tenant_id, skin_id, request_id })` before returning.

3. **Principal first**: `principal()` method must be the first call in any authenticated code path. It returns `{ company_id, tenant_id, skin_id, user_id }`.

4. **Nexus-PURITY**: `resolveEcosystemEndpoints` must validate `base_url` before the request and re-check the resolved IP, so a domain that resolves to a private or loopback address is refused.

### Package Boundary Rules

1. **`@allah/sdk` imports**: May import from `@moonwitness/types` and `@moonwitness/ui` only. No other packages.

2. **`@moonwitness/ui` imports**: May import from `@moonwitness/types` only. No other packages (except internal utility functions).

3. **`@moonwitness/types` imports**: None (leaf package). No imports from any other package.

4. **Apps imports**: May import from `@moonwitness/ui`, `@allah/sdk`, and `@moonwitness/types`. No direct imports between apps.

5. **`packages/lint` imports**: None. Provides arch invariant enforcement via custom rules.

6. **`packages/arsy-orm` imports**: None. Sole ORM package; provides PGlite wrapper only.

### Naming Conventions

| Entity | Naming Pattern | Example |
|---|---|---|
| SDK methods | camelCase, verb-noun | `fetchObservations()`, `setSkin()` |
| Type definitions | PascalCase for interfaces, camelCase for types | `ApiResponse`, `TenantId` |
| Skin IDs | kebab-case string literals | `"imperium-lumen"`, `"rocksoil"` |
| CSS class names | `kebab-case` or `camelCase` | `data-moonframe-skin`, `SkinRoot` |
| Trace events | snake_case | `method`, `duration_ms`, `tenant_id` |
| Error codes | UPPER_SNAKE_CASE | `INVALID_TOKEN`, `OBSERVATION_NOT_FOUND` |
| Environment variables | UPPER_SNAKE_CASE with prefix | `NEXT_PUBLIC_*` (limited subset) |

### API and Database Rules

1. **All API responses**: Must conform to `ApiResponse<T>` shape with `data?`, `error?`, and `metadata?` fields.

2. **Parameterized SQL only**: No string interpolation in SQL queries. Use `$1`, `$2`, etc. parameter placeholders.

3. **Column allowlist**: Every query must specify an allowlist of permitted column identifiers. Sort columns must also be from an allowlist.

4. **`company_id` derivation**: Always derived from the verified principal, never from `req.body`, `req.query`, or `req.params`.

5. **Tenant isolation**: Every row-level operation includes `WHERE company_id = $N` filter, injected by the SDK or middleware.

6. **Audit events**: Every INSERT/UPDATE/DELETE writes one append-only event with `{action, field_names, old_values?, new_values?, timestamp, tenant_id}`.

### UI/UX and Design-System Consistency

1. **Skin assignment**: Worlds are assigned via `data-moonframe-skin` attribute on the root layout element. Never through CSS class toggling or CSS variable overriding.

2. **Colour tokens**: All colour arrives from the design-system token system. No arbitrary Tailwind `hue-()` values, no hard-coded hex codes in component files.

3. **Typography tokens**: All typography arrives from design-system tokens. No raw `font-size`, `font-family` strings in component JSX.

4. **Spacing tokens**: All spacing arrives from design-system tokens. No raw `margin`, `padding` values without token reference.

5. **Responsive behavior**: All layouts must work at mobile breakpoints. Use container queries where appropriate; never mobile-unresponsive patterns.

6. **Accessibility**: All components must have stable accessible names, roles, and states. Keyboard focus must be visible. Reduced-motion media query respected.

7. **State panels**: `error.tsx`, `loading.tsx`, `not-found.tsx` in every app must be built from `StatePanel` component in `@moonwitness/ui`. Custom implementations prohibited.

### Security and Privacy Requirements

1. **Default-deny auth**: Every hub route must have a verified principal. Anonymous access only on explicitly allowlisted routes.

2. **`company_id` fail-closed**: Every database row must have `company_id`. Inserts without `company_id` are rejected. The value must be derived from the authenticated principal, never from the request.

3. **SSRF prevention**: `base_url` must be validated before the request. The resolved IP must be re-checked — if it resolves to a private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) or loopback (127.0.0.1) address, the request is refused.

4. **No client secrets**: No `'use client'` file may read `NEXT_PUBLIC_*` values carrying keys/secrets/tokens. Use same-origin route handlers for credential access.

5. **Audit data privacy**: Audit events store changed field names, not values. No PII (personally identifiable information) in audit events. `tenant_id` is stored but no user-identifying data beyond that.

6. **Trace event sanitization**: Structured trace events must not contain passwords, tokens, or PII. Method names and status are acceptable; request IDs are acceptable but must not expose secrets.

### Testing and Quality Requirements

1. **Unit test coverage**: All new SDK methods must have unit tests verifying correct `ApiResponse` shape, error type dispatch, and trace event emission.

2. **Integration test coverage**: Skin switching flow, auth flow, and SQL parameterization must be verified end-to-end.

3. **Type test coverage**: `pnpm typecheck` must pass 100% with zero `any` types in public APIs.

4. **Arch invariant compliance**: `pnpm lint:arch` must pass with zero violations.

5. **Design system contract compliance**: `pnpm ui:test` must pass all component and skin contract checks.

6. **WCAG contrast compliance**: `pnpm ui:contrast` must pass measured WCAG ratios for every skin's token pairs (minimum AA for normal text, AAA for large text).

7. **Documentation compliance**: `pnpm docs:check` must pass 100/100.

### Performance Constraints

1. **SDK method overhead**: Target <5ms per SDK method call as measured in CI benchmark. Regressions blocked by `pnpm typecheck` and manual benchmark.

2. **Skin switching**: Target <100ms re-render time with CSS variable substitution from skin change to UI update.

3. **API response time**: Target <200ms for observation API endpoints (including DB query + parameterization overhead).

4. **SSE stream reconnection**: Target <3s auto-reconnect time after disconnect.

5. **Bundle size**: No measurable increase in initial bundle size (>5kb gzipped) from new SDK or UI additions.

### Backward Compatibility Requirements

1. **SDK versioned exports**: New methods must not break existing integrations. Provide versioned exports with deprecation path for removed methods.

2. **Type addition only**: New types/interfaces may be added without breaking changes. Removing or renaming types requires major version bump and deprecation period.

3. **API contract stability**: `ApiResponse<T>` shape must not change (additive changes only: new optional fields, never removing existing ones).

4. **Skin recipe backward compatibility**: Existing `data-moonframe-skin` values must continue to work. New skin values must not break existing ones.

5. **Database migration**: If schema changes are needed, provide migration scripts. Zero-downtime migration preferred.

### Forbidden Patterns and Anti-Patterns

| Forbidden Pattern | Reason | Allowed Alternative |
|---|---|---|
| Raw string SQL queries | SQL injection risk | Parameterized queries with `$1`, `$2` placeholders |
| `any` types in public APIs | Type safety loss | Explicit types with interfaces |
| Arbitrary Tailwind `hue-()` values | PALETTE_PURITY violation | Token-driven utilities or `data-moonframe-skin` variants |
| Third-party icon libraries in app code | ICON_PURITY violation | Design-system `Icon` component only |
| `NEXT_PUBLIC_*` with keys/secrets | Client secret exposure | Server-side proxy routes |
| Hand-rolled `id="main-content"` landmark | LANDMARK_PURITY violation | `RouteShell` component owns skip-link |
| Duplicate skin root worlds | STYLE_PURITY violation | Single `SkinRoot` per app, `SkinScope` for route scoping |
| Request body `company_id` | Tenant invasion risk | Derive from principal only |
| SSRF-through-domain-resolve | Network security risk | Validate `base_url` and re-check resolved IP |
| Forms without `data-moonframe-skin` | Inconsistent world appearance | All forms accept skin recipe pattern |
| Custom error panels outside `StatePanel` | STATE_PARITY violation | Use `StatePanel` from `@moonwitness/ui` |

### Agent Execution Boundaries

1. **Planning only**: This plan is for architecture design. Do not implement features without explicit user request and task tracking.

2. **Quality gate enforcement**: Before marking any task complete, run and verify all quality gates pass:
   - `pnpm docs:check` (100/100)
   - `pnpm typecheck` (all packages)
   - `pnpm lint:arch` (zero violations)
   - `pnpm ui:test` (design system contracts)
   - `pnpm ui:contrast` (WCAG ratios)

3. **No production code modification**: This plan creates specification documents only. Actual code changes require separate task creation and user approval.

4. **Git workflow**: All changes must follow the repository's git workflow:
   - Work on `dev` branch
   - Feature branches named `feature/<slug>`
   - Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
   - Pre-commit: `docs:check` + `lint:arch` + `lint` + `typecheck` + `ui:contrast`
   - Pre-push: all build gates + `ui:test` + `ui:contrast`

5. **Branch workflow requirements**:
   - New capabilities on `feature/` branches
   - Bug fixes on `fix/` branches
   - All changes require pre-commit hook passage
   - Merge to `dev` only after all quality gates pass

6. **Validation requirements before marking tasks complete**:
   - Run the specific quality gate relevant to the task
   - Verify no new `any` types introduced
   - Confirm design-system invariants preserved
   - Ensure no forbidden patterns present
   - Document any trade-offs in task comments

### Git and Branch Workflow Requirements

1. **Branch naming**: `feature/<feature-slug>` for new capabilities, `fix/<issue-desc>` for bug fixes

2. **Commit message format**: Conventional commits:
   - `feat: add new SDK method with typed contract`
   - `fix: resolve SSRF validation in resolveEcosystemEndpoints`
   - `docs: update SDK JSDoc contracts`
   - `refactor: restructure SkinRoot provider`

3. **Pre-commit hooks**: Must pass `docs:check` + `lint:arch` + `lint` + `typecheck` + `ui:contrast`

4. **Pre-push hooks**: Must pass all build gates + `ui:test` + `ui:contrast`

5. **Merge requirements**: 
   - All quality gates must pass on the feature branch
   - No merge conflicts with `dev`
   - CHANGELOG.md updated if user-visible changes
   - At least one other agent/reviewer must approve

6. **Tagging**: Releases tagged with `v<semver>` after dev build verification

7. **Rollback plan**: If a merge introduces regressions, `git revert` the commit and document the issue. Do not force-push to shared branches.

### Validation Requirements Before Marking Tasks Complete

Before any task is marked `completed`, the following must be verified:

1. **Quality gate passage**: Run the relevant `pnpm` command and confirm passing output:
   - New SDK methods: `pnpm typecheck` + manual trace event verification
   - New UI components: `pnpm ui:test` + `pnpm ui:contrast`
   - Platform primitives: `pnpm lint:arch` + `pnpm docs:check`
   - Capability resolution: All 13 `new-platform-capability-*` plans resolved or documented

2. **No forbidden patterns**: Grep codebase for:
   - Any `any` types in public API surfaces
   - Raw string SQL queries (`${variable}` in SQL strings)
   - Arbitrary Tailwind palette hues (`bg-red-500`, `text-blue-600`, `hue-()`)
   - Third-party icon imports outside `icon.tsx`
   - `NEXT_PUBLIC_*` with secret-carrying values
   - Hand-rolled `id="main-content"` landmarks

3. **Design-system invariants preserved**:
   - `STYLE_PURITY`: No app-defined colour/type/theme variables
   - `PALETTE_PURITY`: No Tailwind palette hue usage in app JSX
   - `ICON_PURITY`: Only `@moonwitness/ui` `Icon` component used
   - `LANDMARK_PURITY`: `id="main-content"` owned by `RouteShell`
   - `STATE_PARITY`: `error.tsx`, `loading.tsx`, `not-found.tsx` from `StatePanel`

4. **Backward compatibility verified**: No breaking changes to existing SDK methods or type contracts without deprecation path documented.

5. **Performance baseline confirmed**: SDK method calls within 5ms overhead, skin switching within 100ms (if applicable to the task).

6. **Documentation updated**: `spec.md`, `design.md`, `task.md`, and `rule.md` all consistent and synchronized for the feature.