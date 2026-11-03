# Tasks: NEXUS Phase 1 — Network Inventory & MikroTik NAS Registry Foundation (Issue #8)

## 1. Data Model Definition (`addons/nexus` & `@allah/arsy-orm`)
- [ ] Define `nexus.site` model (name, code, coordinates, company_id)
- [ ] Define `nexus.device` model (vendor, model, RouterOS version, management_ip)
- [ ] Define `nexus.nas` model with encrypted secret field and source allowlist
- [ ] Define `nexus.ip_pool` model (CIDR, gateway, DNS servers)
- [ ] Implement AES-256-GCM secret encryption and redaction transformer

## 2. API Endpoints & Plugin Registration (`apps/arsy`)
- [ ] Register `GET /v1/nexus/nas` (list with secret redaction)
- [ ] Register `POST /v1/nexus/nas` (creation with encrypted secret)
- [ ] Register `GET /v1/nexus/nas/:id` (detail inspection)
- [ ] Register `PUT /v1/nexus/nas/:id/secret` (audit-logged secret rotation)
- [ ] Register `GET /v1/nexus/pools` (IP pool catalog)

## 3. Client SDK & Shared Types
- [ ] Export `NexusNasRecord`, `NexusDeviceRecord`, `NexusIpPoolRecord` from `@moonwitness/types`
- [ ] Add `mwClient.nexus` methods to `@allah/sdk`
- [ ] Compile `@moonwitness/types` and `@allah/sdk`

## 4. Testing & Verification Gates
- [ ] Create automated unit tests in `apps/arsy/test/nexus_nas.test.mjs`
- [ ] Verify secret redaction in all response envelopes and logs
- [ ] Run `pnpm lint:arch` (100% compliant)
- [ ] Run `pnpm typecheck` (0 errors)
- [ ] Run `pnpm docs:check` (100/100 pts)

