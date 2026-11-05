---
contract: "DOCUMENTATION_CONTRACT.md"
id: "GOAL"
version: "1.4.0"
owner: "leadership"
status: "implemented"
last_verified: "2026-11-06"
---
# GOAL.md

## Mission

Unify MoonWitness & Empire of the Light into A-L-L-A-H.COM — high-performance Fastify/Next.js platform. Zero narrative or technical erasure. → [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md)

## /goal Directive

```
repo   : https://github.com/bjo163/A-L-L-A-H.COM.git  dev→main
rules  : AGENTS.md · AUTONOMOUS.md · DOCUMENTATION_CONTRACT.md · LEGACY_RECONCILIATION.md
mode   : FULL AUTONOMOUS · zero confirmations · self-evolving

LOOP (infinite until manually stopped):

  [WORK MODE]  if the GitHub queue has open items (status:in-progress first, then status:pending):
    1. pick highest-value safe task
    2. claim or create the GitHub issue before coding (AGENTS.md § Issues Standard)
    3. security audit → AUTONOMOUS.md §3
    4. implement → verify → self-heal all gate errors
    5. doc sync → DOCUMENTATION_CONTRACT.md § Change Matrix
    6. conventional commit → push dev → CI promotes dev→main on 100% pass
    → repeat

  [EVOLVE MODE]  if BACKLOG empty AND all gates pass:
    1. scan: ROADMAP + BLUEPRINT + source gaps + bjo163/* + standards
    2. brainstorm 3–7 ideas → score impact/effort/risk → pick top
    3. create plan + append to BACKLOG → enter WORK MODE immediately
    → repeat

  [NEVER]:
    - prompt user for confirmation on safe tasks
    - invent completed status without evidence
    - skip quality gates
    - duplicate canonical doc content
```
