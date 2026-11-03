---
title: "IR Translation Phase 3: Design Specification"
status: "proposed"
timestamp: "2026-11-04T04:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 31
parent_issue: 29
---

# DESIGN: IR Translation Phase 3 — PGlite SQL Lowerer & Query Planner

## 1. Query Translation Pipeline
```mermaid
sequenceDiagram
    autonumber
    actor Caller as Agent / Service
    participant Lowerer as SQLLowerer (/src/lowerers/sql.ts)
    participant Guard as Tenancy & Safety Guard
    participant ORM as Embedded PGlite ORM

    Caller->>Lowerer: lowerQuery(irNode, { company_id: 42 })
    Lowerer->>Guard: Analyze Query Nodes & Abstract Expressions
    Guard->>Guard: Enforce company_id = $1 predicate
    Guard-->>Lowerer: Verified Secure Query Plan
    Lowerer->>ORM: executeParameterized(sqlText, sqlParams)
    ORM-->>Caller: Structured Query Result Rows
```

## 2. Parameterized Output Contract
Input `MoonIRNode`:
```json
{
  "kind": "data_query",
  "name": "active_pppoe_sessions",
  "attributes": {
    "from": "sentinel_sessions",
    "where": {
      "status": "online",
      "download_bytes": { "$gt": 1048576 }
    },
    "limit": 50
  }
}
```

Generated Parameterized SQL:
```sql
SELECT * FROM sentinel_sessions 
WHERE company_id = $1 AND status = $2 AND download_bytes > $3 
LIMIT $4;
```
Parameters: `[42, "online", 1048576, 50]`

## 3. Defensive Safeguards
- SQL Syntax tree is compiled via structured builder rather than string templating.
- Automatic prevention of multi-statement injection (disallows `;` delimiters).

