# Glass fusion background continuity

Date: November 7, 2026. Reproduction: `/cn/glass-lab`, also reported in the
Codex in-app preview. This is a component runtime fix, following the material
and motion work; it is not a new performance acceptance result.

## Reproduction and cause

Move the left group member vertically while watching the stationary right
member. Vertical movement changes the shared paint plane's origin and height.
Horizontal-only keyboard movement did not reproduce the same fault.

The tracker wrote the new plane dimensions before the replacement optical PNGs
had decoded. The preceding filter then operated in the new coordinate system.
Even a subsequent unchanged tracking frame overwrote a temporarily retained
plane. This changed the background beneath members that had not moved.

The focused browser test holds optical image decoding after initial fitting,
moves the left member up by 72px and compares a 36px square inside the stationary
right member. Before the fix, Chromium's mean absolute RGB channel difference
was **53.751/255** while decoding was pending. The test failed at its <1 threshold.
The same probe returned to 0.349 after the replacement inputs committed.

The original drag captures also showed bright bands in newly exposed portions
of the backing. That backing reused a shade image fitted to an earlier shape;
resizing its bounds stretched geometry-dependent shading into the new outline.
The two independent top buttons remained pixel-stable in the initial focused
keyboard and drag captures. The reproduced cross-effect was inside the group.

## Changes

- `fusion.ts` publishes requested bounds only for a changed layout. Unchanged
  observer/tracking frames no longer replace the optical owner's retained bounds.
- `fusion-optics.ts` captures the requested origin and dimensions with each fit.
  It commits that plane with the decoded lens. During preparation, the previous
  plane remains fixed and a separate mask expresses the current outline in the
  previous plane's coordinates, intersected with the preceding silhouette so old
  shading cannot cover newly exposed areas. The visible contour and shared press light still
  follow live movement. In-flight results with incompatible material ownership
  are rejected.
- `fusion-mask.ts` supports a translated path, retaining the existing alternating
  mask publication. Live silhouette and retained optical plane have separate masks.
- The persistent backing now uses the synchronous material transfer without a
  geometry-dependent shade image. The complete decoded lens retains its optical
  shading; newly exposed backing does not stretch an earlier shade image.
- `apps/docs/test/glass-fusion-continuity.mjs` is the retained browser regression.
  It verifies that the control really moved and the shared material remains
  visible while holding decoding, then compares the stationary face both before
  and after committing the new inputs. It exercises light, dark and clear states,
  plus a uniform gray source that isolates stale shade from source refraction.

## Verification

Run the maintained preview, then:

```sh
DOCS_URL=http://127.0.0.1:4337 node apps/docs/test/glass-fusion-continuity.mjs
```

Final mean absolute RGB differences against the initial stationary face:

| Engine                       | Appearance   | Inputs pending | New inputs committed |
| ---------------------------- | ------------ | -------------: | -------------------: |
| Chromium, Metal acceleration | Light        |          0.000 |                0.349 |
| Chromium, Metal acceleration | Dark         |          0.000 |                0.498 |
| Chromium, Metal acceleration | Clear        |          0.000 |                0.000 |
| WebKit                       | Light        |          0.000 |                0.052 |
| WebKit                       | Dark         |          0.000 |                0.117 |
| WebKit                       | Clear        |          0.000 |                0.096 |
| Chromium, Metal acceleration | Uniform gray |          0.000 |                0.000 |
| WebKit                       | Uniform gray |          0.000 |                0.000 |

- All eight held-decode browser cases passed, including actual movement and material
  visibility. These values describe the cropped stationary face, not every pixel
  on the page or a color calibration score.
- The gray-source case also checks a 24 × 36px region covering newly exposed
  material and adjacent backdrop. Without the retained-silhouette intersection,
  its pending-to-settled mean difference was 30.835/255. The final values were
  3.307 in Chromium and 2.637 in WebKit, below the <8 allowance for exact lens
  shading replacing the backing. This catches the separate white-band fault.
- Continuous two-dimensional pointer dragging passed in Chromium and WebKit with
  no page errors. An animation-frame monitor found no visible copied backdrop
  referring to a removed filter in either run.
- The existing two-engine lab interaction script passed drag without accidental
  activation, split/reconnect, menu action, Escape/focus return, appearance/tint
  changes, and 320/390/768px document-overflow checks.
- Actual Codex in-app preview: dragged the first control above and below the
  stationary members, then reset. The shared material remained present; the new
  preview tab was retained for review. This visual check accompanied the automated
  pixel regression; it is not a quantitative in-app frame-time measurement.
- Glass unit tests: 30 pass. Optical DOM tests: 15 pass. Affected fusion,
  preferences and press-light DOM tests: 15 pass.
- Glass/UI/docs typechecks and affected format/lint checks passed. The seven-task
  dependency/package build passed. Browser verification used the maintained dev
  preview; a full docs production/static export was not rerun for this runtime-only
  component fix.

## Review gate and coverage

- Hard gate PASS in the exercised scope: native keyboard movement, pointer
  activation ownership, focus return and checked responsive layouts still work.
- Purpose gate PASS: source pixels remain aligned with stationary controls while
  the changing silhouette remains visible.
- Liveliness PASS: direct manipulation, shared highlight, fusion and reduced-motion
  DOM contracts remain available; the new regression prevents hiding the material
  or ignoring movement as a false continuity fix.
- Craftsmanship PASS in the recorded scope: the same browser seam failed before
  the fix and passes across eight final engine/appearance cases, with affected
  regressions and package builds passing.

This does not establish that every material family, arbitrary backdrop or real
Safari/iPhone is free of compositor artifacts. The earlier dynamic-fusion CPU
and rasterization bottleneck has not been performance-accepted by this fix.
The separate performance report describes its archived pre-fix candidate.

Reproduction captures, drag recordings, pixel differences, before/after logs and
the source delta are retained under
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-fusion-continuity/`.
