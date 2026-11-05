# Remediation report

Status: completed.

The review found one high-impact UX ambiguity and two medium boundary issues.
The first implementation slice removes the duplicate agent surface and aligns
the status bar with the actual local workflow. Full cloud-source cleanup remains
the next bounded slice because it touches activation handlers and client
compatibility code beyond the view layer.

Implemented evidence:

- `package.json` contributes only `Workspace Agent` as the agent view.
- `extension.ts` registers only `LocalAgentWorkbenchProvider`.
- The status bar now says `Workspace Agent` and focuses that view.

Verification:

- `pnpm --filter allah-vscode-extension typecheck`: passed.
- `pnpm extension:test`: 26 passed, 0 failed.
- `pnpm --filter allah-vscode-extension check-standalone`: passed.
- `pnpm extension:build`: passed.
- `pnpm --filter allah-vscode-extension package`: passed.
- VSIX installed as `a-l-l-a-h.allah-vscode-extension@0.3.0`.
- `allah.agentProvider = ollama` now uses the local `/api/chat` endpoint and
  reports an explicit error when the configured local service is unavailable.

Remaining:

- UI-003 remains open. Cloud compatibility handlers are still in activation
  source but are not contributed to the manifest. Removing them is a separate
  source-boundary cleanup and should be done with a dedicated client contract
  pass rather than by hiding errors in the current UI slice.
