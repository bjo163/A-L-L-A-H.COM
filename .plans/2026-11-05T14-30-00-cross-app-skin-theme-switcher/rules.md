---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER"
version: "1.0.0"
owner: "engineering"
status: "proposed"
--

# Rule: Implementation Rules & Agent Guardrails for Cross-Application Skin Theme Switcher

## Mandatory Architectural Invariants

### INV-001: Skin Purity Invariant
- **Rule:** No application CSS may target private `mw-*` class names. All skin styling must come from the 6 approved token sets in `@moonwitness/ui`.
- **Enforcement:** `pnpm lint:arch` must pass with `STYLE_PURITY` and `PALETTE_PURITY` checks.
- **Violation:** Targeting `.mw-canvas` or any private class from outside `packages/ui/src/theme.css`.
- **Exception:** None — skin-token usage is the only permitted approach.

### INV-002: Six-Skin Limit
- **Rule:** Only the 6 approved skin IDs may be used: `imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, `mycelium`.
- **Enforcement:** TypeScript `SkinId` type (union of the 6 strings) is the only accepted type for skin values.
- **Violation:** Adding a 7th skin ID, using a skin name as a string literal not from the registry, or dynamic skin names not in the approved list.
- **Exception:** None — the design system explicitly limits to 6 worlds.

### INV-003: SkinRoot Ownership
- **Rule:** Each application must use `<SkinRoot>` from `@moonwitness/ui` — no hand-rolled skin providers or context wrappers.
- **Enforcement:** Import `SkinRoot` exclusively from `@moonwitness/ui`, never from other packages or internal re-exports.
- **Violation:** Creating a new `<SkinProvider>`, wrapping `SkinRoot` with custom context, or using a different skin context provider.
- **Exception:** None — SkinRoot is the sole skin entry point.

### INV-004: Per-App Preference Scoping
- **Rule:** Skin preference keys must be per-app scoped using the pattern `mw_skin_preference:{appName}`.
- **Enforcement:** Each app uses its own appName string when calling `useSkinPreference()`.
- **Violation:** Shared preference key across multiple apps (e.g., both dock and headquarter using `mw_skin_preference` without appName suffix).
- **Exception:** Deliberate shared preference (documented and explicitly configured).

### INV-005: No Hydration Mismatch
- **Rule:** Server-side rendered skin must not cause Next.js hydration mismatches.
- **Enforcement:** `useSkinPreference()` must return `undefined` on the server (localStorage unavailable), allowing `SkinRoot` to use its default skin. Client-side hydration must match.
- **Violation:** Reading `localStorage` on the server, or causing a client-side skin change that differs from the server-rendered skin.
- **Exception:** None — hydration stability is non-negotiable in Next.js App Router.

## Coding Conventions and Repository Standards

### CC-001: TypeScript-First Development
- All new files must be TypeScript strict-compliant.
- `SkinId` must be used as a type, never a plain string.
- Interfaces and hooks must have full JSDoc documentation.
- `noImplicitAny: true`, `strict: true` in tsconfig.

### CC-002: Naming Conventions
- Hooks: `use-` prefix (e.g., `useSkinPreference`)
- Components: PascalCase (e.g., `SkinSelector`)
- Constants: `UPPER_CASE` (e.g., skin registry keys)
- Files: `kebab-case` or `camelCase` consistent with existing patterns
- Directories: `kebab-case` (e.g., `use-skin-preference`, `skin-selector`)

### CC-003: Import Style
- Absolute imports from `@moonwitness/ui` for shared utilities
- Relative imports within the same package only when absolutely necessary
- No wildcard imports (`import * as x`) for specific exports
- Group imports: external → internal → local

### CC-004: Comment Standards
- No generic AI-slop comments (antislop-code rule).
- All public APIs must have JSDoc documenting: purpose, params, returns, throws.
- Inline comments only for non-obvious logic, never stating the obvious.
- TODO/FIXME/HACK comments are prohibited outside of `.md` documentation files (enforced by `packages/lint/src/check-architecture.mjs`).

### CC-005: Error Handling Patterns
- All localStorage operations must be wrapped in try/catch.
- Errors must be swallowed gracefully (fall back to default, never crash).
- Console warnings for edge cases but no runtime errors.
- Use `/* eslint-disable */` only for known, lint-suppressed patterns with explanation.

## Package Boundaries and Dependency Rules

### PB-001: `@moonwitness/ui` Package Owns Skin Infrastructure
- **Responsibility:** Skin definitions, SkinRoot, skinRegistry, SkinId type, SkinSelector, useSkinPreference hook.
- **Dependency Rule:** No other package may re-export or modify skin types from outside `@moonwitness/ui`.
- **Violation:** Another package defining its own `SkinId` type or skin registry.
- **Exception:** None — skin infrastructure is centralized in `@moonwitness/ui`.

### PB-002: Application Packages Depend on `@moonwitness/ui`
- **Responsibility:** dock, headquarter, jizz, and other apps integrate skin preference via `@moonwitness/ui` APIs.
- **Dependency Rule:** Apps must not import skin logic from each other or from external packages.
- **Violation:** dock importing skin preference logic from headquarter, or any app implementing its own preference hook.
- **Exception:** None — centralized skin infrastructure prevents fragmentation.

### PB-003: No New External Dependencies
- **Rule:** Skin selector and preference hook must not introduce new npm dependencies.
- **Enforcement:** Pure React + TypeScript implementation. No `framer-motion`, `radix-ui`, `classnames`, or similar.
- **Violation:** Adding `npm install framer-motion` or similar for skin animations.
- **Exception:** `classnames` may be used if already a dependency of `@moonwitness/ui` (verify first).

### PB-004: LocalStorage API Guarded
- **Rule:** All `localStorage` accesses must guard against unavailable/storage-full scenarios.
- **Enforcement:** try/catch around every localStorage read/write, fallback to default on error.
- **Violation:** `localStorage.setItem()` called without try/catch, or assuming localStorage is always available.
- **Exception:** None — browser environments vary; must be defensive.

## Reusability and Modularity Requirements

### RM-001: SkinSelector is Framework-Agnostic (Within React)
- **Rule:** SkinSelector must work as a standalone React component without framework-specific assumptions.
- **Enforcement:** No Next.js route handlers, no Remix data loading, no Gatsby queries inside the component.
- **Violation:** Using `useNavigation`, `useNavigationState`, or other Next.js Router hooks inside SkinSelector.
- **Exception:** None — keep component framework-agnostic.

### RM-002: useSkinPreference is Testing-Friendly
- **Rule:** The hook must be unit-testable without requiring a full browser environment for basic logic.
- **Enforcement:** Abstract localStorage behind a mockable interface; tests can provide mock localStorage.
- **Violation:** Direct `window.localStorage` calls that cannot be mocked in Jest without jsdom.
- **Exception:** Use `global.localStorage` in test environment (jsdom provides this).

### RM-003: Preference Key Format is Stable
- **Rule:** The preference key format `mw_skin_preference:{appName}` must not change between plan versions without a major version bump.
- **Enforcement:** Use the exact key format; any change requires migration logic documented in report.md.
- **Violation:** Changing the key format from `mw_skin_preference` to something else without a migration script.
- **Exception:** Major version bump (e.g., 1.0.0 → 2.0.0) allows format changes with migration.

## Naming Conventions

### NC-001: Skin IDs
- Must be drawn from the `skinIds` union: `imperium-lumen | lunar-chronicles | rocksoul | nexus-paradox | riot-anarchy | mycelium`
- Refer to by their constant name, never by descriptive text in code.
- Example: `<SkinRoot skin="mycelium" />` — not `<SkinRoot skin="the dark one" />`

### NC-002: Preference Keys
- Format: `mw_skin_preference:{appName}` where `{appName}` is the lowercase app directory name
- Example: `mw_skin_preference:dock`, `mw_skin_preference:headquarter`, `mw_skin_preference:jizz`

### NC-003: Hook and Component Names
- Hook: `useSkinPreference` (verb-noun pattern, camelCase)
- Component: `SkinSelector` (PascalCase, descriptive of function)
- Constant: `SKIN_PREFERENCE_PREFIX = "mw_skin_preference"` (UPPER_CASE with prefix)

### NC-004: File Names
- Hook: `use-skin-preference.ts` (kebab-case, descriptive)
- Component: `skin-selector.tsx` (kebab-case, descriptive)
- Registry: no change needed (already properly named)

## API and Database Rules

### AR-001: SkinSelector Props Interface
```typescript
interface SkinSelectorProps {
  appName?: string;           // Optional, auto-detected from context
  onSkinChange: (skin: SkinId) => void;  // Required callback
  initialSkin?: SkinId;      // Optional controlled initial skin
  visible?: boolean;         // Optional, defaults to true
  className?: string;        // Optional, for custom styling
}
```

### AR-002: useSkinPreference Return Type
```typescript
function useSkinPreference(appName: string): [
  SkinId | undefined,
  React.Dispatch<React.SetStateAction<SkinId | undefined>>
]
```

### AR-003: SkinRoot Integration Props (modified)
```typescript
interface SkinRootProps extends DefaultSkinRootProps {
  /** Optional preference override for SSR hydration */
  preference?: SkinId | undefined;
}
```

## UI/UX and Design-System Consistency

### UX-001: Skin Selector Visual Design
- **Pattern:** Follow existing SkinLaboratory design patterns from `packages/ui/src/blocks/skin-laboratory.tsx`
- **Grid:** Responsive — 1 column mobile, 3 tablet, 6 desktop
- **Colors:** Use skin's own accent color for active state, never hard-coded Tailwind hues
- **Typography:** Skin's typography tokens applied to skin names and signatures
- **Spacing:** Consistent with the active skin's spacing density (compact/spacious/comfortable)

### UX-002: Focus and Keyboard Navigation
- **Rule:** SkinSelector must be fully keyboard accessible.
- **Implementation:**
  - Focus trap within open overlay
  - Tab/Shift+Tab cycles through 6 skin options
  - Enter/Space activates selection
  - Escape closes overlay and returns focus to trigger
  - Focus-visible style on all focusable elements
- **Validation:** axe-core passes focus-visible checks

### UX-003: Reduced Motion Respect
- **Rule:** Users with `prefers-reduced-motion` must experience reduced animation.
- **Implementation:**
  - Skin grid transitions use `transition: none` or reduced-duration values
  - No automatic cycling or auto-play of skin options
  - Motion is decorative, not functional — content remains accessible without motion
- **Validation:** Test with `@media (prefers-reduced-motion: reduce)` in DevTools

### UX-004: Accessibility Standards
- **Rule:** Meet WCAG AA for the skin selector component.
- **Requirements:**
  - ARIA-label on the selector trigger/button
  - Each skin option has descriptive `aria-label` (e.g., "IMPERIUM LUMEN skin")
  - Focus-visible indicator meets 3:1 contrast ratio against background
  - Color contrast of skin token combinations meets AA (already verified by design system)
  - Role="dialog" or role="menu" appropriately used
  - Escape key dismisses dialog
  - Focus returns to opening element on close

## Security and Privacy Requirements

### SEC-001: No Sensitive Data in Storage
- **Rule:** Skin preference stores only SkinId strings — no tokens, secrets, user identifiers, or PII.
- **Enforcement:** Type validation ensures only valid SkinId values are stored.
- **Violation:** Storing anything other than a SkinId string in the preference.

### SEC-002: localStorage is Client-Side Only
- **Rule:** Preference logic acknowledges localStorage is browser-specific and not shared across devices.
- **Enforcement:** Server returns undefined; client handles persistence.
- **Violation:** Assuming localStorage persists across devices or browsers.

### SEC-003: No XSS Risk from Stored Values
- **Rule:** SkinId values are from a closed union type, not user input, so no injection risk.
- **Enforcement:** Validate stored value against `skinIds` before accepting.
- **Violation:** Using stored value directly without type validation.

### SEC-004: Privacy by Default
- **Rule:** No skin preference is stored until the user actively makes a selection.
- **Enforcement:** Preference is `undefined` by default; only set on user interaction.
- **Violation:** Preference automatically set on component mount without user action.

## Testing and Quality Requirements

### TQ-001: Unit Test Coverage Minimum
- **Hook `useSkinPreference`:** 100% branch coverage for all code paths
  - Valid preference read
  - Undefined return (no localStorage / localStorage unavailable)
  - Preference write success
  - QuotaExceededError catch
  - Corrupted value handling
  - Key scoping per appName

- **Component `SkinSelector`:** 100% statement coverage for render and interaction paths
  - All 6 skins rendered
  - Keyboard navigation paths
  - Mouse click selections
  - Escape key closure
  - Reduced motion media query

### TQ-002: Integration Test Coverage
- Each app (dock, headquarter, jizz) renders default skin when no preference
- Each app persists and recalls user preference after reload
- Per-app scoping: dock preference does not affect headquarter
- SkinSelector integrates without breaking app layouts

### TQ-003: Accessibility Test Coverage
- axe-core automated scan: 0 violations
- Keyboard-only navigation complete (no mouse needed)
- Screen reader compatible (ARIA labels, roles)
- Focus-visible states present and discernible
- Reduced motion media query honored

### TQ-004: Performance Test Coverage
- Skin preference resolution completes within 50ms
- Bundle size impact < 2KB gzip compressed
- No layout shift on skin change
- Re-render is confined to SkinRoot and descendants

### TQ-005: Quality Gate Compliance
- `pnpm typecheck` — 0 TypeScript errors across all packages
- `pnpm lint:arch` — 0 architectural invariant violations
- `pnpm docs:check` — 100/100 passed
- `pnpm ui:test` — design system component and skin contracts pass
- `pnpm ui:contrast` — WCAG ratios verified for all 6 skin token pairs
- App builds: `pnpm dock:build`, `pnpm headquarter:build`, `pnpm jizz:build` all pass

## Performance Constraints

### PC-001: Skin Switch Latency
- **Requirement:** Skin preference resolution and SkinRoot re-render must complete within 50ms.
- **Measurement:** Performance.mark timing from preference read to skin application.
- **Acceptable:** < 50ms on typical devices (desktop, modern mobile).
- **Unacceptable:** > 100ms, causing perceptible delay or layout flash.

### PC-002: Initial Bundle Impact
- **Requirement:** Skin selector component and hook must not increase initial bundle size by more than 2KB (gzip).
- **Measurement:** `source-map-explorer` or `next build` analyzer comparison.
- **Acceptable:** < 2KB increase to gzip-compressed JS.
- **Unacceptable:** > 5KB increase, or any increase to CSS bundle.

### PC-003: No Layout Shift on Skin Change
- **Requirement:** Skin change must not cause cumulative layout shift (CLS).
- **Implementation:** SkinRoot token swap must be height/width stable across all 6 skins, or use `visibility: hidden` + `transition` pattern.
- **Validation:** Lighthouse CLS score unaffected by skin changes.

### PC-004: SSR Hydration Performance
- **Requirement:** Next.js must not produce hydration warnings related to skin.
- **Implementation:** `useSkinPreference` returns `undefined` on server; SkinRoot uses default on first render.
- **Validation:** `next build` and `next start` produce 0 hydration warnings in logs.

## Backward Compatibility Requirements

### BC-001: Existing Default Skins Unchanged
- **Rule:** When no skin preference is set, each app must render its existing default skin identically to before this feature.
- **Verification:** Compare screenshots/output of dock (imperium-lumen), headquarter (nexus-paradox), jizz (mycelium) before and after deployment.
- **Violation:** Default skin rendering changes without a preference being set.

### BC-002: No Breaking Changes to Existing APIs
- **Rule:** No existing public API may be removed or modified in a breaking way.
- **Enforcement:** All new additions (hook, component) are additive only; existing exports remain unchanged.
- **Violation:** Removing or renaming existing `SkinRoot` prop, changing `skinRegistry` structure.
- **Exception:** Minor version patch may include bug fixes to existing APIs.

### BC-003: TypeScript Compatibility
- **Rule:** All packages must maintain TypeScript strict compatibility.
- **Enforcement:** `pnpm typecheck` passes before and after changes.
- **Violation:** New TypeScript errors introduced by the feature.
- **Exception:** None — strict mode is a hard gate.

### BC-004: Downlevel Support (Next.js 16)
- **Rule:** Feature must work with Next.js 16 App Router (the version used in this monorepo).
- **Enforcement:** Tested with `pnpm dock:build`, `pnpm headquarter:build`, `pnpm jizz:build`.
- **Violation:** Feature requires Next.js 17+ features (e.g., `next` config changes, new router APIs).
- **Exception:** None — monorepo locks to Next.js 16.

## Forbidden Patterns and Anti-Patterns

### FP-001: Direct localStorage Without Guarding
```typescript
// FORBIDDEN — no error handling
const skin = localStorage.getItem('mw_skin_preference');
setSkin(skin as SkinId);
```
**Why:** Crashes if localStorage unavailable (SSR, private browsing, quota exceeded).

**Allowed:**
```typescript
// ALLOWED — guarded
let skin: SkinId | undefined;
try {
  skin = localStorage.getItem('mw_skin_preference:' + appName) as SkinId;
} catch {
  // swallow, use undefined
}
setSkin(skin);
```

### FP-002: Using Skin Name Strings Instead of SkinId Type
```typescript
// FORBIDDEN — no TypeScript safety
const skin = userSelectedSkin;  // string, not SkinId type
```
**Why:** No compile-time validation, typos, no autocomplete, runtime errors.

**Allowed:**
```typescript
// ALLOWED — typed
const skin: SkinId = userSelectedSkin;  // SkinId is union type
```

### FP-003: Global Skin Preference Without App Scoping
```typescript
// FORBIDDEN — preference leaks across apps
localStorage.setItem('mw_skin_preference', skinId);
```
**Why:** If user sets rocksoul in dock, headquarter unexpectedly also shows rocksoul.

**Allowed:**
```typescript
// ALLOWED — per-app scoped
localStorage.setItem('mw_skin_preference:dock', skinId);
```

### FP-004: Server-Side localStorage Access
```typescript
// FORBIDDEN — localStorage unavailable on server
const skin = localStorage.getItem('mw_skin_preference');  // throws on server
SkinRoot skin={skin};
```
**Why:** Next.js SSR runs on server where localStorage is undefined.

**Allowed:**
```typescript
// ALLOWED — returns undefined on server
const [skin, setSkin] = useSkinPreference(appName);
// SkinRoot renders default when skin is undefined (on server)
```

### FP-005: Hard-Coded Skin Names Outside Registry
```typescript
// FORBIDDEN — not maintainable, breaks the 6-skin limit
<SkinRoot skin="custom-skin" />  // not in skinRegistry
```
**Why:** Violates the six-skin invariant, makes future skin additions difficult.

**Allowed:**
```typescript
// ALLOWED — from registry
import { skinRegistry, skinIds } from '@moonwitness/ui';
// Use skinIds[0], skinRegistry.mycelium, etc.
```

### FP-006: Introducing New External Dependencies
```typescript
// FORBIDDEN — violates no-new-dependencies rule
import { useDisclosure } from '@nextui/core';  // new dependency
```
**Why:** Bloat, maintenance burden, potential conflicts.

**Allowed:** Use only React APIs and `@moonwitness/ui` exports.

## Agent Execution Boundaries

### AE-001: Planning-Only Operation
- **Rule:** This plan document is for architectural planning only.
- **Enforcement:** Do NOT modify production source code during planning phase.
- **Violation:** Creating actual component files, modifying layout.tsx, or writing production code.
- **Exception:** Plan creation phase (this task) is allowed; implementation phase requires separate authorization.

### AE-002: Preserve Existing Conventions
- **Rule:** Must not overwrite, rename, or discard existing plan directories without cause.
- **Enforcement:** New plans get new timestamped directory names; existing plans preserved.
- **Violation:** `rm -rf .plans/old-plan` or overwriting existing plan files.
- **Exception:** User explicitly requests cleanup of old plans.

### AE-003: Git and Branch Workflow
- **Rule:** Plan directories should not be committed unless explicitly requested.
- **Enforcement:** `.gitignore` may include `.plans/` or specific plan directories.
- **Violation:** Committing `.plans/` changes without user authorization.
- **Exception:** If `.plans/` is tracked in git and user requests commit.

### AE-004: Validation Before Completion Claim
- **Rule:** Before marking any task as complete, must verify the quality gates pass.
- **Enforcement:** Run `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check` for affected packages.
- **Violation:** Claiming completion without running verification commands.
- **Exception:** User explicitly waives verification (rare).

### AE-005: Cross-Repository Contract Preservation
- **Rule:** MoonWitness ecosystem invariants must be preserved across all packages.
- **Enforcement:** `STYLE_PURITY`, `PALETTE_PURITY`, `LANDMARK_PURITY`, `CLIENT_SECRETS` invariants remain intact.
- **Violation:** Any invariant weakened or bypassed by the feature.
- **Exception:** None — invariants are non-negotiable.

## Git and Branch Workflow Requirements

### GW-001: Plan Directory Naming
- **Format:** `YYYYMMDD-HHMMSS-descriptive-slug`
- **Example:** `20261105T143000-cross-app-skin-theme-switcher`
- **Enforcement:** All plan directories follow this convention.
- **Violation:** Random names, missing timestamps, non-descriptive slugs.

### GW-002: Plan Files Must Not Contain Sensitive Data
- **Rule:** No API keys, secrets, tokens, or credentials in plan documents.
- **Enforcement:** Review all `.md` files before committing.
- **Violation:** Accidental inclusion of sensitive data in spec/design/task/rule documents.

### GW-003: Task Status Updates
- **Rule:** Task list (`task.md`) must be updated live during execution.
- **Enforcement:** Mark tasks as `in_progress` when work begins, `completed` when done.
- **Violation:** Leaving tasks as `pending` after work is done, or marking complete without verification.

### GW-004: No Duplicate Plans
- **Rule:** Cannot create a plan directory that already exists for this feature.
- **Enforcement:** Check `.plans/` before creating new directory.
- **Violation:** Creating `20261105T143000-cross-app-skin-theme-switcher` when it already exists.

## Validation Requirements Before Marking Tasks Complete

### VR-001: TypeScript Verification
- [ ] `pnpm typecheck` passes for `@moonwitness/ui`, dock, headquarter, jizz
- [ ] No new `type` or `any` errors introduced
- [ ] All new TypeScript types are correctly exported and importable

### VR-002: Architecture Lint Verification
- [ ] `pnpm lint:arch` passes with 0 architectural violations
- [ ] `STYLE_PURITY` invariant maintained
- [ ] `PALETTE_PURITY` invariant maintained
- [ ] No new TODO/FIXME/HACK comments in code files

### VR-003: Documentation Verification
- [ ] `pnpm docs:check` passes (100/100)
- [ ] All four plan documents (spec, design, task, rule) are synchronized and consistent
- [ ] No contradictory information across documents
- [ ] Cross-references between documents are valid

### VR-004: Build Verification
- [ ] `pnpm dock:build` passes
- [ ] `pnpm headquarter:build` passes
- [ ] `pnpm jizz:build` passes
- [ ] No Next.js hydration warnings in build output

### VR-005: Accessibility Verification
- [ ] axe-core scan: 0 violations on SkinSelector component
- [ ] Keyboard navigation tested and working
- [ ] Focus-visible states present
- [ ] Reduced motion media query honored

### VR-005: Bundle Size Verification
- [ ] gzip-compressed bundle impact < 2KB
- [ ] Measured via Next.js bundle analyzer or source-map-explorer

### VR-006: Functional Verification
- [ ] Skin preference persists across page reloads
- [ ] Default skin renders when no preference set
- [ ] Per-app scoping works (dock ≠ headquarter by default)
- [ ] SkinSelector component renders all 6 skins correctly

### VR-007: Error Scenario Verification
- [ ] localStorage unavailable gracefully handled (falls back to default)
- [ ] Corrupted preference value falls back to default
- [ ] Quota exceeded handled without crash
- [ ] Console warnings for edge cases (no runtime errors)

### VR-008: Cross-Browser/Device Verification
- [ ] Works in Chrome, Firefox, Safari (latest versions)
- [ ] Works on desktop and mobile breakpoints
- [] Reduced motion tested via DevTools device toolbar