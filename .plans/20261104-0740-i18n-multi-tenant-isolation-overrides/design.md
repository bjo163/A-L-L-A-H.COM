---
status: "proposed"
---
# Architectural Design: i18n Multi-Tenant Translation Isolation & Enterprise Overrides

## 1. Resolution Flow Architecture
```mermaid
flowchart TD
    Client[Client Request (Tenant T, Lang id_ID, Key button.submit)] --> Gateway[Fastify Hub i18n Gateway]
    Gateway --> CacheCheck{Cache Hit in Redis/LRU for T:id_ID:button.submit?}
    CacheCheck -- Yes --> ReturnVal[Return Cached Translated String]
    CacheCheck -- No --> FallbackChain[Execute Fallback Chain Query]

    subgraph FallbackChain [Fallback Hierarchy Query]
        Step1[1. Check ir_translation WHERE company_id = T AND lang = id_ID] --> Check1{Found?}
        Check1 -- No --> Step2[2. Check ir_translation WHERE company_id = 0 AND lang = id_ID]
        Check2 -- No --> Step3[3. Check ir_translation WHERE company_id = T AND lang = id]
        Check3 -- No --> Step4[4. Check ir_translation WHERE company_id = 0 AND lang = id]
        Check4 -- No --> Step5[5. Check fallback lang en_US / en]
        Check5 -- No --> Step6[6. Return raw source code term]
    end

    FallbackChain --> CacheStore[Store Result in Cache with TTL]
    CacheStore --> ReturnVal
```

## 2. Database Schema & Indexing Strategy
```sql
-- Compound index optimized for tenant resolution pipeline
CREATE INDEX idx_ir_translation_tenant_lookup 
ON ir_translation (company_id, lang, name, res_id) 
WHERE state = 'translated';
```

## 3. Security Boundary & Permissions
- All tenant override operations must extract authenticated `company_id` from the verified session claims (`req.user.company_id`).
- Tenant requests cannot read or write records with `company_id` other than their own, except for reading global `company_id = 0`.
- Only users with role `admin` or permission `i18n:manage` can access `POST/DELETE /v1/i18n/tenant/*`.

