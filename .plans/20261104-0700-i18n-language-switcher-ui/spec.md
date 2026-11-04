---
status: "proposed"
---
# i18n Language Switcher UI Component Plan

## Vision
Create a reusable, theme‑aware `<LanguageSwitcher />` component that enables users to change the application language at runtime, automatically toggling LTR/RTL layout and updating all UI strings via the SDK.

## Acceptance Criteria
- Register with global i18n context and persist selection in `localStorage`.
- On change, update SDK translation cache and trigger re‑render of all atomic UI components.
- RTL layout auto‑applied for right‑to‑left languages.
- Fully typed with TypeScript, using `@moonwitness/ui` primitives.
- Passes WCAG 2.2 AA accessibility audit (keyboard navigation, ARIA labels).
- Unit tests (Jest) and integration tests (React Testing Library) cover language change, RTL toggle, persistence.
- Storybook story and documentation in `packages/sdk/README.md`.

## Dependencies
- `packages/ui` (atomic UI components).
- `packages/sdk` (i18n helper hook).
- `apps/*` client apps consume the component.
