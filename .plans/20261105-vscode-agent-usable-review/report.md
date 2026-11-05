# Ultra-review report

## Scope

Reviewed the extension manifest, activation registration, Workspace Agent,
client routing, provider registry, Ollama adapter, local-agent policy and
tests. Validation covered current typecheck, extension tests, standalone
checker, and manifest inspection.

## Validation evidence

- `pnpm --filter allah-vscode-extension typecheck`: passed.
- `pnpm extension:test`: 26 passed, 0 failed.
- `pnpm --filter allah-vscode-extension check-standalone`: passed.
- Manifest inspection: one agent view, Ollama provider option present.
- Live Ollama/model smoke test: not run, because local service/model state was
  not verified.

## Readiness

**CONDITIONALLY READY for release.** The remediation is implemented and
preserves the existing safety controls. A real provider smoke run remains
blocked by the current machine environment.

## Implementation order

1. Provider readiness contract and model discovery.
2. First-run Workspace Agent setup and honest state rendering.
3. Routing and failure recovery tests.
4. Real provider smoke verification.
5. Only then consider streaming, patch hunks, and autonomous repair.

## Remediation evidence

- Contributed view IDs and provider registration IDs now match for every
  MoonWitness activity bar view.
- Workspace Agent now checks provider health before a session, discovers local
  Ollama models, persists a selected model, and links to configuration.
- Missing manifest command handlers are wired for Impact Analyzer, Usage and
  Budget, Audit Trail and Replay, budget limits, and audit export.
- The packaged manifest has no runtime dependencies.
- Ollama smoke check: CLI not installed and `127.0.0.1:11434` unavailable.
