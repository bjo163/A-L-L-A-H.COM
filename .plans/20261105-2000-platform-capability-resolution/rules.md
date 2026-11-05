# Rule — Platform Capability Resolution & Agent Guardrails

## Mandatory Architectural Invariants

| Rule ID | Rule | Enforcement | Violation Consequence |
|---------|------|-------------|----------------------|
| **ARCH-001** | Skin tokens sourced from `packages/ui/src/theme.css` or `packages/ui/src/tokens/` only | `antislop-ui` lint rule auto-fails on arbitrary Tailwind hues | Block merge, developer must replace with token-driven utility |
| **ARCH-002** | `SkinId` whitelist: only `imperium-lumen`, `lunar-chronicles`, `rocksoil`, `nexus-paradox`, `riot-anarchy`, `mycelium` | Type guard in `SkinRoot` component, `antislop-ui` runtime check | Component falls back to default skin, 400 error for invalid SkinId |
| **ARCH-003** | No duplicate capability plans: each `new-platform-capability-*` has exactly one canonical directory | `.plans/` directory audit, BACKLOG.md status tracking | Duplicate directories blocked, one marked superseded with rationale |
| **ARCH-004** | Verification before `VERIFIED` status: every plan marked `VERIFIED` must pass all 5 quality gates | CI pipeline gate, `pnpm docs:check`, `pnpm typecheck`, `pnpm lint:arch`, `pnpm ui:test`, `pnpm ui:contrast` | Merge blocked, status reverted to `DISCOVERED` until gates pass |
| **ARCH-005** | `company_id` on every row, derived from authenticated principal, never from request body | Hub route middleware, ORM trigger enforcement | 403 Forbidden for cross-tenant access, audit event logged |
| **ARCH-006** | Parameterized SQL only, with column/sort identifier allowlist | `@allah/arsy-orm` usage, no raw `prisma/raw` queries | Block merge, code review rejects non-parameterized queries |
| **ARCH-007** | Default-deny auth: every hub route needs verified principal; only `/health`, `/ready`, onboarding, non-prod `/docs` anonymous | Fastify `principalGuard` middleware, route allowlist | Route returns 401 if no verified principal present |
| **ARCH-008** | `NEXT_PUBLIC_*` guard: hyphenated names cannot enter `resolveEcosystemEndpoints` | Guard function at start of resolution, early return on hyphen detection | Function returns 400, developer must rename without hyphen |

## Coding Conventions & Repository Standards

| Rule ID | Convention | Applies To | Example |
|---------|-----------|------------|---------|
| **CONV-001** | TypeScript strict mode: zero `any` types in public API surfaces | All packages, especially `@allah/sdk` public exports | `method(): ApiResponse<User>` not `method(): any` |
| **CONV-002** | Component library adoption: all UI components use `@moonwitness/ui` primitives | Apps, especially JSX elements | `<Card />` not `<div className="...">` for layout |
| **CONV-003** | Tailwind v4 with design tokens: all colours from `theme.css` tokens, never palette hues | `@moonwitness/ui` components, `skins.css` | `bg-primary` not `bg-blue-500` (palette) |
| **CONV-004** | `data-moonframe-skin` attribute: all skin assignment goes through this prop | `@moonwitness/ui` components, app JSX | `<Button data-moonframe-skin="imperium-lumen" />` |
| **CONV-005** | Branch naming: `feat-`, `fix-`, `chore-*` convention where adopted | Git branches | `feat/typed-sdk-methods`, `fix/skin-token-source` |
| **CONV-006** | Commit message format: present tense, imperative, under 72 chars | All git commits | `feat: add typed auth contracts` not `Added auth types` |
| **CONV-007** | Documentation standards: JSDoc on all public methods, Markdown per `DOCUMENTATION_CONTRACT.md` | All packages, especially SDK and types | `@returns {ApiResponse<User>}` not bare `return user` |

## Package Boundary Rules

| Rule ID | Rule | Direction | Enforcement |
|---------|------|-----------|-------------|
| **PKG-001** | `@allah/sdk` may import from `@moonwitness/types` and `@moonwitness/ui` only | One-way: sdk → types/ui | `import type { UserSubject } from '@moonwitness/types'` allowed, reverse forbidden |
| **PKG-002** | `@moonwitness/ui` may import from `@moonwitness/types` only | One-way: ui → types | `import type { SkinId } from '@moonwitness/types'` allowed, reverse forbidden |
| **PKG-003** | Apps may import from all three shared packages (`@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`) | Fan-in: apps → all | No inter-app package imports without explicit architecture approval |
| **PKG-004** | `packages/lint` may inspect any package but may not modify source | Read-only inspection | Lint rules define invariants, code changes go through normal channels |

## Naming Conventions

