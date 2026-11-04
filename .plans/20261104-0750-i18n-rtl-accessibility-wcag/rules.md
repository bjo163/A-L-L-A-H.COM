---
status: "proposed"
---
# Invariants & Security Rules: i18n Bidirectional RTL Layout & Universal WCAG 2.2 AA Accessibility Engine

## 1. Architectural Invariants
- **Atomic UI Enforcement**: All interactive elements, wrappers, dialogs, and navigation drawers MUST be imported from `@moonwitness/ui`. No direct native `<button>` or `<input>` tags allowed in application code.
- **Strict Logical Property Rule**: No usage of `left`, `right`, `ml-*`, `mr-*`, `pl-*`, or `pr-*` in components intended for multi-directional rendering. Enforced via linter rules.
- **Directional State Determinism**: Layout direction MUST be derived deterministically from the active language's `direction` attribute (`ltr` or `rtl`) defined in `res.lang`.

## 2. Accessibility & Security Constraints
- **WCAG 2.2 AA Non-Negotiable**: No component shall ship with contrast failures, missing alternative text, broken focus traps, or inaccessible keyboard controls.
- **Safe Sanitization for Formatted Messages**: Localized text interpolation containing HTML or formatting tags MUST be securely sanitized to prevent Cross-Site Scripting (XSS).
- **Tab Order Consistency**: Forward navigation using `Tab` must logically follow reading order in both LTR (left-to-right) and RTL (right-to-left) without unexpected visual jumping.

## 3. Quality Gate Compliance
- `pnpm docs:check` passes at 100/100 score.
- `pnpm lint:arch` passes cleanly.
- `pnpm typecheck` compiles with zero errors.

