---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261103-1903"
title: "CI Unblock, AI Plan Generator in VS Code, and SDUI Engine"
status: "in_progress"
author: "agent:antigravity"
created_at: "2026-11-03T19:03:00Z"
target_paths:
  - "package.json"
  - ".github/workflows/ci-dev.yml"
  - "packages/vscode-extension"
  - "apps/server"
  - "apps/web"
---

# Feature Specification: CI Unblock, AI Plan Generator in VS Code, and SDUI Engine

## 1. Context & Motivation
Unblock GitHub Actions CI and production container deployment, provide AI-assisted planning in the VS Code extension, and render Server-Driven UI in Next.js 16.

## 2. Technical Architecture & Constraints
1. Pin `packageManager: "pnpm@12.16.1"` in root `package.json` and workflow steps.
2. Extend `MoonWitnessClient` to call `/v1/chat/completions` for plan generation.
3. Enhance `/v1/sdui/{model}/{view_type}` in Loco Rust server and build `<SduiRenderer />` in Next.js 16.

## 3. Acceptance Criteria
- [ ] AC1: `packageManager` declared in `package.json` and `.github/workflows/ci-dev.yml` passes pnpm setup.
- [ ] AC2: `allah.generatePlanWithAI` command added to VS Code extension.
- [ ] AC3: Server-driven UI endpoint and frontend renderer display model schemas.
- [ ] AC4: All 4 monorepo build gates pass 100%.

