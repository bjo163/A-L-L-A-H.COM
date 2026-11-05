---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-TASKS"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-05"
---

# Autonomous Execution Backlog — ID Secrets Control Plane

Task status: [ ] pending · [/] in progress · [x] completed with evidence. Every task is intentionally bounded. Follow dependency order. Do not handle real secret material.

Execution update: SEC-001–020 are complete with source-backed evidence in [audit-matrix.md](./audit-matrix.md), [threat-model.md](./threat-model.md), and [decision-proposal.md](./decision-proposal.md). The proposal is not an accepted ADR. Waves 2–9 remain on hold until the relevant authority, key-custody, and migration decisions are accepted.

## Wave 0 — Repository discovery and capability map
- [x] SEC-001 Locate the actual NAS secret encryption implementation and document exact file paths.
- [x] SEC-002 Locate Sentinel NAS secret decryption and document the trust boundary.
- [x] SEC-003 Locate AI virtual-key generation and verification implementation.
- [x] SEC-004 Locate all routes that create, read, update, rotate, or revoke virtual keys.
- [x] SEC-005 Inventory secret-bearing environment variables across Compose, Dockerfiles, workflows, and app code.
- [x] SEC-006 Verify all existing NEXT_PUBLIC variables and classify public vs sensitive.
- [x] SEC-007 Inventory generic CRUD exclusions for identity, credentials, secrets, and audit models.
- [x] SEC-008 Map existing audit event schema and redaction behavior.
- [x] SEC-009 Map existing tenant and project membership authorization helpers.
- [x] SEC-010 Publish a capability matrix: verified, partial, proposed, unsupported, with source evidence.

## Wave 1 — Threat model and architecture decisions
- [x] SEC-011 Write assets-and-threats inventory for human, service, API-key, secret, environment, and signing-key classes.
- [x] SEC-012 Document attacker scenarios: tenant escape, browser XSS, log leak, insider misuse, backup theft, key compromise.
- [x] SEC-013 Define trust boundaries among ID, ARSY, Sentinel, destination apps, deployment adapters, and KMS.
- [x] SEC-014 Compare envelope-encryption options supported by current Node/runtime dependencies.
- [x] SEC-015 Define key hierarchy and separation of KEK, DEK, signing keys, and API-key verifiers.
- [x] SEC-016 Define key version metadata and ciphertext envelope schema.
- [x] SEC-017 Define backup/restore and disaster-recovery requirements for encrypted records and key material.
- [x] SEC-018 Define key rotation and compromise response runbooks.
- [x] SEC-019 Define API-key entropy, prefix, verifier, expiry, and one-time display contract.
- [x] SEC-020 Record a proposed ADR for crypto, key custody, API credential verification, and migration; block code until accepted.

## Wave 2 — Shared contracts and type safety
- [ ] SEC-021 Define SecretMetadata type with no plaintext/ciphertext fields.
- [ ] SEC-022 Define SecretVersionMetadata type with version, status, timestamps, and safe fingerprint.
- [ ] SEC-023 Define SecretCreateInput type with value marked write-only at API boundary.
- [ ] SEC-024 Define SecretListQuery with bounded pagination and server-side filters.
- [ ] SEC-025 Define ApiCredentialMetadata type with prefix, owner, scopes, environment, expiry, last-used and status.
- [ ] SEC-026 Define ServicePrincipalSummary type without credential material.
- [ ] SEC-027 Define EnvironmentSummary and EnvironmentVariableMetadata types.
- [ ] SEC-028 Define redacted EnvironmentDiff type that cannot carry old/new secret values.
- [ ] SEC-029 Define AccessRequest and ApprovalDecision contracts.
- [ ] SEC-030 Add compile-time tests proving metadata response types do not expose secret value fields.

