# Whole-panel Menu and Select closing

Date: 2026-11-08

## Cause and implementation

The previous opening follow-up replaced the opening geometry, but retained the
old text/Select closing table. Width contracted ahead of height and ended in an
attached droplet. Circular menus also retained a short-menu height adaptation
that unfolded extra rows through corner flattening. Reusing that dependency
on exit made tall panels lose width before losing their full height.

Closing now shares compact/tall physical capture profiles in `menu-curves.ts`.
Width, height and centre are sampled together, independently of roundness.
Monotone cubic interpolation avoids new extrema between measured knots. Final
panel aspect ratio selects the compact/tall blend, and the live source dimensions
adapt the destination back to the actual trigger. Both text and circular
Menu sources, Select and `morphTrigger={false}` use this path. This is not a
literal time reversal: the captured native exit has a faster contraction and a
small source rebound after the surface returns.

The returning text/selected label follows the current glass centre instead of
staying at its eventual source while the glass is elsewhere. Select's label
retains its measured size. Surface paint hands back to the source at 299ms;
Select and stationary-source popups finish then. Morphing Menu sources retain
the small sampled return through 533ms. Circular source return is uniform;
wide sources retain only a small width rebound, replacing the old large squeeze.
Base UI still owns placement, selection, keyboard operation and focus restoration.

Foreground softness and rim refraction remain active during visible contraction
and clear after paint handoff. Material, transparency, background sampling and
fusion recipes are unchanged. This pass adds no renderer or optical pass and
makes no measured CPU improvement claim.

For a 140×44 source and 250×600 panel, direct sampling of the pre-change and
candidate text closing functions gives:

| Closing time | Previous size | Candidate size | Previous height/width | Candidate height/width |
| ------------ | ------------- | -------------- | --------------------- | ---------------------- |
| 50ms         | 176.3×544.4   | 235.4×502.6    | 3.09                  | 2.14                   |
| 100ms        | 109.6×455.4   | 193.8×240.1    | 4.16                  | 1.24                   |
| 150ms        | 72.8×316.4    | 158.6×79.6     | 4.35                  | 0.50                   |
| 200ms        | 43.4×91.7     | 147.4×51.8     | 2.11                  | 0.35                   |

These are model coordinates, not browser timing measurements.

## Physical reference and limits

The existing iPhone 15 Pro Max / iOS 27.2 stock twelve-action SwiftUI Menu
recording was reviewed again:
`/Users/leosouthey/.iphone-use/runs/recordings/2026-11-07T20-04-38Z.mp4`.
Frames 75–79 supply the tall circular exit bounds. The recording's short-menu
counterparts are Files > Browse > More recordings at
`2026-11-07T18-30-14Z.mp4` and `2026-11-07T18-31-10Z.mp4` in that directory.
The compact exit and source rebound follow the previously inspected Files sample.

| Tall capture time | Bounds (x, y, width, height), stream pixels |
| ----------------- | ------------------------------------------- |
| 0ms               | 130, 404, 380, 784                          |
| 51ms              | 152, 489, 337, 654                          |
| 77ms              | 183, 550, 275, 419                          |
| 104ms             | 216, 549, 211, 304                          |
| 166ms             | 271, 462, 103, 85                           |

The stream is variable-rate, approximately 25–30fps during motion, with static
frames deduplicated. Motion onset is uncertain by up to approximately 50ms.
Difference bounds were visually inspected; later tall frames are contaminated
by source reappearance. The terminal tall interval therefore fits the compact
299ms source handoff rather than claiming an independently measured tall tail.
Tall corner shape and horizontal offset adaptation use the compact capture;
wide-source geometry is an adaptation. Native spring constants and exact ink
opacity cannot be recovered from these bounds. No fresh device run occurred in
this follow-up, and exact native equivalence is not claimed.

## Verification

- The new tall-closing geometry regression failed against the old text sampler.
  It samples both samplers at every millisecond before handoff for 44, 140 and
  200px-wide sources, checking aspect ratio and monotonic height contraction.
  Old tests that explicitly required the obsolete hanging droplet were replaced
  with whole-panel contraction and source-handoff behavior checks.
- Seventeen targeted motion, interruption/reversal, toolbar ownership and submenu
  tests pass (4,457 assertions). UI and docs typechecks, affected lint/format,
  package builds and the installed-consumer production check pass.
- `apps/docs/test/menu-close-motion.mjs`: 28 rendered cases pass across Chromium
  and WebKit at 1440px and 390px widths. Cases cover the exact Chinese Default
  example, tall text/icon menus, selected-item-aligned Select, stationary-source
  Menu/Select and upward placement. Controlled 16ms samples check contraction,
  label containment, final visibility, trigger restoration and focus.
- The existing continuous-opening browser runner passes all four engine/viewport
  combinations. The Select/icon runner also checks selection, Escape, focus,
  reduced motion, circle proportions and wide-label source return.
- Real-time opening samples occasionally missed the early width expansion: the
  recorded frame gaps straddled the assertion's 100ms window. Sampling also reads
  geometry, so those observations cannot distinguish scheduling from rendering
  cost. That runner now uses the controlled browser clock for the icon geometry
  segment; the other interaction checks remain in real time. No shape assertion
  was relaxed. All four engine/viewport combinations pass afterward.

The sampled screenshots and logs are saved in the local
`menu-whole-panel-closing` visualization folder. Browser layout tests establish
these cases, not full visual acceptance on physical iOS or overall performance.
