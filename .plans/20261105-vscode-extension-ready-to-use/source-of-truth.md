# Extension Source-of-Truth Matrix

| Surface | Manifest | Runtime owner | Automated evidence | Disposition |
|---|---|---|---|---|
| Project Manager | `allah.views.plans` | `PlanExplorerProvider` | plan manager tests; manifest check | Retained |
| Workspace Agent | `allah.localAgentWorkbench` | `LocalAgentWorkbenchProvider` | local-agent policy/core tests; manifest check | Primary agent surface |
| Setup Wizard | `allah.views.onboarding` | `OnboardingWizardProvider` | manifest check | Retained |
| Health Dashboard | `allah.views.health` | `HealthDashboardProvider` | manifest check | Retained |
| Provider Configuration | `allah.views.providerConfig` | `ProviderConfigPanel` | manifest check | Retained |
| Impact Analyzer | `allah.views.impactAnalyzer` | `ImpactAnalyzerProvider` | manifest check | Retained |
| Usage & Budget | `allah.views.usageDashboard` | `UsageDashboardPanel` | manifest check | Retained |
| Audit Trail & Replay | `allah.views.timelineReplay` | `TimelineReplayProvider` | mission timeline tests; manifest check | Retained |
| Local provider transport | `allah.agentProvider=ollama` | `MoonWitnessClient` | standalone/typecheck/build | Explicit selection; no fallback |
| Optional gateway transport | `allah.agentProvider=gateway` | `MoonWitnessClient` | standalone/typecheck/build | Optional; visible failure |
| Mission persistence | local extension storage | `MissionTimelineService` / `TimelineReplayService` | mission timeline tests | Retained; resume remains explicit |

`scripts/check-vscode-extension-manifest.mjs` is the authoritative parity guard for
contributed commands, views, and `onView` activation events. `scripts/check-vscode-extension-standalone.mjs`
remains the dependency boundary guard.

## Architecture trace

- `extension.ts` owns activation, command registration, plan Explorer wiring, service lifecycle, and disposal.
- `localAgentWorkbench.ts` is the primary user-facing agent flow. `agentWorkbench.ts` is a legacy swarm surface and is not registered by the current manifest.
- `ProviderRegistry` owns legacy provider identity and configured credentials. `ProviderIntegration` bridges SecretStorage-backed credentials into that registry. `MoonWitnessClient` owns the explicit Gateway/Ollama transport used by the primary agent flow.
- `MissionTimelineService` owns local mission event history and redacted export. `TimelineReplayService` owns replay sessions and audit views. `missionTimeline.ts` owns local-agent session ordering, interruption normalization, and bounded repair.
- `TursoClient` and remote mission handlers are optional integration paths and are not activation prerequisites for the local-first workflow.
