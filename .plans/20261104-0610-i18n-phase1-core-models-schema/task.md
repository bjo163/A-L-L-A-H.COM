---
title: "i18n Localization Phase 1: Task Checklist"
status: "in_progress"
timestamp: "2026-11-04T05:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 33
parent_issue: 5
---

# TASKS: i18n Localization Phase 1 — Core Translation Models & Addon Schema

- [x] **1. PGlite Model Definitions (`addons/base/models`)**
  - [x] Implement `ResLang` model in `addons/base/models/res_lang.ts` with fields: `code`, `name`, `direction`, `active`, `date_format`, `time_format`.
  - [x] Implement `IrTranslation` model in `addons/base/models/ir_translation.ts` with fields: `company_id`, `lang`, `type`, `name`, `res_id`, `src`, `value`, `state`.
  - [x] Register `res.lang` and `ir.translation` into `addons/base/index.ts` and `__manifest__.json`.
  - [x] Seed default languages: `id_ID` (Indonesian, LTR), `en_US` (English US, LTR, base), `ar_SA` (Arabic, RTL).

- [x] **2. ORM Translation Support (`packages/arsy-orm`)**
  - [x] Extend field definition options with `translate?: boolean` in `packages/arsy-orm/src/fields.ts`.
  - [x] Implement transparent field translation lookup in `Model.read()` and `Model.search()` via context parameter `lang`.
  - [x] Implement in-memory translation cache to avoid relational joins on repeated terms.

- [x] **3. Fastify Hub Translation Routes (`apps/arsy`)**
  - [x] Implement `GET /v1/i18n/languages` returning active language list.
  - [x] Implement `GET /v1/i18n/terms/:lang` with HTTP 304 ETag caching for frontend dictionary bundling.
  - [x] Implement `POST /v1/i18n/terms/sync` with admin token authentication.

- [x] **4. Documentation & Verification**
  - [x] Update `DOCUMENTATION_CONTRACT.md` matrix with i18n models.
  - [x] Verify `pnpm docs:check` passes 100/100.
  - [x] Verify `pnpm lint:arch` passes.
  - [x] Typecheck has pre-existing JSX syntax errors in apps/dock/headquarter/id (not related to i18n changes).

