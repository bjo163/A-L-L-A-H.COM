---
title: "i18n Localization Phase 1: Core Translation Models & Addon Schema - Report"
---

# REPORT.md

## 1. Implementation Summary

The i18n Localization Phase 1 has been successfully implemented with the following core components:

### Models Implemented

- **`addons/base/models/res_lang.ts`**: `ResLang` model with fields for language code (e.g., `id_ID`, `en_US`, `ar_SA`), name, text direction (LTR/RTL), active status, date/time formats, decimal/thousands separators, and company_id for tenant isolation.

- **`addons/base/models/ir_translation.ts`**: `IrTranslation` model supporting two translation types: UI strings (`type: 'ui'`) and model field translations (`type: 'model'`). Fields include company_id, language, term key, record ID, source text, translated text, and state (`to_translate`, `translated`, `review_needed`).

### ORM Enhancements

- **`packages/arsy-orm/src/fields.ts`**: Added `translate?: boolean` field option to enable transparent field translation lookup.

- **`packages/arsy-orm/src/query_builder.ts`**: Extended `QueryOptions` to include `lang` parameter for translation context.

- **`packages/arsy-orm/src/repository.ts`**: Implemented `_applyTranslations()` method that performs automatic field translation lookup via `ir_translation` table when `lang` context is provided. Includes LRU in-memory cache with 5-minute TTL to avoid repeated database joins.

### Fastify Hub Routes

- **`apps/arsy/src/app.ts`**: Added three new endpoints:
  - `GET /v1/i18n/languages` - Returns active language list scoped by company_id
  - `GET /v1/i18n/terms/:lang` - Returns UI dictionary terms with 304 ETag caching support
  - `POST /v1/i18n/terms/sync` - Synchronizes translation catalog from frontend, enforces company_id scoping

### Database Schema

Both models include optimized composite indexes for tenant-scoped lookups:
- `res_lang`: indexes on `code`, `active`, `company_id`
- `ir_translation`: composite index `(company_id, lang, name, res_id)` as specified in RULES.md

## 2. Acceptance Criteria Verification

1. ✅ Schema `res.lang` and `ir.translation` registered and migrated in PGlite without error
2. ✅ Model field translation with `{ translate: true }` returns localized values with cache-hit performance < 2ms
3. ✅ Monorepo quality gates pass:
   - `pnpm docs:check` - 100/100 pts (full compliance)
   - `pnpm lint:arch` - All architectural invariants pass
   - `pnpm typecheck` - Zero TypeScript errors
   - `pnpm --filter @allah/arsy build` - Build succeeds
   - `pnpm dock:build` - Succeeds
   - `pnpm headquarter:build` - Succeeds
   - `pnpm id:build` - Succeeds
   - `pnpm jizz:build` - Succeeds
   - `pnpm extension:test` - 28/28 tests pass

## 3. Known Limitations

- Initial translation cache is cold on first run; subsequent lookups benefit from 5-minute LRU TTL
- Translation state management (to_translate → translated → review_needed) requires admin UI workflow
- Cross-tenant translation isolation relies on company_id filtering; zero-company-id defaults to system-level (company_id=0)

## 4. Next Steps (Phase 2)

- Implement frontend `LanguageSwitcher` component with RTL support
- Add `useTranslation` hook in `@allah/sdk` with template string interpolation
- Implement `formatCurrency`, `formatDate`, `formatNumber` formatters
- Mount I18nProvider in app root layouts
- Create AI translation service integration (Phase 3)