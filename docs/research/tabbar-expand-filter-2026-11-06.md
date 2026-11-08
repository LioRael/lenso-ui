# TabBar re-expansion filter continuity

The reported flash occurs when the minimized TabBar expands again. The user
clarified this direction during inspection. The issue was reproduced on the
Photos preview and corrected in the shared Glass runtime, with no page workaround.

## Cause and shared correction

The decoded SVG filter uses pixel coordinates. During expansion, the material
surface grows from a circle into a capsule while the old filter can remain only
50px wide. The baseline trace showed a roughly 182px surface still referencing
a 54px filter region. The rendered result briefly has a hard vertical edge or
rectangular patch until the exact larger lens replaces it.

`packages/glass/src/refraction.ts` now handles layout changes before paint:

- Keep decoded optical fields available while an exact replacement is prepared.
- Resize an instance-owned filter view to cover the current surface. Shared
  cached filters remain immutable, so other circles using the same lens are
  unaffected.
- Do not reuse an old appearance's fitted optics after a theme change. A current
  appearance's synchronous material transfer remains authoritative until its
  decoded optics are ready.
- Remove the temporary view when exact fitted optics arrive or the surface is
  detached. The final observed page reported zero temporary resizing states.

An intermediate dark-mode review exposed a second defect: a baked circular
contour stretched into an ellipse. The final implementation removes that baked
contour from the temporary view, bypasses its composition stage, and uses the
existing CSS contour at the current rounded geometry. It suppresses the old rim
image during resizing. Exact fitted contour/rim painting returns afterward.

`packages/glass/src/resizable-filter.ts` owns the temporary SVG view. The shared
material styles recognize its transient resizing state. No new material recipe,
opacity adjustment, TabBar public API or Photos-specific CSS was introduced.
The accepted GlassButton-like background treatment is retained.

## Rendered acceptance

Environment: local Docs development preview, Chromium in-app browser,
`/en/photos`, English, LTR. Primary captures used 589 by 795; narrow captures
used 390 by 844. Both appearances were exercised through the real appearance
menu. Scroll-driven expansion, expand-button activation, interrupted reversal,
and reduced motion were checked.

The acceptance records combine requestAnimationFrame state, actual screencast
images and separate ResizeObserver/microtask samples taken after layout updates
and before paint. RequestAnimationFrame alone runs before resize delivery and
can therefore observe a filter one layout update behind; it is not the final
paint invariant.

| Final capture            | Frame state samples | Pre-paint size samples | Rendered images |
| ------------------------ | ------------------: | ---------------------: | --------------: |
| Dark narrow expansion    |                 147 |                     27 |               6 |
| Dark rapid reversal      |                 133 |                     64 |              18 |
| Dark scroll expansion    |                 135 |                     29 |              17 |
| Dark button expansion    |                 183 |                     29 |              23 |
| Light rapid reversal     |                 145 |                     68 |              13 |
| Light scroll expansion   |                 136 |                     32 |              26 |
| Light button expansion   |                 141 |                     31 |              24 |
| Reduced-motion expansion |                 147 |                      2 |              10 |

Across the final cohort, none of the 282 pre-paint samples had a pixel-coordinate
filter region smaller than its material surface. The 137 rendered images and
representative frame sheets showed no recurrence of the clipped rectangle or
stretched circular contour. The final page was expanded with no resizing state
left behind, and the browser error log was empty at that check.

The temporary browser viewport was reset and the agent-created tabs were closed.
The user tab was preserved. This is a bounded Chromium visual acceptance, not a
Safari/Firefox result, a universal no-flash guarantee or a frame-rate benchmark.

Evidence directory: `.artifacts/tabbar-minimize-2026-11-06/`.
Only `accepted-*.json` and their corresponding screenshots represent the final
implementation. `accepted-metrics.json` summarizes the cohort. Earlier
`before-*` files are baseline evidence; `after-*` and `final-*` files are
intermediate experiments and must not be treated as final acceptance.

## Regression and build evidence

- New DOM regression checks resizing, interrupted reverse sizes, immutable shared
  cache entries, independent owners, contour bypass and disposal. It runs with
  and without a baked contour. Existing appearance checks retain live/default
  material and theme-change coverage.
- Affected formatting, lint and interaction source boundaries passed.
- Tokens and Glass builds passed; Glass/UI typechecks passed.
- Focused component/material DOM cohort: 28 passed, 0 failed.
- Glass unit tests: 22 passed, 0 failed.
- Existing Photos regressions: 10 passed, 0 failed.
- Installed package consumer exports, types, SSR and production assets: passed.

DOM tests do not establish rendering; their geometry/lifetime checks complement
the recorded browser evidence. No full-site audit, native shader parity claim,
merge, publication or deployment is included.

## Scoped antislop gate

The established Photos direction and motion intensity are retained. The correction
keeps a material continuous through a shape change instead of hiding the control
or changing its transparency.

- R-26/R-33/R-35 PASS: shared authored runtime/style changes, successful build,
  real scroll/button interactions and saved rendered frame evidence.
- R-03/R-34/C-4 PASS for the recorded cohort: narrow and reference widths,
  light/dark, reduced motion, normal expansion and interrupted reversals.
- R-19/R-31 PASS: no decorative motion added; preserve the existing spatial
  transition while keeping optical bounds and contours consistent.
- Consistency/C-1/C-2/C-5 PASS within scope: reuse the current material and CSS
  contour, preserve selection/focus ownership, and limit acceptance claims to
  the recorded evidence. No new assets, navigation, copy or palette was added.
