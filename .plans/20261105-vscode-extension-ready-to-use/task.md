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
- [x] VSC-010 Confirm package scripts, bundle entrypoints and standalone dependency graph. Extension contracts are local; no workspace package dependency remains.

### 01 Runtime and extension-host
- [x] VSC-011 Extend parity to every contributed command and view.
- [x] VSC-012 Add VS Code extension-host harness using `@vscode/test-electron`, Mocha, isolated profiles, and a local VS Code executable override.
- [x] VSC-013 Test activation/deactivation, missing optional providers and no workspace. Host activates without a workspace or configured provider and exits cleanly after the host shutdown lifecycle.
- [x] VSC-014 Test single-root and multi-root workspaces in separate extension-host launches.
- [x] VSC-015 Test plan Explorer refresh, opening spec/task artifacts, and task progress updates in the host.
- [x] VSC-016 Test provider setup/discovery/failure/timeout/offline/cancellation. Host acceptance covers SecretStorage setup, Ollama model discovery, unavailable-provider messaging, and no Gateway fallback; unit tests cover body-read timeout, caller cancellation, and malformed success responses.
- [x] VSC-017 Test diff review, approval/rejection, conflicts and safe apply. Host tests verify approved edits apply, rejected edits remain unchanged, and external edits made during review are not overwritten.
- [x] VSC-018 Test validation approval/cancellation and bounded repair. Host acceptance verifies rejection prevents execution, cancellation during approval prevents execution, active process cancellation is reported without success, and repeated identical failures allow only one repair proposal.
- [ ] VSC-019 Test timeline, reload, interruption, explicit resume and replay.
- [x] VSC-020 Install the VSIX in isolated user-data and extension directories, then verify its installed identifier and version without a monorepo checkout.

### 02 Cockpit UX
- [x] VSC-021 Define one primary agent entry point and navigation map. README names Workspace Agent as the start point and maps the plan, provider, health, usage, and audit destinations; host test asserts exactly one contributed agent view.
- [ ] VSC-022 Consolidate duplicate agent surfaces without deleting capabilities. The extension contributes one agent view, but preservation of removed remote-swarm capabilities remains unverified.
- [ ] VSC-023 Unify provider setup and connection status.
- [ ] VSC-024 Integrate plans, active mission and timeline navigation.
- [ ] VSC-025 Integrate diagnostics, usage and audit without duplicate dashboards.
- [ ] VSC-026 Complete loading/empty/error/offline/permission states.
- [ ] VSC-027 Verify keyboard accessibility, themes and narrow panels.

### 03 Providers and local-first
- [!] VSC-028 Finalize one provider adapter contract and registry. The primary Workspace Agent uses explicit Gateway/Ollama routing; legacy registry and fallback services remain isolated pending a larger adapter consolidation.
- [x] VSC-029 Verify Ollama endpoint setup and connection test against a loopback mock server. Live Ollama remains an environment acceptance.
- [ ] VSC-030 Verify model discovery and capability metadata.
- [x] VSC-031 Make provider/model selection explicit and observable. Provider selection is explicit, model readiness is checked before sessions, and fallback is opt-in only.
- [x] VSC-032 Normalize streaming, timeout, cancellation, retry and errors. Gateway timeouts remain active through response-body reads, caller aborts propagate, malformed success payloads fail explicitly, and Ollama discovery is bounded.
- [x] VSC-033 Store credentials only in SecretStorage. Removed the `allah.apiKey` setting; host acceptance verifies the command-stored key reaches the mock gateway through the SecretStorage-backed client.
- [ ] VSC-034 Verify full local workflow with network disabled.
- [x] VSC-035 Verify optional-provider activation and no silent Gateway fallback when configured Ollama is unavailable.

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
- [x] VSC-049 Run build, typecheck, lint and focused tests. Extension build, strict typecheck, source lint, unit tests, and host tests passed; `verify:fast` is blocked by a parse error in unrelated dirty `packages/arsy-orm/src/migrator.ts:612`.
- [x] VSC-050 Run extension-host suite and record environment/results. Three VS Code 1.144.1 host launches passed with 17 tests total.
- [x] VSC-051 Run security and standalone checks.
- [x] VSC-052 Inspect VSIX contents and monorepo imports. Package inspection confirms only manifest, README, LICENSE, CONTRACT, and bundled dist are shipped; development tests are excluded.
- [!] VSC-053 VSIX installed in an isolated profile, but full packaged-extension user-journey click-through remains unverified; host interaction tests currently exercise the development extension.
- [x] VSC-054 Finalize README/setup/provider/troubleshooting/security docs. README covers provider setup, local-only operation, Workspace Trust, SecretStorage, and troubleshooting.
- [x] VSC-055 Update changelog and release report with evidence/limitations. Current host evidence and remaining live/UI acceptance gaps are recorded.

