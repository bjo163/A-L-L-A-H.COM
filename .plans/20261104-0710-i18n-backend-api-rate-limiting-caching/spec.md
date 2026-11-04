---
status: "proposed"
---
# i18n Backend API Rate‑Limiting & Caching Plan

## Vision
Introduce per‑tenant rate‑limiting and response caching for all i18n Fastify endpoints to ensure scalability, prevent abuse, and improve latency for translation lookups.

## Acceptance Criteria
- `GET /v1/i18n/languages` and `GET /v1/i18n/terms/:lang` enforce configurable QPS limits per `company_id`.
- Responses are cached in Redis (or in‑memory LRU for dev) with a TTL of 5 minutes.
- Rate‑limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) are returned.
- Middleware respects tenant isolation and logs violations to audit.
- All new code passes `pnpm lint:arch`, `pnpm typecheck`, and `pnpm docs:check`.

## Dependencies
- `apps/arsy/src/middleware/rateLimit.ts` (new).
- `packages/sdk/src/i18n/cache.ts` (new).
- Redis client library (`ioredis`).
- Existing tenant context (`company_id`) from auth middleware.

