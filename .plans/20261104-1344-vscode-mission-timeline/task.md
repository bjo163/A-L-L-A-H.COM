---
plan_id: "PLAN-20261104-VSCODE-MISSION-TIMELINE"
status: "in_progress"
---

# Tasks

- [x] Define typed mission events, stable ordering, and replay state helpers.
- [x] Persist sanitized timeline events with local session history.
- [x] Restore interrupted sessions as blocked and report the interruption in the timeline.
- [x] Show active and restored events in the Workspace Agent view.
- [x] Record validation outcomes and offer one approval-gated repair proposal.
- [x] Prevent replayed remote mission IDs from repeating completed or interrupted local work.
- [x] Add unit tests for event ordering, replay de-duplication, recovery, failure signatures, and repair bounds.
- [x] Build the standalone bundle, package the VSIX, install it, and verify bundle hashes.
- [x] Run extension TypeScript typecheck after rebuilding workspace package declarations.
- [ ] Reload VS Code and interactively smoke-test timeline, validation repair, cancellation, and remote replay.
- [ ] Add workspace-aware mission templates as a follow-up milestone.