## P1 — 0.5.0
- [x] VSC-056 Repository DNA scanner for framework, package manager, scripts and architecture. The context index now derives bounded metadata without sending source contents.
- [x] VSC-057 Dependency and documentation knowledge map. Repository DNA now indexes dependency names and bounded documentation paths from workspace metadata.
- [ ] VSC-058 Context memory with explicit scope, retention and controls. Unit-tested helper exists, but Workspace Agent does not yet expose or consume it.
- [ ] VSC-059 AI task decomposer with small tasks and acceptance criteria. Deterministic helper exists, but no plan/session workflow invokes it and it is not AI decomposition.
- [x] VSC-060 Workspace-aware mission templates. The picker filters by indexed metadata, gathers variable values, and loads or queues the resulting prompt in Workspace Agent for review before sending.
- [ ] VSC-061 Dependency-aware scheduling and progress synchronization. Typed task-graph helper exists, but it is not connected to `.plans` tasks or mission scheduling.
- [x] VSC-062 Documentation drift detection and proposed updates. Repository indexing now includes bounded metadata-only findings and exposes actionable suggestions to the agent context.

## P1 — 0.6.0
- [ ] VSC-063 Define agent roles, tools, inputs, outputs and capabilities. Role definitions exist, but runtime dispatch does not consume them.
- [ ] VSC-064 Add supervisor and bounded delegation. Coordinator helper is tested, but no Workspace Agent workflow invokes it.
- [ ] VSC-065 Add researcher, builder and reviewer roles. Role definitions exist, but these roles do not run as separate agents.
- [ ] VSC-066 Add inter-agent message schema and trace correlation. Message helper creates correlated envelopes, but runtime agent communication does not use it.
- [ ] VSC-067 Add concurrency/resource limits and failure isolation. Limits exist as helper policy; runtime delegation does not enforce them.
- [x] VSC-068 Add review checkpoint before consequential actions. Consequential actions require an explicit approved checkpoint.

## P2 — 1.0.0
- [ ] VSC-069 Model comparison/evaluation workflow. Expected-signal evaluator exists, but no model comparison workflow invokes it.
- [ ] VSC-070 Prompt laboratory and versioned prompt tests. Prompt version helper exists, but there is no user-facing lab or persisted prompt test workflow.
- [ ] VSC-071 Token, latency, reliability and budget observability. Metric aggregation helper exists, but it is not wired to provider events or a live usage surface.
- [ ] VSC-072 Opt-in mission scheduling. Due-time predicate exists, but no persisted opt-in scheduler triggers missions.
- [ ] VSC-073 Extension capability/plugin contribution contract. Validator helper exists, but extension contributions are not discovered or registered through it.
- [ ] VSC-074 Stable distribution, upgrade and support policy. Policy constant exists, but release/upgrade behavior does not consume it.

## Dependency order
00 → 01 → 02 → 03 → 04 → 05 → 09. 06 depends on stable 00–05. 07 depends on stable provider/agent/mission contracts. 08 is cross-cutting and must not weaken local-core security.

No task is complete without implementation reference, tests, result, acceptance evidence and report update.