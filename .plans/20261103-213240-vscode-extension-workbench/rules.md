---
title: "Rules: Extension Workbench Invariants"
plan: "20261103-213240-vscode-extension-workbench"
---

# Invariants and Boundary Rules

- Preserve unrelated staged, unstaged, and untracked work. Do not reset, revert, commit, or push.
- Keep task state as pending, in-progress, or completed; never collapse it to a boolean.
- Before writing a task line, verify its current source text still matches the tree snapshot.
- Preserve the file's line endings and all bytes outside the selected checkbox marker.
- Surface filesystem, network, response-validation, and cleanup errors explicitly.
- Do not create plan files from mock responses, malformed model output, or failed requests.
- Require the four canonical plan artifacts; do not require time, duration, or budget estimates.
- Treat the model catalog as gateway metadata, not proof of configured upstream providers.
- Do not log or display API keys, authorization headers, or other credentials.
- Keep changes within the extension, plan contract/checker, directly related documentation, and focused tests.
