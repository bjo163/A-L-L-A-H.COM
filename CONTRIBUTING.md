# Contributing to A-L-L-A-H.COM

Thank you for your interest in contributing! This document outlines the process and standards for contributing to the A-L-L-A-H.COM ecosystem.

## 🚀 Quick Start

### Prerequisites

- Node.js 24+
- pnpm 12.16.1
- Docker (for local development with Compose)

### Setup

```bash
# Clone the repository
git clone https://github.com/bjo163/A-L-L-A-H.COM.git
cd A-L-L-A-H.COM

# Install dependencies
pnpm install --frozen-lockfile

# Start development servers (all apps)
pnpm dev

# Or start individual apps
pnpm dock:dev      # Port 3001
pnpm headquarter:dev  # Port 3002
pnpm id:dev        # Port 3003
pnpm jizz:dev      # Port 3004
pnpm gate:dev      # Port 3000
pnpm arsy:dev      # Port 5150
```

## 🏗️ Project Structure

```
A-L-L-A-H.COM/
├── apps/                    # Next.js applications
│   ├── gate/               # Public entrance (port 3000)
│   ├── dock/               # Community harbor (port 3001)
│   ├── headquarter/        # Command center (port 3002)
│   ├── id/                 # Identity & SSO (port 3003)
│   ├── jizz/               # World Observatory (port 3004)
│   ├── arsy/               # Backend hub (port 5150)
│   └── sentinel/           # RADIUS daemon
├── packages/               # Shared packages
│   ├── ui/                 # @moonwitness/ui - Design system
│   ├── sdk/                # @allah/sdk - Client communication
│   ├── types/              # @moonwitness/types - Shared contracts
│   ├── lint/               # @moonwitness/lint - Architecture rules
│   ├── arsy-orm/           # @allah/arsy-orm - PGlite ORM
│   └── arsy-plugin-*/      # ARSY plugins
├── addons/                 # ARSY addons
├── .github/                # GitHub workflows, templates
├── docs/                   # Documentation
└── .plans/                 # Implementation plans
```

## 📋 Development Workflow

### 1. Create an Issue First

Before starting work, create or claim an issue:
- Use the appropriate issue template
- Describe the problem/feature clearly
- Link related issues/PRs

### 2. Branch Naming

```bash
# Feature
git checkout -b feat/issue-123-short-description

# Bug fix
git checkout -b fix/issue-123-short-description

# Chore/maintenance
git checkout -b chore/short-description

# Documentation
git checkout -b docs/short-description
```

### 3. Development Standards

#### Code Style

- **TypeScript strict mode** - No `any` without justification
- **UI Components** - Use `@moonwitness/ui` only (no raw `<button>`, `<input>`, `<a>`, etc.)
- **API Calls** - Use `@allah/sdk` only (no direct `fetch`)
- **Shared Types** - Import from `@moonwitness/types` (no local redefinitions)
- **Antislop** - Follow `antislop`, `antislop-ui`, `antislop-human`, `antislop-code` rules

#### Architecture Rules

- **UI Purity** - Raw HTML controls forbidden in apps (enforced by `@moonwitness/lint`)
- **Universal SDK** - All client-server communication via `@allah/sdk`
- **Shared Types** - No local redefinition of shared entities
- **Single ORM** - Only `@allah/arsy-orm` (embedded PGlite)

### 4. Quality Gates (Must Pass)

Before pushing, ensure all gates pass:

```bash
# TypeScript strict type-check
pnpm typecheck

# Architecture lint
pnpm lint:arch

# Documentation contract
pnpm docs:check

# Build affected apps
pnpm --filter @moonwitness/<app> build
```

**All gates must pass** before PR can be merged.

### 5. Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`

Examples:
```
feat(gate): add hero arrival animation
fix(ui): resolve button focus outline issue
chore(deps): update next.js to 16.4.3
docs: update GATE architecture documentation
```

## 🔄 Pull Request Process

### 1. Open PR

- Use the PR template
- Link related issues
- Add appropriate labels
- Request review from @bjo163

### 2. CI Checks

All checks must pass:
- ✅ TypeScript type-check
- ✅ Architecture lint (@moonwitness/lint)
- ✅ ESLint
- ✅ Documentation contract
- ✅ Build (all affected apps)

### 3. Review

- At least 1 approval required (from CODEOWNERS)
- All conversations resolved
- No merge conflicts

### 3. Merge

- Squash and merge preferred
- Delete branch after merge
- CI will re-run on merge

## 🎨 Design System

### IMPERIUM LUMEN (Gate, Dock)

- Skin: `imperium-lumen`
- Palette: Obsidian, Antique Gold, Warm Ivory
- Typography: Georgia/Serif display, Arial body, Courier New mono

### LUNAR CHRONICLES (ID)

- Skin: `lunar-chronicles`
- Palette: Deep indigo, Observatory alignment

### NEXUS PARADOX (Headquarter)

- Skin: `nexus-paradox`
- Palette: Instrument planes, clipped coordinates

### MYCELIUM (Jizz)

- Skin: `mycelium`
- Palette: Connected organic surfaces

### Shared Components

Always use `@moonwitness/ui`:
- `Button`, `Link`, `Card`, `Input`, `Select`, `Textarea`
- `Form`, `FormField`, `Dialog`, `Table`, `Avatar`, `Badge`
- `EcosystemNavbar`, `SkinRoot`, `MotionFrame`
- Primitives: `RawContainer`, `RawStack`, `RawGrid`, `RawCluster`

## 📚 Documentation

- Update relevant docs with code changes
- Follow `DOCUMENTATION_CONTRACT.md`
- Update `CHANGELOG.md` for user-facing changes
- Keep `README.md` files current

## 🔒 Security

- Never commit secrets, tokens, or credentials
- Use `.env.example` for environment variables
- Report security issues privately to @bjo163

## 🤝 Community

- Be respectful and constructive
- Follow the project's values
- Help others learn and contribute

## 📞 Support

- Create an issue for bugs/features
- Tag @bjo163 for urgent matters
- Check existing issues before creating new ones

---

**Thank you for contributing to A-L-L-A-H.COM!** 🌙
