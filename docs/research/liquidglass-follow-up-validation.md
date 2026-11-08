# Liquid Glass material and motion follow-up

Date: November 7, 2026. Review `/cn/glass-lab` and `/en/glass-lab`.
Reference: onlymoein/liquidglass `89f8b7360a4501940aba9b838710bceb56b23601`.
This continues the [first implementation](liquidglass-first-pass-validation.md).

## Implemented behavior

- GlassContainer retains the broader, bounded smooth union and continuous contour.
  Its compatible shared plane now uses alternating in-document SVG masks. The
  inactive path is updated before the mask reference changes, avoiding image decode
  latency and WebKit's unchanged-mask repaint issue. Geometry, optics and shared
  press lighting retain one contour. Mixed materials retain their bridge path.
- Untinted iOS 27 material now uses fitted contrast, brightness and saturation in
  light appearance and nine-sample luminance/chroma curves in dark appearance.
  Control size continuously interpolates between the 60px and 120px recipes.
  SVG, WebGPU and the shared WebGL core embed the same samples. The CSS fallback
  uses the reference's approximate dark filter chain; it is not pixel equivalent
  to the nonlinear renderer. Existing explicit tint and knob recipes are retained.
- Regular blur defaults to 15.3px. `glassTint` moves toward a 1.3px clear endpoint
  while interpolating color transfer, retaining full face opacity. Dark transfer
  approaches clear continuously. Preference changes refit without resize; caller
  blur overrides and explicit legacy `glassTransparency` remain supported.
- Menus use separate 400ms opening and 500ms closing trajectories. Closing narrows
  into a drop and returns the trigger with a fitted lift/scale response. The drop
  follows the popup side when placement flips above the trigger. Independent
  geometry/content channels use elapsed time; interruption correction carries
  both the current pose and velocity for 120ms. Reduced motion/hidden documents
  settle immediately. Select retains its existing spring presentation.
- Standalone glass actions have distinct pointer and touch release curves;
  touch uses the reference's 342/13.5 return. Fusion members retain a damped
  return. Existing shared highlights and native activation remain in place.
- Menu scrub activation forwards modifier keys. Touch gestures inside a scrolling
  menu remain available to native scrolling. Shared source ownership also protects
  trigger transforms when one menu closes while another opens.

These changes affect the shared components, including their consumers on the
homepage. No new dependency or public preference prop was introduced. The iOS 26
paint branch and primitive source remain outside these changes. Attribution and
the retained MIT permission text are recorded in `THIRD_PARTY_NOTICES.md`.

## Verification evidence

- Glass unit tests: 30 pass, including neutral-ramp reference samples, continuous
  clear transfer, contour geometry and generated shader synchronization. The
  default shared core still passes its existing 8KiB gzip transfer budget.
- Optical DOM regressions: 15 pass. Component DOM regressions: 23 pass, covering
  preferences, fusion, press light, shared-toolbar ownership, stacked submenu,
  independent closing/drop, interruption, modifier forwarding and touch scrolling.
  These two groups ran separately because the older toolbar fixture installs a
  nonconfigurable `document.fonts` stub that conflicts with the optical fixture.
- Affected glass, UI, testing and docs typechecks pass; affected source format,
  lint and whitespace checks pass.
- Actual Chromium and WebKit interactions: drag without activation, reunion,
  separation, menu action, Escape/focus return, local appearance and tint changes,
  and 320/390/768px layouts passed. Clear blur measured 1.3px with face opacity 1
  without resize. No page errors were reported.
- Both engines captured the closing drop and source return; rapid open/close/open
  settled correctly. An above-trigger menu fitted in the viewport; constrained
  content scrolled and declined elastic touch capture.
- Actual SVG raster checks exercised 18 appearance/size/clarity combinations over
  six neutral/colored backgrounds. Maximum channel error against the CPU transfer
  oracle was 3.65/255 in Chromium and 5.48/255 in WebKit, including intermediate
  filter quantization. This checks the implemented curve, not native Apple parity.
- Both engines compiled the GLSL tone code. WebKit compiled the complete WebGPU
  optics pipelines; Chromium's automation context did not expose a WebGPU adapter.
  This does not establish full GPU output parity or high-load performance.
- Final dependency/package builds and the full docs production/static export passed.
  Both lab locales were emitted. The two StyleX delivery/static redirect regressions
  passed. Repeating the interaction suite against a local server of the exported
  output passed in Chromium and WebKit with no page errors.
- HMR regression passed in both engines: 365 styled frames in Chromium and 298 in
  WebKit, text-only edits emitted no CSS update, a failed CSS fetch preserved the
  previous stylesheet, and the next style edit applied. Test source edits were
  restored on completion.

## Design review gate

Direction remains Apple-inspired direct manipulation with semantic controls.
ENERGY 2 / RHYTHM 2 / MOTION 2. The existing photograph provides varied source
pixels; the ordinary stationary panel makes material changes easier to assess.
Shared masks keep the moving material together; separate menu tracks express
opening and return. Typography, content and layout remain the established lab.

- Hard gate PASS in the exercised lab scope: working actions, existing assets and
  routes, keyboard dismissal/focus return, no horizontal overflow at checked sizes.
- Purpose gate PASS: material changes respond to the actual backdrop and preference;
  motion follows direct manipulation and menu lifecycle.
- Liveliness PASS: continuous fusion, distinct press response and menu return were
  exercised in both engines; reduced-motion operation remains available.
- Craftsmanship PASS in the recorded scope: affected source checks, behavioral
  regressions, pixel checks and actual two-engine interaction checks passed.

No real Safari/iPhone, screen reader, native simulator comparison, complete custom
theme sweep or high-load performance acceptance was performed. Contrast across
every photograph/transparency combination is not certified. No release, deployment
or landing is claimed. Browser scripts, logs and captures are retained at
`/Users/leosouthey/.codex/visualizations/2026/11/06/01a1b223-ead1-7131-9aac-8dab90fa59a6/glass-follow-up/`.
