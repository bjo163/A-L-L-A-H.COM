# Conflicts, Assumptions & Decisions Required

## C-01 — GATE vs DOCK public homepage
- Evidence: BLUEPRINT labels DOCK as public ecosystem homepage; GATE has a separate Empire Gateway plan and app directory.
- Resolution proposal: GATE owns `a-l-l-a-h.com`; DOCK owns MoonWitness public discovery at `moonwitness.biz.id`.
- Status: PROPOSED; requires canonical documentation alignment and route verification.

## C-02 — MoonWitness editorial ownership
- Evidence: MoonWitness is the canonical story/knowledge identity, but no dedicated `apps/moonwitness` directory appears in the current app inventory. GATE has content-oriented routes; DOCK is the public discovery homepage.
- Resolution proposal: DOCK owns the initial public MoonWitness entry and discovery. Audit actual content authoring/archive capabilities before deciding whether to create `apps/moonwitness`.
- Status: OPEN; do not scaffold the app yet.

## C-03 — E-ISP public frontend
- Evidence: E-ISP.ID is an owned domain, but no dedicated E-ISP app exists in `apps/*`.
- Resolution proposal: use GATE's E-ISP-branded `/connectivity` route as the initial public destination; Headquarter `/isp` for operators; a scoped HARBOR route for subscribers.
- Status: PROPOSED; verify route feasibility and content requirements.

## C-04 — HARBOR placement
- Evidence: HARBOR plan permits Dock/account integration; no `apps/harbor` directory exists.
- Resolution proposal: keep HARBOR as a customer portal experience, not a standalone app initially.
- Status: PROPOSED; confirm ownership and routes against issue #15.

## C-05 — WORKS placement
- Evidence: WORKS plan targets Headquarter `/isp`; no standalone `apps/works` directory exists.
- Resolution proposal: keep WORKS operator UI within Headquarter.
- Status: PROPOSED; verify issue #14 and actual source.

## C-06 — MOONSKY missing runtime
- Evidence: D-011 and issue #22 accept `apps/moonsky`, but it is absent from current `apps/*` tree.
- Resolution proposal: integrate MOONSKY as the next dedicated app/runtime; only then route `sky.a-l-l-a-h.com`.
- Status: ACCEPTED architecture, implementation pending.

## C-07 — E-ISP apex canonical route
- E-ISP is a separate registrable domain; cross-domain cookies cannot be assumed.
- SSO must use a deliberate redirect/OIDC-style handoff or the existing verified SSO contract. Never set a broad cookie domain across unrelated domains.
- Status: OPEN pending auth contract review.

## C-08 — DNS and deployment
- No registrar, DNS zone, reverse proxy or production host state was checked in this plan.
- Status: OUT OF SCOPE. Requires separate authorization and operational verification.
