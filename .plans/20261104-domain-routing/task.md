# Task Plan — Domain & Application Routing

Status legend: `[ ] pending` · `[~] in progress` · `[x] verified` · `[!] blocked`

## A. Baseline and inventory
- [ ] DR-001 Verify repository, current branch and HEAD before any edit.
- [ ] DR-002 Inventory every `apps/*` directory and package manifest.
- [ ] DR-003 Inventory root Compose services and published ports.
- [ ] DR-004 Inventory actual route trees for GATE, DOCK, ID, HEADQUARTER and JIZZ.
- [ ] DR-005 Inventory route-level authentication and authorization requirements.
- [ ] DR-006 Inventory backend domains/addons and identify their owning app.
- [ ] DR-007 Reconcile current app inventory against BLUEPRINT and README.
- [ ] DR-008 Record existing host/domain references across docs, env examples and proxy config.
- [ ] DR-009 Verify no DNS/proxy/TLS state is inferred from source documentation.
- [ ] DR-010 Publish an evidence-based app/domain inventory report.

## B. Domain and product canon
- [ ] DR-011 Define the three apex domains and their public identities.
- [ ] DR-012 Define GATE as the A-L-L-A-H.COM apex destination.
- [ ] DR-013 Define DOCK as the initial MoonWitness.biz.id destination.
- [ ] DR-014 Define E-ISP.ID as the ISP commercial identity and GATE-hosted initial public destination.
- [ ] DR-015 Define short subdomain vocabulary: dock, hq, id, jizz, sky, my, ops, api, status.
- [ ] DR-016 Define canonical-host and alias-redirect rules.
- [ ] DR-017 Define route ownership for public, authenticated, operator and private services.
- [ ] DR-018 Resolve GATE-vs-DOCK duplicate homepage wording.
- [ ] DR-019 Resolve MoonWitness editorial ownership versus DOCK discovery.
- [ ] DR-020 Resolve E-ISP marketing, customer and operator journeys.
- [ ] DR-021 Validate proposed map against accepted D-001, D-003, D-007, D-008, D-011.
- [ ] DR-022 Record unresolved trade-offs in conflict.md; do not silently promote proposals to ADRs.

## C. Existing application routing contracts
- [ ] DR-023 Define GATE root navigation and ecosystem destination links.
- [ ] DR-024 Define DOCK discovery/community/content route boundaries.
- [ ] DR-025 Define ID callback, cookie/session and SSO host contract.
- [ ] DR-026 Define HEADQUARTER authenticated-only host and role gates.
- [ ] DR-027 Define WORKS operator routes under HEADQUARTER /isp.
- [ ] DR-028 Define JIZZ public read-only routes and source provenance.
- [ ] DR-029 Define ARSY API ingress as private/reserved until security review.
- [ ] DR-030 Define SENTINEL as private UDP service, never a browser destination.
- [ ] DR-031 Define MOONSKY deep-link and independent-console contract from D-011.
- [ ] DR-032 Define safe not-found, unavailable and unauthorized behavior for every host.

## D. E-ISP customer journey
- [ ] DR-033 Define E-ISP landing-page information architecture.
- [ ] DR-034 Define package/coverage discovery without exposing internal network topology.
- [ ] DR-035 Define customer sign-in handoff to ID.
- [ ] DR-036 Define HARBOR self-service entry and customer ownership checks.
- [ ] DR-037 Define customer-visible service status, plan and invoice read models.
- [ ] DR-038 Define WORKS operator entry through ops.e-isp.id/isp.
- [ ] DR-039 Ensure subscriber credentials remain separate from ecosystem ID credentials.
- [ ] DR-040 Define support/contact escalation without inventing unimplemented channels.

## E. Missing application coverage
- [ ] DR-041 Verify MOONSKY app absence in current tree and reconcile D-011 / issues #22 and #27.
- [ ] DR-042 Split MOONSKY integration into independently testable source, runtime, persistence, API, UI and ops tasks.
- [ ] DR-043 Audit MoonWitness story, archive, research and provenance routes in GATE and DOCK.
- [ ] DR-044 Define MoonWitness content taxonomy and evidence/provenance distinctions.
- [ ] DR-045 Decide whether DOCK can own editorial publishing without coupling discovery and authoring.
- [ ] DR-046 If separation is proven, write a dedicated MoonWitness app spec; do not scaffold before approval.
- [ ] DR-047 Verify HARBOR route coverage and identify only missing customer workflows.
- [ ] DR-048 Verify WORKS operator route coverage and identify only missing workflows.
- [ ] DR-049 Review HELIOGRID, MOONLAB, SHADOW, ORBIT and COCKPIT as modules before standalone app proposals.
- [ ] DR-050 Produce a build/extend/defer decision for each product domain.

## F. Documentation reconciliation
- [ ] DR-051 Update BLUEPRINT app inventory to include GATE and correct current app list.
- [ ] DR-052 Update README app inventory, ports and service list.
- [ ] DR-053 Update README development commands to match current manifests.
- [ ] DR-054 Update DECISIONS only for decisions explicitly accepted; proposals stay in BACKLOG.
- [ ] DR-055 Update BACKLOG with missing app coverage and dependencies.
- [ ] DR-056 Update DESIGN with domain-to-experience and skin mapping where needed.
- [ ] DR-057 Check all docs for stale four-app wording and generic homepage duplication.
- [ ] DR-058 Run documentation contract and link checks.

## G. Implementation readiness and verification
- [ ] DR-059 Produce route-to-host mapping table with exact source paths.
- [ ] DR-060 Produce auth/session matrix for apex and subdomains.
- [ ] DR-061 Produce redirect/canonical URL test cases.
- [ ] DR-062 Produce CORS, cookie-domain and callback-origin test cases.
- [ ] DR-063 Produce security review checklist for public/private ingress.
- [ ] DR-064 Verify no app is described as implemented solely because a plan or issue exists.
- [ ] DR-065 Run relevant lint, typecheck, tests, builds and docs checks after implementation.
- [ ] DR-066 Record exact commands, outcomes, baseline SHA and changed paths.
- [ ] DR-067 Create GitHub issues only after this plan is reviewed and task dependencies are stable.
- [ ] DR-068 Create one master issue and small child issues with one independently verifiable outcome each.
- [ ] DR-069 Keep each child issue small enough for one focused coding-agent session.
- [ ] DR-070 Verify all issue bodies link back to this plan and contain acceptance criteria.

## Execution rule

Do not execute DNS/proxy/TLS/deployment tasks in this plan. Do not create GitHub issues in this phase. First finish DR-001 through DR-066, review conflicts and acceptance criteria, then prepare issue decomposition as DR-067 through DR-070.
