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
