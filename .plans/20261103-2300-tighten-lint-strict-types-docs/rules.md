# RULES: Strict Monorepo Architectural Linter, Typecheck & Document Correlation

## 1. System Invariants & Architectural Rules

### 1.1 Zero Tolerance for Architectural Drift
- Code that violates monorepo invariants (such as raw HTML controls in `apps/`, foreign ORM packages, or hardcoded API calls) will fail the pre-commit gate and cannot be merged to `dev`.

### 1.2 Strict Type Checking Invariant
- TypeScript strict mode is enabled across all workspaces.
- Use of the `any` type without justification is forbidden.
- All exported functions and methods must have explicit return type annotations where inference is ambiguous.

### 1.3 Documentation Synchronization Contract
- When architectural rules, packages, or gates are modified, all correlated canonical Markdown files (`AGENTS.md`, `QUALITY.md`, `DESIGN.md`, `BLUEPRINT.md`, `CHANGELOG.md`, `DOCUMENTATION_CONTRACT.md`) must be updated in the same commit.
- `pnpm docs:check` must pass with a minimum score of 95/100 (target: 100/100).

### 1.4 Anti-Slop Enforcement
- No em dashes in prose or documentation headings.
- No fabricated statistics, testimonials, or claims.
- Every interactive element in the UI must have working behaviors and explicit Loading, Empty, and Error states.

