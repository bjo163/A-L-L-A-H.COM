---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-RULES"
version: "1.0.0"
owner: "security-architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# Rules — Secrets, API Keys & Environment Management

## Absolute boundaries
1. ARSY is the sole authority for identity, service principals, credentials, secrets, policy, encryption, decryption, audit, and retention.
2. ID is control plane UX only; no second vault DB, local secret store, or direct DB access.
3. Use @allah/sdk, @moonwitness/types, and @moonwitness/ui; no app-private transport or controls.
4. Never expose plaintext to browser state except the narrowly scoped one-time issuance response explicitly allowed by policy; never persist it.
5. Never include secrets in URLs, logs, analytics, telemetry, errors, screenshots, source control, AI prompts, or agent output.
6. Do not use generic CRUD for identity, credential, secret, key, or audit models.
7. Derive tenant, owner, project membership and environment permissions on the server; fail closed.
8. Every operation checks principal, resource, action, scope, environment, expiry, and policy.
9. API credentials are not human sessions. Service credentials belong to service principals, not individual users.
10. Use cryptographically secure random generation; define high entropy and prefix/version strategy.
11. Select verifier design through threat model; keyed verifier/HMAC or password-hash approach as appropriate. Do not generalize SHA-256-only storage by assumption.
12. Recoverable secrets require authenticated envelope encryption and separated key-encryption keys.
13. Master keys never live in application DB, source code, container image, or UI. Production key source and recovery must be approved.
14. Key version, nonce, algorithm, ciphertext, and metadata must support rotation and migration.
15. No decrypt endpoint for browser use. Runtime retrieval is server-to-server and narrowly scoped.
16. One-time display must be proven; subsequent reads are metadata-only.
17. Rotation must define overlap, consumer migration, failure handling, rollback, and old-key revocation.
18. Revocation must invalidate authority access promptly and bound cache TTL.
19. Environment values are secret by default; public variables require explicit allowlisting.
20. Never provide arbitrary .env export/download or shell execution.
21. Environment diffs show names and metadata, not values.
22. Production changes require policy-based approval and step-up authentication where available.
23. Audit is append-only, redacted, actor/resource/action/outcome tagged, and retention/legal-hold aware.
24. Logs must not include request bodies or headers that can carry credential material.
25. Error responses must not echo submitted secrets or distinguish credential existence where enumeration is possible.
26. Rate-limit issuance, verification, rotation and recovery.
27. Use constant-time verifier comparison where applicable; test replay, brute force and timing-sensitive behavior.
28. Do not claim KMS/HSM, SOC2, ISO, or compliance status without implementation and independent evidence.
29. Existing NAS encryption and AI virtual-key storage are separate legacy mechanisms; audit before migration or reuse.
30. Any missing policy/contract blocks implementation; produce a precise decision record rather than a mock capability.

## AI-agent constraints
- Small agents may implement metadata UI, types, validation, docs, tests, redaction helpers, and safe SDK wrappers.
- Agents must never request or inspect real secret values, production env files, master keys, signing keys, or live credentials.
- Use synthetic fixtures with obvious non-secret markers.
- Do not paste secret material into plan files, issue descriptions, test snapshots, or agent context.
- Stop when a server API or security decision is missing; mark dependent tasks blocked.
- Each task changes a bounded set of files and includes a focused verification command.
