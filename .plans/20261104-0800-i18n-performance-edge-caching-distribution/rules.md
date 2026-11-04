---
status: "proposed"
---
# Invariants & Security Rules: i18n Production Performance, Edge Caching & Distribution Platform

## 1. Architectural & Performance Invariants
- **Database Load Protection**: Translation reads MUST never bypass both in-memory LRU and Redis caches under steady-state load. Database hits only occur on cold cache misses or invalidations.
- **Strong ETag Determinism**: ETags must be calculated strictly from canonicalized, sorted dictionary payloads using SHA-256 to avoid oscillating hashes across load-balanced nodes.
- **Fail-Safe Fallback**: If Redis or cache services fail, the service must gracefully fall back to database queries without bringing down the Fastify server.

## 2. Security & Cache Poisoning Protection
- **Tenant Key Scoping**: Cache keys MUST include `company_id`. A tenant cache entry cannot be populated with or overwritten by data from another tenant.
- **Header Injection Sanitization**: Prevent HTTP response splitting or header injection when writing dynamic ETag and Cache-Control headers.
- **DDoS & Bandwidth Limiting**: Delta sync queries with an unbounded or excessively old `since` timestamp must clamp to a maximum lookback window (e.g., 30 days) to prevent memory exhaustion attacks.

## 3. Quality Gate Compliance
- `pnpm docs:check` passes at 100/100 score.
- `pnpm lint:arch` passes without architectural violations.
- `pnpm typecheck` compiles cleanly.

