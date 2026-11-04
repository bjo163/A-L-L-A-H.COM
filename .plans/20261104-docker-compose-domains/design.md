---
title: "Docker Compose .env Configuration for Coolify Deployment"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Design

## Domain Mapping Design

Based on the A-L-L-A.H.COM domain routing architecture (plan `20261104-domain-routing`):

### Primary Domain Mapping

| Variable | Target Domain | App Service | Port |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://a-l-l-a-h.com:5150` | arsy (API) | 5150 |
| `NEXT_PUBLIC_DOCK_URL` | `http://moonwitness.biz.id` | dock | 3001 |
| `NEXT_PUBLIC_HEADQUARTER_URL` | `http://hq.a-l-l-a-h.com` | headquarter | 3002 |
| `NEXT_PUBLIC_ID_URL` | `http://id.a-l-l-a-h.com` | id | 3003 |
| `NEXT_PUBLIC_JIZZ_URL` | `http://jizz.a-l-l-a-h.com` | jizz | 3004 |

### Cross-App Ecosystem Design

- `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` serves as the base origin for all inter-app navigation
- Each `NEXT_PUBLIC_*_URL` variable provides the canonical destination for its respective app
- Domain aliases (e.g., `dock.a-l-l-a-h.com`) redirect to canonical hosts (`moonwitness.biz.id`)
- No long vanity subdomains as primary URLs per the "short hostname" rule

### Secret Design

- `JWT_SECRET` and `ARSY_MASTER_KEY` must be identical across arsy and sentinel services
- These values are injected via Coolify environment variables (no defaults in docker-compose.yml)
- Required for production deployment; unset values cause service startup failure

### Coolify Integration Design

- Environment variables from `.env` are passed to Docker Compose services
- Coolify domain settings must map external hostnames to service ports
- Health checks configured per service (sentinel has HTTP healthcheck at `/health`)
- Port mappings: arsy(5150), gate(3000), dock(3001), headquarter(3002), id(3003), jizz(3004), sentinel(1812/1813/9181 UDP)