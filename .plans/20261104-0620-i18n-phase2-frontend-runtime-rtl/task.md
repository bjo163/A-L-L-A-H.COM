---
title: "i18n Localization Phase 2: Task Checklist"
status: "in_progress"
timestamp: "2026-11-04T05:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 34
parent_issue: 33
---

# TASKS: i18n Localization Phase 2 — Frontend Runtime, RTL Layout & Locale Switcher

- [x] **1. SDK Client i18n Implementation (`packages/sdk`)**
  - [x] Implement `I18nProvider` in `packages/sdk/src/i18n/provider.tsx`.
  - [x] Implement `useTranslation` hook in `packages/sdk/src/i18n/hook.ts` with template string interpolator.
  - [x] Implement locale formatters (`formatCurrency`, `formatDate`, `formatNumber`) in `packages/sdk/src/i18n/formatters.ts`.
  - [x] Implement client-side dictionary caching using `localStorage` with ETag validation.
  - [x] Unit test: Verify translation lookup, variable interpolation, and fallbacks.

- [x] **2. UI Language Switcher Component (`packages/ui`)**
  - [x] Implement `<LanguageSwitcher />` in `packages/ui/src/blocks/language_switcher.tsx`.
  - [x] Integrate language flags/badges and active indicator.
  - [x] Update `packages/ui/src/blocks/navbar.tsx` to include the language switcher.
  - [x] Ensure full RTL support (`dir="rtl"`) on layout containers and modals.
  - [x] Component test: Test language selection and RTL attribute flipping.

- [x] **3. Application-Level Integration (`apps/`)**
  - [x] Mount `I18nProvider` in root layout of `apps/headquarter/src/app/layout.tsx`.
  - [x] Mount `I18nProvider` in root layout of `apps/dock/src/app/layout.tsx`.
  - [x] Mount `I18nProvider` in root layout of `apps/id/src/app/layout.tsx`.
  - [x] Mount `I18nProvider` in root layout of `apps/jizz/src/app/layout.tsx`.
  - [x] Translate core navbar and dashboard labels into `id_ID` and `en_US`.

- [x] **4. Documentation & Verification**
  - [x] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 2 artifacts.
  - [x] Verify `pnpm docs:check` passes 100/100.
  - [x] Verify `pnpm lint:arch` passes.
  - [x] Verify `pnpm typecheck` passes.