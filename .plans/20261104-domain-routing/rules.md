# Rules — Domain & App Routing

1. Inspect the live `dev` branch and actual source before every implementation batch.
2. No new branches. No changes to `main` or frozen historical repositories.
3. No DNS, registrar, reverse-proxy, TLS, production deployment, release or production-data changes under this plan.
4. Never infer that a route exists because it appears in a plan, issue, README or domain table.
5. Distinguish `EXISTS`, `PLANNED`, `PROPOSED`, `DEFERRED` and `PRIVATE` explicitly.
6. No duplicate homepage, identity authority, billing authority, customer portal or operator control plane.
7. GATE and DOCK must have non-overlapping user journeys.
8. ARSY owns ecosystem identity, tenant and authorization. MOONSKY is the accepted independent communication runtime but not a second identity provider.
9. HARBOR is a customer experience; WORKS owns commercial lifecycle; SENTINEL owns network AAA execution.
10. Use `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui` and established auth/session patterns; do not invent parallel clients or design systems.
11. Every route requires loading, empty, error, unauthorized, unavailable and not-found states where applicable.
12. Every public data surface must preserve source attribution and avoid leaking tenant/private network data.
13. Cookie, callback, CORS and redirect behavior must be tested across different registrable domains.
14. Use canonical redirects only after SSO/session implications are understood.
15. A new app requires a written separation case: distinct users, workflows, permissions, runtime or release lifecycle.
16. Do not create apps solely to give a product name a folder.
17. Each implementation task should change one bounded concern and include exact acceptance tests.
18. No mock metrics, fake actions, empty placeholder pages or claims of production readiness.
19. Update plan checkboxes and report evidence after each task group.
20. GitHub issues are created only after the plan is reviewed and decomposition is stable.
