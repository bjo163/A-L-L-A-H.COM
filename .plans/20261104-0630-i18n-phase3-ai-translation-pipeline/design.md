---
title: "i18n Localization Phase 3: Design Specification"
status: "proposed"
timestamp: "2026-11-04T05:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 35
parent_issue: 33
---

# DESIGN: i18n Localization Phase 3 — AI-Assisted Translation Pipeline & Catalog Sync

## 1. AI Pipeline Sequence Flow
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Tenant Administrator
    participant UI as Headquarter (/i18n Studio)
    participant Hub as ARSY Hub (/v1/i18n/ai-translate)
    participant AIGateway as AI Gateway Router
    participant LLM as Multi-Provider Model (Gemini / Claude / GPT)
    participant DB as PGlite ir.translation Store

    Admin->>UI: Click "Batch Translate Untranslated to id_ID"
    UI->>Hub: POST /v1/i18n/ai-translate { targetLang: "id_ID", limit: 50 }
    Hub->>DB: Query terms WHERE state = 'to_translate'
    DB-->>Hub: Return 50 Terms with source English text
    Hub->>AIGateway: Prompt with Domain Context & Glossary Rules
    AIGateway->>LLM: Generate Translations JSON
    LLM-->>AIGateway: Return Translated Terms Array
    AIGateway-->>Hub: Validated Translations
    Hub->>DB: Batch UPDATE ir_translation SET value = ?, state = 'translated'
    Hub-->>UI: { success: true, count: 50 }
    UI-->>Admin: Update Data Grid View
```

## 2. Technical Glossary Preservation Rules
Prompt engineering guarantees that specific domain terms remain unchanged or standardized:
- **Networking/ISP**: PPPoE, RADIUS, NAS, VLAN, MTU, CIDR, OLT, ONT.
- **Billing/Finance**: Invoice, Prorata, Gateway, Balance, Due Date.
- **Units**: Mbps, Gbps, kWh, kW, V, A, ms.
- **Variables**: `{user}`, `{amount}`, `{code}`, `{date}` must never be translated.

## 3. UI Studio Layout in Headquarter
- Top Filter Bar: Language Selector, Status Dropdown (`All`, `Pending`, `Translated`), Search Input.
- Virtualized Data Grid: Source Key, Source String (en_US), Target Value (Editable inline), Action Icon.
- Bulk Action Footer: "Translate 24 Pending Terms via AI" button with gradient badge.

