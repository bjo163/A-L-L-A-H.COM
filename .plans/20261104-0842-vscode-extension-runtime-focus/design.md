# Design: VS Code Extension Runtime Focus

## Activation flow

1. VS Code loads the contributed manifest.
2. Startup or a contributed command activates the standalone bundle.
3. The activated extension registers commands exactly once.
4. Gateway commands create the SDK client using SecretStorage credentials.
5. Health and model failures return explicit, user-visible service messages.

## Packaging flow

- `main` resolves to `dist/extension.js`.
- `@allah/sdk` is bundled by `tsup`.
- `vscode` remains external because it is supplied by VS Code.
- VSIX packaging uses the standalone bundle only.
- The installed file and workspace build output are compared by SHA-256.

## Error contract

- Missing gateway: name the connection failure and configured URL.
- Invalid gateway response: name the malformed catalog or model response.
- Missing API key: direct the user to the API-key command only when the endpoint requires it.
- Activation failure: remain visible in VS Code runtime logs; never mask it as a successful service response.
