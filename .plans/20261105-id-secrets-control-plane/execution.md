---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-EXECUTION"
version: "1.0.0"
owner: "security-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# Next Execution Slice — Discovery, Threat Model & Security Decisions

## Purpose

Turn the existing 107-item backlog into an evidence-backed first implementation gate. This slice executes SEC-001–SEC-020 only. It does not build a vault, add schema, change encryption, issue credentials, or expose new UI.

**Target branch:** `dev`  
**Canonical plan:** [spec.md](./spec.md) · [task.md](./task.md) · [rules.md](./rules.md) · [design.md](./design.md)

## Why this is the next slice

The repository already contains narrow mechanisms that must be understood before they can be reused or migrated:

- `packages/arsy-orm/src/encryption.ts` — NAS secret encryption entry point; inspect implementation and tests, not just its name.
- `apps/sentinel/src/server.ts` — Sentinel-side NAS secret resolution/decryption path.
- `apps/arsy/src/app.ts` — ARSY routes, model exposure and generic CRUD exclusions.
- `packages/arsy-plugin-llm-gateway/src/usage.ts` and `router.ts` — virtual-key verification and issuance/seed paths.
- `addons/mw_llm_router/index.ts` — virtual-key model definition.
- `DECISIONS.md` D-015 and `SECURITY.md` — existing security decisions and documented claims.
- `.plans/20261104-0054-nexus-inventory-nas-registry/` — prior NAS implementation evidence; reconcile its report against current source and tests.

These are discovery pointers, not proof that the current implementation is complete or production-safe.

## Execution order

### Gate A — Existing capability audit (SEC-001–010)

| Task | Exact work | Required evidence / output |
|---|---|---|
| SEC-001 | Trace NAS encryption from public service/helper to cipher implementation, key derivation, envelope parser, and tests. | File/symbol map; algorithm, KDF, salt, nonce, tag and version fields verified from code; test names. Never inspect key values. |
| SEC-002 | Trace Sentinel lookup and decryption from inbound NAS packet to ARSY response and RADIUS verification. | Sequence diagram; network/auth boundary; failure behavior; confirmation that plaintext is not logged or returned to clients. |
| SEC-003 | Trace virtual-key generation, hash helper, persistence, lookup and comparison. | Generator entropy/source, hash/KDF parameters, prefix semantics, comparison behavior, storage schema and test coverage. |
| SEC-004 | Enumerate every virtual-key create/list/detail/update/rotate/revoke/verify route and caller. | Route/method/handler/auth matrix; explicitly mark missing lifecycle operations. |
| SEC-005 | Inventory environment-variable **names only** from Compose, Dockerfiles, workflow YAML, manifests and source references. | Name → consumer → environment → required/optional → secret/public classification. Do not print or fetch values from any env file or deployment. |
| SEC-006 | Enumerate `NEXT_PUBLIC_*` references and inspect whether each is genuinely public configuration. | Complete allowlist with source path and justification; any credential-bearing value is a P0 finding. |
| SEC-007 | Verify generic CRUD model exclusions and dedicated route boundaries for auth, identity, audit, NAS and credential-bearing models. | Exclusion list tied to route code and tests; identify any bypass or missing model. |
| SEC-008 | Trace audit event schema, transaction hooks/triggers, redaction and sensitive-action coverage. | Event fields, append-only enforcement, transaction behavior, and gaps; confirm values are not stored. |
| SEC-009 | Trace principal resolution, tenant derivation, membership and project/environment authorization helpers. | Call graph and route coverage; prove body-supplied tenant IDs are not authoritative. |
| SEC-010 | Publish the capability matrix. | Every capability marked `verified`, `partial`, `proposed`, `unsupported`, or `unknown`, each with source/test evidence and confidence. |

**Gate A exit criteria:** all ten tasks have source-backed findings; every claim has a file/symbol/test reference; unknowns are explicit; no secrets or production environment values were accessed.

### Gate B — Threat model (SEC-011–013)

