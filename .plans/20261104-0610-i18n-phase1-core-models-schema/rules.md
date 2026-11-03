---
title: "i18n Localization Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T05:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 33
parent_issue: 5
---

# RULES: i18n Localization Phase 1 — Core Translation Models & Addon Schema

## 1. Architectural Invariants
- **Odoo-Inspired Addon Isolation**: Translation tables and logic MUST reside inside modular addon models (`addons/base`) managed exclusively by `@allah/arsy-orm`.
- **Strict Tenant Separation**: All `ir_translation` entries for business entities (`type: 'model'`) MUST be partitioned by `company_id`. No cross-tenant translation exposure.
- **Fail-Safe Source Fallback**: If a term is missing in the requested target language (e.g. `id_ID`), the system MUST transparently fall back to `src` (base English `en_US`) without crashing or emitting empty strings.

## 2. Purity & Encoding Standards
- All database strings and files MUST be UTF-8 encoded.
- RTL language compatibility: Arabic (`ar_SA`) and Hebrew (`he_IL`) must carry `direction: 'rtl'` flag.
- Model field translation lookup must be parameterized to avoid SQL injection.

## 3. Security
- Only authenticated tenant administrators (`role: 'admin'`) can mutate translations or trigger catalog syncs.
