---
status: "proposed"
---
# Architectural Design: i18n Production Performance, Edge Caching & Distribution Platform

## 1. Multi-Tiered Caching & Invalidation Architecture
```mermaid
flowchart TD
    Client[Next.js 16 App / Browser] --> CDN[Edge CDN / Proxy]
    CDN -->|Cache Miss / ETag Check| FastifyNode[Fastify Hub Node (Port 5150)]
    
    subgraph FastifyNode [Fastify Hub Instance]
        LRU[Local In-Memory LRU Cache] -->|Miss| RedisCache[(Distributed Redis Cluster)]
        RedisCache -->|Miss| PGlite[(Embedded PGlite DB Engine)]
    end

    PGlite -->|Load & Store| RedisCache
    RedisCache -->|Store| LRU
    LRU -->|Compute ETag & Stream| CDN
    CDN -->|Return Response / 304 Not Modified| Client

    AdminMutation[Translation Updated via Admin / AI] --> DBWrite[(Write to ir_translation)]
    DBWrite --> InvalidatePub[Publish to Redis Channel i18n:cache:invalidate]
    InvalidatePub --> InvalidateSub[All Fastify Nodes Flush LRU Keys]
```

## 2. Delta Synchronization Contract
- Endpoint: `GET /v1/i18n/terms/:lang/delta?since=2026-11-04T00:00:00Z`
- Response Payload:
```json
{
  "lang": "id_ID",
  "synced_at": "2026-11-04T05:55:00Z",
  "etag": "sha256-a1b2c3d4...",
  "updated": {
    "dashboard.welcome": "Selamat datang di MoonWitness",
    "settings.billing": "Penagihan & Langganan"
  },
  "deleted": [
    "legacy.obsolete_term"
  ]
}
```

## 3. High-Throughput Invariants
- Memory footprint bounded to max 50MB per worker process for LRU cache.
- Payloads compressed with Brotli (level 6) or Gzip depending on `Accept-Encoding`.

