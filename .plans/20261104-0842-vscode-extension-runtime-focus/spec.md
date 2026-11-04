---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261104-VSCODE-EXTENSION-FOCUS"
title: "VS Code Extension Runtime Focus"
status: "completed"
author: "developer"
---

# VS Code Extension Runtime Focus

## Context

The extension previously reached runtime activation only after its standalone bundle could resolve the workspace SDK package. This focused task verifies the activation, packaging, gateway, and VSIX path independently from unrelated application work.

## Goal

Produce a reproducible Windows activation workflow where the extension registers `allah.listModels`, can connect to Arsy, and reports service errors without `command not found`.

## Scope

- Compare contributed commands, activation events, and source registrations.
- Verify SDK bundling and standalone output.
- Package and install the extension VSIX.
- Verify gateway health and installed bundle parity.
- Preserve existing plan, local-agent, pairing, model, and Arsy workflows.

## Acceptance criteria

- [x] `allah.listModels` has a command contribution and source registration.
- [x] `allah.testConnection` has a command contribution and source registration.
- [x] `@allah/sdk` is bundled by the extension build configuration.
- [x] Packaging produces a standalone VSIX and installs without missing-module errors.
- [x] Workspace and installed `extension.js` hashes match.
- [x] Gateway health succeeds at the configured default URL.
- [x] `allah.listModels` is available in the VS Code command surface through its contribution and source registration.
- [x] Offline gateway behavior reports a gateway error rather than an unregistered command.

## Out of scope

- UI redesign.
- Commit, push, or release promotion.
- Changes outside extension activation and packaging unless direct verification exposes a root cause.
