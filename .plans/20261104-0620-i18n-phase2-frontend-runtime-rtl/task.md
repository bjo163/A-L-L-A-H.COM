---
title: "i18n Localization Phase 2: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T05:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 34
parent_issue: 33
---

# TASKS: i18n Localization Phase 2 — Frontend Runtime, RTL Layout & Locale Switcher

- [ ] **1. SDK Client i18n Implementation (`packages/sdk`)**
  - [ ] Implement `I18nProvider` in `packages/sdk/src/i18n/provider.tsx`.
  - [ ] Implement `useTranslation` hook in `packages/sdk/src/i18n/hook.ts` with template string interpolator.
  - [ ] Implement locale formatters (`formatCurrency`, `formatDate`, `formatNumber`) in `packages/sdk/src/i18n/formatters.ts`.
  - [ ] Implement client-side dictionary caching using `localStorage` with ETag validation.
  - [ ] Unit test: Verify translation lookup, variable interpolation, and fallbacks in `test/sdk_i18n.test.tsx`.

- [ ] **2. UI Language Switcher Component (`packages/ui`)**
  - [ ] Implement `<LanguageSwitcher />` in `packages/ui/src/blocks/language_switcher.tsx`.
  - [ ] Integrate language flags/badges and active indicator.
  - [ ] Update `packages/ui/src/blocks/navbar.tsx` to include the language switcher.
  - [ ] Ensure full RTL support (`dir="rtl"`) on layout containers and modals.
  - [ ] Component test: Test language selection and RTL attribute flipping in `test/language_switcher.test.tsx`.

- [ ] **3. Application-Level Integration (`apps/`)**
  - [ ] Mount `I18nProvider` in root layout of `apps/headquarter/src/app/layout.tsx`.
  - [ ] Mount `I18nProvider` in root layout of `apps/dock/src/app/layout.tsx`.
  - [ ] Mount `I18nProvider` in root layout of `apps/id/src/app/layout.tsx`.
  - [ ] Mount `I18nProvider` in root layout of `apps/jizz/src/app/layout.tsx`.
  - [ ] Translate core navbar and dashboard labels into `id_ID` and `en_US`.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 2 artifacts.
  - [ ] Verify `pnpm docs:check` passes 100/100.
  - [ ] Verify `pnpm lint:arch` passes.
  - [ ] Verify `pnpm typecheck` passes.
