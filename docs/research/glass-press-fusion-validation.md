# Glass press and fusion validation

Scope: the existing GlassButton/GlassToggleButton family and GlassContainer
example, using the default iOS 27 recipe. This is local acceptance, not a release
or proof of native Apple parity.

This initial pass did not catch release-triggered layout changes, did not verify
the neck's dark pixels, and treated the reference's enlarged circle as a resting
size. Its visual conclusions are superseded by the
[release-continuity follow-up](glass-release-continuity-validation.md).

## Delivery gate

- Hard Gate PASS: the live example's add, separation, reconnection and theme
  controls work. Chromium and WebKit exercised pointer and keyboard press,
  stationary controls, disabled/pending states, persistent toggle selection,
  reduced motion and forced colors. The 390px viewport has no horizontal overflow.
  No product claims, testimonials, navigation or image assets were invented.
  Representative light-theme pressed-state samples measured 13.44:1 for the
  default button and 4.93:1 for prominent white text on the sampled background.
  These samples do not certify arbitrary backdrops or consumer tint overrides.
- Purpose Gate PASS: active fill identifies a held control; the existing pointer
  glow locates contact; shared geometry removes internal optical boundaries.
  The menu glyph and unequal circle/capsule geometry follow the supplied reference.
  The migration note records these decisions.
- Liveliness PASS: the existing documentation direction is retained at energy 1,
  rhythm 1, motion 2. The interacting pair is the example's focus; spacing separates
  the independent reference and live pair. Press feedback and proximity response
  are the interaction accents, using the library's existing glass language.
- Craftsmanship PASS: affected format/lint checks and glass, tokens and UI type
  checks passed. Ten glass tests, twelve component/fusion DOM regressions and the
  installed-consumer production test passed. Package builds and documentation
  contract generation passed. Browser runs reported no console/page errors.

## Rendered evidence

Chromium and WebKit were reviewed at 900×1050 and 390×900, in light and dark
appearance. Mask samples verify an occupied neck and member face with a clear
outside region. Separation clears fusion overrides, native lens identities stay
available, and disabling the group releases generated filters. The pressed-light
layer fades out independently of toggle selection and remains available with
elastic movement disabled.

In the two-control continuous-translation probe, Chromium frame P95 was about
16.8ms and WebKit about 18ms, with a 42ms WebKit maximum in the recorded run.
This is a short automated probe, not sustained-load or native Safari evidence.
WebKit matching untinted Small Glass uses the same outline with lighter material
paints during movement, then restores full optical rendering after 100ms stable.

The local review fixture imports the actual documentation story and built
packages. It is available on port 4312. Private screenshots remain outside the
repository. Native Safari, physical touch devices, the iOS 26 visual matrix and
mixed-recipe motion performance were not accepted by this pass. A full production
documentation-site build and repository-wide candidate gate were not run.
