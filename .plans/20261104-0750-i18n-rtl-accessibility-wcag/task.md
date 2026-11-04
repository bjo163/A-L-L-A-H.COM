---
status: "proposed"
---
# Actionable Tasks: i18n Bidirectional RTL Layout & Universal WCAG 2.2 AA Accessibility Engine

## 1. CSS Logical Properties & UI Library Refactor
- [ ] Scan `@moonwitness/ui` components for hardcoded `left`/`right`, `ml-*`, `mr-*`, `pl-*`, `pr-*` classes.
- [ ] Refactor navigation primitives, sidebars, modals, and tables to use logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).
- [ ] Implement `RTLProvider` and document usage in `@moonwitness/ui`.

## 2. Iconography & BiDi Mirroring
- [ ] Create `IconWrapper` component with `autoMirror?: boolean` support.
- [ ] Audit all arrow, chevron, and breadcrumb icons to ensure appropriate mirroring in RTL mode.
- [ ] Ensure non-directional icons (search, settings, media player, logo) remain un-mirrored.

## 3. Typography & Complex Script Stacks
- [ ] Define optimized fallback font stacks for Arabic and Persian scripts in Tailwind v4 theme configuration.
- [ ] Adjust line-height and letter-spacing scales for RTL scripts to prevent character clipping.

## 4. Accessibility & Automated Gate
- [ ] Implement root `<html>` attribute sync (`dir="rtl"`, `dir="ltr"`, `lang="..."`) across Next.js 16 app layouts.
- [ ] Add axe-core automated audit test suite verifying WCAG 2.2 AA compliance for both orientations.
- [ ] Run and verify `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck`.

