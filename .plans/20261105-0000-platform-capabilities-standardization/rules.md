# Rule: Implementation Rules & Agent Guardrails for Platform Capabilities Standardization

## Mandatory Architectural Invariants

### AR-001: Skin Token Source
- **Rule:** All color, typography, spacing, and geometry must originate from `--mw-*` CSS custom properties defined in the skin registry.
- **Enforcement:** ESLint rule `antislop-ui` must be active; app CSS must not define color/type variables directly.
- **Penalty:** Quality gate failure (`pnpm lint:arch` fails if private `mw-*` classes targeted).
- **Why:** Preserves the design-system contract; prevents color drift and maintainability issues.

### AR-002: Skin ID Whitelist
- **Rule:** Skin IDs passed to SkinRoot must be drawn from the `skinIds` array in `packages/ui/src/skins/registry.ts`.
- **Enforcement:** `resolveSkinId()` validates against the whitelist; invalid IDs fall back to `defaultSkinId` (`imperium-lumen`) with a console warning.
- **Penalty:** Application renders without intentional skin tokens; components using `--mw-*` may use undefined values.
- **Why:** Prevents typos and ensures only valid skin definitions are used.

### AR-003: No Duplicate Functionality
- **Rule:** Each platform capability must solve a distinct problem. No two capabilities may implement the same feature.
- **Enforcement:** During plan creation, check for overlapping objectives and scope boundaries.
- **Penalty:** Plan rejected during review; duplicate capability marked out-of-scope.
- **Why:** Prevents bloat and keeps the codebase modular and focused.

### AR-004: Verification Before VERIFIED
- **Rule:** A capability must not be marked VERIFIED in BACKLOG.md without real code implementation and evidence in report.md.
- **Enforcement:** Evolve loop guardrails in AUTONOMOUS.md section 8 (three guardrails).
- **Penalty:** Plan creation blocked; existing falsely VERIFIED entries flagged for remediation.
- **Why:** Directly addresses the problem identified in evolve-loop-guard plan (20261104-175034).

### AR-005: Plan Completeness
- **Rule:** Every plan directory must contain exactly four documents: spec.md, design.md, task.md, rule.md.
- **Enforcement:** Inspection during plan creation and quality gates.
- **Penalty:** Plan marked INCOMPLETE; cannot proceed to implementation.
- **Why:** Ensures all necessary information is available for implementation agents.

### AR-006: MoonWitness Ecosystem Preservation
- **Rule:** All implementations must preserve existing MoonWitness invariants:
  - Storage: SHA-256 content-addressed, write-once
  - SQL: Parameterized values only, column/sort identifier allowlist
  - Auth: Default-deny, verified principal per route
  - Tenant: `company_id` on every row, derived from principal
  - ORM: Embedded PGlite via `@allah/arsy-orm` only
  - Audit: Append-only events in same transaction
  - Global admin: Server-authorized per admin route
  - Style source: `packages/ui/src/theme.css` maps Tailwind utilities onto skin tokens
  - Markup colour: App JSX never paints with Tailwind palette hue (`PALETTE_PURITY`)
  - Icon source: Only `packages/ui/src/components/icon.tsx` imports third-party icon libraries; apps consume `Icon` component
  - Landmark purity: skip-link `id="main-content"` belongs to `RouteShell`
  - Client secrets: No `'use client'` file may read `NEXT_PUBLIC_*` values carrying keys/secrets/tokens
  - Composition blocks: Hero, kicker, section heading, route shell, status message, destination card, state panel exist once in `packages/ui/src/blocks/`
  - Route states: Every app ships `error.tsx`, `loading.tsx`, `not-founded.tsx` built from `StatePanel`
  - Skin ownership: Each app declares a valid `SkinRoot`; duplicate root worlds require explicit lint-baseline exception
  - Retention: Fail-closed: reject on `legal_hold` / `retention_until`
  - SSRF: Validate `base_url` before request, re-check resolved IP

