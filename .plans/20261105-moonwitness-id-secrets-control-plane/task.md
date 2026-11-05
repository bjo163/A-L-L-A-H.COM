# Tasks: MoonWitness ID Secrets Control Plane

## Phase 1 — Core identity and secrets foundation
- [ ] Confirm ARSY contract boundaries for identity, credentials, and environment metadata
- [ ] Define tenant-scoped entity model for service identities, API keys, secrets, and environments
- [ ] Implement server-side secret storage and retrieval flow with redaction and audit metadata
- [ ] Add scoped API-key issuance and verification workflow with expiry and rotation support
- [ ] Validate no secret plaintext reaches browser or telemetry layers

## Phase 2 — Environment and approval workflow
- [ ] Design environment taxonomy for dev, staging, and prod configuration sets
- [ ] Implement versioned environment records, redacted diffs, and approval state transitions
- [ ] Wire environment promotion flow to policy and audit ledger
- [ ] Verify deployment hand-off and revocation scenarios

## Phase 3 — ID UI and integration
- [ ] Build secure management screens for service identities, keys, secrets, and environments
- [ ] Add empty, loading, and error states across all management views
- [ ] Integrate `@moonwitness/ui` component composition and accessible interaction patterns
- [ ] Connect SDK and type contracts for secret/environment workflows

## Phase 4 — Verification
- [ ] Run docs, lint, and type safety checks for the affected surfaces
- [ ] Confirm audit logging, tenant isolation, and secret redaction requirements
- [ ] Validate production safety gates before handoff
