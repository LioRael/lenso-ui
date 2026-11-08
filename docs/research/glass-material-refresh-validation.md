# Glass material refresh follow-up

Later follow-up: [persistent material ownership](glass-continuous-plane-validation.md)
removes the independent/shared handoff when compatible shapes cross the fusion threshold.

The user narrowed this pass to material flicker before and after connection.
The existing exterior edge treatment was left unchanged.

## Cause and repair

The preceding implementation kept a material-transfer-only fallback beneath the
full optical output. It omitted `appleShade`, then replaced that flat face with
the fully shaded face after 80ms of quiet geometry. Motion repeatedly hid the
prepared optical output, so the material could visibly brighten and darken even
though the silhouette and interaction tests passed.

The base now uses the same `appleShade` function, local-height geometry and
material recipe as the complete lens. Its image is decoded before ownership
passes from the independent controls. Prepared optical frames stay visible while
the next frame encodes; geometry no longer resets their opacity or waits for a
quiet timer. Old filter resources remain alive through the copied-backdrop
handoff. Immediate clipping and pressed lighting continue to follow the current
presentation, rather than an older asynchronous optical frame.

No public prop or consumer migration is needed. Existing grouping, elasticity,
pressed colors and edge drawing are retained.

## Pixel comparison

The built fixture imports the actual documentation stories and production
packages. Fusion was disabled without moving either control, allowing an
independent/shared material comparison over the same background at the same
coordinates. The three sample points avoid text and the contact rim.

| Engine   | Appearance | Example body RGB, connected / independent | Maximum channel difference across three points |
| -------- | ---------- | ----------------------------------------- | ---------------------------------------------- |
| Chromium | Light      | `(149,169,197)` / `(149,169,197)`         | 0                                              |
| Chromium | Dark       | `(54,98,156)` / `(54,98,156)`             | 0                                              |
| WebKit   | Light      | `(149,169,195)` / `(149,169,195)`         | 0                                              |
| WebKit   | Dark       | `(54,98,156)` / `(54,98,156)`             | 0                                              |

These are comparisons to the existing independent **Web GlassButton** material,
not claims of pixel identity with Apple's native renderer. Artifact filenames
using `native` refer to that independent Web control.

Six successive press captures also kept the unpressed neighbor's material
stable. Chromium's sample was `(150,169,196)` in light appearance and
`(58,99,156)` in dark appearance. WebKit varied by at most one channel level
across the corresponding captures. This replaces the prior flat/full shading
jump, which reached eight channel levels in the earlier recording.

Matching-position captures are in the private session visualization directory
under `material-flicker-fix/`; real-speed split/join and press frame captures
remain under `material-continuity/`.

## Verification

- Chromium and WebKit: light/dark real-speed splitting and joining, intermediate
  necks, reversal/interruption, pressed lighting and shared toolbar elasticity.
- Release checks cover connected frames, one mouse/touch threshold disconnection
  and no late reconnect. The prepared optical layer is not reset to zero opacity
  during connected release.
- Native action/focus identity, keyboard operation, disabled/loading behavior,
  reduced motion, forced colors, RTL and 390px layout passed the affected browser
  regressions without page or console errors.
- Thirteen glass tests, fifteen component/fusion/toolbar DOM checks, affected
  format/lint/type checks, package builds and installed-consumer production
  validation passed. Browser captures establish the visual observations; Happy
  DOM tests do not establish rendering.

The existing testing-package `Tabs.Root variant` type error remains outside this
change. Native iOS acceptance, photo/video-background parity and a full
production documentation export are not established by this focused check.

## Scoped delivery gate

- Hard Gate PASS: working split/join and actions, keyboard operation, both themes,
  mobile bounds and error-free browser regressions were checked in the changed
  scope; no new content or navigation was introduced.
- Purpose Gate PASS: matching the complete shade recipe removes the tone switch;
  keeping prepared optics visible removes the repeated clear/reveal cycle.
- Liveliness PASS: the existing docs direction remains energy 1, rhythm 1,
  motion 2. Motion still communicates grouping and press, with no new animation.
- Craftsmanship PASS: direct before/after material samples supplement the shape
  and behavior regressions, and the scope and limits of the comparison are explicit.
