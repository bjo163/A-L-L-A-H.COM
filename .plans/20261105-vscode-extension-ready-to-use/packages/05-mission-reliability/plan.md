# Mission Reliability and Recovery

Priority: P0 · Status: pending

## Objective
Make mission lifecycle deterministic, inspectable, privacy-safe and safe under cancellation, crash, reload and replay.

## Execution tasks
- [ ] 05MISSIONRELIABILITY-01: Review existing mission schema and reuse it unless a demonstrated gap exists.
- [ ] 05MISSIONRELIABILITY-02: Specify legal state transitions and reject invalid transitions.
- [ ] 05MISSIONRELIABILITY-03: Verify timeline event redaction and versioned persistence.
- [ ] 05MISSIONRELIABILITY-04: Test interruption during planning, model call, edit approval and validation.
- [ ] 05MISSIONRELIABILITY-05: Ensure activation never automatically replays a tool action.
- [ ] 05MISSIONRELIABILITY-06: Implement explicit resume with idempotency and user-visible checkpoint.
- [ ] 05MISSIONRELIABILITY-07: Test duplicate remote mission IDs and replayed completion events.
- [ ] 05MISSIONRELIABILITY-08: Keep repair proposals bounded and approval-gated; no direct shell execution.
- [ ] 05MISSIONRELIABILITY-09: Add extension-host tests and evidence for reload, cancellation and recovery.

## Dependencies
00, 01 and 04; reuse existing Mission Timeline.

## Acceptance
Every task has implementation references, focused tests, exit codes, evidence and report update. Reuse current contracts and services. No duplicate provider/mission/policy implementation. Preserve user data and workspace security. Mark blocked work explicitly; never fabricate PASS.

## Verification record
- Commands:
- Results/exit codes:
- Extension-host/manual evidence:
- Limitations:
- Follow-ups:
- Commit:
