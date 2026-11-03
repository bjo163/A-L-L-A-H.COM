---
title: "i18n Localization Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T05:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 33
parent_issue: 5
---

# TASKS: i18n Localization Phase 1 — Core Translation Models & Addon Schema

- [ ] **1. PGlite Model Definitions (`addons/base/models`)**
  - [ ] Implement `ResLang` model in `addons/base/models/res_lang.ts` with fields: `code`, `name`, `direction`, `active`, `date_format`, `time_format`.
  - [ ] Implement `IrTranslation` model in `addons/base/models/ir_translation.ts` with fields: `company_id`, `lang`, `type`, `name`, `res_id`, `src`, `value`, `state`.
  - [ ] Register `res.lang` and `ir.translation` into `addons/base/index.ts` and `__manifest__.json`.
  - [ ] Seed default languages: `id_ID` (Indonesian, LTR), `en_US` (English US, LTR, base), `ar_SA` (Arabic, RTL).

- [ ] **2. ORM Translation Support (`packages/arsy-orm`)**
  - [ ] Extend field definition options with `translate?: boolean` in `packages/arsy-orm/src/fields.ts`.
  - [ ] Implement transparent field translation lookup in `Model.read()` and `Model.search()` via context parameter `lang`.
  - [ ] Implement in-memory translation cache to avoid relational joins on repeated terms.
  - [ ] Unit test: Verify `read()` returns translated values when `lang: 'id_ID'` is passed in `test/orm_translation.test.ts`.

- [ ] **3. Fastify Hub Translation Routes (`apps/arsy`)**
  - [ ] Implement `GET /v1/i18n/languages` returning active language list.
  - [ ] Implement `GET /v1/i18n/terms/:lang` with HTTP 304 ETag caching for frontend dictionary bundling.
  - [ ] Implement `POST /v1/i18n/terms/sync` with admin token authentication.
  - [ ] Integration test: Validate i18n routes and ETag handling with Supertest.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with i18n models.
  - [ ] Verify `pnpm docs:check` passes 100/100.
  - [ ] Verify `pnpm lint:arch` passes.
  - [ ] Verify `pnpm typecheck` passes.
