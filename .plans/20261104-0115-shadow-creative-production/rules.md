# Rules: SHADOW Phase 1 — Creative Production & Asset Pipeline Foundation

## 1. Creative Pipeline Invariants
1. **CAS Integrity**: Media assets must never be stored on volatile arbitrary disk paths; all files must be referenced by their immutable SHA-256 CAS hash.
2. **Single Storage Engine**: Reuses `@allah/arsy-plugin-storage` and PGlite; no redundant S3 microservices or competing storage engines.
3. **Tenant Isolation**: Mandatory `company_id` filter on all creative projects and media assets.

