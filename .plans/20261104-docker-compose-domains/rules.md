---
title: "Docker Compose .env Configuration for Coolify Deployment"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Rules

## Domain Mapping Rules

1. **One canonical destination per app**: Each application has exactly one canonical domain destination. No overlapping ownership.

2. **Apex domains are primary**: `a-l-l-a-h.com`, `moonwitness.biz.id` are the short public addresses. Do not introduce long vanity subdomains as primary URLs.

3. **Cross-app origins must be set**: `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` must be set to the base domain for inter-app navigation.

4. **Subdomain aliases must redirect**: Short subdomain aliases (e.g., `dock.a-l-l-a-h.com`) must redirect to their canonical host using permanent redirect where safe. Do not serve duplicate content on both apex and alias hosts.

5. **Required secrets must be provided**: `JWT_SECRET` and `ARSY_MASTER_KEY` must be set identically across arsy and sentinel services. No insecure defaults.

6. **Port mapping consistency**: Docker Compose service ports must match the external port configuration in Coolify.

## Coolify Deployment Rules

7. **Secrets via Coolify UI**: `JWT_SECRET` and `ARSY_MASTER_KEY` should be set in the Coolify dashboard, not hardcoded in `.env` committed to the repository.

8. **Domain configuration in Coolify**: Custom domains (e.g., `moonwitness.biz.id`) must be configured in Coolify's domain settings for each service.

9. **No production DNS changes by this plan**: DNS, certificates, and reverse proxy configuration require separate authorization and deployment planning.

10. **Health check preservation**: Sentinel service healthcheck at `/health` endpoint must not be modified or removed.

## Documentation Rules

11. **Plan artifacts required**: Every plan directory must contain `spec.md`, `task.md`, `design.md`, and `rules.md` as per the Documentation Contract.

12. **Change Matrix**: Any modification to existing plan templates must be recorded in the plan's change matrix.

13. **Antislop conformance**: All plan files must pass antislop code comment hygiene checks.