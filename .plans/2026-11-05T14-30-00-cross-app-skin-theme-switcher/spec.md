---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER"
version: "1.0.0"
owner: "engineering"
status: "proposed"
--

# Specification: Cross-Application Skin Theme Switcher

## Feature Overview

The Cross-Application Skin Theme Switcher provides users with the ability to select and persist their preferred MoonFrame skin across all applications in the A-L-L-A.H.COM monorepo. Currently, each application hardcodes its skin (dock→imperium-lumen, headquarter→nexus-paradox, jizz→mycelium), and there is no mechanism for users to choose or remember their skin preference.

This feature introduces a unified skin selection interface with localStorage persistence, allowing users to override the default skin assignment per application while maintaining the existing architecture.

## Problem Statement

**Current State:**
- Each application explicitly sets its skin in `layout.tsx` via `<SkinRoot skin="..."/>`
- Users cannot customize which skin renders in each application
- Skin preference is lost on page refresh or when switching between apps
- The SkinLaboratory component exists as a developer demo but offers no user-facing skin selection

**Motivation:**
- Empower users to explore all 6 approved DNA worlds without administrative changes
- Improve developer/user experience by providing skin customization
- Maintain consistency with the existing design system while adding user agency
- Enable A/B skin testing and preference gathering without code changes

## Objectives

- [x] Provide a persistent skin selector that works across all applications
- [x] Store user skin preference in localStorage with per-app scoping
- [x] Fall back gracefully when localStorage is unavailable or cleared
- [x] Maintain existing skin assignments as defaults when no preference is set
- [x] Ensure accessibility compliance (keyboard focus, ARIA labels, reduced motion)
- [x] Preserve existing MoonFrame invariants (skin purity, token consistency)
- [x] Support server-side rendering without hydration mismatches

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | Users can select a skin from all 6 approved skin IDs: imperium-lumen, lunar-chronicles, rocksoul, nexus-paradox, riot-anarchy, mycelium |
| FR-002 | Selected skin preference is persisted in localStorage under key `mw_skin_preference` |
| FR-003 | Preference is scoped per application (dock, headquarter, jizz, etc.) |
| FR-004 | When no preference is set, each app uses its default skin (current behavior) |
| FR-005 | Skin preference persists across page reloads and app sessions |
| FR-006 | Skin selector is accessible: keyboard navigable, ARIA roles, focus-visible states |
| FR-007 | Reduced motion preference respected (no animation when user has prefers-reduced-motion) |
| FR-008 | Server-rendered initial skin respects the persisted preference without hydration errors |
| FR-009 | Skin selector component is reusable across all applications |
| FR-010 | No blocking of core app functionality when skin preference is loading or unavailable |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | Skin preference must be available before first render (no flash of incorrect skin) |
| NFR-002 | localStorage access must not cause runtime errors (graceful degradation) |
| NFR-003 | Skin selector adds < 2KB to initial bundle (gzip compressed) |
| NFR-004 | No introduction of new external dependencies |
| NFR-005 | TypeScript strict mode compatible across all packages |
| NFR-006 | WCAG AA compliant color contrast in all skin states |
| NFR-007 | Performance: skin switch completes within 50ms |

## Scope

### In-Scope
- Skin preference storage in localStorage with per-app scoping
- SkinSelector component usable in any application
- Persistence layer that reads/writes skin preference
- SSR-safe skin preference initialization
- Accessibility compliance for the skin selector
- Documentation of the new pattern for app developers

### Out-of-Scope
- Changing the default skin assignment for any application (remains as configured)
- Adding new skins beyond the 6 approved IDs
- Modifying the SkinRoot or token architecture
- Server-side skin preference storage or database persistence
- Real-time collaborative skin sharing
- Dynamic skin switching during active user sessions (out of scope for v1)

## User Stories

