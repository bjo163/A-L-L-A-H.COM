---
status: "proposed"
---
# Actionable Tasks: i18n Multi-Tenant Translation Isolation & Enterprise Overrides

## 1. Schema & Engine Isolation
- [ ] Add composite index on `ir_translation (company_id, lang, name, res_id)` in `addons/base/models/ir_translation.ts`.
- [ ] Implement tenant resolver hook in ORM translation engine (`packages/arsy-orm` or `addons/base`).
- [ ] Add unit test verifying query plan leverages tenant index and prevents full-table scan.

## 2. Hierarchical Fallback Engine
- [ ] Implement query resolution logic prioritizing `company_id = tenant` over `company_id = 0`.
- [ ] Add language hierarchy resolution (e.g. `id_ID` -> `id` -> `en_US` -> `en`).
- [ ] Add cache layer keyed by `tenant_id:lang:term_key` to avoid duplicate fallback computation.
- [ ] Write unit test matrix verifying all 4 levels of fallback order.

## 3. Fastify Hub Tenant Endpoints
- [ ] Implement `GET /v1/i18n/tenant/overrides` with pagination and query filters.
- [ ] Implement `POST /v1/i18n/tenant/overrides` with validation and tenant context assertion.
- [ ] Implement `DELETE /v1/i18n/tenant/overrides/:id` ensuring ownership verification before deletion.
- [ ] Implement `POST /v1/i18n/tenant/import` accepting JSON and Gettext PO formats.
- [ ] Implement `GET /v1/i18n/tenant/export` streaming formatted translation catalogs.

## 4. Security, Audit & Invariants
- [ ] Write integration test verifying tenant cross-access attempts return HTTP 403 / zero rows.
- [ ] Integrate audit logging for company override mutations.
- [ ] Verify `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck` pass.

