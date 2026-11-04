# Rules

- Execution authority remains in the VS Code extension host.
- Context selection remains explicit for every new local or remote-backed mission.
- Persisted timeline details are redacted and bounded; raw context and output are not stored.
- Sensitive paths remain excluded by the existing workspace policy.
- Repair attempts use the existing mode policy and edit approval flow.
- Repair prompts cannot execute terminal commands.
- Repair attempts are bounded by workspace, validation command, and normalized failure signature.
- Interrupted work restores as blocked and never resumes silently.
- Replayed remote mission IDs do not repeat local execution.
- Git writes, system writes, deployment, and privilege escalation remain denied.
