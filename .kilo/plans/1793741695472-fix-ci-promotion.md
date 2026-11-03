# Plan: Fix CI Errors and Align Lint Rules for Promotion

## Goal
Restore green CI gate on `dev` so promotion to `main` succeeds, and make ESLint rules optimal/consistent instead of blocking promotion on stylistic noise.

## Scope
- CI failures: ESLint gate, Extension Tests, TypeScript type-check (and indirectly `@allah/arsy-core` resolution).
- Lint rule tuning in ESLint config.
- No source behavior changes beyond what is required to satisfy gates.

## Root Causes
1. **Type-check runs each tsconfig in isolation** (`scripts/typecheck.ts`) without building workspace dependencies first, so `@allah/arsy-core`, `@allah/arsy-orm`, `@allah/sdk`, `@moonwitness/types`, plugins resolve to "Cannot find module" across many projects.
2. **ESLint max-warnings 0** plus rules (`prefer-const`, `no-duplicate-imports`) flag existing code as errors, even where duplication is intentional/idiomatic (e.g., split imports, reassigned locals).
3. **Extension test failure**: `localAgentCore.test.ts` expects `resolveWorkspaceTarget` to throw on traversal/absolute paths but it no longer throws (missing expected exception).
4. **arsy-core package** recently modified; possible name/export mismatch causing resolution failures.

## Plan Tasks
1. Inspect package manifests and tsconfig path mappings to confirm dependency graph and build order.
2. Fix type-check script to build dependencies in topological order (or use project references / composite builds) before `tsc --noEmit`.
3. Fix `@allah/arsy-core` resolution: verify package name/export and rebuild; ensure `packages/arsy-core` is built before dependents.
4. Adjust ESLint configuration:
   - Relax `no-duplicate-imports` where imports are intentionally split, or consolidate duplicates.
   - Keep `prefer-const` but fix flagged locals (`totalErrors`, `filters`) or scope exceptions.
   - Ensure rules reflect monorepo conventions (shared packages, generated code).
5. Fix extension test: either restore throwing behavior in `resolveWorkspaceTarget` for traversal/absolute paths or update test expectations to match intended security behavior (prefer restore guard).
6. Run full CI gates locally: docs:check, lint:arch, lint, typecheck, builds.
7. Push only after all gates pass.

## Validation
- `pnpm docs:check`
- `pnpm lint:arch`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm --filter @allah/arsy build`
- `pnpm extension:test`

## Risks
- Topological build changes may increase CI time; consider caching.
- Relaxing lint rules could hide real issues; prefer targeted fixes over broad disables.
- Test expectation changes must not weaken security guards.

## Open Questions
- Should type-check build dependencies automatically or require explicit build step in CI?
- Should duplicated imports be consolidated or rule relaxed?
- Is `resolveWorkspaceTarget` supposed to throw or return null for invalid paths?