| Rule ID | Convention | Format | Example |
|---------|-----------|--------|---------|
| **NAME-001** | File naming for new types: `kebab-case.ts` | `tenants.ts`, `skins.ts`, `responses.ts`, `errors.ts` | New type in `packages/types/src/` |
| **NAME-002** | Identifier camelCase for all TypeScript/JSX | `userSubject`, `skinId`, `apiResponse` | Variable, function, component prop names |
| **NAME-003** | Task title format: imperative mood, present tense | `- [ ] Task description` | `T1: Define TenantId type` |
| **NAME-004** | Rule identifier format: `ARCH-XXX`, `CONV-XXX`, `PKG-XXX`, `NAME-XXX`, `API-XXX`, `DATA-XXX`, `TEST-XXX`, `RC-XXX` | `ARCH-001`, `CONV-001`, `PKG-001` | Used throughout rules.md and cross-documented |

## API and Database Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **API-001** | All `@allah/sdk` methods return `ApiResponse<T>` or throw `SdkError` | Type enforcement in `index.ts`, typecheck validation |
| **API-002** | No raw SQL queries: all database operations use parameterized values via `@allah/arsy-orm` | `antislop-code` rule, code review requirement |
| **API-003** | `company_id` stamped from authenticated principal, never request body | Hub route middleware `tenantOf(request)`, ORM trigger |
| **API-004** | Error responses follow `SdkError` hierarchy with specific `code` and optional `status` | `throw new SdkError(...)` pattern, catch blocks handle subclasses |
| **API-005** | SSE/event stream contracts include `method`, `status`, `duration_ms`, `tenant_id` in trace events | Structured logging in every SDK method, hub collects via MCP |

## UI/UX and Design-System Consistency

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **UI-001** | `data-moonframe-skin` attribute on all skin-assigning components | `antislop-ui` flags missing attribute, component falls back to default |
| **UI-002** | Component library adoption: use `Button`, `Card`, `Table`, `Badge`, `StatePanel`, `FormField` from `@moonwitness/ui` | Design system contract, `pnpm ui:test` verification |
| **UI-003** | Responsive behavior: all components work at mobile, tablet, desktop breakpoints | CSS media queries, container queries where appropriate |
| **UI-004** | Accessibility: all interactive components have keyboard support, ARIA labels, focus-visible states | `antislop-human` review, automated a11y testing |
| **UI-005** | Motion consistency: transitions respect `prefers-reduced-motion` system setting | CSS `prefers-reduced-motion` query, no automatic animations |

## Security and Privacy Requirements

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| **SEC-001** | Default-deny auth: every hub route needs verified principal | `principalGuard` middleware, 401 if principal missing |
| **SEC-002** | No `NEXT_PUBLIC_*` keys in `use client` files: client secrets live server-side only | ESLint rule, code scan, pre-commit hook |
| **SEC-003** | Skin data is public: `data-moonframe-skin` values are SkinId whitelist only, no secrets | `antislop-ui` runtime check, whitelist validation |
| **SEC-004** | SSRF guard: validate `base_url` before request, re-check resolved IP | Custom middleware, blocks private/loopback resolved addresses |
| **SEC-005** | Audit logging: every SDK method call emits trace event with `method`, `status`, `duration_ms`, `tenant_id` | MCP `getAuditLog` endpoint, structured trace events in each method |
| **SEC-006** | Tenant isolation: `company_id` on every row, fail-closed derivation from principal | ORM trigger, hub route scoping, 404 for cross-tenant access |

## Testing and Quality Requirements

| Rule ID | Rule | Verification |
|---------|------|-------------|
| **TEST-001** | `pnpm typecheck` passes all packages (ui, dock, headquarter, id, jizz, gate, sdk, arsy-orm, lint, types) | CI gate, EXIT=0 required |
| **TEST-002** | `pnpm lint:arch` passes all arch invariants | CI gate, EXIT=0 required |
| **TEST-003** | `pnpm docs:check` passes 100/100 points | CI gate, 100/100 required |
| **TEST-004** | `pnpm ui:test` passes design system component and skin contracts | CI gate, pass required |
| **TEST-005** | `pnpm ui:contrast` passes measured WCAG ratios for every skin's token pairs | CI gate, pass required |
| **TEST-006** | No `any` types in public API surfaces of `@allah/sdk` | Grep scan, typecheck validation |
| **TEST-007** | All SDK methods have explicit TypeScript return types and JSDoc contracts | Manual review, typecheck validation |

## Performance Constraints

| Rule ID | Constraint | Measurement |
|---------|-----------|-------------|
| **PERF-001** | Skin resolution overhead must not exceed 2ms per component render | Measured in CI benchmark, fail if >2ms |
| **PERF-002** | SDK method calls must not introduce measurable overhead (>5ms per call) | Measured in CI benchmark, fail if >5ms |
| **PERF-003** | CSS custom properties (`var(--token-name)`) used for all skin token references, avoiding inline styles and runtime computation | `antislop-ui` lint rule, code scan |

## Backward Compatibility Requirements

