---
name: Pull Request Template
about: Standard PR template for A-L-L-A-H.COM
title: "[TYPE] Brief description"
labels: []
assignees: bjo163
---

## 📝 Description

Brief description of changes and motivation.

## 🔗 Related Issues

Closes #(issue number)
Related to #(issue number)

## 🧪 Type of Change

- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 💥 Breaking change
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring
- [ ] ⚡ Performance improvement
- [ ] 🧪 Test addition/update
- [ ] 🔧 Chore / Maintenance
- [ ] 📦 Dependency update

## ✅ Testing Checklist

- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed
- [ ] TypeScript types pass: `pnpm typecheck`
- [ ] Lint passes: `pnpm lint:arch`
- [ ] Build passes: `pnpm --filter @moonwitness/<app> build`

## 📱 Apps Affected

- [ ] @moonwitness/gate (port 3000)
- [ ] @moonwitness/dock (port 3001)
- [ ] @moonwitness/headquarter (port 3002)
- [ ] @moonwitness/id (port 3003)
- [ ] @moonwitness/jizz (port 3004)
- [ ] @allah/arsy (port 5150)
- [ ] @allah/sentinel (ports 1812/1813/9181)
- [ ] Shared packages (@moonwitness/ui, @allah/sdk, @moonwitness/types, @allah/arsy-orm, etc.)

## 📸 Screenshots / Demo (if UI changes)

| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

## 📋 Additional Notes

Any additional context, concerns, or decisions made during implementation.

## ✅ Pre-merge Checklist

- [ ] All CI checks pass
- [ ] Code follows project conventions (AGENTS.md, AUTONOMOUS.md)
- [ ] No raw HTML controls in apps (use @moonwitness/ui)
- [ ] No direct fetch in apps (use @allah/sdk)
- [ ] No local type redefinitions (use @moonwitness/types)
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated (if applicable)
- [ ] No secrets or sensitive data committed
