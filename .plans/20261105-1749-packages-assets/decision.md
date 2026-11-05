# Decision: packages/assets

## Chosen approach (operator-approved)
Auto-sync. Canonical files live only in `packages/assets`; a build-time script
copies each app's subset into `apps/*/public`. The copies are gitignored and
removed from the index. This was chosen over module imports because every asset
reference in this repo is a runtime public string path (registry, OG images,
favicon factory) and the `assets.test.ts` contract reads files off disk.

## Fonts included
The operator confirmed real font binaries are in scope, not just a placeholder.
`woff2` + `woff` for Inter, Cormorant Garamond, and Cascadia Code (weight 400
normal) are vendored so `packages/ui/src/fonts/fonts.css` resolves actual files
instead of falling back to `local()`.

## Echo / standalone S3 dropped
The operator first asked for a self-built Node.js S3 service named "echo", then
reversed: they already run an S3 endpoint and will connect it later. No object
store, multipart upload, or storage service is built here. Connecting an external
S3 is a future workstream, out of scope for this package.

## Emblem drift preserved, not redesigned
Same `/brand/emblem.svg` path resolves to different bytes per app (dock 368B,
gate 489B, and six others). Canonicalizing per app keeps every pixel identical to
today. Silently picking one emblem for all would be an unrequested visual change,
so it is deferred to the owner with this report.

## Heroes stay as committed
The legacy rasterizer no longer reproduces the committed hero bytes (far smaller
output), so the committed PNGs are treated as authoritative and the generator is
retargeted but not run in the gates.
