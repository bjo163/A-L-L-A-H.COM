---
status: "proposed"
---
# i18n Key Extraction & Generation Plan

## Vision
Automate discovery of translatable UI strings across all client apps and generate corresponding entries in the `ir.translation` model, reducing manual effort and keeping translations in sync with code.

## Acceptance Criteria
- CLI command `pnpm i18n:extract` scans TypeScript/TSX files for `t('key')` and `i18n.t('key')` usages.
- Generates JSON payload of `{key:string, default:string, file:string, line:number}`.
- Inserts missing keys into `ir.translation` with `source='code'` and `company_id=0` (global).
- Existing keys are left untouched; updates default values when they change.
- Fails fast with clear error if DB connection unavailable.
- CI runs the extraction as a pre‑commit hook to ensure no new keys are left untranslated.
- All new code passes `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`.