## Wave 3 — ARSY authority and storage foundations
- [ ] SEC-031 Define dedicated ARSY secret repository interface; keep credential models out of generic CRUD.
- [ ] SEC-032 Define tenant-scoped secret ownership and project/environment foreign-key invariants.
- [ ] SEC-033 Add schema migration for secret metadata only after ADR acceptance.
- [ ] SEC-034 Add encrypted secret-version storage with authenticated encryption and key-version metadata.
- [ ] SEC-035 Add server-side secret create service with strict input size/type validation.
- [ ] SEC-036 Add metadata-only secret list endpoint with bounded pagination.
- [ ] SEC-037 Add metadata-only secret detail endpoint; assert response schema excludes plaintext.
- [ ] SEC-038 Add secret update as a new version, never in-place ciphertext overwrite.
- [ ] SEC-039 Add secret revoke/disable lifecycle endpoint with policy check.
- [ ] SEC-040 Add tests for tenant isolation, invalid envelope, wrong key version, tamper detection, and no plaintext response.

## Wave 4 — API credential lifecycle
- [ ] SEC-041 Define separate personal API credential and service API credential policies.
- [ ] SEC-042 Implement cryptographically secure credential generator behind ARSY service boundary.
- [ ] SEC-043 Implement reviewed verifier storage and constant-time verification where applicable.
- [ ] SEC-044 Implement one-time credential issuance response; ensure later list/detail responses are metadata-only.
- [ ] SEC-045 Add credential metadata list endpoint with prefix-only display.
- [ ] SEC-046 Add scope allowlist validation and reject unknown scopes.
- [ ] SEC-047 Add project/environment binding validation on issuance.
- [ ] SEC-048 Add expiry enforcement in credential verification middleware.
- [ ] SEC-049 Add immediate revoke endpoint and cache invalidation contract.
- [ ] SEC-050 Add rotation endpoint with explicit overlap and old-credential revoke semantics.
- [ ] SEC-051 Add last-used metadata update without logging credential material.
- [ ] SEC-052 Add issuance/verification rate limits and abuse tests.
- [ ] SEC-053 Add replay, expiry, revoked, wrong-scope, wrong-tenant, and brute-force tests.

## Wave 5 — Service identities and access policy
- [ ] SEC-054 Define service principal owner, purpose, project, environment, status, and expiry schema.
- [ ] SEC-055 Add service principal create/list/detail endpoints with tenant-scoped authorization.
- [ ] SEC-056 Add service principal disable/revoke lifecycle endpoint.
- [ ] SEC-057 Define service-to-service permission model with least-privilege scopes.
- [ ] SEC-058 Add policy evaluator tests for allow, deny, missing scope, wrong environment, and expired principal.
- [ ] SEC-059 Define human owner transfer and orphaned service principal handling.
- [ ] SEC-060 Add service identity audit events for create, update, disable, rotate, and revoke.

## Wave 6 — Environment and configuration management
- [ ] SEC-061 Define project and environment ownership contract using existing project model where possible.
- [ ] SEC-062 Define environment classes: development, staging, production, and custom.
- [ ] SEC-063 Define variable classification: public, sensitive, secret; secret is default.
- [ ] SEC-064 Add environment metadata list endpoint with no values returned.
- [ ] SEC-065 Add write-only variable submission endpoint with strict name/value limits.
- [ ] SEC-066 Add redacted version history endpoint listing names and operation types only.
- [ ] SEC-067 Add validation endpoint for variable names, reserved names, and public allowlist.
- [ ] SEC-068 Define environment promotion and approval state machine.
- [ ] SEC-069 Add deployment request contract using secret references, not plaintext payloads.
- [ ] SEC-070 Add tests proving no old/new secret values appear in diff, history, logs, or error responses.

## Wave 7 — Approvals, step-up and audit
- [ ] SEC-071 Define sensitive action matrix: reveal-once, rotate, revoke, delete, production promote, policy change.
- [ ] SEC-072 Define step-up authentication contract and block sensitive actions if unavailable by policy.
- [ ] SEC-073 Define approval request schema with actor, resource, action, reason, expiry, and approver.
- [ ] SEC-074 Add approval decision endpoint with separation-of-duties rules where required.
- [ ] SEC-075 Add append-only redacted audit event types for secret and credential lifecycle.
- [ ] SEC-076 Add audit query endpoint with tenant filters and bounded pagination.
- [ ] SEC-077 Add retention and legal-hold policy for secret versions and audit records.
- [ ] SEC-078 Add tests proving denied actions and failed actions are audited without leaking values.

