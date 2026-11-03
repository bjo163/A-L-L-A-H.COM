# Spec: Tighten Lint Rules, Type-Checking, Consistency Gates, Husky Gates, and CI Gates

## Status
`proposed`

## Objective
Perketat (tighten) the monorepo quality gates: lint rules, TypeScript type-checking, consistency enforcement, local husky hooks, and CI gates — ensuring 100% compliance per AGENTS.md quality gates.

## Requirements

### 1. Type-Checking Gate (`pnpm typecheck`)
- **REQ-1.1**: All TypeScript packages and apps must be included in root `typecheck`: `packages/lint`, `packages/sentinel-radius`, `packages/vscode-extension`, `apps/jizz`, `apps/web`.
- **REQ-1.2**: Addons (`addons/base`, `mw_storage`, `mw_llm_router`, `mw_qorpus`, `nexus`, `works`) must have tsconfigs and be type-checked.
- **REQ-1.3**: All project tsconfigs must extend `tsconfig.base.json` as the single source of truth for compiler options.
- **REQ-1.4**: Add strict flags consistently: `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noFallthroughCasesInSwitch`.
- **REQ-1.5**: Replace the fragile shell `&&` chain in package.json with a maintainable `typecheck.ts` script that iterates tsconfig projects.

### 2. Lint Rules Gate (`pnpm lint:arch` + `pnpm lint`)
- **REQ-2.1**: Strengthen `packages/lint/src/check-architecture.mjs` — upgrade from regex-based to proper AST parsing using `@typescript-eslint/parser` (available in node_modules).
- **REQ-2.2**: Add new rules: TENANT_ISOLATION (`company_id`), PARAMETERIZED_QUERIES (no string-concat SQL), NO_SECRETS (no hardcoded keys/tokens), NO_DEBUGGER, TODO_FIXME_HACK scan, CIRCULAR_DEPENDENCY check, ADDON_MANIFEST_CONSISTENCY.
- **REQ-2.3**: Strengthen UI_PURITY to catch all raw HTML elements (`<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>`) across `apps/` AND `packages/`.
- **REQ-2.4**: Expand SHARED_DATA_CONTRACTS to catch any local redefinition of `@moonwitness/types` entities, not just 3 hardcoded strings.
- **REQ-2.5**: Add root-level `eslint.config.mjs` using `@moonwitness/lint/src/index.js` as a base ESLint flat config.
- **REQ-2.6**: Add `pnpm lint` script to root package.json that runs ESLint across the monorepo.

### 3. Consistency Gates
- **REQ-3.1**: Every package/app tsconfig extends `tsconfig.base.json` — no inline duplicate compilerOptions.
- **REQ-3.2**: `skipLibCheck` consistent across all configs (keep `true` but document why).
- **REQ-3.3**: `isolatedModules: true` consistently enabled across all TS projects.
- **REQ-3.4**: Add docs:check threshold from 95 → 100 to match AGENTS.md requirement.
- **REQ-3.5**: Add missing app READMEs to `REQUIRED_DOCS` in `scripts/check-doc-contracts.ts`: `apps/id/README.md`, `apps/jizz/README.md`, `apps/server/README.md`.

### 4. Local Husky Gates
- **REQ-4.1**: `.husky/pre-commit`: add `pnpm lint` (ESLint) step before `lint:arch`.
- **REQ-4.2**: `.husky/pre-commit`: ensure `typecheck` covers all projects (per REQ-1).
- **REQ-4.3**: `.husky/pre-push`: add `jizz:build`, `extension:build`, `server:build` (Rust), full typecheck re-run, and docs:check.
- **REQ-4.4**: Husky hooks must fail fast with clear error messages.

### 5. CI Gates (`.github/workflows/ci-dev.yml`)
- **REQ-5.1**: Add `verify-lint-arch` job running `pnpm lint:arch`.
- **REQ-5.2**: Add `verify-typecheck` job running `pnpm typecheck`.
- **REQ-5.3**: Add `verify-lint` job running `pnpm lint`.
- **REQ-5.4**: Add `verify-jizz` job running `pnpm jizz:build`.
- **REQ-5.5**: Add `verify-id` job running `pnpm id:build`.
- **REQ-5.6**: Add `verify-arsy` job running `pnpm --filter @allah/arsy build`.
- **REQ-5.7**: Add `verify-tests` job running `pnpm extension:test`.
- **REQ-5.8**: `promote-to-main` must need ALL verify jobs (not just 4).
- **REQ-5.9**: CI must fail fast; any gate failure blocks promotion.

## Acceptance Criteria
- `pnpm docs:check` passes at 100/100
- `pnpm lint:arch` passes with 0 violations
- `pnpm lint` passes with 0 ESLint errors
- `pnpm typecheck` passes with 0 TS errors across all packages/apps
- Husky pre-commit runs: docs:check → lint → lint:arch → typecheck
- Husky pre-push runs: typecheck → all builds (dock, headquarter, id, jizz, arsy, extension)
- CI runs all verify jobs; promote-to-main requires all jobs to pass
- All package/app tsconfigs extend `tsconfig.base.json`
- No inline `strict: true` duplicates outside base config
