# Tasks: i18n CI Validation Pipeline (Issue #25)

## 1. CI Pipeline Integration
- [ ] Add translation catalog validation to CI pipeline
- [ ] Implement key usage checks on PR creation
- [ ] Add syntax validation for translation files
- [ ] Configure automated key extraction on merge

## 2. Validation Rules
- [ ] Validate translation key format and naming conventions
- [ ] Check for missing translations per language
- [ ] Detect circular references in interpolation
- [ ] Validate JSON schema for translation catalogs

## 3. Reporting & Enforcement
- [ ] Generate validation reports on PRs
- [ ] Block merge on critical i18n violations
- [ ] Add GitHub Actions workflow for i18n validation
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`