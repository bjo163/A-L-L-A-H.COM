# Rules: Phase 4 Autonomous Cognitive Agent Loop & Generative SDUI

## 1. Safety Invariants & Execution Boundaries
1. **Loop Termination Guarantee**:
   - Every agent execution MUST have an absolute `max_steps` boundary (capped at 20; default is 8).
   - If an agent issues identical tool calls with identical parameters 3 times consecutively, the engine MUST force-terminate with `finish_reason: "loop_detected"`.
2. **SSRF Guard on Autonomous Web Actions**:
   - Any tool attempting HTTP requests (e.g. `web_fetch`) MUST validate URLs via `validateUrlSsrf`. Loopback, link-local, cloud metadata IP addresses (`169.254.169.254`), and private RFC 1918 subnets are forbidden.
3. **Database Read/Write Guard**:
   - `pglite_query` executed by the cognitive loop is strictly parameterized. No direct string interpolation into SQL queries.
   - Destructive statements (`DROP DATABASE`, `ALTER TABLE`, `TRUNCATE`) are blocked by execution guards unless explicit operator override is provided.
4. **Tenant Isolation**:
   - The agent operates strictly within the tenant context (`company_id`) derived from the API virtual key or session token. Cross-tenant leakage is strictly prevented.

## 2. Monorepo Architectural Invariants
1. **UI Purity**: All interactive controls in `apps/headquarter/src/app/agent/page.tsx` must import from `@moonwitness/ui`. No un-styled HTML buttons or inputs.
2. **Universal SDK Routing**: Frontend clients must trigger agent sessions exclusively via `@allah/sdk` (`sdk.agentRun` and `sdk.agentStream`).
3. **Documentation Integrity**: Any behavioral or schema modifications must be recorded in `DOCUMENTATION_CONTRACT.md`, `CHANGELOG.md`, `BACKLOG.md`, `QUALITY.md`, and `BLUEPRINT.md`.

