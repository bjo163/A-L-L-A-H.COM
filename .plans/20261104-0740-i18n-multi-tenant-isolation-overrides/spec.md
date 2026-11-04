---
status: "proposed"
---
# Plan Specification: i18n Multi-Tenant Translation Isolation & Enterprise Overrides

## 1. Overview & Vision
This plan establishes strict multi-tenant isolation and hierarchical translation fallback mechanics across the whole platform. In enterprise multi-company environments, each tenant (`company_id`) must have the power to define brand-specific or locale-specific vocabulary (e.g. customized terminology, enterprise glossary overrides) without corrupting global base translations (`company_id = 0` / system level) or leaking confidential nomenclature across different organizations.

## 2. Goals & Objectives
- **Strict Data Isolation**: Enforce queries to scope translations strictly to `company_id IN (0, current_tenant_id)` with row-level tenant security.
- **Hierarchical Fallback Strategy**:
  1. Exact tenant override (`company_id = current_tenant_id`, `lang = current_lang`).
  2. Global system translation (`company_id = 0`, `lang = current_lang`).
  3. Tenant base locale fallback (e.g., `id_ID` -> `id` -> `en_US` -> `en`).
  4. Raw source term / developer string.
- **Tenant Glossary Management API**: Fastify Hub endpoints for tenant administrators to view, upload (PO/JSON/CSV), export, and customize company-specific dictionary entries.
- **Audit Logging & Retention**: Record historical revisions of tenant overrides for compliance and tamper resistance.

## 3. Scope & Acceptance Criteria
- [ ] Schema update in `addons/base/models/ir_translation.ts` adding tenant indexing: `CREATE INDEX idx_ir_translation_tenant_lookup ON ir_translation (company_id, lang, name, res_id);`.
- [ ] PGlite ORM query middleware guarantees automatic injection of `company_id` filter unless explicit cross-tenant admin mode is requested.
- [ ] Fastify Hub routes:
  - `GET /v1/i18n/tenant/overrides`: List active company overrides.
  - `POST /v1/i18n/tenant/overrides`: Upsert company custom terms.
  - `DELETE /v1/i18n/tenant/overrides/:id`: Revert override back to global default.
  - `POST /v1/i18n/tenant/import`: Batch import PO/JSON translation catalogs.
  - `GET /v1/i18n/tenant/export`: Export company catalog.
- [ ] Isolation leak prevention test suite: tenant A cannot read or overwrite tenant B's vocabulary.
- [ ] 100% compliance with `DOCUMENTATION_CONTRACT.md`, `pnpm lint:arch`, and `pnpm typecheck`.

