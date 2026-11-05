# Ultra-review findings

## Finding U-001: AI first-run path is not self-discovering

- Category: Product alignment / UX
- Severity: HIGH
- Confidence: CONFIRMED
- Priority: P0
- Evidence: `package.json` defaults `allah.agentProvider` to `gateway`; the
  local Ollama route is available only after manually changing settings.
- Impact: a clean install can open the agent, submit a task, and fail because
  the user has not configured a gateway or selected Ollama.
- Root cause: provider readiness is split between configuration, provider
  services, and `MoonWitnessClient`, with no agent-facing readiness contract.
- Recommendation: add provider readiness discovery and a guided first-run
  action before the first request.

## Finding U-002: Ollama model availability is not checked before request

- Category: API / reliability / UX
- Severity: HIGH
- Confidence: CONFIRMED
- Priority: P0
- Evidence: `completeWithOllama` posts using `allah.agentModel` or the literal
  `llama3.1`; there is no request-time `/api/tags` check or model picker in the
  Workspace Agent.
- Impact: users can have Ollama running but still receive a model-not-found
  failure with no guided recovery.
- Recommendation: list local models, persist an explicit selection, and show
  the missing-model action.

## Finding U-003: Provider configuration UI is disconnected from agent routing

- Category: Architecture / UX
- Severity: MEDIUM
- Confidence: CONFIRMED
- Priority: P1
- Evidence: `ProviderIntegration` and `ProviderRegistry` manage provider
  credentials, while `MoonWitnessClient.completeAgent` routes only by the
  `allah.agentProvider` string and uses its own Ollama fetch path.
- Impact: users can configure a provider in one surface without knowing
  whether Workspace Agent will use it.
- Recommendation: introduce one small readiness/request contract used by both
  configuration and Workspace Agent.

## Finding U-004: Release readiness is proven statically, not end-to-end

- Category: Testing / release
- Severity: MEDIUM
- Confidence: CONFIRMED
- Priority: P1
- Evidence: typecheck, 26 unit/regression tests, standalone check, build, and
  package pass. No live provider smoke test was run.
- Impact: installation success does not prove that a user can complete Ask,
  Code, validation, and cancellation in a configured environment.
- Recommendation: add a provider contract test with a local fake HTTP server
  and document one real Ollama smoke flow separately.

## Strengths to preserve

- One agent view is now exposed.
- Workspace consent and sensitive-path filtering are explicit.
- Edits are previewed and stale content is checked before apply.
- Validation uses a fixed allowlist and approval.
- Standalone checker prevents required monorepo dependencies.

## Final verdict

The extension is **usable as a local repository and plan workbench** and
**conditionally usable as an AI coding agent**. It is not yet first-run ready
for an ordinary user because provider/model readiness is not surfaced or
verified before the first request.
