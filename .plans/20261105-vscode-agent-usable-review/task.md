# Tasks

- [x] Define provider readiness contract for gateway and Ollama.
- [x] Add local provider discovery and model selection to first-run flow.
- [x] Connect readiness state to Workspace Agent UI.
- [x] Add actionable empty, loading, offline, and error states.
- [x] Add regression coverage and validate routing/build boundaries.
- [/] Run a documented manual smoke flow with a real configured provider.
- [x] Build, package, install, and perform release verification.
- [x] Fix view activation and remove unavailable internal focus command.

## Evidence

- View provider IDs now match the contributed MoonWitness view IDs.
- Workspace Agent exposes provider readiness, model discovery, configuration,
  and explicit no-fallback behavior.
- Previously unregistered MoonWitness commands are now wired to their views or
  real actions.
- Typecheck, extension tests (26), standalone check, and build pass.
- VSIX is packaged and installed at version 0.3.0.
- Live provider smoke remains environment-dependent until Ollama or a gateway
  is running with a usable model.
- All interactive webviews now declare `onView` activation events, and the
  unavailable `workbench.action.focusView` command is no longer used.