- **Enforcement:** `pnpm lint:arch` checks arch invariants; `pnpm ui:contrast` measures WCAG ratios; `pnpm typecheck` ensures TS strictness.
- **Penalty:** Quality gate failure; architectural drift.
- **Why:** Preserves the enterprise-grade maintainability and consistency that the MoonWitness ecosystem requires.

## Coding Conventions & Repository Standards

### CC-001: TypeScript Strict Mode
- All files must pass `pnpm typecheck` with strict mode enabled.
- No `any` types where more specific types are available.
- All public functions and components must have explicit return types.

### CC-002: Component Library Usage
- All UI components must come from `@moonwitness/ui`, not hand-written HTML elements with inline styles.
- Raw `<button>` / `<input>` / `<select>` / `<textarea>` / `<a>` / `<form>` / `<label>` / `<table>` are forbidden in `apps/`.
- Use `Button asChild` pattern to turn router links into buttons where appropriate.

### CC-003: Tailwind v4 with Design-System Tokens
- Tailwind utilities must resolve to `--mw-*` skin tokens, not arbitrary values.
- `PALETTE_PURITY`: App JSX must not use Tailwind palette hues (e.g., `bg-blue-500`).
- Colour must arrive from component variants, composition blocks, or token-driven utilities.

### CC-004: Data Slot Attributes
- Shared components expose `data-slot` attributes as the supported CSS hook.
- App CSS must not target private `mw-*` class names (`STYLE_PURITY`).
- Use `data-slot="button"` / `data-slot="input"` etc. for styling.

### CC-005: Branch Naming Conventions
- New features: `feat-*` branch naming
- Bug fixes: `fix-*` branch naming
- Chores: `chore-*` branch naming

### CC-006: Commit Message Conventions
- Must follow commitlint conventions.
- Commit messages must describe "why" rather than "what".
- No sweep of repo's other WIP changes in a single commit.

### CC-007: Documentation Standards
- All new features must have corresponding documentation updates.
- `pnpm docs:check` must pass (100/100 required).
- Documentation must be consistent across spec.md, design.md, task.md, rule.md.

## Package Boundaries & Dependency Rules

### PB-001: Package Ownership
- `packages/ui` owns: SkinRoot, skin registry, skin tokens, design system components, blocks
- `packages/sdk` owns: client↔hub communications, SDK methods
- `packages/types` owns: shared contracts, type definitions
- `packages/lint` owns: arch invariants checking (`pnpm lint:arch`)
- Applications own: their own business logic, UI composition using design-system components

### PB-002: Dependency Direction
- Applications → packages (ui, sdk, types) — downward dependency
- packages → no downward dependency on applications
- No application should import from another application
- Cross-application communication via SDK and hub routes

### PB-003: Prohibited Import Patterns
- **Forbidden:** App JSX importing raw HTML components, local type redefinition, direct DB calls
- **Forbidden:** App CSS targeting private `mw-*` class names
- **Forbidden:** Direct `NEXT_PUBLIC_*` value reads carrying keys/secrets/tokens
- **Required:** All UI components from `@moonwitness/ui`
- **Required:** All styling via `--mw-*` CSS custom properties or `data-slot` attributes

### PB-004: Skin Package Boundary
- `packages/ui/src/skins/` is the single source of skin definitions
- No application may define its own skin tokens or skin IDs
- All skin references must go through `resolveSkinId()` and `getSkinStyle()`
- The 6 skin definitions are fixed; no new skins may be added without explicit architecture review

## Naming Conventions

### NC-001: File Naming
- spec.md, design.md, task.md, rule.md — mandatory for each plan
- capability-<n>/ directory naming for platform capabilities
- Plan directories: `YYYYMMDD-HHMM-descriptive-slug` format (e.g., `20261105-0000-platform-capabilities-standardization`)

