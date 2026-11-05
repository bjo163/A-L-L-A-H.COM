# Tasks: NEXUS Phase 1 — Network Inventory & MikroTik NAS Registry Foundation (Issue #8)

## 1. Data Model Definition (`addons/nexus` & `@allah/arsy-orm`)
- [x] Define `nexus.site` model (name, code, coordinates, company_id)
- [x] Define `nexus.device` model (vendor, model, RouterOS version, management_ip)
- [x] Define `nexus.nas` model with encrypted secret field and source allowlist
- [x] Define `nexus.ip_pool` model (CIDR, gateway, DNS servers)
- [x] Implement AES-256-GCM secret encryption and redaction transformer

## 2. API Endpoints & Plugin Registration (`apps/arsy`)
- [x] Register `GET /v1/nexus/nas` (list with secret redaction)
- [x] Register `POST /v1/nexus/nas` (creation with encrypted secret)
- [x] Register `GET /v1/nexus/nas/:id` (detail inspection)
- [x] Register `PUT /v1/nexus/nas/:id/secret` (audit-logged secret rotation)
- [x] Register `GET /v1/nexus/pools` (IP pool catalog)

## 3. Client SDK & Shared Types
- [x] Export `NexusNasRecord`, `NexusDeviceRecord`, `NexusIpPoolRecord` from `@moonwitness/types`
- [x] Add `mwClient.nexus` methods to `@allah/sdk`
- [x] Compile `@moonwitness/types` and `@allah/sdk`

## 4. Testing & Verification Gates
- [x] Create automated unit tests in `apps/arsy/test/nexus_nas.test.mjs`
- [x] Verify secret redaction in all response envelopes and logs
- [x] Run `pnpm lint:arch` (100% compliant)
- [x] Run `pnpm typecheck` (0 errors)
- [x] Run `pnpm docs:check` (100/100 pts)

