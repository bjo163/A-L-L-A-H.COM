# Rules

- Execution authority remains in the VS Code extension host.
- `@allah/sdk` must remain bundled.
- Only `vscode` may be externalized from the extension runtime bundle.
- Credentials remain in SecretStorage.
- Sensitive and ignored workspace paths stay excluded.
- Remote missions cannot select paths or elevate local policy.
- Static model catalog entries do not imply provider readiness.
- Packaging claims require bundle hash and extension-host evidence.
