# Menu quick-action row padding

Date: 2026-11-08

## Source and diagnosis

Read-only geometry was decoded from the locally supplied
`lenso-apple-ios-ipados27-source-20261027.fig`.
SHA-256: `6577bbc12e8b5006db277f1dc9f69ab372656c6c7314919769245f2f53e885b0`.
No design file was modified. This pass uses its layout data, not a fresh native
phone measurement or a new render of the design file.

The Quick Actions frame `5511:46790` has 10px leading/trailing padding, 6px
spacing and 56px height. The 250px example frames `12740:23897` and
`12740:24187` carry the same values; their three actions are about 72.667px wide.
Action instances have 6px block/4px inline padding, a 5px icon-label gap and
20px corners. The standalone action master is 57px high while its example
instances are 56px; this correction retains the example's existing 56px row.

The browser reproduction used the exact Chinese Default example and the actual
PhotosViewerMenu component with inert fixture callbacks. The Default popup was
250px wide, but its action group was 246px wide with only 2px from the first/last
action to the popup boundary. This came from a retained `margin-inline: -6px`
combined with the current content wrapper's 8px padding. The per-action 6px/4px
padding was already correct. The geometry assertion failed before the fix.

## Correction

The shared action group now cancels its inherited content-wrapper inline padding
and applies its own 10px inline padding. This preserves the source's full-width
Quick Actions frame, 6px gaps and evenly divided actions. It is independent of
the ordinary vertical row's inline padding. No material, animation, activation,
selection or primitive source changed.

## Verification

The maintained `apps/docs/test/menu-action-group.mjs` checks both real consumers
in Chromium and WebKit at 1440px and 390px. It measures the first/last action's
actual popup-relative inset, action height, internal padding and inter-item gap.
It also exercises keyboard activation, the fixture's observable action result
and focus restoration after the close completes.

All four engine/viewport cases pass for both consumers. Chromium measures
10px on each side; WebKit measures 10px/9.984375px because three equal columns
round to fractional CSS pixels. Each 250px popup now has approximately 72.667px
columns instead of 78px columns.

The existing four-case ordinary Menu/Select ink, spacing, focus and re-entry suite
also passes. Affected format/lint, the eight-task package build/type graph, docs
typecheck, installed-consumer exports/types/SSR/assets check and contract generation
pass. The generation round-trip covers 218 documents, 1,240 example graphs and
92 style maps. Preview readiness was verified on port 4337 after the build.

The source subset, red/green measurements and screenshots are retained in
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/menu-action-group-padding/`.
