---
plan_id: "PLAN-20261104-VSCODE-EXTENSION-FOCUS"
---

# Tasks: VS Code Extension Runtime Focus

## Baseline
- [x] Compare contributed commands with explicit activation events and source registrations.
- [x] Verify SDK bundling configuration.
- [x] Check configured Arsy listener.

## Runtime and packaging
- [x] Apply only required activation or packaging fixes.
- [x] Package the standalone extension bundle as VSIX.
- [x] Install the VSIX and reload the VS Code installation state.
- [x] Verify `allah.listModels` registration and gateway catalog availability.

## Verification
- [x] Run focused extension tests.
- [x] Run extension typecheck.
- [x] Build the standalone bundle.
- [x] Compare workspace and installed bundle hashes.
- [x] Verify gateway health.
- [x] Record completion evidence or unavailable checks.
