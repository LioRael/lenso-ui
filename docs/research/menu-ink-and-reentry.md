# Menu ink, source modes and glass re-entry

Date: 2026-11-08

## Native reference and remaining uncertainty

The preceding circular-icon pass matched the outline but tied content blur to
width. In that profile width finishes early, leaving the later contour motion
with prematurely sharp ink. It also lacked foreground refraction: background
glass cannot bend menu labels that are painted in front of it.

For this follow-up, a small SwiftUI application was built and run on the attached
physical iPhone 15 Pro Max / iOS 27.2. Its controls are stock system components:
a circular glass Menu, a large glass Menu labelled Create shipment, an unstyled
text Menu, and a menu-style Picker. Actions are inert and selection changes only
the test application's local state. The fixture contains no personal content.

Recording: `/Users/leosouthey/.iphone-use/runs/recordings/2026-11-07T19-24-06Z.mp4`.
The active sequence is approximately 14.3–20.9 seconds. The recording includes
all four open/close pairs. As before, stream capture is variable-rate, roughly
25–30 fps during motion, with static frames deduplicated. This is not a 60 fps
native timing trace.

The label Menu's opening shows soft text first, then clear central ink while
icons near the rounded contour are still stretched and cropped. Around
14.566 seconds the edge icon is visibly displaced; by roughly 14.670–14.823
seconds the remaining distortion is much smaller. This supports separate blur
and rim-refraction channels. It does not uniquely identify native content alpha:
blur, scale, changing glass tint and antialiasing all change apparent coverage.
The implementation therefore retains its existing item fade instead of claiming
a newly measured native opacity curve.

The large labelled source does narrow and has a different return from the
circle; its shape profile remains distinct. The ordinary text Menu and Picker
also unfold a rounded glass region with soft/deformed content. The plain Menu's
text source does not undergo the glass button's squeeze/rebound. Native upward
menus can reverse visual action ordering; this pass preserves Base UI's declared
DOM/keyboard order instead of changing selection semantics.

The reference repository was inspected at
[`89f8b736`](https://github.com/onlymoein/liquidglass/tree/89f8b7360a4501940aba9b838710bceb56b23601).
Its `src/menu.tsx` uses independent item opacity and blur timing. Its
`src/styles.css` specifies 250px minimum width, content padding `10px 8px`,
42px minimum rows, row padding `6px 20px`, 24px icons and 12px gaps. Lenso's
previous content padding was `10px 16px`, rows were 40px high with approximately
6–8px inline padding, and the popup had a fixed 238px width. Those differences
changed both text alignment and highlight geometry. The reference disables its
optical rim while morphing; it is not evidence that native foreground refraction
is absent.

## Changes

- `menu-ink.ts` provides a time-based blur tail independent of panel width and
  a separate foreground lens. Blur is small late in opening and clears at rest.
  Refraction also settles to zero; reduced motion does not retain an ink filter.
- Foreground refraction uses the existing control-lens model, with independent
  neutral axes and neutral spectral separation. Identical colour rays use one
  axis pair rather than three identical pairs and colour reconstruction. This
  preserves the selected zero-dispersion model's premultiplied colour and alpha;
  background material recipes, tint, transparency and fusion remain unchanged.
  It is a Web fit to native shape/ink behavior, not a full spectral calibration.
- Menu text content follows vertical panel movement; circular/anchored content
  follows both axes. Clipping follows the current contour. Source glyphs keep
  their own proportions.
- Menu and Select support stationary, visible sources with
  `morphTrigger={false}`. Their popups unfold from a compact source with the same
  contour and ink mechanisms, without source masking, source squeeze or rebound.
  Select adds this optional public property with the existing default preserved.
  The plain PopupButton Select example uses the stationary-source mode.
- Menu spacing now follows the inspected reference's dimensions. Width grows
  with content while staying bounded by Base UI's available space. Selection
  checkmarks, descriptions and native scrolling remain in their existing parts.

## Shared re-entry fix

The WebKit homepage reproduction recorded an unchanged background image copy
being detached after scrolling away and returning. Its retained-node result was
`[false,true,true]`. The reproduction asserts that existing source copies remain
connected; it failed before the fix.

`copyBackdrop` marked every returning copy stale and toggled its output through
`display:none`. Re-entry therefore requested a new clone and image decode even
when the source had not changed. Visibility now pauses scheduling while retaining
decoded input and paint. The shared scheduler tracks pending content edits per
consumer, so a visible sibling cannot consume and erase a paused consumer's
change. Styles and placement still refresh on return. Real background edits
continue to rebuild the required copy; this is not an unconditional stale cache.

The shared GPU manager had a second visibility/lifetime coupling: filtering
offscreen entries out of a batch's membership disposed and recreated the whole
batch, including visible siblings. Visibility now only gates drawing; prepared
batch membership, ready output canvases and resources remain owned until a real
state change or unmount. All-offscreen batches submit no drawing work. A
deterministic adapter test exercises the real manager: it failed when hiding one
member detached the visible sibling's canvas, and passes after the fix. It also
checks cached re-entry without a new GPU submission and release on unmount.
That test validates lifecycle behavior with a simulated device/capture adapter,
not physical GPU throughput or every material eligibility path.

The same homepage reproduction then retained `[true,true,true]`. Maintained
browser checks exercise both unchanged re-entry and a source image changed while
the target is offscreen. Chromium also checks retention of the existing lens
nodes. The observed replacement was in WebKit's copied-input path; this evidence
does not prove that every browser-internal compositor or GPU cache behavior has
been eliminated.

## Verification

Affected format/lint, glass/tokens/UI/docs typechecks, package builds, generated
API and installed-consumer exports/types/SSR/assets checks were run. The tests
are intentionally split between the glass and React DOM suites because an
existing toolbar test installs a non-configurable `document.fonts` fixture.

- 31 glass unit tests.
- 13 targeted React Menu motion/Toolbar/submenu DOM tests, including late ink
  after width expansion and reversal continuity.
- Two scheduler DOM tests, including source edits retained by a paused consumer
  while a visible sibling reads the shared source.
- One shared GPU lifecycle DOM regression using deterministic device/capture
  adapters, with a recorded failure before the fix.
- `menu-ink-reentry.mjs`: Chromium/WebKit, 1440/390 CSS px; stationary Menu/Select,
  late filter tail, settled filter cleanup, padding/row geometry, selection,
  focus restoration, reduced motion, unchanged re-entry and real offscreen edits.
- `menu-select-animation.mjs`: existing morphing icon/text Menu and Select
  regressions across the same engine/width combinations.

The native operation sequence was saved locally at
`/Users/leosouthey/.iphone-use/flows/local-menu-motion-probe.json`, validated and
successfully replayed after replacing the Picker's value-dependent label with
its stable identifier. Dismissal uses a verified empty background coordinate for
this fixture/phone size. It was not published. The phone lease was released.

No aggregate CPU benchmark or full-site acceptance was performed. Native alpha,
continuous corners, arbitrary menu content, all custom triggers and all iOS
presentation variants remain outside exact parity claims.
