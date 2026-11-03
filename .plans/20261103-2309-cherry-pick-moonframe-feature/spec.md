---
status: blocked
---
# Cherry-Pick MoonFrame Feature to Local Dev

## Scope
Apply only the MoonFrame feature commits that are not already present on local `dev`.

## Requirements
- Preserve all existing staged, unstaged, and untracked work.
- Exclude merge commits that only synchronize `dev` into the feature branch.
- Apply feature commits in original order.

## Acceptance criteria
- The five feature commits are applied to local `dev` in order.
- Their documentation changes appear in the worktree history.
- Existing user changes remain intact and no cherry-pick is left in progress.
