---
title: "API Validation Bug Fix Plan"
status: "proposed"
timestamp: "2026-11-04T14:30:00+07:00"
author: "Qoder Agent"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---
# SPEC: API Validation Bug Fix

## 1. Problem Statement

The API endpoints in `apps/gate/` and `apps/headquarter/` are accepting requests with invalid or missing required parameters, causing 500 errors instead of proper validation responses. This violates the project's default-deny auth principle and creates poor developer experience.

## 2. Affected Components

- `apps/gate/src/app/api/route.ts` - Gateway API routes
- `apps/headquarter/src/app/api/route.ts` - Headquarter API routes
- Shared validation logic in `packages/ui/src/`

## 3. Root Cause

Missing Zod schema validation on incoming request bodies. Some routes use minimal validation or none at all, allowing malformed requests to reach the business logic layer.

## 4. Acceptance Criteria

1. All POST/PUT endpoints in `apps/gate/` and `apps/headquarter/` use Zod schema validation
2. Invalid requests return 400 with descriptive error messages instead of 500
3. Validation errors follow the format: `{"error": "validation failed", "details": [...]}`
4. All existing tests pass with `pnpm typecheck`
5. No TypeScript errors introduced

## 5. Implementation Plan

- [ ] Audit all API routes in `apps/gate/` and `apps/headquarter/`
- [ ] Create Zod schemas for each endpoint's required parameters
- [ ] Add middleware that validates requests using the schemas
- [ ] Return proper 400 errors on validation failure
- [ ] Update unit tests to cover validation scenarios
- [ ] Run full gate build: `pnpm gate:build`