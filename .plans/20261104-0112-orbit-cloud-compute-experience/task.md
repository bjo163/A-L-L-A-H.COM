# Tasks: ORBIT Phase 1 — Cloud Compute & Hosting Customer Experience

## 1. Domain Modeling (`addons/orbit` & `@allah/arsy-orm`)
- [ ] Define `orbit.instance` model (specs, status machine, IP, partner reference)
- [ ] Define `orbit.template` model (OS image hashes, default sizing)
- [ ] Define `orbit.volume` model (storage bounds, attachment lifecycle)
- [ ] Register models in `@allah/arsy-orm` schema migration registry

## 2. Fastify Hub APIs & SDK Integration
- [ ] Register `GET /v1/orbit/instances` and `POST /v1/orbit/instances`
- [ ] Register `POST /v1/orbit/instances/:id/start` & `stop`
- [ ] Add `mwClient.orbit` methods in `@allah/sdk`
- [ ] Export `OrbitInstanceRecord` and `OrbitTemplateRecord` from `@moonwitness/types`

## 3. Testing & Verification Gates
- [ ] Create automated unit tests for instance lifecycle in `apps/arsy/test/orbit_compute.test.mjs`
- [ ] Verify `pnpm lint:arch` (100% compliant)
- [ ] Verify `pnpm typecheck` (0 errors)
- [ ] Verify `pnpm docs:check` (100/100 pts)

