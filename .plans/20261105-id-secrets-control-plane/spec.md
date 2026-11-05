---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-SPEC"
version: "1.0.0"
owner: "security-architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# MoonWitness ID — Identity & Secrets Control Plane

## Motivation
MoonWitness ID already provides the human identity/account-trust surface. The ecosystem also has narrow secret-related foundations: encrypted NAS shared secrets and hashed AI virtual keys. A unified, auditable control plane can make identities, credentials, secrets, and environment configuration understandable without creating a second backend authority.

## Product narrative
**One identity. Every trusted connection. Every secret under deliberate control.**

MoonWitness ID becomes the human-facing control plane for human identities and sessions; non-human service identities; personal and service API keys; recoverable secrets in an encrypted vault; project/environment configuration; access policies, approvals, rotation, revocation, and audit.

ID is not a vault daemon, key broker, deployment engine, or arbitrary shell. It is the control surface and workflow orchestrator.

## Architecture ownership
- ID (apps/id): UX, typed request orchestration, metadata display, approvals and workflow status.
- ARSY (apps/arsy): sole authority for identity, service principals, policy evaluation, secret custody, encryption/decryption, key issuance/verification, access decisions, revocation, audit, retention, and server-side integration.
- Sentinel / destination runtimes: consume only explicitly scoped server-side secret references or credential material; enforce runtime authorization.
- SDK/types: @allah/sdk and @moonwitness/types are the only client contract and transport boundaries.
- UI: @moonwitness/ui is mandatory.

No second vault database, no browser-held plaintext, no generic CRUD for credential-bearing models, no secrets passed to AI agents.

## Existing evidence and limits
- Root README and Compose document an ARSY master key used to encrypt NAS shared secrets and Sentinel decrypts them.
- Changelog reports AI virtual keys persisted as SHA-256 hashes.
- These are narrow, separate foundations. They do not prove a general vault, robust API-key lifecycle, KMS/HSM integration, environment manager, or end-to-end secret workflows.
- Current auth baseline is Better Auth hosted by ARSY; app uses HttpOnly sessions.
- No production runtime behavior is claimed by this plan.

## Resource taxonomy
1. Human identity: canonical person/account.
2. Service identity: non-human principal with owner, project, purpose, and lifecycle.
3. API credential: bearer proof presented by a caller; personal and service key classes remain distinct.
4. Secret: recoverable sensitive value used by a trusted runtime.
5. Environment: named deployment/configuration boundary.
6. Policy: grants an actor narrowly scoped actions over resources under conditions.
7. Audit event: immutable evidence of action, actor, resource, outcome, and request context.

Never collapse these into one generic key model.

## Secret lifecycle
DRAFT → CREATED → ACTIVE → ROTATION_DUE → ROTATING → ACTIVE(new version) → REVOKED/EXPIRED.
Plaintext may be shown once at creation/rotation only when a reviewed contract permits it. Subsequent reads return metadata and masked fingerprints only. Rotation must support consumer migration and bounded overlap; revocation is authority-enforced and cache invalidation is documented.

## Environment lifecycle
DRAFT → VALIDATED → REVIEW_REQUIRED → APPROVED → DEPLOY_REQUESTED → DEPLOYED.
Values are secret by default. Diffs expose changed variable names and metadata, never values. Promotion is explicit; production may require approval and step-up auth. Deployment adapters receive scoped references or short-lived access, not a vault dump. No arbitrary shell execution.

## Architecture requirements
- Inspect existing NAS encryption and AI virtual-key code before proposing migrations or reusing primitives.
- Decide envelope encryption algorithm, nonce/tag format, key hierarchy, key versioning, rotation, backup, recovery, and compromise response in an ADR.
- Master/key-encryption keys live outside the app database and source control, supplied by an approved deployment secret manager/KMS. Do not invent a production KMS integration.
- Recoverable secrets use authenticated envelope encryption; key material is separated from ciphertext.
- API keys are generated from a cryptographically secure random source, high entropy, one-time displayed, scope-bound, expiring, revocable, and verified with a reviewed keyed verifier/hash design. SHA-256 alone is not assumed adequate for every credential class.
- Tenant/project/resource ownership is resolved server-side from verified identity and membership.
- Every read/reveal/write/rotate/revoke/export/deploy action is authorized and audited; sensitive actions may require step-up authentication.
- No secret plaintext in browser state, local storage, cookies, URLs, client props, logs, analytics, telemetry, errors, AI prompts, or agent tool output.
- No direct DB calls from ID; no generic CRUD for credential-bearing models.
- Secret retrieval is server-to-server and narrowly scoped to consumer, project, environment, and purpose.
- Environment values are write-only after submission; secret diffs never reveal values.
- Retention and legal-hold semantics apply to secret versions and audit history.
- Existing NAS and AI key records require compatibility and migration analysis before changing their storage formats.

## Big initiatives
1. ID-S01 — Secret Vault foundation and threat model.
2. ID-S02 — API Key & Credential Lifecycle.
3. ID-S03 — Service Identity & Workload Access.
4. ID-S04 — Environment & Configuration Manager.
5. ID-S05 — Access Policy, Approval & Step-up.
6. ID-S06 — Rotation, Revocation & Incident Response.
7. ID-S07 — Audit Ledger & Compliance Evidence.
8. ID-S08 — Runtime Integration & Developer Experience.
9. ID-S09 — ID UX, accessibility, localization, and operator clarity.

## Explicit non-goals
- Do not expose raw secrets to AI agents or local models.
- Do not make ID a general-purpose SSH/terminal or remote command runner.
- Do not store secrets in Next.js client state or browser storage.
- Do not expose master keys or signing keys through the UI.
- Do not use API keys as human login/session credentials.
- Do not implement arbitrary .env file download/export.
- Do not claim KMS/HSM compliance or certification without evidence.
- Do not create a separate microservice/database until an ADR proves it necessary.

## Delivery phases
A. Discovery and threat model; B. cryptographic and authority decisions; C. server-side contracts; D. metadata-only ID workflows; E. service/API credential lifecycle; F. environment versioning and approvals; G. runtime integrations; H. hardening and operational readiness.

## Global acceptance
- Every capability has explicit resource ownership, actor, scope, environment, expiry, and audit semantics.
- Server-side tests prove tenant isolation, default-deny, least privilege, one-time display, masking, revocation, rotation, replay resistance, and log redaction.
- Key custody, backup, restore, rotation, and compromise recovery are documented and tested before production secrets are migrated.
- UI tests prove plaintext never appears after initial issuance and unavailable features do not appear active.
- CI evidence is recorded; proposed work is never marked implemented or verified prematurely.
