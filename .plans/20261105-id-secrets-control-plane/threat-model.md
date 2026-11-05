---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-THREAT-MODEL"
version: "1.0.0"
owner: "security-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# ID Secrets Control Plane Threat Model

## Scope and trust boundaries

```text
Browser
  | HTTPS, HttpOnly session cookie
  v
apps/id
  | @allah/sdk; no direct database access
  v
ARSY auth and API authority
  | tenant-scoped ORM operations
  v
Embedded PGlite data (PG_DATA_DIR)
  ^ direct ORM access
  |
Sentinel process
  | decrypts NAS shared secret for RADIUS verification
  v
NAS / destination service
```

Deployment configuration and key custody are external trust boundaries. The repository shows environment-variable names and local development behavior, but it does not establish a production KMS, secret manager, backup procedure, or deployed origin matrix.

## Assets and current controls

| Asset | Current evidence | Protection gap |
|---|---|---|
| Human passwords and sessions | Better Auth stores bcrypt credentials and serves HttpOnly, SameSite=Lax cookies; Secure is enabled in production. | Cookie `Domain` and lifetime are not explicitly set in the repository config. Production host behavior is unverified. |
| Recoverable NAS/provider secrets | AES-256-GCM envelope and master-key-derived encryption key. Generic CRUD blocks NAS and AI provider models. | A single master-key configuration spans secret classes; no KEK ID, resource-bound AAD, or key rotation metadata was found. |
| AI virtual-key credentials | 24 bytes of cryptographic randomness, `mw_live_` prefix, SHA-256 digest in storage. | No expiry, scopes, last-used field, or user lifecycle endpoints. |
| Auth account tokens and legacy credential fields | Auth models include provider token fields and legacy credential columns. Generic CRUD blocks the credential-bearing identity models. | At-rest protection for provider tokens was not demonstrated by the inspected adapter/config. No row values were inspected. Legacy field use and population are unknown. |
| Audit records | Append-only transactional ORM audit records store changed field names; privileged reads require a reason. | No member-facing security-event feed or event-retention review was verified. |
| Tenant ownership | ARSY derives tenant scope from the verified principal; ORM rejects unscoped tenant reads. | Project and environment membership semantics are not implemented in the inspected ID surface. |
| Backups and signing keys | No production values were inspected. | Backup, restore, signing-key rotation, and external key custody were not established by repository evidence. |

## Threat register

| Priority | Scenario and precondition | Existing evidence | Residual risk and required treatment |
|---|---|---|---|
| High | Database and master-key compromise enables decryption of all supported envelopes. | One environment-provided master key is used by the shared secret-encryption helper. | Separate KEK custody, per-secret DEKs, version metadata, resource-bound AAD, and a tested rotation/recovery runbook are required before expanding secret storage. |
| High | Tenant user or API client obtains encrypted NAS envelope from response and keeps it for offline analysis. | NAS handlers redacted `secret` but spread the full row, including `secret_encrypted`. | Fixed in this change: response projection omits `secret_encrypted`; tests assert it is absent from create, list, detail, and rotation responses. Retain the allowlist projection pattern for future secret APIs. |
| High | Tenant escape through a new secret endpoint or client-supplied tenant ID. | Current ARSY tenant scope comes from the authenticated principal; generic CRUD is fail-closed. | Every new route must derive ownership from verified authority and test wrong-tenant, missing-principal, and body-tenant cases. |
| Medium | Secret rotation/revocation is delayed in Sentinel after a NAS cache hit. | Sentinel caches decrypted NAS records for up to one hour; no invalidation protocol was found. | Define bounded cache lifetime and authenticated invalidation or version-check behavior before promising immediate revocation. |
| Medium | Database-only attacker attacks a virtual-key verifier. | Keys contain 192 bits of randomness and are SHA-256 hashed. | Randomness makes offline guessing impractical, but a separately keyed/versioned verifier could reduce database-only exposure. Decide verifier/key rotation before a user key lifecycle is built. |
| Medium | Valid virtual key remains usable beyond intended lifetime or scope. | Model does not include expiry or scopes; no personal lifecycle endpoints were found. | Define explicit audience, scope, expiry, last-used, revoke, and cache invalidation semantics before issuance. |
| Medium | Provider access tokens or legacy credential columns are exposed through database, logs, or generic access. | Credential-bearing auth models are excluded from generic CRUD. Model fields exist; no values were read. | Verify storage encryption, log redaction, migration status, and field use. Treat unverified fields as sensitive. |
| Medium | Backup theft, restore mismatch, or lost key makes ciphertext unavailable. | No production backup/key recovery procedure was evidenced. | Document separated backup ownership, restore drills, key version selection, and tested recovery before migration. |
| Medium | Browser XSS or extension reads future vault plaintext. | No ID secret-vault UI exists; ID uses SDK transport. | Keep plaintext out of browser state and client responses except a deliberately approved one-time issuance flow. Avoid rendering secret values in URLs, logs, analytics, or errors. |
| Low | Audit metadata reveals sensitive values. | ORM audit stores changed field names rather than values; tests cover redaction and transactional behavior. | Preserve this invariant; separately review free-form metadata and logs whenever new sensitive actions are added. |

## Required response before implementation

1. Approve an external key-custody provider and define operational ownership.
2. Accept an envelope format and compatibility/migration path for existing NAS/provider secrets.
3. Decide API-key verifier, scopes, expiry, one-time reveal, and revocation semantics.
4. Define Sentinel invalidation behavior and test rotation/revocation under cache.
5. Confirm production origin and backup/restore procedures without adding their values to source.

No vault, recovery, federation, privacy, or service-identity capability is claimed implemented by this threat model.