| Rule ID | Requirement | Impact |
|---------|------------|--------|
| **BC-001** | Default skin preservation: existing applications retain their current skin assignment if no `data-moonframe-skin` prop provided | Backward-compatible; new pages default to `imperium-lumen` |
| **BC-002** | Skin ID compatibility: new `SkinId` values do not break existing skin assignments | Whitelist expansion gradual, old SkinId values still valid |
| **BC-003** | Existing application compatibility: new SDK methods do not break existing integrations | Versioned exports with deprecation path, optional chaining in catch blocks |
| **BC-004** | `@moonwitness/types` canonical types backward-compatible: existing imports continue to work | No breaking changes to type exports, additive only |

## Forbidden Patterns and Anti-Patterns

| Rule ID | Forbidden Pattern | Reason |
|---------|------------------|--------|
| **ANTI-001** | Raw HTML `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`, `<form>`, `<label>`, `<table>` in `apps/` | Design system owns these controls; apps use composition blocks |
| **ANTI-002** | Hand-written `mw-*` component class names in app CSS | Private classes not part of public API, `STYLE_PURITY` invariant |
| **ANTI-003** | Local type redefinition in `apps/` | Duplicate types create inconsistency, use shared `@moonwitness/types` |
| **ANTI-004** | Direct DB calls in app code | ORM layer (`@allah/arsy-embed`) is sole access point, `DATA_INTEGRITY` invariant |
| **ANTI-005** | Tailwind palette hues directly in component styles (`bg-blue-500`, `text-red-600`) | `PALETTE_PURITY` invariant, colours from tokens only |
| **ANTI-006** | Third-party icon libraries (`lucide-react`, `react-icons`, `@tabler/icons-react`, `heroicons`) imported by apps | `ICON_PURITY` invariant: only `packages/ui/src/components/Icon` |
| **ANTI-007** | Undefined or non-whitelist `SkinId` values passed to `data-moonframe-skin` | Skin ID must be one of six canonical values, runtime check fails otherwise |
| **ANTI-008** | Falsely marking capabilities as `VERIFIED` without quality gate passage | `evolve-loop-guard` prevents this, but rule reinforces the invariant |
| **ANTI-009** | `NEXT_PUBLIC_*` values carrying keys/secrets/tokens in `use client` files | `NO_PUBLIC_CLIENT_SECRETS` invariant, security risk |
| **ANTI-010** | Duplicate capability plan directories without documented resolution | `ARCH-003` invariant, clean up with rationale in `report.md` |

## Agent Execution Boundaries

| Rule ID | Boundary | Scope |
|---------|----------|-------|
| **AGENT-001** | Plan-only operation: this planning task creates documentation only, no source code modifications | `.plans/` directory, Markdown documents only |
| **AGENT-002** | Documentation creation authorization: plan artifacts created only when user explicitly authorizes | User must confirm before any `.plans/` modification |
| **AGENT-003** | Implementation authorization: actual feature implementation requires separate user authorization beyond planning | Planning → implementation is separate execution task |
| **AGENT-004** | Git workflow requirements: all planning changes follow branch/create-commit-push pattern | Branch naming `feat/capability-resolution`, commit message format |
| **AGENT-005** | Validation before completion: all 5 quality gates must pass EXIT=0 before any task marked complete | Automated CI checks, manual verification if CI unavailable |

## Git and Branch Workflow Requirements

| Rule ID | Requirement | Process |
|---------|------------|---------|
| **GIT-001** | Branch creation: new features on `feat/<short-description>` branches | `git checkout -b feat/capability-resolution dev` |
| **GIT-002** | Commit message format: present tense, imperative, under 72 chars | `feat: add typed auth contracts` not `Added auth types feature` |
| **GIT-003** | Pre-commit hooks: `pnpm lint:arch` and `pnpm typecheck` run automatically | Husky pre-commit, fail hook blocks commit |
| **GIT-004** | Pre-push checks: all 5 quality gates (`docs:check`, `typecheck`, `lint:arch`, `ui:test`, `ui:contrast`) must pass | `gh run watch` or `pnpm --filter @allah/monorepo run:all-gates` |
| **GIT-005** | Commit-msg validation: commitlint runs on every commit, rejects non-conventional commits | `commitlint --edit` or `git-cz` configuration |

## Validation Requirements Before Marking Tasks Complete

Before marking any task complete in `task.md`, the following validations must pass:

1. **Spec Verification**: Task supports at least one acceptance criterion from `spec.md` — verify cross-document consistency
2. **Design Verification**: Task implementation aligns with `design.md` architecture and component patterns — verify API contracts and data models
3. **Task Verification**: Task's subtasks are all checked (where applicable) and the task itself is fully done — no partial completions
4. **Rule Verification**: All rules from `rule.md` relevant to the task area are satisfied (e.g., if task modifies SDK, verify `CONV-001`, `API-001`, `TEST-001`-`TEST-007`) — check rule.md cross-references
5. **Cross-Document Consistency**: No contradictory information across `spec.md`, `design.md`, `task.md`, `rule.md` — verify all four documents remain synchronized

Each validation must explicitly pass before a task transitions from `in_progress` to `completed`. If any validation fails, the task returns to `in_progress` and the issue must be resolved.