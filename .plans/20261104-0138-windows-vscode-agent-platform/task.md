# Tasks: Windows VS Code Agent and Remote Operations

## Foundation and contracts
- [x] Inspect pending Headquarter/design worktree diffs and reconcile current extension, SDK, auth, ORM, and swarm contracts.
- [x] Define typed mode, tool-policy, device-pairing, mission, and event contracts.
- [x] Add SDK support for extension-provided credential storage and route extension Hub calls through the SDK.
- [/] Add tests for credential storage injection, SDK transport errors, and typed session/event parsing.

## Pairing and remote mission control
- [x] Implement authenticated single-use device pairing and revocation.
- [x] Implement persisted user/tenant-scoped mission lifecycle and audit events.
- [x] Implement authenticated outbound extension heartbeat/mission retrieval and cancellation.
- [/] Verify device ownership, replay rejection, reconnect behavior, and server restart recovery.

## Windows-local agent host
- [/] Implement workspace-scoped file read/search tools with ignore/secret filtering and canonical path checks.
- [x] Implement edit proposal, diff review, and policy-controlled workspace apply.
- [/] Implement bounded PowerShell execution, output limits, timeout, and cancellation.
- [x] Implement `allow` / `ask` / `deny` mode policies and trusted-workspace Autopilot behavior.
- [/] Verify non-Windows fallback preserves existing extension workflows.

## Modes, sessions, and dashboards
- [x] Implement Ask, Plan, Code, Debug, Ideate/Brainstorm, and Autopilot orchestration.
- [x] Implement per-session context consent and safe context construction.
- [x] Persist local session history and expose truthful completion/verification status.
- [/] Complete the VS Code agent cockpit with modes, live events, approvals, diff, and cancel.
- [x] Extend Headquarter with paired-device management, remote mission submit/stop, and live session events.
- [x] Preserve and integrate existing uncommitted Headquarter and design changes.

## Verification and release preparation
- [/] Add unit, contract, integration, and Windows extension-host tests for policy and remote control.
- [/] Verify keyboard, accessibility, empty/loading/error/offline/approval states, and existing VS Code theme behavior.
- [/] Update affected canonical docs and this plan's final report with evidence.
- [/] Run focused extension/SDK checks and all required repository quality/build gates.
- [ ] Review scoped diff for user changes, secrets, and unrelated files; do not commit or push.
