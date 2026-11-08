# Safari submenu material ownership

The Menu documentation preview previously supplied a complete background only to
its root popup. Cascading submenus fell back to native panel paints on WebKit,
while Chromium could keep the fitted SVG backdrop. The two paths have different
tone transfer and clear-end behavior.

## Correction

- Resolve each popup through Base UI's `aria-controls` submenu chain to the
  registered example. Support shadow-root previews, portaled descendants and
  trigger links committed after the material ref. Reject unrelated and cyclic
  chains before capture.
- Preserve the complete page capture for every admitted child. Support the
  full-box, default-size repeating gradient masks used by ScrollShadow, so those
  masks do not silently reject a submenu capture.
- Use analytic optics where its material equations apply. At the clear end,
  retain the complete fitted SVG graph; WebKit applies it to owned source pixels
  rather than attempting an unsupported SVG backdrop filter.
- Hide the separately hoisted native panel paints while a complete snapshot is
  presented. Restore them on invalidation and cleanup.
- Do not invalidate a prepared material for an empty stylesheet. Real stylesheet
  changes still invalidate it. This also prevents automated WebKit's transient
  `body {}` inspection stylesheet from replacing the material during capture.

This does not make arbitrary native backdrops equivalent. The complete-input
contract remains explicit; unsupported or moving captures retain their existing
native fallback. This change makes no performance improvement claim.

## Verification

The maintained browser regression is `apps/docs/test/submenu-material.mjs`.
It opens the actual Menu documentation page with keyboard input in Chromium and
WebKit at 1440 × 1000, DPR 2, in both themes and at tint amounts 0, 0.5 and 1.
It checks root/child snapshot ownership, the resolved theme and preference,
restored keyboard focus, page errors and three interior RGB samples. Paired
samples must differ by at most 6 per channel. Snapshot existence alone does not
establish material parity, so the check also requires it after capture.

`apps/docs/test/menu-mask.mjs` checks 20 gradient alpha samples at DPR 1 and 2 in
each engine. DOM regressions cover nested ownership, shadow-root portals, late
links, fallback handoff, meaningful/empty stylesheet changes and scroll
invalidation. Menu toolbar, cascading motion and title regressions exercise
interaction contracts separately.

Automated WebKit in this environment does not reliably render native backdrop
filters in screenshots, even for a minimal blur. Native-fallback screenshot RGB
values are therefore not an authoritative Safari baseline. The comparable
browser matrix uses complete owned outputs. Actual Safari was also inspected
qualitatively during diagnosis; that inspection is not a final frame-by-frame or
pixel-parity receipt.

## Recorded result

All 12 browser states passed ownership, preference, focus and error checks.
Interior samples passed the existing tolerance of 6 per channel:

| Theme | Tint amount | Maximum paired RGB difference |
| ----- | ----------- | ----------------------------- |
| light | 0           | 1                             |
| light | 0.5         | 1                             |
| light | 1           | 1                             |
| dark  | 0           | 1                             |
| dark  | 0.5         | 0                             |
| dark  | 1           | 1                             |

Other completed checks: 10 material/ownership DOM tests, 7 menu interaction
regressions, 36 glass unit tests, both engines' gradient-mask checks, affected
format/lint/type checks, the 8-task package build, and the isolated installed
consumer check. Earlier build attempts encountered concurrent Swipe Actions type
errors; the final package build passed after that work was corrected separately.
No commit, landing, publication or whole-site production build was performed.
