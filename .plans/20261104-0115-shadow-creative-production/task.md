# Tasks: SHADOW Phase 1 — Creative Production & Asset Pipeline Foundation

## 1. Creative Domain Models (`addons/shadow` & `@allah/arsy-orm`)
- [ ] Define `shadow.project` model (project title, status, metadata)
- [ ] Define `shadow.asset` model (media type, CAS storage hash, byte size)
- [ ] Define `shadow.generation_task` model (parameters, prompt, status)
- [ ] Register models in `@allah/arsy-orm` schema migration registry

## 2. Media Asset APIs & SDK Integration
- [ ] Implement `POST /v1/shadow/projects` & `GET /v1/shadow/projects`
- [ ] Implement `POST /v1/shadow/assets/upload` (streams to CAS storage)
- [ ] Export `ShadowProjectRecord` and `ShadowAssetRecord` from `@moonwitness/types`
- [ ] Add `mwClient.shadow` methods in `@allah/sdk`

## 3. Testing & Verification Gates
- [ ] Create automated unit tests for project and asset tracking in `apps/arsy/test/shadow.test.mjs`
- [ ] Verify `pnpm lint:arch` (100% compliant)
- [ ] Verify `pnpm typecheck` (0 errors)
- [ ] Verify `pnpm docs:check` (100/100 pts)

