---
title: "i18n Localization Phase 3: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T05:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 35
parent_issue: 33
---

# RULES: i18n Localization Phase 3 — AI-Assisted Translation Pipeline & Catalog Sync

## 1. Architectural Invariants
- **AI Gateway Integration Invariant**: All AI-assisted translation calls MUST route through `@allah/arsy-plugin-llm-gateway` using the configured primary or fallback providers. Direct external LLM API calls are strictly forbidden.
- **Auditing & Immutability**: Bulk translation updates MUST emit an immutable event entry to `CHRONICLE` recording the model used, token cost, and terms affected.
- **Tenant Scope Guard**: Model translation updates (`type: 'model'`) only affect records owned by the requesting `company_id`.

## 2. Technical Validation Rules
- The translation service must validate that all template variables (e.g. `{count}`) present in `src` are preserved exactly in `value`. If an AI response drops a placeholder, the update is rejected and flagged for review.
- Term extractions must ignore files in `dist/`, `.next/`, `node_modules/`, and `.plans/`.

## 3. UI Purity & Security
- Headquarter Translation Studio MUST be constructed purely from `@moonwitness/ui` atomic elements.
- Bulk operations require `role: 'admin'`.
