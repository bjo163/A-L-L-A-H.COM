# Cherry-Pick Blocker

The feature changes `BACKLOG.md` and `DESIGN.md`, which have local uncommitted edits. Git refused the cherry-pick before applying any commit; local `dev` remains at `1d90232effd1f13a4c38dceb08e61bba62c3bfd7`.

Choose how to proceed:

- [ ] User saves the overlapping edits in a commit or stash, then retry the five cherry-picks.
- [ ] Reconcile the feature's `BACKLOG.md` and `DESIGN.md` changes with the local edits manually.
- [ ] Stop; leave `dev` unchanged.
- [ ] Confirmed by User
