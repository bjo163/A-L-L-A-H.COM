---
status: "proposed"
---
# i18n Extended Overview

## Vision
Create a comprehensive, Odoo‑style multilingual platform that supports **dynamic translation of UI strings**, **backend model fields**, **AI‑assisted term generation**, and **full RTL/Accessibility compliance** across all client apps (`dock`, `headquarter`, `id`).

## Acceptance Criteria
- All language resources are stored in PGlite models `res.lang` and `ir.translation`.
- SDK exposes type‑safe helpers for fetching translations and switching language at runtime.
- Front‑end components (`LanguageSwitcher`, `RTLProvider`) use the atomic UI library (`@moonwitness/ui`).
- AI translation pipeline preserves placeholders (`{var}`) and glossary terms.
- CI validates translation keys, prevents missing keys, and runs automated UI snapshot tests for LTR/RTL.
- Documentation updates are synchronized with code and pass `pnpm docs:check` (100/100).

## Phases Covered
1. **Core Models & Schema** – already completed (Phase 1).
2. **Frontend Runtime & RTL** – already completed (Phase 2).
3. **AI Translation Pipeline** – already completed (Phase 3).
4. **Language Switcher UI Component** – new.
5. **Backend API Rate‑Limiting & Caching** – new.
6. **Automated Extraction & Generation of Translation Keys** – new.
7. **CI Pipeline for Translation Validation** – new.
8. **Multi‑Tenant Isolation for i18n Data** – new.
9. **Accessibility & RTL Enhancements** – new.
10. **Documentation & Public SDK Release** – new.

Each new phase will have its own canonical plan directory with `spec.md`, `task.md`, `design.md`, and `rules.md`.

