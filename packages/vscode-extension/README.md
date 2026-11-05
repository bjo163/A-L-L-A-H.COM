# A-L-L-A-H.COM VS Code Extension

The extension is a standalone VS Code workbench for repository `.plans` files,
workspace navigation, diagnostics, templates, and local developer workflows.
It does not require this monorepo, Arsy, MoonWitness, Turso, or any cloud
service to activate or manage local projects.

## Plans

- The Plans tree scans every open workspace folder and refreshes when `spec.md` or `task.md` changes.
- Selecting a plan opens `spec.md`. Selecting a task opens `task.md` at that checklist line.
- Task context actions set in-progress, completed, or pending explicitly.
- Local and gateway-generated plans contain `spec.md`, `task.md`, `design.md`, and `rules.md`.
- Choose a workspace folder when more than one root is open.

## Coding workflow

- The Workspace Agent supports Ask, Plan, Ideate, Code, Debug, and Autopilot
  sessions.
- The activity bar exposes one agent surface, `Workspace Agent`. The former
  remote swarm surface is not part of the standalone workflow.
- The workbench UI is organized as a three-part command deck: intent, approved
  verification, and evidence. This keeps the next decision visible instead of
  presenting a generic dashboard.
- The visual system uses VS Code theme tokens, a single status accent, compact
  section numbering, and no decorative motion. This preserves editor context
  and makes state changes legible in light and dark themes.
- At narrow panel widths, the header and action row reflow into one column,
  controls retain a 44px touch target, and keyboard focus remains visible.
- Build a repository context index with `Workspace: Build Context Index`.
  The index records non-sensitive paths, project manifests, and `.plans`
  artifacts without sending file contents. It also suggests documentation
  updates from project metadata; suggestions do not edit project files.
- Use `Workspace: Search and Open File` for bounded file discovery and
  `Tasks: Run Approved Validation` for the fixed, approval-gated validation
  list.
- Code and Debug sessions open proposed diffs before applying edits. Files are
  checked again before apply so external changes cannot be overwritten.
- The Workspace Agent checks the selected provider before every session,
  discovers Ollama models from `/api/tags`, and lets you select an installed
  model. It never switches providers silently.

## AI providers and offline behavior

- Core workspace and `.plans` features work fully offline.
- Optional provider adapters use native HTTP and VS Code `SecretStorage`; no
  provider is required for activation.
- Workspace Agent can use `allah.agentProvider = ollama` with a local Ollama
  endpoint. Set `allah.agentModel` to an installed Ollama model such as
  `llama3.1`. If Ollama is unavailable, the panel reports the connection error
  instead of silently switching to a remote service.
- The AI plan command rejects mock completions, failed requests, and incomplete
  or malformed responses. It does not create a local fallback plan.

The MoonWitness activity bar views are wired to their providers: Setup Wizard,
Health Dashboard, Provider Configuration, Impact Analyzer, Usage and Budget,
and Audit Trail and Replay. Their commands focus the corresponding view before
starting the action.

The `allah.gatewayUrl` and `allah.arsyUrl` settings default to `http://127.0.0.1:5150`. Set `allah.plannerModel` to a gateway model identifier. `allah.apiKey` is optional when the endpoint requires authentication.

## Local agent and safety

- Ask, Plan, Code, Debug, Ideate, and Autopilot modes use extension-side tool policies. Workspace edits are previewed before application; validation runs use a fixed, approval-gated command list.
- Workspace context is selected and sent only after explicit session consent.
- The local agent cannot access paths outside the selected workspace or silently commit, push, or deploy.
- Workspace Trust is required before workspace indexing, agent sessions, plan creation, Git operations, or validation.
- Provider keys are saved through `MoonWitness: Set API Key` in VS Code `SecretStorage`; do not put credentials in workspace settings.
- Remote mission pairing and cloud synchronization are not part of the standalone product.

## Troubleshooting

- **Ollama is unavailable:** confirm Ollama is running, `allah.ollamaUrl` points to its HTTP endpoint, and `GET /api/tags` lists at least one model. Choose that installed model in `allah.agentModel`.
- **Model is not installed:** install the model with the Ollama CLI, or select a model returned by its tags endpoint. The extension does not switch to Gateway automatically.
- **Gateway setup fails:** check `allah.gatewayUrl`, use `MoonWitness: Test Gateway Connection`, and set a key with `MoonWitness: Set API Key` only when the endpoint requires one.
- **Workspace actions are unavailable:** trust the workspace in VS Code, then rerun the command.
- **Need diagnostics:** inspect the `A-L-L-A-H.COM Extension` Output channel for activation messages.

## Verification

From the repository root, run:

```sh
pnpm extension:test
pnpm --filter allah-vscode-extension typecheck
pnpm extension:build
pnpm --filter allah-vscode-extension check-standalone
```

Run the VS Code extension-host suite with an installed VS Code executable:

```powershell
$env:VSCODE_EXECUTABLE_PATH='C:\Program Files\Microsoft VS Code\Code.exe'
pnpm --filter allah-vscode-extension test:integration
```

Without `VSCODE_EXECUTABLE_PATH`, the test runner downloads the stable VS Code
build. The host suite creates and removes temporary workspace and profile data.


## Product roadmap and execution plan

The canonical evolution plan for the standalone Developer Cockpit lives at:

- `.plans/20261105-vscode-extension-ready-to-use/README.md` — product narrative and roadmap.
- `.plans/20261105-vscode-extension-ready-to-use/spec.md` — functional requirements and release gates.
- `.plans/20261105-vscode-extension-ready-to-use/blueprint.md` — target architecture and ownership.
- `.plans/20261105-vscode-extension-ready-to-use/task.md` — master task index and dependencies.
- `.plans/20261105-vscode-extension-ready-to-use/rules.md` — execution rules for local coding agents.
- `.plans/20261105-vscode-extension-ready-to-use/packages/` — ten executable phase plans.

The plan is intentionally evidence-first: historical build/package reports do not replace current extension-host and clean-install acceptance tests. Release 0.4.0 focuses on a reliable local-first user journey before advanced multi-agent capabilities.
