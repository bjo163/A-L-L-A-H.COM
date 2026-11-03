---
title: "i18n Localization Phase 1: Design Specification"
status: "proposed"
timestamp: "2026-11-04T05:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 33
parent_issue: 5
---

# DESIGN: i18n Localization Phase 1 — Core Translation Models & Addon Schema

## 1. Relational ER Diagram & Translation Architecture
```mermaid
erDiagram
    RES_LANG {
        string code PK "e.g. id_ID, en_US, ar_SA"
        string name "Bahasa Indonesia / English"
        string direction "ltr or rtl"
        boolean active "true/false"
        string date_format "DD/MM/YYYY"
        string time_format "HH:mm:ss"
    }

    IR_TRANSLATION {
        string id PK "uuid"
        int company_id "Tenant Isolation Key"
        string lang FK "References res_lang.code"
        string type "model, ui, or code"
        string name "e.g. works.product,name or ui.login.submit"
        string res_id "Optional Record ID if type == model"
        string src "Source English Text"
        string value "Translated Target Text"
        string state "translated / to_translate"
    }

    RES_LANG ||--o{ IR_TRANSLATION : "contains translations"
```

## 2. API Contract Specification
- `GET /v1/i18n/languages`:
  ```json
  {
    "success": true,
    "data": [
      { "code": "en_US", "name": "English (US)", "direction": "ltr", "active": true },
      { "code": "id_ID", "name": "Bahasa Indonesia", "direction": "ltr", "active": true },
      { "code": "ar_SA", "name": "العربية", "direction": "rtl", "active": true }
    ]
  }
  ```
- `GET /v1/i18n/terms/id_ID`:
  ```json
  {
    "success": true,
    "version": "b4c10a",
    "terms": {
      "app.headquarter.title": "Pusat Komando Operasi",
      "works.invoice.status.paid": "Lunas",
      "sentinel.session.disconnect": "Putuskan Sesi"
    }
  }
  ```

## 3. Performance & Caching Strategy
- Translation terms are cached in-memory with SHA-256 ETag generation.
- Response payload is compressed (Gzip/Brotli) resulting in $< 15\text{KB}$ transfer for ~2,000 UI keys.
