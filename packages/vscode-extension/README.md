# A-L-L-A-H.COM VS Code Extension

The extension manages repository `.plans` files and connects to the Arsy API and MoonWitness gateway from VS Code.

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

## Verification

From the repository root, run:

```sh
pnpm extension:test
pnpm --filter allah-vscode-extension typecheck
pnpm extension:build
```