## Wave 8 — SDK and ID interface
- [ ] SEC-079 Add typed SDK list-secret-metadata method.
- [ ] SEC-080 Add typed SDK create-secret method with no secret persistence in client cache.
- [ ] SEC-081 Add typed SDK secret-version and revoke methods.
- [ ] SEC-082 Add typed SDK API-credential metadata and issuance methods.
- [ ] SEC-083 Add typed SDK service-principal methods.
- [ ] SEC-084 Add typed SDK environment metadata, write-only update, and redacted diff methods.
- [ ] SEC-085 Build Vault list route using metadata-only fixtures and explicit unavailable state.
- [ ] SEC-086 Build one-time secret creation/reveal panel with transient memory-only display and clear-on-navigation behavior.
- [ ] SEC-087 Build API Keys list/create/rotate/revoke UI with scope, environment, expiry, and one-time reveal.
- [ ] SEC-088 Build Service Identities list/detail UI with owner and scope clarity.
- [ ] SEC-089 Build Environment variable editor with write-only fields and redacted diffs.
- [ ] SEC-090 Build approval inbox and audit timeline using redacted metadata only.
- [ ] SEC-091 Add UI tests asserting plaintext is absent after initial reveal and absent from rendered logs/errors.
- [ ] SEC-092 Add Indonesian and English copy for security-critical operations.

## Wave 9 — Runtime integration and operations
- [ ] SEC-093 Define server-to-server secret retrieval contract scoped by service, project, environment, and purpose.
- [ ] SEC-094 Add short-lived retrieval authorization and bounded cache TTL contract.
- [ ] SEC-095 Define deployment adapter interface with secret references only.
- [ ] SEC-096 Add integration tests for consumer authorization, environment mismatch, expiry, and revocation propagation.
- [ ] SEC-097 Document safe local development using synthetic values and no production secret files.
- [ ] SEC-098 Add incident runbook for suspected secret exposure and emergency revoke/rotate.
- [ ] SEC-099 Add backup/restore drill for encrypted data and separately managed key material.
- [ ] SEC-100 Publish operational readiness checklist and known limitations before enabling production use.

## Wave 10 — Final verification and documentation
- [ ] SEC-101 Run focused ARSY secret/credential tests and record exact output.
- [ ] SEC-102 Run ID unit tests, typecheck, and production build.
- [ ] SEC-103 Run architecture lint and verify no client secret exposure.
- [ ] SEC-104 Run security tests for tenant isolation, authorization, replay, rate limits, tamper detection, and redaction.
- [ ] SEC-105 Run browser tests at 360, 390, 768, 1024, and 1440 CSS px with synthetic fixtures.
- [ ] SEC-106 Update README, BLUEPRINT, ID README, and CHANGELOG to match only verified implementation.
- [ ] SEC-107 Publish report separating implemented, integration-verified, blocked, and deferred capabilities.

## Small-agent execution protocol
1. Read root AGENTS.md, AUTONOMOUS.md, QUALITY.md, DOCUMENTATION_CONTRACT.md, and relevant Antislop instructions before edits.
2. Select the first unblocked pending task in dependency order. One agent = one task unless tasks explicitly share a tiny contract.
3. Read only the exact files named by discovery; do not ingest production env files or secret material.
4. Change the smallest bounded scope. Preserve existing user work and target dev; do not create branches.
5. Use synthetic fixtures only. Never place secrets in prompts, tool outputs, test snapshots, logs, or plan files.
6. Run the focused test first, then relevant repository gates. Record exact commands and results.
7. Update this checklist only after evidence exists. A task blocked by missing ADR/API/policy stays pending and records the blocker.
8. Never mark a task complete based on a mock frontend, dependency capability, generated code, or unexecuted test.
