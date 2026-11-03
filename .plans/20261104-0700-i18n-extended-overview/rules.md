---
status: "proposed"
---
# i18n Extended Overview – Rules

## Invariants
- All new i18n artifacts must be listed in `DOCUMENTATION_CONTRACT.md` matrix.
- Any change to `res.lang` or `ir.translation` requires a migration script with version bump.
- SDK functions must not expose raw DB queries; all access goes through typed helpers.
- Rate‑limit headers must be present on every i18n endpoint.
- No raw HTML in UI components; only `@moonwitness/ui` primitives.

## Security Constraints
- Tenant isolation enforced via `company_id` on every DB query.
- AI translation requests are rate‑limited per tenant (default 30 QPS).
- All endpoints require authenticated session (JWT) and appropriate role (`i18n_admin` for write ops).

## Quality Gates
- `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check` must pass after each commit.
- Unit test coverage ≥ 90 % for i18n service layer.
- UI component accessibility audit (axe‑core) must report no violations.
