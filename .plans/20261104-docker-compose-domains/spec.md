---
title: "Docker Compose .env Configuration for Coolify Deployment"
status: "proposed"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Docker Compose .env Configuration for Coolify Deployment

## 1. Objective

Set up the `.env` file for Docker Compose deployment with Coolify, configuring domain routing based on the A-L-L-A.H.COM domain architecture (referencing issue #40). This configuration maps each application to its canonical destination domain.

## 2. Source-of-truth and constraints

- Repository: `bjo163/A-L-L-A-H.COM`, branch `dev`
- Based on domain routing architecture from plan `20261104-domain-routing`
- `.env` file is used by Docker Compose and Coolify for environment variable injection
- All domain mappings must follow the canonical destination mapping
- JWT_SECRET and ARSY_MASTER_KEY must be provided by Coolify environment (no defaults)

## 3. Domain Configuration

### 3.1 Primary apex domains

| Domain | Canonical Destination | Purpose |
|---|---|---|
| `a-l-l-a-h.com` | GATE — `apps/gate` | Main Empire gateway |
| `moonwitness.biz.id` | DOCK — `apps/dock` | Public discovery and MoonWitness content |
| `hq.a-l-l-a-h.com` | HEADQUARTER — `apps/headquarter` | Authenticated command center |
| `id.a-l-l-a-h.com` | MoonWitness ID — `apps/id` | Login, registration and SSO |
| `jizz.a-l-l-a-h.com` | WORLD OBSERVATORY / JIZZ — `apps/jizz` | Public phenomena and perspective observatory |

### 3.2 E-ISP related domains

| Domain | Canonical Destination | Purpose |
|---|---|---|
| `e-isp.id` | GATE-hosted route | Commercial connectivity brand |
| `my.e-isp.id` | HARBOR customer portal | Initially integrated with Dock/ID |
| `ops.e-isp.id` | HEADQUARTER `/isp` | ISP operator workspace |

### 3.3 Cross-app ecosystem origins

| Variable | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` | `http://a-l-l-a-h.com` | Base origin for cross-app navigation |
| `NEXT_PUBLIC_DOCK_URL` | `http://moonwitness.biz.id` | DOCK application URL |
| `NEXT_PUBLIC_HEADQUARTER_URL` | `http://hq.a-l-l-a-h.com` | HEADQUARTER application URL |
| `NEXT_PUBLIC_ID_URL` | `http://id.a-l-l-a-h.com` | ID application URL |
| `NEXT_PUBLIC_JIZZ_URL` | `http://jizz.a-l-l-a-h.com` | JIZZ/WORLD OBSERVATORY URL |
| `NEXT_PUBLIC_API_URL` | `http://a-l-l-a-h.com:5150` | API gateway URL |

## 4. Service Mapping

Each app service in docker-compose.yml maps to its domain:

| Service | Docker Internal Port | External Domain | Plan Reference |
|---|---|---|---|
| arsy | 5150 | `api.a-l-l-a-h.com` (reserved) | `20261104-domain-routing` |
| gate | 3000 | `a-l-l-a-h.com` | `20261104-domain-routing` |
| dock | 3001 | `moonwitness.biz.id` / `dock.a-l-l-a-h.com` | `20261104-domain-routing` |
| gate (empire) | 3000 | `a-l-l-a-h.com` | `20261104-domain-routing` |
| headquarter | 3002 | `hq.a-l-l-a-h.com` | `20261104-domain-routing` |
| id | 3003 | `id.a-l-l-a-h.com` | `20261104-domain-routing` |
| jizz | 3004 | `jizz.a-l-l-a-h.com` | `20261104-domain-routing` |
| sentinel | 1812/1813/9181 | Private network | `20261104-domain-routing` |

## 5. Required Environment Variables

Variables that **must** be set (via Coolify UI or `.env`):

```
# Required secrets - must match between arsy and sentinel
JWT_SECRET=your-jwt-secret-here
ARSY_MASTER_KEY=your-arsy-master-key-here

# Optional - set if custom domains are configured
# NEXT_PUBLIC_ECOSYSTEM_ORIGIN=http://a-l-l-a-h.com
# NEXT_PUBLIC_DOCK_URL=http://moonwitness.biz.id
# etc.
```

Variables with `${VAR:?...}` in docker-compose.yml (e.g., `JWT_SECRET`, `ARSY_MASTER_KEY`) **must** have values set; otherwise the services will fail to start.

## 6. Coolify Deployment Notes

- In Coolify, these environment variables are set per service
- JWT_SECRET and ARSY_MASTER_KEY must be identical across arsy and sentinel services
- Domain names (e.g., `moonwitness.biz.id`) must be configured in Coolify's domain settings if using custom domains
- For local Docker Compose development, the `.env` file provides default values
- Production deployment requires actual DNS pointing to the Coolify server

## 7. Definition of Done

- [x] `.env` file created with all domain mappings from issue #40 architecture
- [x] Domain routing follows the canonical mapping from `20261104-domain-routing` plan
- [x] All `NEXT_PUBLIC_*` variables set for cross-app navigation
- [x] Required secrets (JWT_SECRET, ARSY_MASTER_KEY) documented but not hardcoded
- [x] Plan file `.plans/20261104-docker-compose-domains/spec.md` created
- [ ] DNS configuration for custom domains (separate plan required)
- [ ] TLS/SSL certificate configuration (separate requirement)
- [ ] Coolify deployment verification (manual step)