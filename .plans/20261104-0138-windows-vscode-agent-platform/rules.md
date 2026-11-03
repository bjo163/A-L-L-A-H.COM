# Rules: Windows VS Code Agent and Remote Operations

## Trust boundaries

1. The extension host is the sole authority for local Windows files and processes.
2. Arsy and Headquarter may queue, observe, and cancel missions but never gain direct filesystem or shell access to a paired machine.
3. A model response, server-side role, or remote operator cannot widen the local tool policy.
4. Pairing, mission retrieval, events, and revocation are authenticated and scoped to the owning user and tenant.
5. Workspace content is sent to the model gateway only after explicit session consent.

## Local execution constraints

- Bind a mission to a workspace selected in VS Code; never trust a workspace path supplied by a model or Headquarter.
- Canonicalize paths and reject traversal, symlink escapes, unsupported URI schemes, and paths outside the bound workspace.
- Exclude ignored files and credential-like files by default. Never read or transmit environment secrets, private keys, tokens, or credential stores.
- Use `vscode.workspace.applyEdit` or equivalent guarded APIs for file changes; preserve dirty document content and expose the exact diff before policy-authorized apply.
- PowerShell runs only in the extension host, with an explicit workspace CWD, timeout, cancellation, output cap, and user-visible command/result record.
- No machine-wide or destructive action, privilege elevation, arbitrary secret access, commit/push, or deployment may run silently. Require a dedicated confirmation or deny it.
- Autopilot means no prompt for each action already allowed by its explicit workspace/mode grant. It is not unrestricted administrator access.
- Ignore tool requests not in the active mode's allowlist and validate all tool arguments immediately before execution.
- Stop/cancel must abort active requests/processes where supported and report partial completion honestly.

## Remote control constraints

- Use a one-time expiring pairing code and revocable device credential stored in VS Code `SecretStorage`.
- Do not open an inbound Windows port. Extension connections are outbound and authenticated.
- Persist mission commands before delivery, enforce idempotency, and ensure the same command is not executed twice after reconnect.
- Re-check local workspace and policy on every remote mission. Headquarter cannot select a filesystem path or approve a locally gated operation.
- Audit pairing, revocation, mission submission, approvals, tool execution, cancellation, and terminal outcomes. Redact secrets and sensitive file content from events.
- Revoke device credentials and stop polling promptly when signed out, revoked, or the extension deactivates.

## Product and quality invariants

- Preserve repository architecture: all Hub calls through `@allah/sdk`, shared contracts through `@moonwitness/types`, Headquarter interactive UI through `@moonwitness/ui`.
- Preserve `.plans` canonical artifacts and distinguish proposal, execution, and verified completion.
- No success-shaped fallback for failed requests or failed validation.
- Do not fabricate activity, metrics, providers, test results, or verifier evidence.
- Headquarter and extension dashboards have real keyboard-operable controls and truthful empty/loading/offline/error/approval states.
- Preserve unrelated and pre-existing user worktree changes; inspect diffs before editing overlapping files.

## Verification requirements

- Test policy decisions for each mode and tool, path traversal and symlink escape, ignored/secret filtering, timeout and cancellation, and output truncation.
- Test pairing expiration/replay/revocation, tenant ownership, unauthorized mission access, duplicate delivery, reconnection, and restart recovery.
- Verify remote cancellation cannot bypass local policy and no inbound listener is created.
- Run extension-host checks on Windows and retain working non-Windows plan/gateway behavior.
- Run documented extension, SDK, documentation, architecture, typecheck, and application build gates before marking the plan complete.
