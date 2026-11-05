---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_SECURITY_OBSERVABILITY_ENHANCEMENTS_RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Security & Observability Rules

## Security boundaries

- Every hub route is default-deny and requires a verified principal unless it is on the explicit public allowlist: `/health`, `/ready`, onboarding, and non-production `/docs`.
- Derive `company_id` from the authenticated principal for every tenant-scoped row. Never accept tenant identity from request data.
- Reject writes when `legal_hold` is active or `retention_until` has not elapsed. Fail closed when tenant or retention state cannot be verified.
- Authorize global-admin access on each admin route, require a reason, and record the target tenant. Generic CRUD must not expose identity, audit, or credential-bearing models.
- Use `@allah/arsy-orm` with embedded PGlite for persistence. Parameterize SQL values and allowlist dynamic identifiers.

## Audit and storage

- Record one append-only audit event for each model insert, update, and delete in the same transaction as the model change.
- Include changed field names, actor, and principal-derived `company_id`; do not store changed values or secrets in audit events.
- Store audit content using SHA-256 content addressing at `data/storage/<digest>`. Keep stored content write-once.
- Audit failures must fail the model transaction rather than report a successful unaudited write.

## Observability and secrets

- Emit structured logs and propagate request identifiers without placing credentials, tokens, secret values, or raw changed values in logs, metrics, or traces.
- Keep observability best-effort so an exporter failure does not block the primary request, while preserving security and audit transaction failures.
- Restrict metric labels and trace attributes to bounded, non-secret fields. Do not use tenant identifiers or other high-cardinality values as metric labels.
- Keep upstream credentials server-side. Client code must not read `NEXT_PUBLIC_*` values that carry keys, secrets, or tokens.

## Delivery constraints

- Use the existing architecture and platform contracts as the source of truth; do not introduce a second ORM, storage model, UI control system, or client-to-hub transport.
- Apply security and observability at shared boundaries where possible. Do not change unrelated application business behavior.
- Measure performance claims and security coverage; do not treat the plan's targets as verified results until tests or runtime evidence support them.
- UI changes must use `@moonwitness/ui`, skin tokens, and the existing route-state patterns. Do not add raw controls, private component-class selectors, or palette colors in app markup.
- Verify relevant contracts, architecture checks, tests, and type checks for each implementation slice. Report checks that were not run.
