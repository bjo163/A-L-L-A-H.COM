---
status: "proposed"
---
# Invariants & Security Rules: i18n In-Context Visual Translation Editor & Live DOM Overlay

## 1. Architectural & Production Invariants
- **Zero Overhead in Standard Production Mode**: The in-context overlay scripts and styles must be code-split and loaded strictly on-demand. When `inContextEditMode` is inactive or the user is not authenticated, no extra DOM nodes, event listeners, or network polling shall occur.
- **Atomic UI Enforcement**: The editor popover, badges, input controls, and modal components MUST be constructed exclusively from `@moonwitness/ui`. No ad-hoc styled HTML tags are permitted.
- **Optimistic State Consistency**: In the event of an API error during save, the editor must automatically roll back in-memory changes to the previously valid state and present a clear diagnostic alert.

## 2. Security & Access Boundary Constraints
- **Strict Role-Based Gate**: Activation requires an authenticated session with verified `i18n:edit` or `i18n:admin` capability. Unauthenticated or read-only users must not be able to trigger the overlay under any circumstance.
- **XSS & Content Sanitization**: All content submitted through the editor textarea must be sanitized. HTML tags must either be escaped or validated against a strict allowlist (e.g. `<b>`, `<i>`, `<span>`).
- **Tenant Scope Enforcement**: Updates triggered from the overlay automatically inherit the session's `company_id`. A user from tenant A cannot submit translations against tenant B's dictionary.

## 3. Quality & Contract Gates
- `pnpm docs:check` passes at 100/100 score.
- `pnpm lint:arch` passes cleanly.
- `pnpm typecheck` compiles with zero errors.
