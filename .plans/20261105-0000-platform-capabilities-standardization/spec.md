> **Moon UI skin-phase reconciliation (2026-11-05):** The skin mapping and all-application SkinRoot tasks in this older plan are superseded by the current accepted mapping in `DESIGN.md`, `DNA/README.md`, and `.plans/20261105-moon-ui-master-consolidation/spec.md`. The correct frontend mapping is Gate+Dock=Imperium, ID=Lunar, Harbor=ROCKSOUL, Headquarter=Nexus, MoonSky=Riot, JIZZ=Mycelium. ARSY and SENTINEL are backend/service runtimes and must not receive `SkinRoot`. Do not execute the old skin phase as written. Other non-UI capability work in this plan is unaffected.

# Feature Specification: Platform Capabilities Standardization

## Overview
This feature addresses the incomplete platform capabilities across the A-L-L-A.H.COM monorepo, specifically:
1. Implementing the platform capability entries that remain valid after evidence-based backlog reconciliation
2. Adding guardrails to prevent falsely VERIFIED capabilities without concrete implementation evidence

UI skin integration has been transferred out of this plan to `.plans/20261105-moon-ui-master-consolidation/`.

## Problem Statement
The monorepo contains legacy capability entries whose actual implementation status must be verified against source and evidence before work is scheduled. UI skin assignments and integration are owned exclusively by the Moon UI Master Consolidation plan; this plan does not reopen or duplicate that work.

The `evolve-loop-guard` plan (20261104-175034) specifically identifies this problem: AUTONONOUS.md section 8 must carry guards preventing EVOLVE from creating plans without concrete specs and marking VERIFIED without report.md containing real evidence.

## Objectives
- Complete implementation of all DISCOVERED platform capabilities with real code and verification
- Reconcile the platform capability backlog against actual implementation evidence
- Add architectural guardrails preventing future falsely VERIFIED capabilities
- Ensure all quality gates pass (typecheck, lint:arch, docs:check, builds)
- Document each capability with proper acceptance criteria and verification

## Functional Requirements

### FR-001: UI Skin Integration — TRANSFERRED / OUT OF SCOPE
- Do not execute skin integration work from this plan.
- Canonical frontend mapping and implementation tasks are maintained in `.plans/20261105-moon-ui-master-consolidation/`.
- Backend/service runtimes must not receive frontend SkinRoot wrappers.
- This plan may consume the shared UI package but must not change its skin ownership or duplicate its implementation.

### FR-002: Platform Capability Implementation
- Capability 4 (Simulated new platform capability): Implement actual feature from brainstorming, not empty template
- Capability 6 (New platform capability): Implement real capability with code, not just plan templates
- Capability 7 (New platform capability): Implement real capability with code, not just plan templates
- Capability 8 (New platform capability): Implement real capability with code, not just plan templates
- Capability 9 (New platform capability): Implement real capability with code, not just plan templates
- Capability 10 (New platform capability): Implement real capability with code, not just plan templates
- Capability 11 (New platform capability): Implement real capability with code, not just plan templates
- Capability 12 (New platform capability): Implement real capability with code, not just plan templates
- Capability 13 (New platform capability): Implement real capability with code, not just plan templates

### FR-003: Evolve Loop Guardrails
- AUTONOMOUS.md section 8 must carry three guards:
  1. Cannot create plans without a concrete spec
  2. Cannot mark VERIFIED without a report.md containing real evidence
  3. Cannot have falsely VERIFIED capability entries without code

## Non-Functional Requirements
- All implementations must pass `pnpm typecheck` across relevant packages
- All implementations must pass `pnpm lint:arch` (arch invariants)
- All implementations must pass `pnpm docs:check` (100/100 required)
- All builds must succeed: `pnpm dock:build`, `pnpm headquarter:build`, `pnpm id:build`, `pnpm jizz:build`, `pnpm gate:build`
- No duplicate functionality across capabilities
- Must preserve existing MoonWitness ecosystem invariants

## Scope
### In-Scope
- Implement 11 platform capabilities with real code and verification evidence
- Update BACKLOG.md statuses from DISCOVERED/VERIFIED to appropriate states
- Add evolve-loop-guard guardrails to AUTONOMOUS.md
- Create proper plan directories with spec.md, design.md, task.md, rule.md for each capability
- Ensure all quality gates pass

### Out-of-Scope
- Creating duplicate capabilities that already exist
- Changing the fundamental skin token architecture
- Modifying the core MoonWitness invariants
- Removing existing verified capabilities
- Adding new skin definitions beyond the existing 6

## User Stories & Use Cases

### US-001: Application Skin Assignment
As a developer, I want each application to have a properly configured SkinRoot so that the application renders with the correct skin tokens and branding.

**Acceptance:** Gate and Dock render with Imperium Lumen, ID with Lunar Chronicles, Harbor with ROCKSOUL, Headquarter with Nexus Paradox, MoonSky with RIOT ANARCHY, and JIZZ with MYCELIUM. ARSY and SENTINEL are backend/service runtimes and are not SkinRoot consumers.

### US-002: Platform Capability Verification
As a reviewer, I want each "new-platform-capability" entry to have real implementation evidence, not just empty plan templates.

**Acceptance:** Each capability has real code, passing tests, and report.md with measurable output.

### US-003: Evolve Loop Guard
As an automation guard, I want the system to prevent creating plans without concrete specs and marking things VERIFIED without evidence.

**Acceptance:** AUTONOMOUS.md has the three guards; BACKLOG shows no VERIFIED capability without code.

## Dependencies & Constraints

### Dependencies
- `@moonwitness/ui` package (v0.1.0) - provides SkinRoot and skin registry
- `@allah/sdk` package - client↔hub communications
- `@moonwitness/types` package - shared contracts

### Constraints
- UI skin mapping is governed by the Moon UI Master Consolidation plan; do not change or duplicate it.
- Must use existing skin registry (6 skins: imperium-lumen, lunar-chronicles, rocksoul, nexus-paradox, riot-anarchy, mycelium)
- Must preserve existing package boundaries and dependency rules
- Must not break existing quality gates
- Must follow MoonWitness engineering preferences (modular, reusable, enterprise-grade maintainability)
- Skin IDs must come from the registered skinIds array

## Acceptance Criteria
- [ ] All 11 platform capabilities have real code implementation
- [ ] All quality gates pass: typecheck, lint:arch, docs:check, all builds
- [ ] BACKLOG.md updated: no VERIFIED capability without code
- [ ] AUTONOMOUS.md section 8 has three evolve-loop-guard guards
- [ ] Each capability directory has spec.md, design.md, task.md, rule.md
- [ ] No duplicate functionality across capabilities

## Success Metrics
- 100% of DISCOVERED capabilities implemented with real code
- 0 falsely VERIFIED capabilities in BACKLOG.md
- All applicable quality gates pass for the actual capability scope
- Evolve loop guardrails prevent future empty plan creation