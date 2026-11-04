---
status: "proposed"
---
# Plan Specification: i18n Bidirectional RTL Layout & Universal WCAG 2.2 AA Accessibility Engine

## 1. Overview & Vision
This plan details the end-to-end design and implementation of bidirectional (LTR/RTL) rendering, logical CSS layout architecture, and universal accessibility (WCAG 2.2 AA) enforcement across all applications (`dock`, `headquarter`, `id`). When an RTL language (such as Arabic `ar`, Persian `fa`, or Hebrew `he`) is activated, the application must dynamically transform all visual layouts, alignment primitives, typography scales, iconography orientations, and keyboard navigation flows without layout glitches or content overflow.

## 2. Goals & Objectives
- **Zero Hardcoded Directional CSS**: Replace physical CSS utilities (`left`, `right`, `ml-*`, `mr-*`, `pl-*`, `pr-*`) with CSS logical properties (`inline-start`, `inline-end`, `ms-*`, `me-*`, `ps-*`, `pe-*`) across `@moonwitness/ui` and all apps.
- **Directional Iconography Transformation**: Provide automatic bidirectional mirroring for navigational icons (e.g., arrows, chevrons, steps, progress bars) while preserving invariant media (e.g., brand logos, playback controls, clocks).
- **Universal Keyboard & Screen Reader Accessibility**:
  - Full tab-order parity in RTL environments.
  - Correct ARIA attributes (`aria-current`, `aria-expanded`, `aria-orientation`) and localized `aria-label` tags.
  - Automatic injection of HTML `<html dir="rtl" lang="ar">` attribute upon language switch.
- **Automated Visual Regression & Axe Testing**: Integrate automated Playwright and axe-core accessibility audits into CI for both LTR and RTL states.

## 3. Scope & Acceptance Criteria
- [ ] `@moonwitness/ui` directional audit: 100% replacement of directional styles with CSS logical properties.
- [ ] Dynamic HTML `dir` and `lang` synchronization in Next.js 16 App Router root layout.
- [ ] RTL iconography system with declarative `mirrorRtl` prop in UI icon wrappers.
- [ ] WCAG 2.2 AA compliance: automated axe-core check with zero violations across all standard pages in both LTR and RTL.
- [ ] Font family and typographic scale support for complex scripts (Arabic Naskh/Kufi, Perso-Arabic typography).
- [ ] All code passes `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck`.

