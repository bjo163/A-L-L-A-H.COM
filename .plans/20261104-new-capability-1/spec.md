---
title: "NEW-PLATFORM-CAPABILITY-1: Basic Platform Capability Scaffold"
status: "proposed"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# NEW-PLATFORM-CAPABILITY-1: Basic Platform Capability Scaffold

## 1. Objective

Create a minimal platform capability scaffold that can serve as a template for future capabilities. This addresses the pattern where capabilities were marked VERIFIED without actual product code.

## 2. Scope

This is a foundational scaffold only - no new features or business logic. It provides the directory structure, plan templates, and basic configuration that future capabilities can build upon.

## 3. Deliverables

### 3.1 Directory Structure
```
.capabilities/
  capability-1/
    spec.md
    task.md
    design.md
    rules.md
    report.md (on completion)
```

### 3.2 Minimal Files
- `.capabilities/capability-1/spec.md` - This specification
- `.capabilities/capability-1/task.md` - Task list with concrete acceptance criteria
- `.capabilities/capability-1/design.md` - Minimal design documenting the scaffold
- `.capabilities/capability-1/rules.md` - Rules for capability creation

### 3.3 What's NOT Included
- No new API routes
- No new database models
- No new UI components
- No new backend services
- No runtime code

## 4. Acceptance Criteria

- [x] Directory `.capabilities/capability-1/` created
- [x] `spec.md` created with objective, scope, and deliverables
- [x] `task.md` created with specific, measurable tasks (not vague "implement capability")
- [x] `design.md` created with minimal design content
- [x] `rules.md` created with creation rules
- [ ] Report generated on actual implementation (when real capability exists)

## 5. Constraints

- Must not claim VERIFIED status without actual product code
- Must follow the evolve-loop-guard patterns for plan integrity
- Must be distinguishable from actual capability implementations
- Template must be updated when real capabilities are created

## 6. Related

- EVOLVE-LOOP-GUARD: Plan to harden against empty VERIFIED claims
- BACKLOG: NEW-PLATFORM-CAPABILITY-1 entry
- `.plans/20261104-domain-routing` - Reference domain routing plan structure