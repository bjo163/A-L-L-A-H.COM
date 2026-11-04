---
status: "proposed"
---
# Architectural Design: i18n In-Context Visual Translation Editor & Live DOM Overlay

## 1. Live Overlay Architecture
```mermaid
flowchart TD
    User[Translator / Admin] -->|Ctrl+Alt+T / UI Switch| Toggle[Toggle In-Context Mode]
    Toggle --> PermCheck{Has i18n:edit permission?}
    PermCheck -- No --> Deny[Toast: Unauthorized]
    PermCheck -- Yes --> Activate[Mount InContextEditorOverlay in Root Layout]

    Activate --> DOMScan[Tag & Outline i18n Elements with data-i18n-key]
    User -->|Hover Text Element| Highlighter[Draw Outline & Translation Badge]
    User -->|Click Text Element| Popover[Open In-Context Edit Popover]

    subgraph Popover [Visual Studio Popover]
        SourceView[Base Text & Key Name]
        InputArea[Localized Textarea Input]
        AIClick[Ask AI Gateway for Suggestions]
        SaveBtn[Save Translation Button]
    end

    SaveBtn --> Optimistic[Update In-Memory Translation Dict & DOM]
    Optimistic --> FastifySync[Fastify Hub: POST /v1/i18n/tenant/overrides]
    FastifySync --> CacheInvalidate[Redis Pub/Sub Eviction]
```

## 2. DOM Node Tagging Contract
When `inContextEditMode = true`, strings rendered by the i18n hook render wrapped with inspection markers:
```html
<span 
  data-i18n-key="dashboard.header.welcome" 
  data-i18n-status="translated"
  data-i18n-lang="id_ID"
  class="i18n-editable-node"
>
  Selamat datang di Command Center
</span>
```
When `inContextEditMode = false`, string output is clean plain text or transparent fragment with zero wrapper overhead.

## 3. Security & Injection Protection
- Inputs entered through the visual popover are strictly sanitized before persisting to avoid stored XSS.
- The overlay bundle is lazily loaded via dynamic import to preserve lean initial bundle sizes for regular visitors.

