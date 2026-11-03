---
title: "IR Translation Phase 3: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T04:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 31
parent_issue: 29
---

# RULES: IR Translation Phase 3 — PGlite SQL Lowerer & Query Planner

## 1. Architectural Invariants
- **Zero Raw Injection**: Under no circumstance may raw string concatenation be used to compose SQL text. All variables MUST be isolated into parameterized query arrays (`$1, $2, ...`).
- **Strict Tenancy Invariant**: Every query emitted by the lowerer MUST contain an explicit predicate filtering by `company_id`. Queries lacking tenant context are rejected with a fatal error.
- **Embedded PGlite Exclusive**: All generated queries MUST be targeting the embedded PGlite instance. External ORMs or database drivers are forbidden.

## 2. Security Boundaries & Forbidden Operations
- Structural DDL operations (`DROP`, `ALTER`, `CREATE`, `TRUNCATE`) are strictly forbidden.
- Query timeouts are capped at 5,000ms to eliminate runaway queries or locks.
- Result sets default to a ceiling of 500 rows unless explicit pagination is supplied.

## 3. Auditing & Compliance
- Every mutation query plan must compute a SHA-256 hash of its parameter array and record it into `CHRONICLE`.

