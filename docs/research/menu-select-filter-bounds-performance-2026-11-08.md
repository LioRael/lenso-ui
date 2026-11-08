# Menu and Select foreground-filter bounds

Date: 2026-11-08

Follow-up to [animation work reduction](menu-select-animation-performance-2026-11-08.md).

The shared control lens placed its SVG filter's x, y, width and height on every
animated update in Chromium. Menu and Select already supply fixed resting
content dimensions: their contour, clipping and displacement animate inside that
space. Reassigning the same filter bounds contributed no output change.

Initialize the zero origin when creating a filter, then write its pixel width or
height only when that dimension changes. Read the actual owned attribute rather
than introducing a second bounds cache. WebKit keeps its existing normalized
object-bounding-box filter bounds and filter-reference refresh behavior.
Displacement, map placement, blur, current contour and animation timing are
unchanged. The implementation is shared with other control lenses; changing
content dimensions still updates their filter bounds.

## Evidence

The daily docs preview on port 3000 was exercised at 1440×1000 with a paused
browser clock, identical native open/Escape actions and identical frame steps.
The probe counts SVG attribute writes inside the control-lens container. This
includes graph construction, dynamic displacement/map parameters and WebKit's
required changing filter references.

| Engine / fixture                  | Writes before | Writes after |
| --------------------------------- | ------------: | -----------: |
| Chromium text Menu                |         1,249 |        1,061 |
| Chromium icon Menu                |         1,275 |        1,083 |
| Chromium selected-row Select      |         1,249 |        1,061 |
| Chromium stationary-source Select |         1,275 |        1,083 |
| WebKit text Menu                  |         1,057 |        1,057 |
| WebKit icon Menu                  |         1,079 |        1,079 |
| WebKit selected-row Select        |         1,057 |        1,057 |
| WebKit stationary-source Select   |         1,079 |        1,079 |

Chromium writes decreased by approximately 15.1% in each fixture. This measures
DOM work, **not** a 15.1% CPU or frame-rate improvement. No aggregate CPU,
presented-frame or power improvement is claimed.

Opening at 176ms and closing at 128ms were captured for all eight engine/fixture
cases. All 16 sampled filter graphs, content clip paths, transforms and filter
references matched before/after exactly after normalizing generated filter IDs.
The graph comparison includes encoded optical maps. It is parameter/output
equivalence at those sampled poses, not a screenshot pixel comparison or proof
of every possible animated state.

The DOM geometry regression now covers both Chromium-style pixel units and
WebKit-style normalized units. It checks that moving a lens does not rewrite
its unchanged bounds, that a content-width change updates the pixel width, and
that normalized bounds remain fixed. Existing layout-read and scaled-geometry
checks remain. The earlier test covered equivalent geometry but could not catch
redundant SVG bounds mutations.

Verification completed before rendered regressions: glass typecheck, 36 glass
unit tests, 34 glass DOM tests, 14 Menu/cascade motion tests and affected lint.
Affected formatting, the glass package build and installed-consumer verification
(exports, types, SSR and production assets) also passed.

The interrupted-return browser regression passed all 16 engine/width/family
cases. The standard selection/return regression passed Chromium 1440px; its
initial Chromium 390px case failed the selected-value retention assertion
(California instead of Washington after reopening and Escape). The isolated
matching rerun passed. Its cause is not established, so the uninterrupted full
suite is not reported as clean and selection-retention stability remains a
verification limitation.
Both WebKit widths subsequently passed their standard selection/return checks.

Artifacts, baseline source, raw mutation counts and complete sampled graphs:
`/Users/leosouthey/.codex/visualizations/2026/11/08/01a1bada-c998-7850-9e85-360ce49b33f4/menu-filter-bounds-performance/`.

These are scoped development-preview checks. Real Safari/iPhone validation,
exhaustive theme coverage and production performance acceptance remain outside
this pass.
