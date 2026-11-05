# Task: Implementation Breakdown for Platform Capabilities Standardization

## Implementation Phases

### Phase 1: Skin System Integration — SUPERSEDED / DO NOT EXECUTE

The original T-001 through T-014 skin integration work is superseded by the current canonical mapping and the Moon UI Master Consolidation plan.

- [-] **T-001–T-010:** Do not wrap apps using the old mapping. Current approved mapping: Gate+Dock=Imperium; ID=Lunar; Harbor=ROCKSOUL; Headquarter=Nexus; MoonSky=Riot; JIZZ=Mycelium. ARSY and SENTINEL are backend/service runtimes, not SkinRoot consumers.
- [-] **T-011–T-014:** Skin integration verification and documentation reconciliation are tracked by MU-0801–MU-0822 and MU-0930–MU-0942 in `.plans/20261105-moon-ui-master-consolidation/task.md`.

Do not mark these old tasks as implementation complete. Their scope has been transferred and must be executed only in the master plan.

### Phase 2: Platform Capability Implementation (Weeks 3-8)
Objective: Implement all 11 DISCOVERED platform capabilities with real code and verification evidence.

**Implementation Order (by capability number):**

**Capability 4: Simulated new platform capability**
- [ ] T-020: Read brainstorming output for capability 4
- [ ] T-021: Implement actual feature (not empty template)
- [ ] T-022: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-023: Implement verification/tests
- [ ] T-024: Update BACKLOG.md status
- [ ] T-025: Run quality gates (typecheck, lint:arch, docs:check, build)

**Capability 6: New platform capability**
- [ ] T-030: Read brainstorming output for capability 6
- [ ] T-031: Implement actual feature with real code
- [ ] T-032: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-033: Implement verification/tests
- [ ] T-034: Update BACKLOG.md status
- [ ] T-035: Run quality gates

**Capability 7: New platform capability**
- [ ] T-040: Read brainstorming output for capability 7
- [ ] T-041: Implement actual feature with real code
- [ ] T-042: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-043: Implement verification/tests
- [ ] T-044: Update BACKLOG.md status
- [ ] T-045: Run quality gates

**Capability 8: New platform capability**
- [ ] T-050: Read brainstorming output for capability 8
- [ ] T-051: Implement actual feature with real code
- [ ] T-052: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-053: Implement verification/tests
- [ ] T-054: Update BACKLOG.md status
- [ ] T-055: Run quality gates

**Capability 9: New platform capability**
- [ ] T-060: Read brainstorming output for capability 9
- [ ] T-061: Implement actual feature with real code
- [ ] T-062: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-063: Implement verification/tests
- [ ] T-064: Update BACKLOG.md status
- [ ] T-065: Run quality gates

**Capability 10: New platform capability**
- [ ] T-070: Read brainstorming output for capability 10
- [ ] T-071: Implement actual feature with real code
- [ ] T-072: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-073: Implement verification/tests
- [ ] T-074: Update BACKLOG.md status
- [ ] T-075: Run quality gates

**Capability 11: New platform capability**
- [ ] T-080: Read brainstorming output for capability 11
- [ ] T-081: Implement actual feature with real code
- [ ] T-082: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-083: Implement verification/tests
- [ ] T-084: Update BACKLOG.md status
- [ ] T-085: Run quality gates

**Capability 12: New platform capability**
- [ ] T-090: Read brainstorming output for capability 12
- [ ] T-091: Implement actual feature with real code
- [ ] T-092: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-093: Implement verification/tests
- [ ] T-094: Update BACKLOG.md status
- [ ] T-095: Run quality gates

**Capability 13: New platform capability**
- [ ] T-100: Read brainstorming output for capability 13
- [ ] T-101: Implement actual feature with real code
- [ ] T-102: Create proper spec.md, design.md, task.md, rule.md
- [ ] T-103: Implement verification/tests
- [ ] T-104: Update BACKLOG.md status
- [ ] T-105: Run quality gates

**Capability 5: (Also DISCOVERED, review if included)**
- Review and decide inclusion

**Dependencies:** Phase 1 (skin integration) must complete first for applications that need skin integration for their capabilities.

**Parallelizable Workstreams:** Capabilities 6-13 can be worked on in parallel since they're independent features. Capability 4 may depend on brainstorming output.

**Required Files per Capability:**
- `.plans/capability-4/spec.md`
- `.plans/capability-4/design.md`
- `.plans/capability-4/task.md`
- `.plans/capability-4/rule.md`
- (Similarly for capabilities 5-13, reviewing inclusion)

**Testing & Validation:**
- Unit tests for each capability
- Integration tests where applicable
- `pnpm typecheck` must pass
- `pnpm lint:arch` must pass
- `pnpm docs:check` must pass
- All app builds must pass

**Documentation Requirements:**
- Each capability directory has all 4 documents (spec, design, task, rule)
- BACKLOG.md updated: status changed from DISCOVERED/VERIFIED to appropriate state
- report.md with real evidence (not empty templates)

**Quality Gates:**
- typecheck: must pass across all relevant packages
- lint:arch: must pass (100% arch invariants)
- docs:check: must pass (100/100)
- All 5 app builds: dock, headquarter, id, jizz, gate must pass

### Phase 3: Evolve Loop Guardrails (Week 9)
Objective: Add guardrails to AUTONOMOUS.md preventing future empty plan creation and falsely VERIFIED capabilities.

