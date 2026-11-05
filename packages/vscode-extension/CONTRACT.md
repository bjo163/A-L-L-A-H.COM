---
contract: unit
id: PKG_VSCODE_EXTENSION
tier: package
name: allah-vscode-extension
owner: developer-experience
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: VS Code extension surfacing missions health and usage dashboards
publicSurface: []
depends: []
---

# allah-vscode-extension — Unit Contract

The editor extension host: local workspace workflows, provider integration,
Ollama detection, mission timeline and replay, health monitoring, usage
dashboard, and impact analysis. It has no required monorepo package dependency;
remote HTTP integrations are optional and use local contracts.

## Public surface

Empty by design: the extension contributes commands and views through the VS Code
host rather than exposing an imported library surface.

## Depends

No required package dependencies. The extension uses the VS Code API, native
`fetch`, and local TypeScript contracts.
