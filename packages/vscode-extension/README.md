# A-L-L-A-H.COM VS Code Extension

The extension manages repository `.plans` files, connects to the Arsy API and MoonWitness gateway, and provides a Windows-local coding agent from VS Code.

## Plans

- The Plans tree scans every open workspace folder and refreshes when `spec.md` or `task.md` changes.
- Selecting a plan opens `spec.md`. Selecting a task opens `task.md` at that checklist line.
- Task context actions set in-progress, completed, or pending explicitly.
- Local and gateway-generated plans contain `spec.md`, `task.md`, `design.md`, and `rules.md`.
- Choose a workspace folder when more than one root is open.

## Arsy and gateway

- The Arsy view reports `/health` and `/ready` separately and opens `/docs`.
- The model view reads the gateway catalog. A catalog entry does not prove that an upstream provider is configured.
- The AI plan command rejects mock completions, failed requests, and incomplete or malformed responses. It does not create a local fallback plan.

The `allah.gatewayUrl` and `allah.arsyUrl` settings default to `http://127.0.0.1:5150`. Set `allah.plannerModel` to a gateway model identifier. `allah.apiKey` is optional when the endpoint requires authentication.

## Local agent and remote missions

- Ask, Plan, Code, Debug, Ideate, and Autopilot modes use extension-side tool policies. Workspace edits are previewed before application; validation runs use a fixed, approval-gated command list.
- Workspace context is selected and sent only after explicit session consent. The local agent cannot access paths outside the selected workspace or silently commit, push, or deploy.
- Pairing stores the device credential in VS Code `SecretStorage`. The extension polls for Headquarter missions over an outbound connection; Headquarter cannot choose local paths or override extension permissions.
- Signup provisions each account with an isolated personal tenant. Team device sharing requires an administrator to assign members to the same organization tenant.

## Verification

From the repository root, run:

```sh
pnpm extension:test
pnpm --filter allah-vscode-extension typecheck
pnpm extension:build
```