**Ordered Tasks:**
- [ ] T-110: Review AUTONONOUS.md section 8 current state
- [ ] T-111: Add guardrail 1: "Cannot create plans without a concrete spec"
- [ ] T-112: Add guardrail 2: "Cannot mark VERIFIED without a report.md containing real evidence"
- [ ] T-113: Add guardrail 3: "Cannot have falsely VERIFIED capability entries without code"
- [ ] T-114: Verify guards are syntactically correct and enforceable
- [ ] T-115: Test guardrails by attempting to create plan without spec
- [ ] T-116: Test guardrails by attempting to mark VERIFIED without evidence
- [ ] T-117: Run full quality gate suite to ensure no regressions

**Dependencies:** Phase 2 must complete first (need real capabilities to verify the guards work against).

**Parallelizable Workstreams:** Guardrail implementation is sequential - all three must be added to section 8.

**Required Files:**
- Modify `AUTONOMOUS.md` section 8 with three guardrails

**Testing & Validation:**
- Attempt to create plan without concrete spec - should be blocked
- Attempt to mark capability VERIFIED without report.md evidence - should be blocked
- Run quality gates to ensure no regressions

**Documentation Requirements:**
- AUTONOMOUS.md section 8 updated with three guardrails
- Documentation of what each guardrail prevents

**Quality Gates:**
- All existing quality gates must still pass
- No regressions introduced

### Phase 4: BACKLOG.md Status Updates (Week 9-10)
Objective: Update all DISCOVERED capability entries to appropriate states.

**Ordered Tasks:**
- [ ] T-120: Update capability 4 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-121: Update capability 5 status (review inclusion decision)
- [ ] T-122: Update capability 6 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-123: Update capability 7 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-124: Update capability 8 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-125: Update capability 9 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-126: Update capability 10 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-127: Update capability 11 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-128: Update capability 12 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-129: Update capability 13 status from DISCOVERED/VERIFIED to COMPLETED (with evidence)
- [ ] T-130: Verify no VERIFIED capability exists without code in BACKLOG.md

**Dependencies:** Phase 2 must complete first (need real implementations before updating statuses).

**Parallelizable Workstreams:** STATUS updates are independent per capability.

**Required Files:**
- `BACKLOG.md` - update status entries for all 11+ capabilities

**Testing & Validation:**
- Run pnpm docs:check to ensure no regressions
- Verify BACKLOG.md reflects correct statuses
- Confirm no "VERIFIED without code" entries remain

**Quality Gates:**
- docs:check must pass (100/100)
- No new errors introduced

## Detailed Subtasks

### Skin integration subtasks — SUPERSEDED

The old T-001 through T-010 detail sections have been removed from this execution document. They are transferred to MU-0801–MU-0822 in `.plans/20261105-moon-ui-master-consolidation/task.md`. Do not recreate SkinRoot wrappers or use the old all-app mapping here.

### T-020: Implement capability 4
1. Read brainstorming output from plan directory 2026-11-04T08-13-57-new-platform-capability-4
2. Implement actual feature (not empty template)
3. Create spec.md with real feature description
4. Create design.md with architecture
5. Create task.md with implementation breakdown
6. Create rule.md with constraints
7. Add verification/tests
8. Update BACKLOG.md
9. Run quality gates

### [Similar subtasks for capabilities 5-13, following the same pattern]

## Dependencies & Execution Order

### Phase Dependencies
- Phase 2 (Capability Implementation) → Phase 3 (Guardrails) → Phase 4 (BACKLOG Updates). UI skin integration is tracked separately by the Moon UI Master Consolidation plan.

### Parallel Dependencies
- Within Phase 1: All 10 applications independent (parallel)
- Within Phase 2: Capabilities 6-13 independent (parallel); Capability 4 depends on brainstorming output
- Within Phase 3: Sequential (all three guardrails in same section)
- Within Phase 4: Independent status updates (parallel)

### Key Cross-Phase Dependencies
- Phase 2 implementations must pass quality gates before Phase 3 can verify guardrails
- Phase 4 status updates require completed implementations from Phase 2
- AUTONOMOUS.md guardrails (Phase 3) apply to future plan creation, not retroactive

### Required Files & Affected Modules
- `AUTONOMOUS.md` - section 8 (guardrails)
- `BACKLOG.md` - capability status entries
- `.plans/20261105-0000-platform-capabilities-standardization/` - all 4 documents
- `.plans/capability-*/` - 11 subdirectories with spec.md, design.md, task.md, rule.md
- `packages/ui/src/skins/` - already exists, may need minor updates

### Testing and Validation Procedures
2. **Quality Gate Tests**: Run `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`, and app-specific builds
3. **Capability Verification**: Each capability must have real code, not just plan templates
4. **Guardrail Test**: Attempt to create plan without spec - should be blocked by AUTONOMOUS.md guards
5. **BACKLOG Status Test**: Verify all capability entries have appropriate statuses

### Documentation Requirements
- All 11 platform capabilities have complete documentation (spec, design, task, rule)
- AUTONOMOUS.md section 8 has three enforceable guardrails
- BACKLOG.md accurately reflects implementation status
- No "VERIFIED without code" entries remain in BACKLOG.md

### Completion Checklist
- [ ] All 11 platform capabilities have real code implementation
- [ ] All quality gates pass: typecheck, lint:arch, docs:check, and 5 app builds
- [ ] BACKLOG.md updated: no VERIFIED capability without code
- [ ] AUTONOMOUS.md section 8 has three evolve-loop-guard guards
- [ ] Each capability directory has spec.md, design.md, task.md, rule.md
- [ ] No duplicate functionality across capabilities
- [ ] Zero regressions in existing quality gates