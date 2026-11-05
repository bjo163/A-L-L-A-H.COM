# Changelog

## Unreleased

### Added

- VS Code extension-host tests for activation, workspace roots, plan task actions, and Ollama provider discovery.
- Workspace-aware mission templates that load or queue a reviewable Workspace Agent prompt.
- Gateway credentials use SecretStorage without a user-editable API key setting.
- Setup, security, and troubleshooting guidance for local Ollama and optional Gateway use.
- MIT license and repository metadata in the extension package.

### Validation

- Extension unit tests, typecheck, manifest checks, standalone checks, and VSIX package inspection pass.
- Ten extension-host tests pass across no-workspace, single-root, and multi-root profiles.
- Full manual webview click-through, live Ollama model execution, and persisted timeline recovery remain unverified.
