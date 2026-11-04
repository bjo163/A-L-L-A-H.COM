---
title: "i18n Localization Phase 3: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T05:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 35
parent_issue: 33
---

# TASKS: i18n Localization Phase 3 — AI-Assisted Translation Pipeline & Catalog Sync

- [ ] **1. String Extraction Tooling (`scripts/`)**
  - [ ] Implement `scripts/i18n-extract.ts` using TypeScript AST parser.
  - [ ] Support extraction of `t('key', ...)` and model field `label:` attributes.
  - [ ] Support export to JSON catalogs (`addons/*/i18n/{lang}.json`).
  - [ ] Add npm script `"i18n:extract": "tsx scripts/i18n-extract.ts"` to `package.json`.

- [ ] **2. Fastify Hub AI Translation Service (`apps/arsy`)**
  - [ ] Implement `I18nAITranslator` in `apps/arsy/src/services/i18n-ai.ts`.
  - [ ] Integrate with `@allah/arsy-plugin-llm-gateway` with fallback model routing.
  - [ ] Implement domain-specific glossary enforcement (preserving terms like RADIUS, PPPoE, NAS, VLAN, kWh).
  - [ ] Expose endpoint `POST /v1/i18n/ai-translate` with batch limits.
  - [ ] Unit test: Verify variable placeholder preservation in `test/i18n_ai.test.ts`.

- [ ] **3. Headquarter Translation Studio UI (`apps/headquarter`)**
  - [ ] Implement `/i18n` admin page in `apps/headquarter/src/app/i18n/page.tsx`.
  - [ ] Build virtualized term editor table using `@moonwitness/ui`.
  - [ ] Add "Translate with AI" batch action button with progress meter.
  - [ ] Add filter by language, translation status, and search query.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 3 artifacts.
  - [ ] Verify `pnpm docs:check` passes 100/100.
  - [ ] Verify `pnpm lint:arch` passes.
  - [ ] Verify `pnpm typecheck` passes.

