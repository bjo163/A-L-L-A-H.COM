# A-L-L-A-H Developer Cockpit — VS Code Extension Evolution

**Tagline:** Understand. Orchestrate. Build. Verify. Evolve.  
**Target:** packages/vscode-extension · **Branch:** dev  
**Roadmap:** 0.4.0 Ready-to-use → 0.5.0 Intelligent Engineering → 0.6.0 Autonomous Workforce → 1.0.0 Engineering Platform.

## Product narrative
A unified autonomous development environment that transforms Visual Studio Code into an intelligent command center for software engineering. It understands the repository before acting, converts intent into executable plans, coordinates specialized AI agents, keeps consequential actions under developer control, validates meaningful changes, and preserves evidence of what happened.

It is not another AI chat extension. It is an autonomous engineering cockpit.

## Product promise
Open an existing repository, select a local or remote model, ask the assistant to understand the project, create a small executable plan, review proposed edits, approve execution, run validation and inspect evidence — without requiring ARSY or internet access for the local-first core.

## Product principles
1. Local-first; core workflows work offline and without ARSY.
2. Provider-neutral; all providers use one explicit adapter contract.
3. Workspace-aware; workspace roots, trust and path boundaries are respected.
4. Plan-driven; substantial work becomes small tasks with acceptance criteria.
5. Human-controlled; consequential file, terminal, Git, network, release and deploy actions follow policy.
6. Evidence-driven; completion requires observable verification, not agent self-report.
7. Recoverable; interrupted missions are inspectable and require explicit safe resume.
8. Non-duplicative; reuse existing services rather than build parallel implementations.
9. Standalone; packaged extension has no monorepo-only runtime dependency.
10. Incremental; ship P0 usability before advanced capabilities.

## Existing baseline and caveats
The repository already contains a plan Explorer, agent workbench surfaces, provider integration, Ollama support, MoonWitness Gateway client, context/edit-review flows, validation policy, Mission Timeline and VSIX packaging scripts. Existing plan history reports earlier unit/build/package checks, but the Mission Timeline interactive extension-host smoke test remains explicitly pending and workspace-aware mission templates were deferred. Historical reports are not proof of current runtime readiness; rerun checks on the current checkout.

## Architecture decisions
- Extension Host owns activation, commands, views, workspace APIs, SecretStorage and lifecycle.
- One primary Cockpit/Workspace Agent experience owns user interaction.
- Provider Registry is the sole provider discovery, selection and adapter boundary.
- Local Agent Core owns context, model calls, tool orchestration, edit proposals and cancellation.
- Plan Engine owns plan discovery, task graph and progress.
- Mission Engine owns lifecycle, checkpoints, recovery, replay protection and timeline.
- Policy Engine owns trust, sensitive paths, command allowlist, approvals and network policy.
- Validation Engine owns permitted test/build/lint execution and evidence.
- MoonWitness Gateway and ARSY are optional remote adapters, never activation dependencies.

### Consolidation rules
Trace AgentWorkbenchProvider and LocalAgentWorkbenchProvider before merging, wrapping or retaining; target one primary user-facing flow, not blind deletion. ProviderRegistry owns provider identity and selection. Mission Engine owns mission state. Existing edit-review and validation policies remain authoritative. Retire legacy code only after reference search, runtime tracing, tests and documented disposition.

## Release roadmap
| Release | Goal | Scope |
|---|---|---|
| 0.4.0 | Ready-to-use | runtime parity, extension-host tests, unified UX, local provider, agent safety, mission reliability, clean VSIX |
| 0.5.0 | Intelligent engineering | repository DNA, context intelligence, task decomposition, mission templates, docs drift |
| 0.6.0 | Autonomous workforce | supervisor, researcher, builder, reviewer, bounded parallel missions |
| 1.0.0 | Engineering platform | mature providers, observability, scheduling, extensibility, stable release |

## Ready-to-use acceptance
Clean VSIX install; all commands/views resolve; activation without monorepo; Ollama setup/model discovery/offline workflow; optional Gateway; plan CRUD; agent inspect→plan→diff→approval→apply→validation→evidence; cancellation/reload/recovery/replay; multi-root; accessible/theme-aware UI; security tests; documentation parity.

## Execution
Read spec.md, blueprint.md and rules.md. Execute packages in dependency order. Inspect implementation before editing, make minimal changes, run focused and regression tests, and record exact evidence. Work on existing dev only. No unrelated commits. Do not mark implementation complete based solely on this plan.