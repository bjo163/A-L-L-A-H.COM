---
status: "proposed"
---
# Architectural Design: i18n Continuous Localization CI/CD & TMS Sync Engine

## 1. Synchronization Flow Architecture
```mermaid
flowchart TD
    Repo[Codebase Merged into dev] --> Extract[CI Key Extraction: pnpm i18n:extract]
    Extract --> PushTMS[Sync CLI: Push Untranslated Strings to TMS]
    PushTMS --> TMSPlatform[(External TMS / Translators)]

    subgraph TranslationLifecycle [Human & AI Review]
        TMSPlatform --> Translators[Professional Linguists / Human Reviewers]
        Translators --> Approved[Strings Approved & Published]
    end

    Approved --> Webhook[TMS Webhook: POST /v1/i18n/webhooks/tms]
    Webhook --> HMAC[HMAC-SHA256 Signature Guard]
    HMAC --> Hub[Fastify Hub: Upsert into ir_translation]
    Hub --> Evict[Pub/Sub Cache Invalidation]

    Approved --> ActionBot[GitHub Action: Pull Translations]
    ActionBot --> AutoPR[Create Sync Pull Request: chore/i18n-sync]
```

## 2. Webhook Security Contract
- Header: `X-TMS-Signature: sha256=<hex_digest>`
- Payload:
```json
{
  "event": "translation.published",
  "project_id": "allah-ecosystem",
  "lang": "id_ID",
  "terms": [
    {
      "key": "auth.login.title",
      "value": "Masuk ke Akun Anda",
      "translator": "linguist_01"
    }
  ]
}
```

## 3. Versioning & Reconciliation Rules
- Translations with `state = 'verified'` take precedence over untranslated or machine-translated drafts.
- Term removals are marked obsolete rather than hard-deleted to prevent accidental data loss.

