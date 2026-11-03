# Design

## Git operation

Use sequential cherry-picks for the feature-only commits, preserving their original order and avoiding merge commits whose changes are already present on `dev`.

## Expected outcome

The local `dev` history gains the feature documentation commits. Existing local modifications and untracked files remain untouched.
