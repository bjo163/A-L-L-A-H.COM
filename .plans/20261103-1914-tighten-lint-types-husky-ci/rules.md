# Rules: Quality Gate Invariants

## R1 — Single Source of Truth for TS Config
Every `tsconfig.json` in `packages/*`, `apps/*`, `addons/*` MUST extend `tsconfig.base.json`. No inline `strict: true`, `skipLibCheck`, `esModuleInterop`, or `forceConsistentCasingInFileNames` duplicates outside base.

## R2 — TypeScript Strictness
- `strict: true` is mandatory (enables all strict family flags)
- `noUnusedLocals: true` — no unused variables/imports
- `noUnusedParameters: true` — no unused function parameters
- `noUncheckedIndexedAccess: true` — indexed access returns `T | undefined`
- `verbatimModuleSyntax: true` — type-only imports must use `import type`
- `exactOptionalPropertyTypes: true` — optional properties are exact
- `isolatedModules: true` — safe for transpile-only bundlers
- `skipLibCheck: true` — acceptable for third-party libs (documented)
- `noFallthroughCasesInSwitch: true` — prevent switch fall-through bugs

## R3 — Lint: Architectural Invariants
- UI_PURITY: No raw `<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>` in `apps/` or `packages/` — use `@moonwitness/ui` components
- ZERO_ORM_OVERLAP: No `drizzle-orm`, `@prisma/client`, `typeorm`, `mongoose` imports anywhere
- UNIVERSAL_SDK_CLIENT: Client apps must route through `@allah/sdk`, not direct `fetch`
- SHARED_DATA_CONTRACTS: No local redefinition of `@moonwitness/types` entities
- TENANT_ISOLATION: Storage models must use `company_id` for multi-tenant isolation
- PARAMETERIZED_QUERIES: No raw SQL string concatenation; use parameterized queries
- NO_SECRETS: No hardcoded API keys, tokens, passwords, or connection strings
- NO_DEBUGGER: No `debugger;` statements in committed code
- TODO_FIXME_HACK: No `TODO:`, `FIXME:`, `HACK:` blocking comments
- CIRCULAR_DEPENDENCY: No circular imports between packages/apps
- ADDON_MANIFEST_CONSISTENCY: Every addon has valid `__manifest__.json`

## R4 — Husky Gate Ordering
pre-commit: docs:check → lint → lint:arch → typecheck
pre-push: typecheck → dock:build → headquarter:build → id:build → jizz:build → arsy:build → extension:build → docs:check

## R5 — CI Gate Completeness
CI must run ALL of: lint-arch, typecheck, lint, dock, headquarter, id, jizz, arsy, extension, tests, docs.
promote-to-main requires ALL verify jobs to pass.

## R6 — Documentation
- `docs:check` threshold: 100/100 (not 95)
- Required docs include all app READMEs (dock, headquarter, id, jizz, server)
- All plans must have spec.md, task.md, design.md, rules.md
- Completed plans must have report.md
