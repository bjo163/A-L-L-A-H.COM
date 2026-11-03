# Rules: JIZZ Phase 4 — Integration, Verification & Quality Gates

## Quality Gates Invariants
1. `pnpm docs:check` must maintain 100/100 compliance.
2. `pnpm lint:arch` must pass with zero violations.
3. `pnpm typecheck` must compile all 11 packages and apps without any error.
4. No fake tests or mock success assertions.

