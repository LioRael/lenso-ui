# Native source delivery — 2026-11-10

The private `@lenso/ui-native` package and Expo example are included in this
source delivery. They are not published packages or deployed mobile applications.
The production deployment delivers the Web documentation site only.

## Verified in the isolated delivery checkout

- Frozen Bun dependency installation.
- Workspace format, lint and type checks, including the native package and app.
- Four slider value-boundary tests.
- Generated native material and semantic theme consistency.
- Expo Android and iOS JavaScript/Hermes bundle exports.

These checks establish source integration and JavaScript bundling. They do not
compile the complete Swift/Kotlin host or establish native rendering correctness.
The parallel native implementation's full build attempts encountered dependency
download and local toolchain failures; this delivery does not count those attempts
as successful builds. Full application builds, device interaction, accessibility,
controlled-value restoration, fusion and performance acceptance remain pending.

Generated Expo platform projects and build outputs remain ignored. Regenerate
them using the commands in the example and package READMEs when completing the
native verification. The preserved Web primitives have no source or API changes.
