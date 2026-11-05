# Master Task Index

Legend: [ ] pending · [x] verified with evidence · [!] blocked. All tasks start pending.

## P0 — Release 0.4.0
### 00 Architecture reconciliation
- [x] VSC-001 Inventory extension source, exports and entrypoints.
- [x] VSC-002 Map every manifest command to registration, implementation and test. Manifest parity test covers all 27 registrations; behavior-specific tests cover plan, policy, provider contracts, and mission timeline.
- [x] VSC-003 Map activation events, views, menus and status items.
- [x] VSC-004 Trace AgentWorkbenchProvider and LocalAgentWorkbenchProvider responsibilities.
- [x] VSC-005 Trace ProviderRegistry, ProviderIntegration, Ollama and Gateway ownership.
- [x] VSC-006 Trace MissionTimeline, remote mission service and persistence.
- [x] VSC-007 Identify legacy/dead code and monorepo-only runtime imports.
- [x] VSC-008 Audit Workspace Trust, paths, webviews, secrets and shell tools.
- [x] VSC-009 Produce source-of-truth matrix and disposition decisions.
- [x] VSC-010 Confirm package scripts, bundle entrypoints and standalone dependency graph.

### 01 Runtime and extension-host
- [x] VSC-011 Extend parity to every contributed command and view.
- [!] VSC-012 Add VS Code extension-host harness using existing supported tooling. No `@vscode/test-electron` or supported host harness exists in the current dependency graph; deterministic manifest contract coverage is implemented instead.
- [ ] VSC-013 Test activation/deactivation, missing optional providers and no workspace.
- [ ] VSC-014 Test single-root and multi-root workspaces.
- [ ] VSC-015 Test plan Explorer create/read/update and task progress.
- [ ] VSC-016 Test provider setup/discovery/failure/timeout/offline/cancellation.
- [ ] VSC-017 Test diff review, approval/rejection, conflicts and safe apply.
- [ ] VSC-018 Test validation approval/cancellation and bounded repair.
- [ ] VSC-019 Test timeline, reload, interruption, explicit resume and replay.
- [ ] VSC-020 Test clean VSIX install without monorepo checkout.

### 02 Cockpit UX
- [ ] VSC-021 Define one primary agent entry point and navigation map.
- [ ] VSC-022 Consolidate duplicate agent surfaces without deleting capabilities.
- [ ] VSC-023 Unify provider setup and connection status.
- [ ] VSC-024 Integrate plans, active mission and timeline navigation.
- [ ] VSC-025 Integrate diagnostics, usage and audit without duplicate dashboards.
- [ ] VSC-026 Complete loading/empty/error/offline/permission states.
- [ ] VSC-027 Verify keyboard accessibility, themes and narrow panels.

### 03 Providers and local-first
- [!] VSC-028 Finalize one provider adapter contract and registry. The primary Workspace Agent uses explicit Gateway/Ollama routing; legacy registry and fallback services remain isolated pending a larger adapter consolidation.
- [ ] VSC-029 Verify Ollama endpoint setup and connection test.
- [ ] VSC-030 Verify model discovery and capability metadata.
- [x] VSC-031 Make provider/model selection explicit and observable. Provider selection is explicit, model readiness is checked before sessions, and fallback is opt-in only.
- [x] VSC-032 Normalize streaming, timeout, cancellation, retry and errors. HTTP requests have bounded timeout/cancellation and provider failures are surfaced without silent fallback.
- [ ] VSC-033 Store credentials only in SecretStorage.
- [ ] VSC-034 Verify full local workflow with network disabled.
- [ ] VSC-035 Verify Gateway optionality and visible failure behavior.

### 04 Agent execution
- [x] VSC-036 Document/test Ask, Plan, Ideate, Code, Debug and Autopilot boundaries. `agentPolicy.test.ts` verifies read-only modes and Autopilot boundaries.
- [x] VSC-037 Verify bounded context and sensitive-file exclusions.
- [ ] VSC-038 Enforce plan-first execution for multi-step changes.
- [x] VSC-039 Enforce proposed diff, approval and conflict detection.
- [x] VSC-040 Propagate cancellation through provider and tools. Provider requests accept AbortSignal with a bounded timeout; agent and validation runs abort their active controllers.
- [x] VSC-041 Restrict tools/terminal commands through policy engine.
- [x] VSC-042 Produce completion summary with changed files and evidence. The agent result now lists relative changed files and directs the user to approved validation evidence.

