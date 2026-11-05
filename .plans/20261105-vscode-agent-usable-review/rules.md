# Constraints and safety rules

- Never send workspace context to another provider as an automatic fallback.
- Provider changes require visible user action and must be reflected in the
  status state.
- Keep secrets in VS Code SecretStorage.
- Do not log prompts, file contents, API keys, or model responses by default.
- Keep Ollama URLs local-only by default and validate configured URLs before
  requests.
- Preserve workspace boundary checks, sensitive-path filtering, edit preview,
  stale-file detection, and terminal approval.
- Do not claim a live smoke flow passed until a real configured provider is
  exercised.
- No new dependency is justified for provider readiness.
