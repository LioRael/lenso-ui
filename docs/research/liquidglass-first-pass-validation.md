# Liquid Glass interaction first pass

Historical first-pass record. The [follow-up validation](liquidglass-follow-up-validation.md)
supersedes its remaining material, closing-animation and mask limitations.

Date: November 7, 2026. Review routes: `/cn/glass-lab` and `/en/glass-lab`.
This implements the owner's request to begin visual optimization against
onlymoein/liquidglass. It is an initial review candidate, not native parity or
final visual approval.

## Changes available to review

- GlassContainer now traces its shared signed-distance field as continuous vector
  contours instead of stacked half-pixel scanline rectangles. A fixed bounded
  blend makes the contact neck broaden as pieces approach, rather than retaining
  the old deliberately thin contact. The paint plane includes a swelling margin.
  Nested membership, actual controls, shared optics/light and reduced-motion
  behavior remain owned by the existing runtime.
- Menus now sample width, height, center movement, roundness and content zoom
  independently. The reference's squeeze and overshoot samples are adapted to
  the existing reversible spring. Live anchoring, content/glyph handling,
  keyboard focus, dismissal and Base UI ownership remain in place.
- Standalone glass actions have a mild release overshoot. Fusion members and
  joined groups keep their damped return. The generic touch press uses the
  reference's faster response. Press fill is lighter in light mode and less
  opaque in dark mode; dark-mode light fields retain white ink.
- The clear end of `glassTint` now reduces blur as well as sampled-face opacity.
  Fitted optics invalidate on a blur change without requiring resize. Caller
  blur changes during attachment are preserved, including cleanup. Explicit
  legacy `glassTransparency` behavior remains separate.
- A bilingual review surface uses real controls over existing licensed photos:
  drag the pieces, use arrow keys, change spacing, open the photo menu, toggle
  appearance and change tint. Dragging is distinct from activating an action.
  Both routes are explicitly included in static export.

## Scope of this iteration

The midpoint material's existing color-transfer recipe is retained. This pass
coordinates clear-end blur and opacity and adjusts pressed appearance; it does
not yet replace every light/dark transfer with upstream's fitted color tables.
Closing reverses the opening path for continuity. It does not yet reproduce the
reference's separate closing-droplet sequence. There is no claim of matching the
reference's recorded native timing or of completing performance optimization.

The adapted contour tracer and menu samples retain both Kelvin Zhang and Moein
Saharkhiz's MIT attribution, pinned to upstream commit
`89f8b7360a4501940aba9b838710bceb56b23601`. See `THIRD_PARTY_NOTICES.md`.

## Design rationale

Use the actual component families so this page exposes changes in the shared
runtime. One photo stage makes the sampled material, rim and contact visible;
the existing page typography and ordinary side panel keep controls readable.
The stage owns the photo and clipping; the group owns its layout gap; each real
button owns its interaction. Existing semantic colors follow local appearance.
Motion follows direct manipulation, contact and menu state, with reduced-motion
alternatives. Design dials: ENERGY 2 / RHYTHM 2 / MOTION 2.

## Verification

- `@lenso/glass` tests: **28 passed**, including optical/contour distance agreement,
  shoulder continuity and a new polygon-versus-field coverage regression across
  connected and disconnected shapes. Existing narrow-neck assertions were
  updated for the intentionally broader contact; overflow assertions now
  include the new paint margin.
- Focused DOM regressions: **20 passed** across fusion, preferences, press light,
  shared-toolbar menu ownership and stacked submenu title behavior. The new
  preference case catches blur remaining stale until resize, repeated attachment
  and loss of a caller's updated blur on cleanup.
- Affected glass/UI/docs/testing typechecks and affected format/lint checks pass.
  Initial checks run during declaration regeneration were repeated after the
  dependency build completed.
- Chromium and WebKit dev review at 1440 x 1000: activation, drag without accidental
  activation, separation/reconnection, menu selection, Escape and focus return,
  tint endpoints and appearance switching passed. At clear tint, actual control
  blur was **1.3px** and sampled-face opacity **0.35**, without a resize.
- Widths **320, 390 and 768px** had no horizontal document overflow. Separated
  controls wrap on narrow screens. Chinese mobile captures and desktop light,
  dark, pressed and menu states were inspected. An English 390px Chromium check
  also passed RTL and reduced-motion menu operation after hydration.
- The above two-engine dev interaction run reported **no page errors**.
- React Doctor changed-scope docs scan remained **83/100, 23 warnings**, with no
  findings in the new lab files. This broad working tree contains unrelated
  changes; the score is not an isolated repository-wide quality claim.

The final package and full production docs builds passed after the caller-blur
hardening. Both lab routes were emitted. Generated StyleX/static-export checks
passed against the built output. This is build/export evidence, not a native
rendering comparison or a published deployment.

## Review gate and remaining coverage

- Hard gate PASS for the exercised review flows: real actions and existing local
  routes, native keyboard targets, no document overflow at the checked widths,
  descriptive photo alternatives, no fabricated product/customer claims.
- Purpose gate PASS: the photo and glass demonstrate actual optics/contact;
  ordinary side controls stay distinct from the floating material.
- Liveliness PASS: direct drag/contact and menu feedback implement the declared
  motion, with the side panel providing a stationary reference.
- Craftsmanship PASS for this first-pass review scope: source checks, targeted
  regression checks and actual browser operation support the candidate.

This is not a comprehensive accessibility/contrast audit across every photograph
and transparency setting, nor a real Safari/iPhone or screen-reader test. No
native simulator comparison, quantitative motion/performance benchmark or full
custom-theme sweep was run. No primitive source, publication, deployment or
landing was changed.

Captures are stored in
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-first-pass/`.
