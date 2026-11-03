# Tasks: FORGE Phase 1 — Safe Network Configuration Templates & Approval Foundation (Issue #18)

## 1. Template Modeling & Rendering
- [ ] Register `forge.template` model in `@allah/arsy-orm`
- [ ] Implement parameter interpolation engine with strict JSON schema validation
- [ ] Register `forge.change_request` with status machine and approval tracking

## 2. Dry-Run & Diff Synthesizer
- [ ] Implement text diff generator comparing desired config vs target snapshot
- [ ] Implement dry-run safety guard blocking real device writes

## 3. Testing & Verification Gates
- [ ] Write unit tests for MikroTik RouterOS config rendering
- [ ] Test approval workflow permissions
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

