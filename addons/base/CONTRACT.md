---
contract: unit
id: ADDON_BASE
tier: addon
name: base
owner: platform-core
version: 1.1.0
status: released
last_verified: 2026-11-05
summary: Core enterprise entity registry, access-control models, and platform reference data
depends: []
models: [res.company, res.currency, res.country, res.partner, res.users, ir.ui.view, res.lang, ir.translation, ir.model.access, ir.rule]
data: [data/index.ts]
views: [views/res_partner_views.json, views/res_company_views.json]
installable: true
---

# base — Unit Contract

The root addon every other addon depends on. It registers the enterprise entity
models (companies, partners, users, currency, country, language, view, and the
`ir.translation` i18n store) and owns the platform reference data a fresh install
needs to be usable.

## Default data

`data/index.ts` exports `loadDefaultData(ctx)` and seeds, in FK-safe order, the
platform-owned (company_id 0) records:

1. `res.currency` — 8 working currencies keyed on `name`.
2. `res.country` — a representative ISO 3166-1 alpha-2 set keyed on `code`.
3. `res.lang` — the language catalog keyed on `code`.
4. `ir.translation` — a small `type: ui` term catalog keyed on `(lang, name, type)`.

Row content lives in `data/default.ts`. Seeding is idempotent and runs through the
ORM query layer (`seedDatasets`), never raw SQL.

## Models

Ten models registered by `registerBaseAddon`; the `models` frontmatter mirrors
`__manifest__.json` exactly and is enforced by `lint:arch` (ADDON_MANIFEST_CONSISTENCY)
and `contract:check` (UNIT_CONTRACT_CONSISTENCY). `ir.model.access` and `ir.rule`
are the Odoo-style access-control stores the ORM repository reads for model
permissions and record rules (roadmap S3).
