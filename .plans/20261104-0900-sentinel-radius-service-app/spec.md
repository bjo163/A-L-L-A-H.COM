---
status: "completed"
---
# Plan Specification: Sentinel Standalone Microservice Daemon (`apps/sentinel`) & High-Performance UDP RADIUS Service

## 1. Overview & Vision
This plan establishes **`apps/sentinel`** as a dedicated, high-performance standalone daemon application in the monorepo workspace for network AAA (Authentication, Authorization, Accounting) and MikroTik/NAS access control. 

While architectural issue plans (`Issue #10`, `#11`, `#12`, `#13`) previously designed the protocol logic, **`apps/sentinel` and `packages/sentinel-radius` now exist in the codebase**. 

`apps/sentinel` runs as a native Node.js/TypeScript network daemon listening on UDP ports 1812 (Authentication) and 1813 (Accounting), RFC 3576 / 5176 port 3799 (CoA / Disconnect-Request), with direct integration into PGlite via `@allah/arsy-orm`, Redis policy caching, and MikroTik RouterOS PPPoE integration.

## 2. Goals & Objectives
- **Dedicated Daemon Workspace**: Create `apps/sentinel` with TypeScript configuration, clustering/worker support, zero-slop architecture, and healthcheck endpoints.
- **High-Throughput UDP Socket Engine**: Native `dgram` UDP sockets optimized for high concurrency, zero-copy packet slicing, and sub-millisecond response latency (< 2ms for PAP auth).
- **Core AAA Execution**:
  - RFC 2865: RADIUS Authentication (PAP, CHAP, MS-CHAPv2).
  - RFC 2866: RADIUS Accounting (Start, Interim-Update, Stop) with deduplication.
  - RFC 3576 / 5176: Dynamic Authorization (Change of Authorization CoA & Disconnect-Request DM).
  - Vendor-Specific Attributes (VSA): MikroTik (Vendor ID 14988: `MikroTik-Rate-Limit`, `MikroTik-Group`).
- **Resilient Multi-Tenant & NAS Registry Binding**:
  - Resolve NAS IP and shared secret dynamically against `nexus.nas` table in PGlite.
  - Fail-safe fallback to local cache during temporary database lockups.
- **Observability & Prometheus Metrics**:
  - Expose Prometheus metrics on port 9181 (`radius_auth_requests_total`, `radius_auth_latency_seconds`, `radius_active_sessions`).

## 3. Scope & Acceptance Criteria
- [x] Create `apps/sentinel` directory structure with `package.json`, `tsconfig.json`, `src/index.ts`, `src/server.ts`.
- [x] Implement `RadiusServer` UDP listener for Auth (port 1812) and Acct (port 1813).
- [ ] Implement binary packet parser and encoder strictly complying with RFC 2865 and RFC 2866.
- [ ] Implement MikroTik PPPoE PAP authentication path verifying subscriber status against `sentinel.account`.
- [ ] Implement session accounting tracking in `sentinel.session` table.
- [ ] Implement CoA/Disconnect-Request dispatcher to force-disconnect suspended subscribers.
- [x] Pass monorepo quality gates: `pnpm docs:check` (100/100), `pnpm lint:arch`, and `pnpm typecheck`.

