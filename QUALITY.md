# QUALITY.md
## Quality Standards & Definition of Done

A task is complete only when acceptance criteria are met, relevant checks are executed, the diff is reviewed, and evidence is recorded. `IMPLEMENTED`, `VERIFIED`, and `RELEASED` are different states.

## Backend
Where applicable: Rust formatting; Clippy; unit/integration tests; API contracts; error handling; input validation; parameterized queries; authentication/authorization; tenant isolation; migration and recovery strategy; secret-safe logging.

## Frontend
Where applicable: lint and production build; working navigation and controls; loading/empty/error/offline/success states; responsive layouts; keyboard/focus/semantics/contrast; reduced motion; optimized assets.

## Integrations
Explicit versioned contracts; authentication; timeout/retry/idempotency; data ownership/provenance; end-to-end tests; useful observability.

## Data and legacy migration
Preserve originals; record mapping/provenance; validate counts, hashes, relationships, and representative records where appropriate; document rollback/recovery; no destructive deletion without authorization.

## Security and operations
Review secrets, least privilege, access control, injection, SSRF, XSS, CSRF, unsafe deserialization, dependency risks, abuse controls, backups, restore, health checks, observability, deployment, and rollback as relevant.

## Evidence
For each verified task record exact command/test, result, environment limitations, paths or commit, and manual verification. Never report skipped or unavailable checks as passing.
