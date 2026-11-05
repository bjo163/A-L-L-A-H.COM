# Project Governance

This document describes the governance model, ownership, and contribution process
for the A-L-L-A-H.COM project.

## Maintainers

A-L-L-A-H.COM is currently maintained by a single principal maintainer:

| Role | Handle | Responsibility |
| ---- | ------ | -------------- |
| Principal Maintainer | [@bjo163](https://github.com/bjo163) | Final decision authority, release management, architecture |

## Architecture Ownership

| Domain | Owner | Path |
| ------ | ----- | ---- |
| Public Entrance (GATE) | @bjo163 | `apps/gate/` |
| Community Harbor (Dock) | @bjo163 | `apps/dock/` |
| Command Center (Headquarter) | @bjo163 | `apps/headquarter/` |
| Identity & SSO | @bjo163 | `apps/id/` |
| World Observatory | @bjo163 | `apps/jizz/` |
| Backend Hub (ARSY) | @bjo163 | `apps/arsy/` |
| Sentinel RADIUS | @bjo163 | `apps/sentinel/` |
| Shared UI | @bjo163 | `packages/ui/` |
| Shared SDK | @bjo163 | `packages/sdk/` |
| Shared Types | @bjo163 | `packages/types/` |
| Architecture Lint | @bjo163 | `packages/lint/` |

## Decision-Making

1. **Day-to-day changes**: Committed directly to `dev` following `AUTONOMOUS.md`.
2. **Architecture changes**: Require an updated `BLUEPRINT.md` / `DECISIONS.md` entry.
3. **Breaking changes**: Require an accepted GitHub work item (AGENTS.md § Issues Standard) before implementation.
4. **Production releases**: Gate through the GitHub Actions pipeline (dev → main promotion).

## Contribution Model

This repository operates in **autonomous mode** per `AUTONOMOUS.md`. The autonomous
agent (or a human acting as agent) discovers work, plans, implements, verifies, and
documents changes continuously. Human intervention is required for:

- Irreversible external operations (deploys, DNS, releases to users)
- Security-sensitive changes
- Strategic direction decisions

## Versioning & Releases

- **Branching**: `dev` (development) → `main` (production)
- **Release cadence**: On-demand, gated by CI
- **Versioning**: Semantic Versioning (semver) via GitHub releases
- **Changelog**: Maintained in `CHANGELOG.md`

## Community

- **Code of Conduct**: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security**: [SECURITY.md](SECURITY.md)

## Contact

For project coordination, security, or governance matters, reach the maintainer
via a private GitHub Security Advisory (recommended) or by tagging @bjo163.