### Story 1: Exploring Different Skins
**User:** "I want to see what the lunar-chronicles skin looks like in the headquarter app without asking an admin to change it."
- **Action:** User opens skin selector, chooses "Lunar Chronicles"
- **Expected:** Headquarter app renders with lunar-chronicles tokens, canvas color `#101923`, accent `#c5d5e1`
- **Persistence:** Preference stored; on next visit, headquarter auto-loads lunar-chronicles

### Story 2: Default Behavior Preservation
**User:** "I don't care about skins; I just want the apps to work as they always have."
- **Action:** User has no prior preference, or clears localStorage
- **Expected:** Each app renders with its configured default skin (no visible change)
- **Graceful Degradation:** If localStorage is unavailable, defaults are used

### Story 3: Cross-Application Consistency
**User:** "I selected the rocksoul skin in the dock app and want it to also apply when I visit headquarter."
- **Action:** User selects rocksoul in one app
- **Expected:** The skin preference is remembered; other apps can optionally adopt the same skin or maintain their own defaults
- **Per-App Scoping:** Preference is app-specific unless explicitly shared

### Story 4: Accessibility
**User:** "I use keyboard navigation and screen readers. Is the skin selector accessible?"
- **Action:** User navigates to skin selector via Tab key
- **Expected:** Focus-visible state, ARIA-label on selector, all skin buttons keyboard-operable, Escape closes overlay
- **Validation:** Meets WCAG AA contrast requirements for all skin token combinations

## Dependencies and Constraints

### Dependencies
- `@moonwitness/ui` package (v0.6.0+) — provides SkinRoot, skinRegistry, SkinId type
- All 6 approved skin definitions in `packages/ui/src/skins/registry.ts`
- Next.js 16 App Router pattern (used in all apps)
- localStorage browser API (graceful fallback when unavailable)

### Constraints
- Must not modify existing default skin assignments in app layout files
- Must maintain skin purity invariants (no arbitrary Tailwind variants, no private class targeting)
- Must respect the existing 6-skin limit defined in the design system
- Must work with Next.js server components and client components
- Must not cause hydration mismatches in Next.js App Router
- Must be TypeScript-first with strict type checking

### Ecosystem and Roadmap Alignment
- Aligns with MoonWitness vision of "six worlds, one engine"
- Supports the existing skin system without replacing it
- Enables future capabilities: shared skin preferences, A/B testing, theming surveys
- Consistent with the MoonFrame Six DNA architecture pattern
- No conflict with existing quality gates (docs:check, lint:arch, typecheck)

## Acceptance Criteria

- [ ] SkinSelector component renders all 6 skin options
- [ ] Selected skin is persisted in localStorage under `mw_skin_preference`
- [ ] Per-app scoping: each application respects its own skin preference key
- [ ] Default skin (no preference) matches current app configuration
- [ ] Preference persists across page reloads within the same app
- [ ] Skin selector is keyboard navigable (Tab/Shift+Tab, Enter/Space activation)
- [ ] ARIA labels properly describe the skin selector and each option
- [ ] Focus-visible states meet WCAG requirements
- [ ] Reduced motion (`prefers-reduced-motion`) is respected
- [ ] Server-side rendering uses persisted preference without hydration error
- [ ] TypeScript type checking passes (`pnpm typecheck`)
- [ ] Architecture lint passes (`pnpm lint:arch`)
- [ ] Documentation checks pass (`pnpm docs:check`)

## Success Metrics

- **Adoption Rate:** Percentage of users who interact with the skin selector within first 30 days (target: >15%)
- **Preference Retention:** Percentage of users who return and see their preferred skin (target: >85%)
- **Zero Hydration Errors:** 0 skin-related Next.js hydration warnings in production
- **Accessibility Score:** WCAG AA compliance confirmed via automated testing
- **Bundle Impact:** < 2KB increase in gzip-compressed JavaScript size
- **Type Safety:** 0 TypeScript errors across all packages

### Technical Success
- All quality gates pass without new failures
- No regression in existing skin-related tests
- Skin preference works across mobile, desktop, and tablet breakpoints
- Error handling for corrupted/localStorage-full scenarios