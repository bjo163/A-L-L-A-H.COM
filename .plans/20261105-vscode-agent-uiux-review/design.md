# Design decisions

- **One agent surface:** the local Workspace Agent owns the primary coding
  workflow. The old swarm panel is not discoverable because it uses a separate
  remote interaction model and duplicates intent entry.
- **Status as orientation:** the status bar says `Workspace Agent` and
  `offline-first`, because local file and plan workflows do not require a
  gateway. It remains a compact entry point rather than a health dashboard.
- **No decorative treatment:** existing VS Code theme tokens, visible focus,
  state text, and section hierarchy carry the UI. This preserves editor context
  in light and dark themes.
