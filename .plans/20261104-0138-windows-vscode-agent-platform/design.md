# Design: Windows VS Code Agent and Remote Operations

## Product composition

The VS Code extension is the Windows execution cockpit. Keep the existing Plans, Arsy status, and model views, and make the Agent Workbench the main task surface. Its primary screen decision is: what is this agent doing, what needs my approval, and can it safely continue?

Headquarter is the paired-device operations surface. It manages device pairing and revocation, sends a mission to a selected paired device, shows its real connection/session state, and requests cancellation. Existing server-side Agent Studio, Swarm Operations, and MCP remain distinct capabilities; do not merge server execution with Windows-local execution.

Use the established Moon UI/Nexus Paradox direction in Headquarter and VS Code theme tokens in the extension. Design read: Windows developer control surface, ENERGY 2 / RHYTHM 2 / MOTION 1. State badges must represent real states. Do not fabricate activity or metrics. Every view provides meaningful empty, loading, offline, approval, and error states.

## Agent modes

| Mode | Purpose | Local tools |
|---|---|---|
| Ask | Explain code and answer questions | Read/search only |
| Plan | Produce `.plans` artifacts and implementation steps | Read/search; plan writes require user action |
| Ideate / Brainstorm | Generate and compare ideas | Read/search; no source writes |
| Code | Implement a user goal | File tools and validation subject to policy |
| Debug | Trace a defect, propose and apply a fix | Read/search; edits and commands subject to policy |
| Autopilot | Complete scoped coding/fixing loops | Allowed workspace edits and configured checks without per-action prompts after explicit mission start; other actions follow `ask`/`deny` rules |

The model never grants itself capabilities. Every proposed tool call is validated by an extension-host policy engine immediately before execution. Remote missions use the same local policy path.

## System boundaries

```text
Headquarter
  -> authenticated pairing / mission API / persisted events
Arsy Fastify + PGlite
  -> owns identity/tenant checks, paired-device records, mission queue, audit
VS Code extension host on Windows
  -> owns local workspace scope, permission decisions, files, PowerShell, cancellation
Configured model gateway
  -> receives only user-approved context; proposes typed tool calls, never executes local tools
```

The extension initiates authenticated outbound HTTPS requests; no local machine port is exposed. Use long-poll/heartbeat to retrieve queued commands unless inspection shows an existing safe persistent transport. Persist commands and lifecycle state so a Hub restart does not lose a mission. Remote cancellation is a request that the extension acknowledges and enforces locally.

## Contracts and lifecycle

- Pairing: authenticated short-lived one-use challenge, device public metadata, user/tenant ownership, revoke/rotate.
- Mission: `id`, owner, paired device, workspace binding, mode, prompt, context-consent record, policy snapshot, status, timestamps, terminal reason.
- Events: monotonically ordered mission events for state, agent role, tool proposal, approval decision, sanitized result, validation result, and completion report.
- Tool proposal: typed tool name, validated arguments, workspace-relative paths, required policy action, request ID, and bounded execution options.
- Session completion: distinguish `completed`, `blocked`, `cancelled`, `failed`, and `verification_failed`; only real checks may populate verified evidence.

## Local execution and safety

- Bind each session to a workspace folder selected in VS Code; never accept an arbitrary path from Headquarter.
- Resolve and normalize paths before every access; reject workspace escape and symlink escape. Respect ignored files and exclude credential-like files by default.
- For writes, construct a proposed edit, show a reviewable diff when policy requires it, and apply through VS Code workspace APIs so dirty/unsaved state is handled deliberately.
- Execute PowerShell from the extension host with a fixed workspace working directory, cancellation, timeout, and bounded stdout/stderr. Commands are subject to mode policy and explicit trust. Do not run shell commands in Arsy.
- Keep user approvals and policy decisions visible in the event timeline. A remote operator may submit goals but cannot approve an action that local policy marks `ask` or `deny`.
- Request per-session consent before sending workspace content to the configured gateway; do not include secret or ignored files by default.

## Dashboard states and behavior

- VS Code: unpaired/connecting/offline; no workspace; idle; context consent; queued; running; approval required; applying diff; validating; completed with evidence; blocked; cancelled; error.
- Headquarter: no paired device; pairing pending/expired; connected/offline; no missions; queued; running; waiting for local approval; cancel requested; completed/blocked/failed; API error.
- All controls have real behavior, accessible names, keyboard support, visible focus, and status text not conveyed by color alone.

## Migration and compatibility

- Preserve existing `.plans` tree and generation, Arsy health/model views, server swarm, and MCP UI.
- Inject a credential-store interface into `@allah/sdk` instead of importing VS Code APIs into the universal SDK. The extension adapts `SecretStorage`; web apps keep browser storage behavior.
- Keep local execution capability-specific and disable it with an explicit unsupported-host state outside Windows. Do not disable existing extension functionality.
- Inspect and integrate current Headquarter changes before editing overlapping screens. Do not replace or reset the user's current work.