### NC-002: Identifiers
- Use stable identifiers: REQ-001, FR-001, AC-001, ARCH-001
- Do not create identifiers that change on every update
- Skin IDs: from `skinIds` array (`imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, `mycelium`)

### NC-003: Task Titles
- Format: `- [ ] Task description`
- Present continuous form in task tracker spinner
- Sufficiently granular for autonomous coding agents

### NC-004: Rule Identifier Format
- AR-001, AR-002, etc. (Architectural Invariant)
- CC-001, CC-002, etc. (Coding Convention)
- PB-001, PB-002, etc. (Package Boundary)
- NC-001, NC-002, etc. (Naming Convention)

## API & Database Rules

### DB-001: No Raw SQL
- All database queries must use parameterized values.
- No arbitrary-SQL tool on the public surface.
- Use column/sort identifier allowlist only.

### DB-002: Tenant Isolation
- `company_id` on every row, derived from the principal.
- Never taken from the request body.
- Fail-closed: reject on `legal_hold` / `retention_until`.

### DB-003: Audit Logging
- Every model insert/update/delete writes one append-only event in the same transaction.
- Events store changed field names, not values.

## UI/UX & Design-System Consistency

### UX-001: Skin Root Requirement
- Every application must wrap its root layout with `<SkinRoot>`.
- Skin ID must be from the registered `skinIds` array.
- Omitting the skin prop defaults to `imperium-lumen`.

### UX-002: Component Library Adoption
- No hand-written `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`, `<form>`, `<label>`, or `<table>` in app code.
- Use `@moonwitness/ui` components: `Icon`, `Button`, `Select`, `Table`, `Dialog`, `Form`, `FormField`, `Link`.

### UX-003: Responsive Behavior
- All applications must support responsive layouts using the design-system approach.
- Container queries, fluid typography, CSS Grid, and mobile-first breakpoint strategies.

### UX-004: Accessibility
- All interactive components must be keyboard-accessible.
- ARIA labels, focus-visible states, and contrast ratios must meet WCAG AA standards.
- `pnpm ui:contrast` must pass for every skin's token pairs.

### UX-005: Motion Consistency
- Motion must follow the easing and duration defined in the skin tokens.
- Do not introduce custom motion values without skin token justification.

## Security & Privacy Requirements

### SEC-001: Skin Data is Public
- Skin definitions (tokens, identities, signatures) are public by design.
- No sensitive data in skin definitions.
- Skin ID resolution does not make external requests.

### SEC-002: No Client Secrets
- No `'use client'` file may read a `NEXT_PUBLIC_*` value carrying a key/secret/token (`NO_PUBLIC_CLIENT_SECRETS`).
- Upstream credentials live server-side only — apps proxy through a same-origin route handler.

### SEC-003: Default-Deny Auth
- Every hub route needs a verified principal.
- Only explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`) is anonymous.

### SEC-004: Token Validation
- Skin IDs validated against whitelist (`skinIds` array).
- Invalid IDs fall back to default with console warning — no security implication but indicates configuration error.

## Testing & Quality Requirements

### QT-001: Type Check
- `pnpm typecheck` must pass with 0 errors across all relevant packages.
- Include: packages/ui, packages/sdk, packages/types, and all applications.

### QT-002: Architecture Lint
- `pnpm lint:arch` must pass with 0 warnings.
- All arch invariants must be satisfied.

### QT-003: Documentation Check
- `pnpm docs:check` must pass with 100/100.
- All four plan documents must be present and consistent.

### QT-004: Build Gates
- `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build`, `pnpm gate:build` must all succeed.

### QT-005: UI Contrast
- `pnpm ui:contrast` must pass measured WCAG ratios for every skin's token pairs.

### QT-006: No Falsely VERIFIED Capabilities
- BACKLOG.md must not contain VERIFIED capability entries without corresponding code.
- Evolve loop guardrails in AUTONOMOUS.md prevent future occurrences.

## Performance Constraints

### PC-001: Skin Resolution Overhead
- Skin resolution (`resolveSkinId`, `getSkinStyle`) must remain synchronous and lightweight.
- No asynchronous skin loading from external sources.
- CSS custom properties `--mw-*` must be available immediately after SkinRoot render.

### PC-002: No Performance Degradation
- Skin integration must not degrade page load performance.
- All quality gates (builds) must pass without performance regressions.

### PC-003: CSS Custom Property Usage
- `--mw-*` CSS custom properties are set inline via StyleSheet and do not require runtime JavaScript after initial resolution.

