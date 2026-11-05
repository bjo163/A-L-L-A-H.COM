---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-DECISION-PROPOSAL"
version: "1.0.0"
owner: "security-architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# Proposed ADR: Secret Encryption and Credential Verification

**Status:** Proposed, not accepted. No production crypto or key-custody decision is authorized by this document.

## Context

The current NAS/provider secret helper in [`encryption.ts`](../../packages/arsy-orm/src/encryption.ts) uses AES-256-GCM and derives an encryption key from `ARSY_MASTER_KEY` with PBKDF2-HMAC-SHA256. The v1 envelope has random salt and IV but no KEK identifier, independent DEK, or resource-bound AAD. Sentinel reads the same encrypted NAS data through the ORM and decrypts it in its own process.

Virtual keys are generated from 24 random bytes and stored as SHA-256 digests. The record has no expiry, scope, or last-used metadata. The repository does not establish a production KMS or external key-custody adapter.

## Options

| Option | Benefits | Costs and failure modes | Status |
|---|---|---|---|
| Keep the current derived-key AES-256-GCM format | Native Node crypto, current ciphertext remains readable, no new runtime dependency. | One master-key compromise spans supported secret classes; changing the master key makes existing ciphertext unreadable; no resource binding or KEK version identifier. | Retain only as a compatibility reader during an approved migration. Not recommended as the target architecture. |
| AES-256-GCM envelope encryption with a random DEK per secret version and an externally managed KEK | Uses the existing runtime cipher; limits the key-management boundary; supports KEK versioning, rewrapping, and resource-bound AAD. | Requires an approved KMS/secret-manager provider, operational credentials, backup/restore procedures, and migration. No provider is verified in this repository. | Recommended target, blocked on provider and ownership decision. |
| Add a different AEAD through a new cryptographic dependency | May provide alternative nonce and API properties. | No such dependency or deployment support was verified; adds migration and dependency review without solving key custody by itself. | Not selected for this proposal. Re-evaluate only with a concrete requirement and supported dependency. |

## Proposed target envelope

Use a versioned envelope with:

- `format_version`, `algorithm`, and `kek_id`;
- a random per-version 256-bit DEK wrapped by the selected KEK;
- a fresh 96-bit nonce/IV, authentication tag, and ciphertext;
- AAD derived server-side from immutable `tenant_id`, resource type, resource ID, and secret version.

Use a strict parser that fails closed on unknown versions, algorithms, missing fields, authentication failure, or mismatched AAD. Keep the existing v1 reader only as long as compatibility requires. Do not silently fall back to plaintext or a default key.

## Key separation and operations

1. KEKs remain outside the application database and source control in an owner-approved deployment key manager.
2. DEKs are random and scoped to one secret version; plaintext DEKs and secret values stay in process memory only for the operation that needs them.
3. Signing keys, API-key verifier keys, and encryption KEKs are separate purposes and credentials.
4. Rotation creates a new KEK version; rewrap DEKs where supported, otherwise decrypt/re-encrypt under an audited migration. Preserve a bounded, observable compatibility window.
5. Backups preserve ciphertext and non-secret key-version metadata. Recovery keys are backed up through a separately approved control path, with restore drills.
6. On suspected key compromise, disable the affected KEK, rotate impacted secrets and dependent credentials, invalidate runtime caches, and audit the incident.

## API credential proposal

- Preserve the current high-entropy generation property; 24 random bytes is 192 bits.
- Use a distinct, documented prefix for personal, service, and platform credentials.
- Display a new credential once; all later responses contain metadata and a prefix only.
- Bind each credential to an owner, audience, allowlisted scopes, environment, expiry, and status.
- Evaluate a keyed HMAC-SHA-256 verifier using a separately managed, versioned verifier key. The current SHA-256 verifier may remain for existing keys during a bounded migration; never invalidate existing credentials without a migration plan.
- Enforce expiry, revocation, scope, and tenant at the authority on every request. Define cache invalidation before claiming immediate revoke.
- Record last-used metadata without recording credential material.

This verifier choice is a proposal, not a claim that HMAC keys or rotation are currently available.

## Compatibility, migration, and rollback

1. Inventory record counts and format versions without selecting or displaying secret values.
2. Build a dual-reader only after decision acceptance; keep writes on the old format until provider readiness is tested.
3. Migrate a small canary set and verify decrypt/re-encrypt, tenant AAD, audit events, and Sentinel consumption.
4. Track counts by format and key version, never by secret content.
5. Roll back by retaining the old decrypt path until all active consumers pass; do not delete old key versions or ciphertext before restore is proven.
6. Test wrong-key, unknown-version, tampered-tag, mismatched-AAD, tenant-isolation, backup-restore, and stale-cache cases.

## Decisions required to accept

| Decision | Needed from | Current status |
|---|---|---|
| Production key-custody provider, tenancy, service identity, and rotation owner | Deployment/security owner | Unresolved; no provider verified |
| Whether KEKs are shared per environment or separated by tenant/resource class | Security architecture | Proposed per-environment KEK with per-secret DEKs; requires risk and operations review |
| API-key verifier key custody and migration overlap | Security architecture and ARSY owner | Proposed HMAC verifier; unresolved |
| Legacy NAS/provider secret migration and Sentinel cache behavior | ARSY and Sentinel owners | Unresolved |
| Backup retention, restore authority, and incident response owner | Operations owner | Unresolved |

Until these are accepted in the repository decision process, SEC-021 onward stays on hold and no new secret schema, lifecycle route, or UI should be built.