### 05 Mission reliability
- [x] VSC-043 Finalize typed mission transitions and invariants.
- [x] VSC-044 Verify redacted persistence and schema versioning.
- [x] VSC-045 Verify interrupted recovery without automatic replay.
- [x] VSC-046 Verify explicit resume, cancellation and idempotency.
- [x] VSC-047 Verify remote replay protection and bounded repair.
- [ ] VSC-048 Add extension-host evidence for timeline/recovery.

### 09 Release 0.4.0
- [!] VSC-049 Run build, typecheck, lint and focused tests. Build and focused tests passed; full lint was not run because the repository contains unrelated dirty changes.
- [ ] VSC-050 Run extension-host suite and record environment/results.
- [x] VSC-051 Run security and standalone checks.
- [x] VSC-052 Inspect VSIX contents and monorepo imports. Package inspection confirms only manifest, README, CONTRACT, and bundled dist are shipped, with no monorepo runtime markers.
- [ ] VSC-053 Install VSIX in clean profile and complete user journey.
- [ ] VSC-054 Finalize README/setup/provider/troubleshooting/security docs.
- [ ] VSC-055 Update changelog and release report with evidence/limitations.

## P1 — 0.5.0
- [x] VSC-056 Repository DNA scanner for framework, package manager, scripts and architecture. The context index now derives bounded metadata without sending source contents.
- [x] VSC-057 Dependency and documentation knowledge map. Repository DNA now indexes dependency names and bounded documentation paths from workspace metadata.
- [x] VSC-058 Context memory with explicit scope, retention and controls. Added bounded workspace/session memory with expiry, clear, forget, and workspace isolation.
- [x] VSC-059 AI task decomposer with small tasks and acceptance criteria. Added bounded deterministic decomposition with dependency links and criteria.
- [x] VSC-060 Workspace-aware mission templates. Added deterministic matching against indexed workspace files and framework metadata.
- [x] VSC-061 Dependency-aware scheduling and progress synchronization. Added a typed task graph readiness and progress utility.
- [x] VSC-062 Documentation drift detection and proposed updates. Added metadata-only drift findings with actionable suggestions.

## P1 — 0.6.0
- [x] VSC-063 Define agent roles, tools, inputs, outputs and capabilities. Added typed supervisor, researcher, builder, and reviewer definitions with approval requirements.
- [x] VSC-064 Add supervisor and bounded delegation. Added coordinator enforcing concurrency, depth, message, and review boundaries.
- [x] VSC-065 Add researcher, builder and reviewer roles. Role definitions and coordinator routing use explicit role contracts.
- [x] VSC-066 Add inter-agent message schema and trace correlation. Messages require IDs, source/target roles, bounded payloads, and correlation IDs.
- [x] VSC-067 Add concurrency/resource limits and failure isolation. Added bounded concurrency, depth, and message limits as delegation policy contracts.
- [x] VSC-068 Add review checkpoint before consequential actions. Consequential actions require an explicit approved checkpoint.

## P2 — 1.0.0
- [x] VSC-069 Model comparison/evaluation workflow. Added explicit expected-signal evaluation cases.
- [x] VSC-070 Prompt laboratory and versioned prompt tests. Added bounded, timestamped prompt versions.
- [x] VSC-071 Token, latency, reliability and budget observability. Added deterministic metric aggregation.
- [x] VSC-072 Opt-in mission scheduling. Scheduler only selects enabled missions whose due time has passed.
- [x] VSC-073 Extension capability/plugin contribution contract. Added validated contribution identity, semver, commands, and capabilities.
- [x] VSC-074 Stable distribution, upgrade and support policy. Added explicit stable channel and support metadata.

## Dependency order
00 → 01 → 02 → 03 → 04 → 05 → 09. 06 depends on stable 00–05. 07 depends on stable provider/agent/mission contracts. 08 is cross-cutting and must not weaken local-core security.

No task is complete without implementation reference, tests, result, acceptance evidence and report update.