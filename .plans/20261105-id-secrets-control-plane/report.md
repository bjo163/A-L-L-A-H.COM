---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-REPORT"
version: "1.0.0"
owner: "security-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# ID Secrets Control Plane Slice Report

## Delivered

- Completed SEC-001–020 with source-backed inventory, threat model, and a proposed decision package.
- Added SEC-021–030 shared secret, credential, service-principal, environment, diff, and approval contracts, plus compile-time checks that metadata types cannot expose secret material.
- Found that the NAS API response redacted `secret` but also serialized `secret_encrypted`. Updated the NAS response projection in [`app.ts`](../../apps/arsy/src/app.ts) to omit ciphertext on create, list, detail, and rotation responses.
- Strengthened [`nexus_nas.test.mjs`](../../apps/arsy/test/nexus_nas.test.mjs) to assert that `secret_encrypted` is absent from each response shape.
- No vault schema, new key helper, API-key lifecycle, environment editor, ID UI, or accepted crypto decision was added.
- Existing user worktree changes outside these targeted edits were preserved.

## Verification

| Command | Result |
|---|---|
| `pnpm --filter @allah/arsy-orm test` | 32 passed, 0 failed |
| `pnpm --filter @allah/arsy test` | 75 passed, 0 failed, including the strengthened NAS response assertions |
| `pnpm --filter @allah/arsy build` | Passed |
| `pnpm exec tsc --noEmit -p packages/types/tsconfig.json` | Passed |
| `pnpm --filter @moonwitness/types build` | Passed |
| `pnpm docs:check` | Blocked by unrelated workspace plans missing mandatory artifacts (80/100, 7 violations) |
| `git diff --check` | Passed |

## Hold point

The decision proposal is not an accepted ADR. Production key custody, migration, backup recovery, API-key lifecycle, and Sentinel cache invalidation remain unresolved. No later implementation wave is claimed complete.

## Current execution boundary

- SEC-021–030 remain locally implemented and type-checked, but are not yet committed because the repository pre-commit documentation gate scans unrelated untracked plans with missing mandatory artifacts.
- The blocked documentation gate is external to this slice. No hook was bypassed, and no unrelated plan was rewritten to manufacture a passing result.
- SEC-031–107 remain pending by design until the proposed authority, key-custody, migration, and policy decisions are accepted through the repository decision process.
