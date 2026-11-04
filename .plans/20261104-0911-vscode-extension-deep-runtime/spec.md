---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261104-VSCODE-EXTENSION-DEEP-RUNTIME"
title: "VS Code Extension Deep Runtime Hardening"
status: "completed"
author: "developer"
---

# VS Code Extension Deep Runtime Hardening

## Goal

Turn the installed A-L-L-A-H.COM VS Code extension into a reproducible Windows runtime with activation diagnostics, deterministic packaging, and verified core commands.

## Scope

- Manifest, activation event, source registration, and bundle parity.
- VSIX packaging and installation verification.
- Extension-host core command smoke checks.
- Gateway, model, offline, local-agent, and remote mission recovery behavior.
- Canonical documentation and completion evidence.

## Acceptance criteria

- [x] Every contributed command has activation coverage and source registration.
- [x] Activation logs expose start, completion, and failure stages.
- [x] A standalone bundle and VSIX build from the same runtime artifact.
- [x] Workspace, VSIX, and installed bundle hashes match.
- [ ] Core commands work after VS Code window reload or fail with a specific actionable error.
- [x] Local-agent safety boundaries and remote mission replay boundaries remain unchanged.
- [ ] Focused tests, typecheck, packaging checks, and applicable repository gates pass.

## Out of scope

- Unrestricted machine execution.
- Silent edits, commits, pushes, deployments, or secret transmission.
- UI work unrelated to runtime state and diagnostics.
