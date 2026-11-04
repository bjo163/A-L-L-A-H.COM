---
status: "proposed"
---
# i18n CI Validation Pipeline Plan

## Vision
Introduce a CI stage that automatically validates translation keys, detects missing translations, and runs UI snapshot tests for both LTR and RTL layouts.

## Acceptance Criteria
- New npm script `pnpm i18n:validate` runs after `pnpm lint:arch`.
- Fails the build if any `t('key')` lacks a translation for any enabled language.
- Executes Playwright snapshot tests for each client app in both directions.
- Generates a summary report (`i18n-validation-report.json`) and uploads as an artifact.
- All CI pipelines (`github-actions.yml`) include this step and block merges on failure.

## Dependencies
- Extraction tool (`i18n:extract`) from the Key Extraction plan.
- Jest/Playwright config extensions.
- `@moonwitness/ui` test utilities.

