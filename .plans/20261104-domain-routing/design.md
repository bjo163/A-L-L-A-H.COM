# Design — Host Routing and Experience Ownership

## Canonical public map

```text
a-l-l-a-h.com          -> apps/gate
moonwitness.biz.id     -> apps/dock (initial host; content discovery)
e-isp.id               -> apps/gate /connectivity (initial public site)

dock.a-l-l-a-h.com     -> apps/dock (alias)
hq.a-l-l-a-h.com       -> apps/headquarter
id.a-l-l-a-h.com       -> apps/id
jizz.a-l-l-a-h.com     -> apps/jizz
sky.a-l-l-a-h.com      -> apps/moonsky (planned; D-011)
my.e-isp.id            -> HARBOR route (planned; DOCK/ID integration)
ops.e-isp.id           -> apps/headquarter /isp
api.a-l-l-a-h.com      -> apps/arsy (reserved/private until security approval)
status.e-isp.id        -> WATCHTOWER public projection (deferred)
```

## App ownership matrix

| Surface | Public/authenticated | Owns | Must not own |
|---|---|---|---|
| GATE | Public | Empire identity, overview, routing | Community feed, account records, operations |
| DOCK | Public + signed-in community | Discovery, content discovery, community entry | Empire corporate gateway, ISP billing authority |
| MoonWitness editorial | Public + author roles; proposed | Canonical stories, chronicles, research, archive provenance | Community identity, ISP workflows |
| ID | Authentication | Login, registration, SSO, sessions | ISP subscriber credentials, provider sessions |
| HEADQUARTER | Authenticated operators | Governance, admin, WORKS operator workflows | Customer portal, MOONSKY inbox |
| HARBOR | Authenticated subscribers; planned | Own service, plan, usage, invoices, support entry | Billing ledger, RADIUS policy authority |
| MOONSKY Console | Authenticated operators; planned | Conversations, channels, provider sessions, delivery | Identity/tenant authority |
| JIZZ | Public read-only | World observations and sourced perspectives | Editorial canon, unsupported claims |
| ARSY | Private backend | Identity/tenant/authz/business API | Public website experience |
| SENTINEL | Private network runtime | RADIUS AAA and access execution | Browser UI, invoice lifecycle |

## Routing behavior

- Apex domains are canonical; short subdomains are named entry points, not separate brands.
- `dock.a-l-l-a-h.com` redirects to `moonwitness.biz.id` after canonical host and cookie implications are tested.
- `ops.e-isp.id` routes to the Headquarter ISP operator surface; it must enforce operator roles.
- `my.e-isp.id` is subscriber-only and must enforce subscriber-to-account ownership server-side.
- `api.a-l-l-a-h.com` is reserved and must not become public until authentication, authorization, rate limiting, CORS, TLS, observability and ingress policy pass review.
- Do not use wildcard cookie scope across all three apex domains. Use explicit trusted origins and a deliberate cross-domain SSO flow.
- No host may trust tenant, user, subscriber or resource identifiers supplied by the browser without server-side authorization.
