# Circular icon Menu: physical-device alignment

Date: 2026-11-08

The previous icon pass reused the wide-label Menu shape table and removed its
source return transform. That did not establish native equivalence. The reused
opening narrows a circular source while increasing height, producing the
straight downward stem reported by the user. A physical-device recording shows
a different trajectory for a circular source.

## Evidence

Recorded an attached physical iPhone 15 Pro Max running iOS 27.2 with iphone-use.
The primary reference is Files > Browse > More: a circular ellipsis button
opening the three-action system menu. One recording holds the opening through
settle; a second contains three open/close cycles. No file action was invoked.
Safari's page menu was also inspected, but its different source geometry is not
the calibration for this profile.

Original local recordings:

- `/Users/leosouthey/.iphone-use/runs/recordings/2026-11-07T18-30-14Z.mp4`
- `/Users/leosouthey/.iphone-use/runs/recordings/2026-11-07T18-31-10Z.mp4`

Evidence is archived under
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/menu-icon-device-alignment/`.
The shared clips contain only the public menu region, cropped at
`440:270:195:70` in the 644×1398 stream. The opening slow clip plays at half
speed; the three-cycle clip retains normal speed.

The source bounds are approximately `(550,88,66,66)` stream pixels and the
settled panel `(240,88,376,220)`. Differencing against the resting frame,
thresholding and morphological filtering estimate the shape bounds. A circular
fit to its edge estimates corner roundness. Representative observations:

| Phase            | Relative time | Bounds (x, y, width, height), stream pixels |
| ---------------- | ------------: | ------------------------------------------- |
| Resting source   |          0 ms | 550, 88, 66, 66                             |
| Opening          |         39 ms | 474, 109, 121, 111                          |
| Opening          |        104 ms | 320, 119, 286, 200                          |
| Opening          |        139 ms | 267, 112, 343, 216                          |
| Settled panel    |        442 ms | 240, 88, 376, 220                           |
| Closing          |        149 ms | 431, 107, 172, 149                          |
| Source reappears |        299 ms | approximately 551, 83, 64, 64               |
| Source settled   |        533 ms | 550, 88, 66, 66                             |

The circular source immediately widens and travels diagonally toward the panel
centre. Its corners flatten after most width expansion. Closing contracts the
whole shape toward the source, followed by a small uniform rebound and lift.
The previous wide-label return's strong horizontal squeeze and hanging drop are
not present in this capture. Apple's [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)
and [Build a UIKit app with the new design](https://developer.apple.com/videos/play/wwdc2025/284/)
provide the broader source-to-overlay material context; the numbers here come
from the physical recording.

## Implementation

`menu-icon-shape.ts` owns the sampled circular profile and separate durations.
It applies only to square, single-icon Menu sources without nested controls.
The original text sampler and Select implementation remain byte-identical to
their pre-change snapshots. Composite Toolbar sources retain their existing
path. The shared timeline accepts the icon durations while preserving its
default profile and interruption handling.

Width and horizontal centre adapt to the live source and final panel. Early
height retains the captured source proportions; additional destination height
unfolds as roundness flattens. This prevents menus with more rows from turning
the initial circle into a tall oval. Vertical travel mirrors for panels above
the source. Content translates with the live shape centre and clips to its
current corner radius rather than the final panel radius.

Closing hands paint back to the actual source around 299 ms. Its return is
uniformly scaled, with a small lift and overshoot that settles by 533 ms. The
source glyph does not inherit the wide-label horizontal squeeze. Optical
material recipes, transparency and fusion computation are unchanged.

## Verification and limits

Affected format/lint, UI/docs typechecks, package build, installed-consumer
exports/types/SSR/assets verification, and contract generation passed. Twelve
targeted DOM tests passed, including independently recorded geometry points,
tall-panel adaptation, mirrored return, reversal continuity, Toolbar source
ownership, scrub activation and submenu titles.

Rendered verification passed all four cases of the maintained
`menu-select-animation.mjs` suite in Chromium and WebKit at 1440 and 390 CSS px,
with 16 family records and no page errors. It checks early icon widening and
travel, circular source return, retained text Menu behavior, Select selection,
keyboard/focus restoration, touch placement and reduced motion. Controlled
Chromium frame captures additionally inspect the live contour and clipping at
48, 96, 144, 224 and 320 ms. For a 44 px source and 238×201 px panel, the
48 ms shape is approximately 100×89 px and has already moved horizontally.

The device stream is variable-rate, roughly 25–30 fps during active motion,
with static frames deduplicated. It is not a 60 fps capture. Gesture onset is
bracketed by the last resting frame. Threshold bounds have several pixels of
uncertainty; corner fitting approximates native continuous corners. The final
closing interval has no intermediate frames; its source alignment is fitted
within the detection uncertainty before paint handoff. Interpolation, arbitrary
panel sizes, content timing and CSS corner geometry remain Web approximations.
This evidence does not establish pixel-perfect parity, all iOS menu variants,
all custom triggers or overall performance acceptance. CPU was not benchmarked.
