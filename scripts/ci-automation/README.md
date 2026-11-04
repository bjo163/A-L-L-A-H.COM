# CI Monitor & Auto-Fix Automation

Automated monitoring and fixing of GitHub Actions CI failures for A-L-L-A-H.COM.

## Features

- **Monitors** GitHub Actions runs on `dev` branch every 10 minutes
- **Analyzes** failures and categorizes them (TypeScript, Lint, Build, Docs)
- **Auto-fixes** common patterns:
  - TypeScript implicit any, missing imports
  - Lint errors (via `pnpm lint:fix`)
  - Build errors (retry with clean)
  - Documentation check errors
- **Commits & Pushes** fixes automatically with descriptive messages
- **Skips CI** on auto-fix commits to prevent infinite loops (`[skip ci]`)

## Quick Start

### Local Development

```bash
# One-time check
pnpm --filter ci-automation monitor:check

# Run as daemon (every 10 minutes)
pnpm --filter ci-automation monitor:daemon
```

### GitHub Actions (Automatic)

The workflow `.github/workflows/ci-monitor.yml` runs automatically:
- **Every 10 minutes** via cron schedule
- **On every push to dev** (quick health check)
- **Manual trigger** via Actions tab

## Configuration

### Required Secrets

| Secret | Description |
|--------|-------------|
| `GH_TOKEN` | GitHub Personal Access Token with `repo` scope (read/write) |

Add in: Settings → Secrets and variables → Actions → New repository secret

### Environment Variables

| Variable | Description |
|--------|-------------|
| `REPO_OWNER` | GitHub owner (default: `bjo163`) |
| `REPO_NAME` | Repository name (default: `A-L-L-A-H.COM`) |
| `BRANCH` | Branch to monitor (default: `dev`) |
| `CHECK_INTERVAL` | Check interval in ms (default: 600000 = 10 min) |

## Auto-Fix Capabilities

| Failure Type | Detection | Auto-Fix Method |
|--------------|-----------|-----------------|
| **TypeScript** | `tsc --noEmit` failures | `pnpm lint:fix`, type annotation hints |
| **Lint** | `pnpm lint:arch` failures | `pnpm lint:fix` |
| **Build** | Next.js build failures | Clean rebuild, dependency check |
| **Docs** | `pnpm docs:check` failures | Frontmatter fixes, link fixes |

## Commit Messages

Auto-fix commits use format:
```
fix: auto-fix typescript errors from CI

Auto-fixed by CI monitor
Original run: https://github.com/.../actions/runs/123456789
```

All auto-fix commits include `[skip ci]` to prevent infinite loops.

## Manual Usage

```bash
# Check once
node scripts/ci-automation/monitor.js --check

# Run as daemon locally
node scripts/ci-automation/monitor.js --daemon
```

## Architecture

```
scripts/ci-automation/
├── monitor.js          # Main monitoring logic
├── package.json        # Package config
└── README.md           # This file

.github/workflows/
└── ci-monitor.yml      # GitHub Actions workflow
```

## Safety Features

1. **Only fixes known patterns** - unknown failures require manual intervention
2. **Commits are atomic** - each fix type gets its own commit
3. **Skip CI tag** - prevents infinite auto-fix loops
4. **Max 1 fix per run** - prevents cascade failures
5. **Notifications** - warnings for unfixable failures (extendable to Slack/Discord)

## Extending

To add new auto-fix patterns:

1. Add detection logic in `analyzeFailure()`
2. Implement fix function (e.g., `fixNewPatternErrors()`)
3. Return `{ fixable: true, fixFn: async () => {...} }`

## Monitoring

Check workflow runs at:
`https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/ci-monitor.yml`

Logs show:
- Which run was analyzed
- What failures were detected
- What fixes were attempted
- Whether commits were pushed
