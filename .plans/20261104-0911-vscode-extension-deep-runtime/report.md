# Report: VS Code Extension Deep Runtime Hardening

## Status

status: partial-completed

## Delivered

- Activation starts, completes, and fails through a dedicated VS Code output channel.
- Runtime parity gate covers 12 contributed commands against source registrations and activation coverage.
- The runtime gate verifies standalone SDK/type bundling and the expected extension entrypoint.
- The extension builds, packages, installs, and reloads from VSIX.
- Workspace, VSIX, and installed bundles match by SHA-256.

## Evidence

- `pnpm extension:build`: passed, standalone bundle 106.99 KB.
- `pnpm extension:check`: passed, 12 commands checked.
- `pnpm --filter allah-vscode-extension typecheck`: passed.
- `pnpm extension:test`: passed, 28 tests.
- `pnpm docs:check`: passed, 100/100.
- VSIX: `allah-vscode-extension-0.3.0.vsix` packaged and installed.
- Installed extension: `a-l-l-a-h.allah-vscode-extension-0.3.0`.
- SHA-256: `2EE4AA38983ECB56A8E5EED2ABDF9A5764F3FCE17B6288BC6C7DB709D237522C`.
- Arsy `/health`: HTTP 200.
- Arsy `/ready`: HTTP 200 and `ready: true`.
- Arsy `/v1/models`: HTTP 200 with three registered gateway models.

## Remaining interactive verification

The CLI can prove installation and gateway availability, but it cannot invoke the VS Code Command Palette UI. Invoke `Allah: List Registered LLM Models` after reloading the VS Code Window and confirm the three catalog entries appear.

## Repository gate blockers

- `pnpm lint:arch`: fails on existing TODO comments in `apps/sentinel/src/server.ts`.
- `pnpm typecheck`: fails because `apps/sentinel/tsconfig.json` places `packages/sentinel-radius/src/index.ts` outside its configured root directory.

These failures are outside the extension runtime scope and were not modified.
