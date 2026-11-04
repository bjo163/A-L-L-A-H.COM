---
title: "VS Code Extension Runtime Focus - Completion Report"
status: "completed"
---

# VS Code Extension Runtime Focus

## Verified deliverables

- Extension bundle built successfully at 105.86 KB.
- Focused test suite passed: 28 tests.
- Extension TypeScript typecheck passed.
- Standalone VSIX packaged and installed successfully.
- Installed extension reported `a-l-l-a-h.allah-vscode-extension@0.3.0`.
- Workspace bundle SHA-256:
  `610E21B205E7AA4FFB2B87A62A13A0A20206D9B4ADDFFBCDFF506B4853C95BA1`
- Installed bundle SHA-256:
  `610E21B205E7AA4FFB2B87A62A13A0A20206D9B4ADDFFBCDFF506B4853C95BA1`
- Arsy health endpoint returned HTTP 200.
- Arsy model catalog endpoint returned HTTP 200.
- `allah.listModels` is contributed by the manifest and registered by the activation module.

## Runtime conclusion

The standalone extension runtime is packaged with `@allah/sdk`, installed at the expected extension location, and byte-identical to the workspace build. The previously observed activation gap caused by unresolved SDK runtime dependencies is resolved in this artifact.

## Remaining manual check

Interactive extension-host command invocation requires an active VS Code window to confirm the exact UI result. The command contribution, source registration, installation, gateway health, and catalog response are all verified.
