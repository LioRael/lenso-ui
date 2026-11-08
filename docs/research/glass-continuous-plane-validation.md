# Continuous material across the fusion threshold

The approved touch-centered press light is retained. This follow-up changes only
how compatible materials keep ownership while their silhouettes connect and
separate.

## Cause and change

The preceding implementation created the shared optics when a pair entered the
fusion distance, then restored individual optics and retired the shared surface
when the pair left it. A warm, shaded fallback kept that shared surface from
clearing while maps encoded, but did not eliminate the independent/shared
renderer handoff at the threshold.

Matching materials now keep one prepared material plane for the lifetime of the
enabled multi-member container, including when all members are separated. The
same distance field clips that plane into independent islands, a narrow neck,
or a connected outline as their actual presentation bounds move. The fusion
threshold changes geometry; it no longer changes the material owner or destroys
and recreates the base shade filter. Prepared geometry maps still update the
refraction while the warm material remains available beneath them.

Eligibility uses the same material comparison as shared optical rendering:
matching fill and shape recipes, unit zoom and no explicit bridge tint. The
comparison is reused by measurement and optical preparation. Mixed recipes keep
the existing individual/bridge path. Disabling the container, preferences that
suppress fusion, removal of members, and incompatible material changes still
use the established cleanup/restoration path. A single-member container retains
its independent renderer. No new public prop or migration is required.

Keeping a plane warm for separated matching controls retains its resources
longer than before. Small groups remain the intended use, and existing idle and
offscreen scheduling is retained. This pass does not establish a performance
budget for large groups.

## Browser evidence

The maintained docs preview was exercised in light and dark appearance, with
actual gap transitions and screenshots. The real documentation story was also
built with production workspace packages and compiled StyleX in an isolated
fixture so unrelated documentation hot reloads could not interrupt captures.
The fixture uses a 26px rest gap and 18px connection distance; pressing the
50px circular control enlarges it into range.

Each diagnostic reads actual rendered DOM on animation frames. The recorded
base filter URL identifies the material resource, not the geometry filter,
which is expected to update as refraction changes.

| Transition                      | Captured animation frames | Hidden shared face | Independent renderer handoffs | Optical opacity reset to zero | Base material resources |
| ------------------------------- | ------------------------: | -----------------: | ----------------------------: | ----------------------------: | ----------------------: |
| Docs light separation           |                        78 |                  0 |                             0 |                             0 |                       1 |
| Docs light connection           |                        83 |                  0 |                             0 |                             0 |                       1 |
| Docs dark separation            |                        75 |                  0 |                             0 |                             0 |                       1 |
| Production press into range     |                        83 |                  0 |                             0 |                             0 |                       1 |
| Production release out of range |                        81 |                  0 |                             0 |                             0 |                       1 |
| Production toolbar split        |                       116 |                  0 |                             0 |                             0 |                       1 |
| Production toolbar join         |                       117 |                  0 |                             0 |                             0 |                       1 |

There are also twelve full-viewport screenshots for each light/dark separation
and connection. A body point follows the circular control as it moves across
the marked backdrop. At a stable endpoint the repeated RGB samples are exactly
stable: light connected `(149,164,193)`, light separated `(148,164,189)`, dark
connected `(60,91,146)`, dark separated `(58,89,144)`. Different endpoints sample
different backdrop coordinates, so these numbers are not asserted equal across
positions. The moving dark sample changed by one channel level as it settled;
there was no later asynchronous refresh at the stationary position. JPEG
samples are supporting observations, not a lossless or native-iOS parity claim.

Artifacts are in the session visualization directory under
`continuous-material/`: `light-frames.json`, `dark-frames.json`,
`production-press-frames.json`, `production-toolbar-frames.json`, `captures.json`,
48 transition screenshots and `production-press.jpg`.

## Checks and limits

- Thirteen glass regression tests and nine affected component/gesture DOM tests pass.
- Glass and UI type checks, affected format/lint, package build and the installed
  consumer production check pass.
- Native activation, DOM identity and focus remain covered by existing regressions.
  The approved press field and exterior contour algorithms are unchanged.
- Captures in this pass use the in-app browser. A second engine, native iOS and
  a full production docs export were not requalified. Mixed material handoffs
  are outside this specific fix.
- The existing documentation contract-generation and general Toolbar-page
  blockers noted in `glass-touch-light-validation.md` were not changed. Docs hot
  reloads interrupted an additional press capture; the production story fixture
  supplied the completed press/release and toolbar evidence above.

## Scoped delivery gate

- Hard Gate PASS: affected gestures have passing regressions and real rendered
  transition checks; no new content flow, control, asset or claim was added.
- Purpose Gate PASS: retaining the material plane removes a threshold-dependent
  renderer swap; geometry still communicates joining and separation.
- Liveliness PASS: ENERGY 1 / RHYTHM 1 / MOTION 2 remains unchanged. No new motion
  or decoration was introduced.
- Craftsmanship PASS: moving and stationary material samples supplement actual
  lifecycle traces; supported recipes and remaining proof limits are explicit.
