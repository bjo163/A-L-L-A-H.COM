# Tasks: ORBIT Phase 1 — Cloud Compute & Hosting Customer Experience

## 1. Domain Modeling (`addons/orbit` & `@allah/arsy-orm`)
- [x] Define `orbit.instance` model (specs, status machine, IP, partner reference)
- [x] Define `orbit.template` model (OS image hashes, default sizing)
- [x] Define `orbit.volume` model (storage bounds, attachment lifecycle)
- [x] Register models in `@allah/arsy-orm` schema migration registry

## 2. Fastify Hub APIs & SDK Integration
- [x] Register `GET /v1/orbit/instances` and `POST /v1/orbit/instances`
- [x] Register `POST /v1/orbit/instances/:id/start` & `stop`
- [x] Add `mwClient.orbit` methods in `@allah/sdk`
- [x] Export `OrbitInstanceRecord` and `OrbitTemplateRecord` from `@moonwitness/types`

## 3. Testing & Verification Gates
- [x] Create automated unit tests for instance lifecycle in `apps/arsy/test/orbit_compute.test.mjs`
- [x] Verify `pnpm lint:arch` (100% compliant)
- [x] Verify `pnpm typecheck` (0 errors)
- [x] Verify `pnpm docs:check` (100/100 pts)

