---
status: "proposed"
---
# Plan Specification: i18n Production Performance, Edge Caching & Distribution Platform

## 1. Overview & Vision
This plan establishes a zero-latency, ultra-scalable distribution architecture for translation assets across global points of presence. To guarantee instant page loads in Next.js 16 client applications (`dock`, `headquarter`, `id`), translation bundles must be aggressively cached, incrementally updated, and served through a multi-tiered caching topology: memory LRU, distributed Redis, HTTP conditional validation (ETags), and Edge CDN distribution.

## 2. Goals & Objectives
- **Sub-10ms Localization Delivery**: Serve pre-compiled translation dictionaries directly from memory / edge cache without recurring database hits.
- **Deterministic ETag & Delta Sync**:
  - Compute SHA-256 ETags for translation payloads per `(tenant_id, lang, version)`.
  - Return `304 Not Modified` when client caches are current.
  - Implement delta sync endpoint (`GET /v1/i18n/terms/:lang/delta?since=<timestamp>`) returning only modified or added terms.
- **Cache Invalidation & Webhook Fanout**:
  - Invalidate redis and CDN caches within < 500ms when an admin or AI job publishes term revisions.
  - Pub/Sub channel `i18n:cache:invalidate` notifies all Fastify worker nodes to flush local LRU caches.
- **Static Generation Integration**: Pre-render default language catalogs during Next.js build time while allowing dynamic runtime fallbacks.

## 3. Scope & Acceptance Criteria
- [ ] Redis caching layer for Fastify translation routes with stale-while-revalidate semantics.
- [ ] Fastify plugin calculating strong ETags and HTTP caching headers (`Cache-Control: public, max-age=300, stale-while-revalidate=86400`).
- [ ] Delta synchronization endpoint implementation.
- [ ] Redis Pub/Sub cluster invalidation listener in `apps/arsy`.
- [ ] Benchmark test suite asserting > 5,000 req/sec throughput with p99 latency < 15ms.
- [ ] Full quality gate clearance (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`).

