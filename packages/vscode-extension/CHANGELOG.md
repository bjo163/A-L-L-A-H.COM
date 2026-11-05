# Changelog

## Unreleased

### Added

- VS Code extension-host tests for activation, workspace roots, plan task actions, and Ollama provider discovery.
- Workspace-aware mission templates that load or queue a reviewable Workspace Agent prompt.
- Repository metadata indexing prefers the workspace root package manifest over nested packages.
- Gateway credentials use SecretStorage without a user-editable API key setting.
- Provider timeouts cover response-body reads, caller cancellation remains active through parsing, and Ollama discovery is bounded.
- The optional Ollama adapter reads advertised model capabilities and context length; missing metadata stays unknown.
- Multi-step coding requests require approval of a generated plan before an edit proposal is requested.
- AI plans now provide validated task dependencies, acceptance criteria, and verification checks before approval.
- Explicit workspace notes can be saved, cleared, and selectively included as redacted context with a 30-day retention limit.
- Setup, security, and troubleshooting guidance for local Ollama and optional Gateway use.
- MIT license and repository metadata in the extension package.

### Validation

- Extension unit tests, typecheck, manifest checks, standalone checks, and VSIX package inspection pass.
- Twenty-six extension-host tests pass across no-workspace, single-root, and multi-root profiles.
- Full manual webview click-through, live Ollama model execution, and persisted timeline recovery remain unverified.
