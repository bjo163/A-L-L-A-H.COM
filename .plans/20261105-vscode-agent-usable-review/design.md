# UX and architecture plan

## Design read

Reading this as: a VS Code coding-agent workbench for developers, with an
editorial command-deck language, dial ENERGY 2 / RHYTHM 3 / MOTION 1.

## First-run flow

1. Workspace Agent opens with a provider readiness row.
2. The row names the active backend: `Local Ollama`, `Gateway`, or
   `Not configured`.
3. `Check provider` performs a bounded health check.
4. For Ollama, the user selects from models returned by `/api/tags`.
5. The selected model is persisted in extension configuration.
6. Ask mode is the smoke path. Code and Debug remain gated by context consent
   and diff review.

## State model

- `checking`: provider check is in progress.
- `ready`: provider and model are available.
- `not-configured`: no usable provider/model is selected.
- `offline`: configured provider cannot be reached.
- `error`: provider responded with a contract or request error.
- `working`: request is running and cancellation is available.

Every state includes a human-readable cause and a concrete next action.

## Routing decision

Prefer a small `AgentProviderAdapter` contract owned by the extension. Keep
Ollama and gateway adapters behind it. Do not make the Workspace Agent depend
on the broader provider registry until that registry exposes the same request,
health, and model contract.

## Alternatives considered

- **Default Ollama:** rejected as an implicit runtime assumption because Ollama
  may not be installed.
- **Default gateway:** retained only when readiness is explicit and the UI
  never presents it as already available.
- **Automatic fallback:** rejected because it can send workspace context to a
  different trust boundary without a new consent decision.