## Backward Compatibility Requirements

### BC-001: Default Skin Preservation
- When no skin prop is provided to SkinRoot, default must be `imperium-lumen`.
- Existing applications omitting skin prop must continue to render with imperium-lumen tokens.

### BC-002: Skin ID Compatibility
- Skin IDs from the registry (`skinIds` array) must continue to work.
- No removal or renaming of existing skin definitions without deprecation cycle.

### BC-003: Existing Application Compatibility
- All 10 existing applications must continue to build and pass quality gates after SkinRoot integration.
- No breaking changes to API surfaces or component interfaces.

## Forbidden Patterns & Anti-Patterns

### FP-001: Raw HTML Elements in Apps
- **Forbidden:** Hand-written `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`, `<form>`, `<label>`, `<table>` in `apps/` directory.
- **Anti-pattern:** Using raw HTML instead of `@moonwitness/ui` components.

### FP-002: Direct Tailwind Palette Usage
- **Forbidden:** `bg-blue-500`, `text-red-600`, or any arbitrary Tailwind palette hue.
- **Anti-pattern:** Using Tailwind colors instead of `--mw-*` skin tokens.

### FP-003: Private Class Targeting
- **Forbidden:** App CSS targeting `mw-*` private class names.
- **Anti-pattern:** `div.mw-skin-root`, `span.mw-button`, etc.

### FP-004: Undefined Skin IDs
- **Forbidden:** Passing arbitrary string to SkinRoot skin prop without validation.
- **Anti-pattern:** `skin="custom-skin"` — should be from `skinIds` array.

### FP-005: Falsely VERIFIED Capabilities
- **Forbidden:** Marking a capability VERIFIED in BACKLOG.md without real code and evidence.
- **Anti-pattern:** Empty plan templates with no implementation.

### FP-006: Duplicate Capabilities
- **Forbidden:** Two capabilities implementing the same feature.
- **Anti-pattern:** Capability 6 and Capability 7 with overlapping objectives.

## Agent Execution Boundaries

### AE-001: Plan-Only Operation
- This planning task is PLAN ONLY — never automatically:
  - Edit application source code (except plan-directory document creation)
  - Create implementation files in target application
  - Modify database schemas
  - Install dependencies
  - Execute migrations
  - Modify deployment systems
  - Change application configuration
  - Create GitHub Issues
  - Modify project boards
  - Create branches
  - Commit changes
  - Push code
  - Deploy applications

