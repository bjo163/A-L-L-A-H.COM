# Tasks: Strict Monorepo Architectural Linter, Typecheck & Document Correlation

## 1. Architectural Linter Engine (`packages/lint`)
- [x] Build AST / Regex architectural checker script `packages/lint/src/check-architecture.mjs`
- [x] Implement Rule 1: UI Purity Check (mandatory `@moonwitness/ui` in `apps/`)
- [x] Implement Rule 2: Single ORM Invariant (blocks Drizzle, Prisma, TypeORM)
- [x] Implement Rule 3: SDK Client Invariant (requires `@allah/sdk` for API calls)
- [x] Implement Rule 4: Data Contract Invariant (requires `@moonwitness/types`)
- [x] Implement Rule 5: SSRF Guard Invariant on upstream URLs
- [x] Configure `packages/lint/package.json` with binary command `moonwitness-lint`
- [x] Add `"lint:arch"` script to root `package.json`

## 2. Strict TypeScript & Monorepo Configuration
- [x] Create `tsconfig.base.json` with strict compiler flags
- [x] Add `"typecheck"` script to root `package.json`
- [x] Verify `pnpm typecheck` across all workspace projects and resolve any type strictness issues

## 3. Husky Gate Enforcement
- [x] Update `.husky/pre-commit` to execute `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck`
- [x] Verify fail-closed behavior on rule violations

## 4. Canonical Documentation Harmonization & Synchronization
- [x] Update `AGENTS.md` with explicit architectural linter rules and shared-aware invariants
- [x] Update `QUALITY.md` to remove legacy Rust references and reflect TypeScript/Fastify/PGlite standards
- [x] Update `DESIGN.md` to mandate `@moonwitness/ui` atomic system and antislop compliance
- [x] Update `BLUEPRINT.md` with Phase 1 & 2 AI Gateway & Qorpus architecture
- [x] Update `BACKLOG.md` with verified completions
- [x] Update `CHANGELOG.md` with architectural linter and strict typechecking deliverables
- [x] Verify `pnpm docs:check` passes with 100/100 score
- [x] Execute complete monorepo verification and commit changes to `dev`
