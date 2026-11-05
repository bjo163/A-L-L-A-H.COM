---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-AUDIT"
version: "1.0.0"
owner: "security-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# ID Secrets Control Plane Audit Matrix

Scope: SEC-001–010. Sources and tests were inspected without reading `.env` files, deployment values, key files, or stored secret values.

| Task | Status | Verified evidence | Gap or disposition |
|---|---|---|---|
| SEC-001 NAS encryption | Verified | [`encryption.ts`](../../packages/arsy-orm/src/encryption.ts) uses AES-256-GCM; its v1 envelope carries a 16-byte salt, 12-byte IV, 16-byte authentication tag, and ciphertext. PBKDF2-HMAC-SHA256 uses 100,000 iterations. Production requires `ARSY_MASTER_KEY`; local development can use a key file. The ORM secret-encryption tests cover round-trip, randomized envelopes, wrong-key rejection, tampering, and empty values. | Format version 1 is not a KEK/key version. No resource-bound AAD or externally managed key provider was found. |
| SEC-002 Sentinel trust boundary | Verified | [`server.ts`](../../apps/sentinel/src/server.ts) resolves a NAS by source IP, reads the encrypted secret through the ORM and decrypts it before RADIUS verification. Sentinel connects to the embedded PGlite engine using `PG_DATA_DIR`; it is a separate process with direct storage access, not an ARSY HTTP client. | The decrypted NAS cache can remain valid for up to one hour. No cross-process invalidation contract was found. Deployment must ensure Sentinel and ARSY use the intended shared data directory and master key. |
| SEC-003 AI virtual keys | Verified | [`usage.ts`](../../packages/arsy-plugin-llm-gateway/src/usage.ts) generates 24 random bytes, prefixes the key with `mw_live_`, stores a SHA-256 digest, and compares the presented key against the stored digest. [`index.ts`](../../addons/mw_llm_router/index.ts) defines the virtual-key record. | The persisted contract has no expiry, scope, or last-used field. No dedicated virtual-key lifecycle tests were found. |
| SEC-004 Virtual-key routes | Verified | The gateway seeds a platform master key in [`router.ts`](../../packages/arsy-plugin-llm-gateway/src/router.ts). Search of the ARSY route and gateway source found no personal key create/list/detail/rotate/revoke API. Verification occurs on gateway requests. | The seed path is not a user-facing key lifecycle. Do not expose it through ID or generic CRUD. |
| SEC-005 Environment names | Verified | Compose, Dockerfiles, workflows, and source references were inventoried by variable name only. Security-sensitive names include `ARSY_MASTER_KEY`, `GATEWAY_VIRTUAL_KEY`, `BETTER_AUTH_SECRET`, `JWT_SECRET`, `BETTER_AUTH_URL`, and `CORS_ORIGINS`. | No values were read. Deployment secret-store names, rotation ownership, and production values remain unknown. |
| SEC-006 Public environment | Verified | ID reads `NEXT_PUBLIC_AUTH_API_URL` and `NEXT_PUBLIC_ECOSYSTEM_HOSTNAME`, `NEXT_PUBLIC_ECOSYSTEM_ORIGIN`, `NEXT_PUBLIC_ECOSYSTEM_DEV_HOSTNAME`, `NEXT_PUBLIC_ECOSYSTEM_PROTOCOL`, and product URL variables from [`endpoints.ts`](../../apps/id/src/lib/endpoints.ts). These are endpoint/host configuration, not credential material. | Production domains and deployed values were not available. No claim is made about deployed origin correctness. |
| SEC-007 Generic CRUD boundary | Verified | [`app.ts`](../../apps/arsy/src/app.ts) excludes identity, account, session, verification, setup, audit, AI provider/key, NAS, and NAS-secret-log models from generic CRUD. | New secret or service-principal models must remain excluded and use dedicated authority-checked routes. |
| SEC-008 Audit and redaction | Verified, with one defect fixed | ORM writes append-only audit events in the same transaction, recording actor/resource and changed field names rather than changed values. ARSY privileged audit reads require a reason. The NAS rotation test confirms rotation is audited. | NAS response objects previously spread `secret_encrypted` even while redacting `secret`. [`app.ts`](../../apps/arsy/src/app.ts) now removes the encrypted field from all four NAS response paths; [`nexus_nas.test.mjs`](../../apps/arsy/test/nexus_nas.test.mjs) asserts that ciphertext is absent. |
| SEC-009 Tenant authorization | Verified | ARSY derives `company_id` from the authenticated principal through its tenant-scope helper; ORM tenant queries are fail-closed and parameterized. Request-body tenant values are not authoritative. | The inspected ID/ARSY surface has company tenancy, not a verified project/environment membership policy. New project-scoped secret access needs an explicit authority contract. |
| SEC-010 Capability matrix | Verified | This matrix distinguishes existing mechanisms from proposed capabilities and records source-backed gaps. | Full feature implementation remains blocked by the decisions in [`decision-proposal.md`](./decision-proposal.md). |

## Status vocabulary

- **Verified** means source and/or tests directly support the statement.
- **Partial** means only part of the intended behavior exists.
- **Proposed** means a design direction, not implemented behavior.
- **Unsupported** means no supporting implementation was found in the inspected source.
- **Unknown** means evidence was unavailable; it is not treated as safe or present.

## Execution evidence

- `pnpm --filter @allah/arsy-orm test` — 32 tests passed.
- `pnpm --filter @allah/arsy test` — passed; includes Better Auth, tenant, gateway, and NAS endpoint tests.
- No production deployment values or secret material were accessed.
