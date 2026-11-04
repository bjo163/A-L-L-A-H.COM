# Feature Specification: Platform Capabilities Standardization

## Overview
This feature addresses the incomplete platform capabilities across the A-L-L-A.H.COM monorepo, specifically:
1. Standardizing and completing the UI skin system integration across all applications
2. Implementing the 11 "new-platform-capability" entries currently marked DISCOVERED with no real code
3. Adding guardrails to prevent falsely VERIFIED capabilities without concrete implementation evidence

## Problem Statement
The monorepo contains 11 "new-platform-capability" entries (capabilities 4-13 plus capability 12) in the BACKLOG.md all marked as DISCOVERED with status VERIFIED without actual code implementation. Additionally, the UI skin system, while well-designed with 6 skin definitions in `@moonwitness/ui`, has incomplete integration across applications - only some apps have proper skin directory structures and route assignments.

The `evolve-loop-guard` plan (20261104-175034) specifically identifies this problem: AUTONONOUS.md section 8 must carry guards preventing EVOLVE from creating plans without concrete specs and marking VERIFIED without report.md containing real evidence.

## Objectives
- Complete implementation of all DISCOVERED platform capabilities with real code and verification
- Standardize skin system integration across all 10 applications in the monorepo
- Add architectural guardrails preventing future falsely VERIFIED capabilities
- Ensure all quality gates pass (typecheck, lint:arch, docs:check, builds)
- Document each capability with proper acceptance criteria and verification

## Functional Requirements

### FR-001: Skin System Integration
- All applications must support skin system via `@moonwitness/ui` SkinRoot component
- Each application must declare a valid SkinRoot with a valid skin ID from the skin registry
- Skin tokens must flow correctly from SkinRoot through to rendered CSS variables
- Default skin (`imperium-lumen`) must be the fallback when no skin is specified

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
- Standardize skin system integration across all applications
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

**Acceptance:** Dock renders with Imperium Lumen skin, Headquarter with Nexus Paradox, ID with Lunar Chronicles, Jizz with Mycelium, Moonsky with Rocksoul, Gate with Riot Anarchy.

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
- All 10 applications must have Next.js 16+ and React 19+

### Constraints
- Must use existing skin registry (6 skins: imperium-lumen, lunar-chronicles, rocksoul, nexus-paradox, riot-anarchy, mycelium)
- Must preserve existing package boundaries and dependency rules
- Must not break existing quality gates
- Must follow MoonWitness engineering preferences (modular, reusable, enterprise-grade maintainability)
- Skin IDs must come from the registered skinIds array

## Acceptance Criteria
- [ ] All 10 applications have SkinRoot with valid skin ID
- [ ] All 11 platform capabilities have real code implementation
- [ ] All quality gates pass: typecheck, lint:arch, docs:check, all builds
- [ ] BACKLOG.md updated: no VERIFIED capability without code
- [ ] AUTONOMOUS.md section 8 has three evolve-loop-guard guards
- [ ] Each capability directory has spec.md, design.md, task.md, rule.md
- [ ] No duplicate functionality across capabilities
- [ ] Skin tokens flow correctly through all applications

## Success Metrics
- 100% of applications have SkinRoot integration
- 100% of DISCOVERED capabilities implemented with real code
- 0 falsely VERIFIED capabilities in BACKLOG.md
- All 5 quality gates pass (typecheck, lint:arch, docs:check, and 5 app builds)
- Evolve loop guardrails prevent future empty plan creation