---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MCP-TOOL-REGISTRY-UI-RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-04"
---

# MCP Tool Registry & Execution UI — Implementation Rules

## 1. Mandatory Architectural Invariants

### R-001 — One Source of Truth for UI Controls
**Rule:** All interactive controls MUST use `@moonwitness/ui` components.  
**Forbidden:** Raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<form>`, `<table>`, `<label>` in app code.  
**Enforcement:** `@moonwitness/lint` rule `UI_PURITY` fails build.  
**Rationale:** Consistency, accessibility, skin theming, reduced duplication.

### R-002 — One Source of Truth for Styling
**Rule:** All styling MUST come from `packages/ui/src/theme.css` token mappings.  
**Forbidden:** 
- Inline styles (`style={{ color: 'red' }}`)
- Tailwind palette hues in app JSX (`text-blue-500`, `bg-red-600`)
- Local theme variables (`--background`, `--foreground`)
- Hard-coded colors, fonts, or spacing  
**Enforcement:** `@moonwitness/lint` rules `STYLE_PURITY`, `INLINE_STYLE_PURITY`, `PALETTE_PURITY` fail build.  
**Rationale:** Skin authority, theming capability, maintainability.

### R-003 — Tenant Isolation
**Rule:** Tenant ID MUST be derived from authenticated principal, NEVER from request body.  
**Enforcement:** Arsy auth middleware extracts tenant from JWT, body `company_id` ignored.  
**Rationale:** Security, prevent tenant hijacking.

### R-004 — Fail-Closed Authentication
**Rule:** All routes require authenticated user except explicit public allowlist (`/health`, `/ready`).  
**Enforcement:** Root `onRequest` auth guard in Arsy.  
**Rationale:** Default-deny security posture.

### R-005 — Audit Every Execution
**Rule:** Every tool execution (success or failure) MUST create an audit event in `arsy.audit.event`.  
**Enforcement:** Backend middleware appends audit event in same transaction.  
**Rationale:** Compliance, debugging, accountability.

## 2. Coding Conventions and Repository Standards

### R-006 — TypeScript Strict Mode
**Rule:** All code MUST be strict TypeScript with no `any` types (except intentional error handling).  
**Enforcement:** `pnpm typecheck` fails on errors.  
**Rationale:** Type safety, IDE support, refactoring confidence.

### R-007 — Component Naming
**Rule:** 
- Components: PascalCase (`ToolRegistryCard`)
- Files: PascalCase matching component name (`ToolRegistryCard.tsx`)
- Test files: `{componentName}.test.tsx`
- Utilities: camelCase, descriptive names  
**Rationale:** Consistency, discoverability.

### R-008 — File Organization
**Rule:** 
- Components in `packages/ui/src/components/`
- Blocks in `packages/ui/src/blocks/`
- App pages in `apps/{app}/src/app/`
- Tests adjacent to source (`{file}.test.tsx`)  
**Rationale:** Predictability, maintainability.

### R-009 — Import Order
**Rule:** Imports ordered: 
1. React
2. Third-party libraries
3. Monorepo packages (`@moonwitness/*`, `@allah/*`)
4. Relative imports (components, utils)
5. CSS imports  
**Enforcement:** ESLint `import/order` rule.  
**Rationale:** Readability, merge conflict reduction.

### R-010 — No Console.log in Production
**Rule:** `console.log()` MUST be removed or wrapped in `process.env.NODE_ENV === 'development'` check.  
**Allowed:** `console.error()` for errors, `console.warn()` for warnings.  
**Rationale:** Production log hygiene, performance.

## 3. Package Boundaries and Dependency Rules

### R-011 — UI Package Exports
**Rule:** All new components MUST be exported from `packages/ui/src/components/index.ts`.  
**Forbidden:** Direct imports from component files (`import X from 'packages/ui/src/components/X'`).  
**Rationale:** Single export point, versioning, tree-shaking.

### R-012 — SDK Usage
**Rule:** All client-server communication MUST use `@allah/sdk` methods.  
**Forbidden:** Direct `fetch()` calls to Arsy endpoints in app code.  
**Rationale:** Type safety, error handling, centralized auth.

### R-013 — Types Package
**Rule:** All shared types MUST come from `@moonwitness/types`.  
**Forbidden:** Redefining MCP types, tool types, or audit types locally.  
**Rationale:** Type consistency, single source of truth.

### R-014 — No Circular Dependencies
**Rule:** Package dependency graph MUST be acyclic.  
**Enforcement:** `pnpm lint:arch` checks for cycles.  
**Forbidden:** 
- `ui` depending on `sdk`
- `sdk` depending on app code
- Apps importing from each other  
**Rationale:** Build stability, testability.

## 4. Reusability and Modularity Requirements

### R-015 — Component Reusability
**Rule:** Components MUST be reusable across applications, not hardcoded to Headquarter.  
**Forbidden:** 
- Hard-coded skin names in components (use context)
- Hard-coded routes in components
- App-specific business logic in `packages/ui`  
**Rationale:** Reusability, testability, separation of concerns.

### R-016 — Props-Only Configuration
**Rule:** Components MUST be configured via props, not environment variables or global state.  
**Forbidden:** Reading `process.env` inside components.  
**Rationale:** Testability, predictability, reusability.

### R-017 — No Side Effects in Render
**Rule:** Component render functions MUST be pure (no mutations, no API calls).  
**Enforcement:** React rules of hooks.  
**Rationale:** Predictability, debugging, performance.

## 5. Naming Conventions

### R-018 — Variable Naming
**Rule:**
- Constants: `UPPER_SNAKE_CASE` (`TOOL_EXECUTION_TIMEOUT`)
- Variables/Functions: `camelCase` (`toolName`, `executeTool`)
- Types/Interfaces: `PascalCase` (`McpTool`, `ToolExecutionResult`)
- Boolean variables: `is*`, `has*`, `can*` prefix (`isLoading`, `hasError`)  
**Rationale:** Readability, consistency.

### R-019 — CSS Class Naming
**Rule:** 
- Use `data-*` attributes for testing (`data-tool`, `data-result`)
- Use BEM-style classes if needed (`tool-card__title`)
- NEVER use `mw-*` class names (reserved for skin system)  
**Enforcement:** `@moonwitness/lint` rule `STYLE_PURITY`.  
**Rationale:** Skin authority, testability.

## 6. API and Database Rules

### R-020 — Parameterized Queries Only
**Rule:** All database queries MUST use parameterized values via `@allah/arsy-orm`.  
**Forbidden:** Raw SQL with string interpolation.  
**Enforcement:** `@moonwitness/lint` rule, security audit.  
**Rationale:** SQL injection prevention.

### R-021 — SSRF Guard
**Rule:** Network tools MUST validate URLs before request and check resolved IPs against private ranges.  
**Forbidden:** Fetching user-supplied URLs without validation.  
**Enforcement:** Arsy SSRF middleware.  
**Rationale:** SSRF attack prevention.

### R-022 — Rate Limiting
**Rule:** Tool execution endpoints MUST enforce rate limits per user.  
**Default:** 10 requests/minute per tool per user.  
**Enforcement:** Arsy rate limiting middleware.  
**Rationale:** Abuse prevention, resource protection.

## 7. UI/UX and Design System Consistency

### R-023 — State Parity
**Rule:** Every page MUST implement `loading.tsx`, `error.tsx`, and `not-found.tsx`.  
**Enforcement:** `@moonwitness/lint` rule `STATE_PARITY`.  
**Rationale:** Honest states, user experience.

### R-024 — Accessibility Requirements
**Rule:** All interactive elements MUST be:
- Keyboard accessible (Tab, Enter, Escape)
- Visible focus indicators
- Screen reader labels present
- Color contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text)  
**Enforcement:** Manual testing, axe-core audits.  
**Rationale:** WCAG AA compliance, inclusivity.

### R-025 — Responsive Design
**Rule:** All layouts MUST work on:
- Desktop (≥1280px)
- Tablet (768–1279px)
- Mobile (<768px)  
**Enforcement:** Manual testing, responsive design mode.  
**Rationale:** Multi-device support.

### R-026 — Motion Preferences
**Rule:** Animations MUST respect `prefers-reduced-motion` media query.  
**Enforcement:** CSS media query, manual testing.  
**Rationale:** Accessibility for motion-sensitive users.

## 8. Security and Privacy Requirements

### R-027 — Input Sanitization
**Rule:** All string inputs MUST be sanitized to prevent XSS.  
**Enforcement:** React escapes by default, but explicit sanitization for HTML content.  
**Rationale:** XSS prevention.

### R-028 — Result Sanitization
**Rule:** Tool results MUST NOT be rendered as raw HTML without sanitization.  
**Enforcement:** Use `DOMPurify` or similar if HTML rendering needed.  
**Rationale:** XSS prevention.

### R-029 — Sensitive Data Handling
**Rule:** Tool arguments containing passwords, keys, or secrets MUST be redacted in audit logs.  
**Enforcement:** Backend redaction logic.  
**Rationale:** Security, compliance.

### R-030 — Session Expiry
**Rule:** Expired sessions MUST redirect to login without exposing partial data.  
**Enforcement:** Auth middleware.  
**Rationale:** Security.

## 9. Testing and Quality Requirements

### R-031 — Unit Test Coverage
**Rule:** All new components MUST have unit tests.  
**Enforcement:** `pnpm ui:test` must pass.  
**Rationale:** Regression prevention, documentation.

### R-032 — Integration Test Coverage
**Rule:** Tool execution flow MUST have integration tests.  
**Enforcement:** `pnpm headquarter:test` must pass.  
**Rationale:** End-to-end verification.

### R-033 — No TODO-Only Code
**Rule:** Components MUST be functional, not TODO-only placeholders.  
**Enforcement:** Code review, `pnpm docs:check`.  
**Rationale:** No dead code.

### R-034 — Documentation Contract
**Rule:** All public APIs MUST have JSDoc comments.  
**Enforcement:** `pnpm docs:check` (100/100 required).  
**Rationale:** Discoverability, maintainability.

## 10. Performance Constraints

### R-035 — Initial Load Performance
**Rule:** `/tools` page MUST load in < 500ms.  
**Enforcement:** Lighthouse audit, manual profiling.  
**Rationale:** User experience.

### R-036 — Large Dataset Handling
**Rule:** Audit log MUST handle 1000+ rows without lag.  
**Enforcement:** Manual testing with large dataset, virtualization if needed.  
**Rationale:** Scalability.

### R-037 — Debounced Search
**Rule:** Search input MUST be debounced (300ms).  
**Enforcement:** Code review, manual testing.  
**Rationale:** Performance, UX.

## 11. Backward Compatibility Requirements

### R-038 — No Breaking SDK Changes
**Rule:** This feature MUST NOT require changes to existing SDK method signatures.  
**Enforcement:** `pnpm --filter @allah/sdk typecheck` must pass.  
**Rationale:** Backward compatibility.

### R-039 — No Breaking API Changes
**Rule:** This feature MUST NOT require changes to existing Arsy API endpoints.  
**Enforcement:** `pnpm --filter @allah/arsy build` must pass.  
**Rationale:** Backward compatibility.

## 12. Forbidden Patterns and Anti-Patterns

### R-040 — Forbidden: Premature Abstraction
**Rule:** Do NOT create abstractions for hypothetical future needs.  
**Example:** Do NOT create `ToolExecutorFactory` when one form component suffices.  
**Rationale:** YAGNI, maintainability.

### R-041 — Forbidden: Silent Failures
**Rule:** Do NOT swallow errors without logging or user feedback.  
**Example:** Do NOT use `.catch(() => {})` without handling.  
**Rationale:** Debuggability, user experience.

### R-042 — Forbidden: Magic Numbers
**Rule:** Do NOT use unexplained numeric literals.  
**Example:** Use `const TOOL_EXECUTION_TIMEOUT = 30000` instead of `setTimeout(..., 30000)`.  
**Rationale:** Readability, maintainability.

### R-043 — Forbidden: Commented-Out Code
**Rule:** Do NOT leave commented-out code in commits.  
**Enforcement:** Code review.  
**Rationale:** Code hygiene, confusion prevention.

### R-044 — Forbidden: AI-Slop Comments
**Rule:** Do NOT add generic comments like "This function handles the tool execution".  
**Allowed:** Comments explaining WHY, not WHAT (e.g., "Retry only for transient errors to avoid infinite loops").  
**Rationale:** Signal-to-noise ratio.

## 13. Agent Execution Boundaries

### R-045 — Plan-Only Mode
**Rule:** This document is for PLANNING ONLY. Do NOT implement features without explicit authorization.  
**Enforcement:** User approval required before implementation.  
**Rationale:** User control, scope management.

### R-046 — No Source Code Modification
**Rule:** Do NOT modify source code unless explicitly authorized for implementation.  
**Enforcement:** User approval.  
**Rationale:** User control.

### R-047 — No Database Modification
**Rule:** Do NOT run database migrations or schema changes.  
**Enforcement:** User approval, backend safeguards.  
**Rationale:** Data safety.

### R-048 — No Production Deployment
**Rule:** Do NOT deploy to production.  
**Enforcement:** CI/CD pipeline, user approval.  
**Rationale:** Production safety.

## 14. Git and Branch Workflow Requirements

### R-049 — Branch Naming
**Rule:** Feature branch MUST follow convention: `feat/mcp-tool-registry-ui`.  
**Enforcement:** Git branch naming convention.  
**Rationale:** Consistency, traceability.

### R-050 — Commit Messages
**Rule:** Commits MUST follow Conventional Commits: `feat(tools): add tool registry browser`.  
**Enforcement:** `commitlint` in pre-commit hook.  
**Rationale:** Changelog automation, readability.

### R-051 — Atomic Commits
**Rule:** Each commit MUST represent one logical change.  
**Forbidden:** "Big bang" commits with unrelated changes.  
**Rationale:** Reviewability, revertability.

### R-052 — No Secrets in Commits
**Rule:** Do NOT commit `.env` files, credentials, or local database files.  
**Enforcement:** `.gitignore`, pre-commit checks.  
**Rationale:** Security.

## 15. Validation Requirements Before Task Completion

### R-053 — Quality Gates Must Pass
**Rule:** Before marking any task complete, ALL quality gates MUST pass:
- `pnpm headquarter:build`
- `pnpm --filter @moonwitness/ui typecheck`
- `pnpm lint:arch`
- `pnpm docs:check`
- `pnpm ui:test`
- `pnpm headquarter:test`  
**Enforcement:** Self-verification, code review.  
**Rationale:** Definition of Done.

### R-054 — Manual Testing Required
**Rule:** Before marking task complete, MUST test in real browser with:
- Keyboard navigation
- Responsive layout
- All states (loading/empty/error/success)
- Accessibility (screen reader if possible)  
**Enforcement:** Manual test checklist.  
**Rationale:** Real-world verification.

### R-055 — Evidence Required
**Rule:** Before marking task complete, MUST document evidence:
- Screenshots of each state
- Test output
- Lighthouse scores
- Audit log entries  
**Enforcement:** Task update requires evidence.  
**Rationale:** Verification, audit trail.

---

**Cross-References:**
- Related: [spec.md](./spec.md) — Requirements
- Related: [design.md](./design.md) — Architecture
- Related: [task.md](./task.md) — Implementation steps
- Related: [AGENTS.md](../../AGENTS.md) — Global engineering rules
- Related: [QUALITY.md](../../QUALITY.md) — Definition of Done