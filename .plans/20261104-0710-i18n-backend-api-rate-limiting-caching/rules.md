---
title: "i18n Backend API Rate Limiting & Caching - Rules"
---
# Rules: i18n Backend API Rate Limiting & Caching

## Invariants
- Rate limits must be enforced per tenant and per API key
- Cache TTL must respect translation catalog version hashes
- Rate limit exceeded responses must return 429 with Retry-After header
- Cache invalidation must be immediate on catalog updates

## Security Constraints
- Rate limit configuration must not be exposed to clients
- Redis connection must use TLS encryption
- Rate limit keys must not leak tenant identifiers
- Cache keys must be salted to prevent enumeration

## Boundary Rules
- Rate limiting applies to all i18n backend API endpoints
- Cache layer is separate from translation catalog storage
- No direct Redis access from frontend - SDK proxy only
- Rate limit configurations must be versioned and deployed atomically