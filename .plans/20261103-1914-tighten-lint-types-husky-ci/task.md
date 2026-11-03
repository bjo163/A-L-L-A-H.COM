# Task Checklist: Tighten Lint Rules, Type-Checking, Consistency, Husky Gates, CI Gates

## TypeScript Type-Checking
- [ ] Tighten `tsconfig.base.json` with strict flags (noUnusedLocals, noUnusedParameters, noUncheckedIndexedAccess, verbatimModuleSyntax, exactOptionalPropertyTypes, noFallthroughCasesInSwitch)
- [ ] Make `packages/arsy-orm/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/arsy-core/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/arsy-plugin-auth/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/arsy-plugin-llm-gateway/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/arsy-plugin-sdui/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/arsy-plugin-storage/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/types/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/sdk/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/ui/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/lint/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/sentinel-radius/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `packages/vscode-extension/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/arsy/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/dock/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/headquarter/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/id/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/jizz/tsconfig.json` extend `tsconfig.base.json`
- [ ] Make `apps/web/tsconfig.json` extend `tsconfig.base.json`
- [ ] Add tsconfig for `addons/base`, `mw_storage`, `mw_llm_router`, `mw_qorpus`, `nexus`, `works`
- [ ] Add `packages/lint`, `packages/sentinel-radius`, `packages/vscode-extension`, `apps/dock`, `apps/headquarter`, `apps/id`, `apps/jizz`, `apps/web` to `pnpm typecheck`
- [ ] Create `scripts/typecheck.ts` to replace fragile shell `&&` chain

## Lint Rules
- [ ] Strengthen `packages/lint/src/check-architecture.mjs` with AST-based parsing
- [ ] Add TENANT_ISOLATION rule (company_id enforcement)
- [ ] Add PARAMETERIZED_QUERIES rule (no raw SQL string concatenation)
- [ ] Add NO_SECRETS rule (no hardcoded keys/tokens/passwords)
- [ ] Add NO_DEBUGGER rule
- [ ] Add TODO_FIXME_HACK scan rule
- [ ] Add CIRCULAR_DEPENDENCY check rule
- [ ] Add ADDON_MANIFEST_CONSISTENCY rule
- [ ] Strengthen UI_PURITY: catch `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` across apps/ AND packages/
- [ ] Strengthen SHARED_DATA_CONTRACTS: catch all local redefinitions of @moonwitness/types entities
- [ ] Add `eslint.config.mjs` at root using `@moonwitness/lint/src/index.js`
- [ ] Add `pnpm lint` script to root package.json

## Consistency
- [ ] Update `scripts/check-doc-contracts.ts` threshold from 95 → 100
- [ ] Add `apps/id/README.md`, `apps/jizz/README.md`, `apps/server/README.md` to REQUIRED_DOCS

## Husky Gates
- [ ] `.husky/pre-commit`: add `pnpm lint` step
- [ ] `.husky/pre-push`: add jizz:build, extension:build, server:build, typecheck re-run

## CI Gates
- [ ] Add `verify-lint-arch` job to ci-dev.yml
- [ ] Add `verify-typecheck` job to ci-dev.yml
- [ ] Add `verify-lint` job to ci-dev.yml
- [ ] Add `verify-jizz` job to ci-dev.yml
- [ ] Add `verify-id` job to ci-dev.yml
- [ ] Add `verify-arsy` job to ci-dev.yml
- [ ] Add `verify-tests` job to ci-dev.yml
- [ ] Update `promote-to-main` to need ALL verify jobs
