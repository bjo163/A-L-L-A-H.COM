---
contract: "DOCUMENTATION_CONTRACT.md"
id: "QUALITY"
version: "1.0.0"
owner: "qa"
status: "implemented"
last_verified: "2026-11-03"
---
# QUALITY.md
## Quality Standards & Definition of Done

A task is complete only when acceptance criteria are met, relevant checks are executed, the diff is reviewed, and evidence is recorded. `IMPLEMENTED`, `VERIFIED`, and `RELEASED` are different states.

## Backend Standards
Fastify 5.x micro-kernel framework; strict TypeScript compilation (`pnpm typecheck`); unit and integration tests; standard response envelope `{ success, data, error, meta }`; input validation; parameterized SQL queries on embedded PGlite WASM (`@allah/arsy-orm`); zero ORM overlap; tenant isolation (`company_id`); fail-closed security guards; SSRF validation on upstream URLs; secret-safe structured Pino logging.

## Frontend Standards
Mandatory shared UI design system (`@moonwitness/ui`); no ad-hoc raw HTML controls (`<button>`, `<input>`); universal API client routing (`@allah/sdk`); production build validation (`dock:build`, `headquarter:build`, `id:build`); working navigation; three mandatory UI states (loading, empty, error); responsive mobile layouts; keyboard accessibility and focus indicators (WCAG AA); antislop compliance.

## Monorepo & Architectural Invariants
All code must pass the architectural invariant gate (`pnpm lint:arch` via `@moonwitness/lint`):
1. UI Purity: Only `@moonwitness/ui` in `apps/`.
2. Single ORM: Only embedded PGlite via `@allah/arsy-orm`.
3. Universal SDK: All client-to-hub communications route through `@allah/sdk`.
4. Shared Contracts: Universal data models imported from `@moonwitness/types`.
5. Pre-commit enforcement: `.husky/pre-commit` runs documentation, architectural lint, and typechecks.

## Integrations
Explicit versioned contracts in `@moonwitness/types`; authentication via MoonWitness ID session tokens or virtual keys; timeout/retry/idempotency; data ownership and provenance; automated integration tests; useful observability and cost metering in PGlite.

## Data and Legacy Migration
Preserve originals; record mapping and provenance (`LEGACY_RECONCILIATION.md`); validate counts, hashes, relationships, and representative records where appropriate; document rollback and recovery; no destructive deletion without authorization.

## Security and Operations
Review secrets, least privilege, access control, injection, SSRF guards, dependency risks, abuse controls, health checks (`/health`, `/ready`), observability, deployment, and rollback as relevant.

## Evidence
For each verified task record exact command, test result, environment limitations, paths or commit, and manual verification. Never report skipped or unavailable checks as passing.