1. Classify assets: human sessions, service principals, API credentials, recoverable secrets, environment variables, ciphertext, DEKs/KEKs, signing keys, audit records and backups.
2. Model attacker positions: unauthenticated remote caller, compromised tenant user, malicious/compromised service, XSS/browser extension, log/backup reader, compromised runtime, privileged insider and stolen deployment credential.
3. Draw trust boundaries and data flows among browser/ID, ARSY, storage, Sentinel, destination services, deployment adapters, CI/CD and external key custody.
4. For each threat, record preconditions, attack path, impact, existing control, evidence, residual risk and required mitigation.
5. Explicitly test assumptions around tenant escape, confused deputy, SSRF, replay, stale cache after revocation, key compromise, restore mismatch and audit tampering.

**Gate B exit criteria:** threat register has a named asset, actor, attack path, impact, current evidence and mitigation for every high-risk scenario; no generic “secure by design” statements.

### Gate C — Architecture decision package (SEC-014–020)

Produce a proposed ADR, not an accepted decision, covering:

- Authenticated envelope encryption options available in the actual Node.js runtime and pinned dependency set.
- Nonce/IV generation, authentication tag handling, canonical envelope versioning and algorithm agility.
- KEK/DEK hierarchy, tenant/resource binding (AAD), key separation and version metadata.
- Production key custody options actually available to the deployment; no assumed KMS/HSM integration.
- Backup/restore, disaster recovery, rotation, compromise containment and re-encryption strategy.
- API credential entropy, token format/prefix, verifier construction, constant-time comparison, expiry, scopes, one-time reveal, revocation and cache invalidation.
- Compatibility/migration analysis for NAS ciphertext and existing virtual-key rows; no destructive migration in this slice.

Compare at least two viable options where the repository/runtime supports them. Record operational trade-offs, failure modes, dependencies and rollback. If a decision requires deployment-owner input or an unavailable key-custody capability, mark it blocked and specify the exact missing decision; do not silently choose.

**Gate C exit criteria:** SEC-014–020 have documented evidence and a proposed ADR with explicit unresolved questions. No production crypto choice is treated as accepted until the repository's decision process records acceptance.

## Parallel-agent boundaries

Agents may work in parallel only on independent read-only audit areas:

- Agent A: NAS encryption and Sentinel resolution (SEC-001–002).
- Agent B: AI virtual-key lifecycle (SEC-003–004).
- Agent C: environment names, public variables and generic CRUD exposure (SEC-005–007).
- Agent D: audit and tenant authorization (SEC-008–009).
- Lead: consolidate SEC-010, threat model and ADR.

Each agent receives exact file paths and synthetic examples only. Agents must not open `.env`, production secret stores, deployment values, key files, or live credentials. No agent may modify implementation during discovery.

## Required artifacts from this slice

1. Update the existing `task.md` checkboxes only when evidence exists.
2. Add `audit-matrix.md` with capability status, file/symbol references, test evidence and unresolved gaps.
3. Add `threat-model.md` with trust-boundary diagram, threat register and prioritized mitigations.
4. Add `decision-proposal.md` with crypto/key-custody/API-key alternatives and explicit proposed/rejected/blocked states.
5. Add a short report only after the slice's checks are run; include exact commands, exit codes and changed paths.

## Implementation hold points

- No new vault schema, secret repository, encryption helper, API-key lifecycle route, ID UI or environment editor until the relevant decision is accepted.

## Slice result

SEC-001–020 and the required artifacts are complete. A pre-existing NAS API response leak of encrypted secret material was corrected with a metadata-only response projection and regression assertions; this does not add a new secret capability. The crypto/key-custody proposal remains unaccepted, so later implementation waves stay on hold. See [report.md](./report.md) for exact verification results.
- No reuse of NAS encryption as a general vault primitive without explicit suitability review.
- No claim that SHA-256-only virtual-key verification is sufficient without a credential threat model and verifier decision.
- No plaintext secret in browser, AI-agent context, logs, test snapshots, issue text or generated documentation.
- No new branch. Preserve unrelated work. Commit directly to `dev` using a conventional commit.
- Run focused documentation checks for this plan update. Full runtime gates are required when implementation begins, not claimed by a documentation-only commit.

## Completion definition

This slice is complete only when SEC-001–020 are evidence-backed or individually blocked with a precise reason, the audit matrix and threat model are reviewed, the proposed ADR separates accepted facts from open decisions, and `task.md` reflects only verified completion. Completion does not mean the vault or credential manager is implemented.
