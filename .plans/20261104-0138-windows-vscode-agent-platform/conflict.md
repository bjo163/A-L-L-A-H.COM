# Resolution: Autonomy and Windows Trust Boundary

## Conflict

The user requested a “super free” autonomous Windows coding/fixing agent with no limits. Unrestricted machine-wide filesystem or shell access, secret access, and silent commit/push/deploy would violate the repository's least-privilege, explicit-authorization, and operational-safety invariants.

## Options

- [x] **Bounded Autopilot (confirmed by approval of the implementation plan):** no per-action prompt for operations allowed by an explicit trusted-workspace/mode grant; hard policy for workspace escape, secrets, destructive/system-wide operations, and Git write/deployment actions.
- [ ] Unrestricted machine-wide execution with no policy boundary. Not available for implementation.

## Resolution

Implement Kilo-like per-mode `allow` / `ask` / `deny` policies and a high-autonomy mode scoped to a user-selected workspace. Require explicit session start and context consent; local extension policy remains authoritative for both VS Code and Headquarter-originated missions. Dangerous or out-of-scope actions require explicit confirmation or are denied.

## Dashboard boundary

The user selected remote control from Headquarter. Pairing is therefore required; Headquarter can submit and cancel missions for an authenticated paired extension, but cannot select arbitrary local paths or bypass local approvals.