### AE-002: Documentation Creation
- When user explicitly authorizes documentation creation, create planning artifacts in appropriate location (`Z:\project\rocksoul-dx\.plans\`).
- Before modifying existing planning artifact, inspect current contents and preserve unrelated work.

### AE-003: Implementation Authorization
- When user authorizes implementation, that is a separate execution task — this plan provides the architecture but does not execute implementation.

### AE-004: Git Workflow
- All plan-directory file creation follows git best practices.
- Commit only the task's own files; stage partial hunks and commit the index.
- Never sweep the repo's other WIP changes in a single commit.

### AE-005: Validation Before Completion
- Before marking tasks complete, verify:
  - Requirements are clear (spec.md)
  - Scope is defined (spec.md)
  - Architecture is coherent (design.md)
  - Component responsibilities are clear (design.md)
  - Dependencies are identified (task.md)
  - Interfaces defined where necessary (design.md)
  - Data contracts defined where necessary (design.md)
  - Security requirements addressed (rule.md)
  - Failure scenarios considered (rule.md)
  - Migration constraints documented (rule.md)
  - Testing strategy exists (task.md, rule.md)
  - Acceptance criteria verifiable (spec.md, rule.md)
  - Risks identified (rule.md)
  - Open questions visible (rule.md)
  - Conflicting specifications resolved (rule.md)
  - Implementation sequencing sensible (task.md)

## Git & Branch Workflow Requirements

### GW-001: Branch Creation
- New feature work: `git checkout -b feat/<descriptive-name>` from dev branch
- Bug fixes: `git checkout -b fix/<descriptive-name>` from dev branch
- Chores: `git checkout -b chore/<descriptive-name>` from dev branch

### GW-002: Commit Message Format
- Conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Scope: affected package or app (e.g., `ui`, `dock`, `gate`, `headquarter`, `id`, `jizz`, `moonsky`, `harbor`, `arsy`, `sentinel`, `server`)
- Description: concise, imperative mood

### GW-003: Pre-Commit Hooks
- Run `pnpm docs:check` + `pnpm lint:arch` + `pnpm lint` + `pnpm typecheck` + `pnpm ui:contrast` before commit.
- Self-heal all errors.
- Never prompt user for pre-commit actions.

### GW-004: Pre-Push Checks
- Run all build gates: `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build`, `pnpm gate:build`
- Run `pnpm ui:test` + `pnpm ui:contrast`
- All must pass before push to dev branch.

### GW-005: Commit-msg Validation
- Commit messages validated by commitlint.
- Must not reference issue numbers directly (use conventional commits instead).

## Validation Requirements Before Marking Tasks Complete

### VR-001: Spec Verification
- [ ] Feature overview and vision documented
- [ ] Problem statement and motivation documented
- [ ] Objectives and expected outcomes documented
- [ ] Functional requirements listed (FR-001, FR-002, etc.)
- [ ] Non-functional requirements evaluated
- [ ] Scope and out-of-scope documented
- [ ] User stories and use cases documented
- [ ] Dependencies and constraints listed
- [ ] Ecosystem and roadmap alignment noted
- [ ] Acceptance criteria defined
- [ ] Success metrics documented

### VR-002: Design Verification
- [ ] High-level architecture documented
- [ ] Component and module structure documented
- [ ] Package boundaries and responsibilities documented
- [ ] Data models and relationships documented
- [ ] API contracts and interfaces documented
- [ ] Data flow and system interactions documented
- [ ] UI/UX flows and design specifications documented
- [ ] Integration architecture documented
- [ ] Error handling and failure scenarios documented
- [ ] Security and performance considerations documented
- [ ] Observability strategy documented
- [ ] Technical decisions and alternatives documented

### VR-003: Task Verification
- [ ] Implementation phases documented
- [ ] Ordered and independently executable tasks documented
- [ ] Detailed subtasks documented
- [ ] Dependencies and execution order documented
- [ ] Parallelizable workstreams identified
- [ ] Required files and affected modules listed
- [ ] Testing and validation procedures documented
- [ ] Documentation requirements listed
- [ ] Quality gates identified
- [ ] Completion checklist documented

### VR-004: Rule Verification
- [ ] Mandatory architectural invariants documented (AR-001 through AR-006)
- [ ] Coding conventions and repository standards documented (CC-001 through CC-007)
- [ ] Package boundaries and dependency rules documented (PB-001 through PB-004)
- [ ] Naming conventions documented (NC-001 through NC-004)
- [ ] API and database rules documented (DB-001 through DB-003)
- [ ] UI/UX and design-system consistency documented (UX-001 through UX-005)
- [ ] Security and privacy requirements documented (SEC-001 through SEC-004)
- [ ] Testing and quality requirements documented (QT-001 through QT-006)
- [ ] Performance constraints documented (PC-001 through PC-003)
- [ ] Backward compatibility requirements documented (BC-001 through BC-003)
- [ ] Forbidden patterns and anti-patterns documented (FP-001 through FP-006)
- [ ] Agent execution boundaries documented (AE-001 through AE-005)
- [ ] Git and branch workflow requirements documented (GW-001 through GW-005)
- [ ] Validation requirements documented (VR-001 through VR-004)

### VR-005: Cross-Document Consistency
- [ ] spec.md defines WHAT and WHY
- [ ] design.md defines HOW and ARCHITECTURE
- [ ] task.md defines IMPLEMENTATION STEPS
- [ ] rule.md defines CONSTRAINTS and NON-NEGOTIABLE RULES
- [ ] No duplicated or contradictory information across documents
- [ ] Cross-references between documents are correct and consistent