# Color source reconstruction

Authority: HeroUI v3.2.6, `e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
Adapted source examples retain Apache-2.0 notices. Imported JSON is reference
content; the corresponding `.tsx` files are independent live implementations.

## Exact source keys

Every registered English color record has a live module at its original
`src/demos/en/<family>/<basename>.tsx` path and its original named export:

- `color-area`: `basic`, `controlled`, `custom-styles`, `disabled`,
  `render-function`, `space-and-channels`, `with-dots`.
- `color-field`: `basic`, `channel-editing`, `controlled`, `custom-styles`,
  `disabled`, `form-example`, `full-width`, `invalid`, `on-surface`,
  `render-function`, `required`, `variants`, `with-description`.
- `color-picker`: `basic`, `controlled`, `custom-styles`, `with-fields`,
  `with-sliders`, `with-swatches`.
- `color-slider`: `alpha-channel`, `basic`, `channels`, `controlled`,
  `custom-styles`, `disabled`, `render-function`, `rgb-channels`, `vertical`.
- `color-swatch`: `accessibility`, `basic`, `custom-styles`, `render-function`,
  `shapes`, `sizes`, `transparency`.
- `color-swatch-picker`: `basic`, `controlled`, `custom-indicator`,
  `custom-styles`, `default-value`, `disabled`, `render-function`, `sizes`,
  `stack-layout`, `variants`.

`color-input-group` is the local supporting composition used by ColorField;
there are no registered source records for a separate English demo family.

## Boundary adaptations

- Color labels, descriptions and errors use their native RAC context-dependent
  parts. Picker trigger copy is a native span, not a global Field label.
- Ordinary selects and buttons use native Base UI contracts. The demo select
  portals remain inside the RAC picker subtree, above its overlay; moving these
  portals to the document body breaks focus containment and pointer reachability.
- Upstream `render` DOM interception examples are represented by RAC's native
  children/style render-state callbacks and the same custom DOM data attributes.
  They preserve the source's actual div output and native color interaction, but
  do not add a compatibility `render` prop to RAC color roots.
- The malformed-text example keeps editable raw text in the input because a RAC
  Color cannot hold `"not-a-color"`; Input's `defaultValue` is otherwise
  overridden by the contextual controlled value.
- The shuffle icon uses the same Gravity icon as the upstream Iconify reference.
  The custom selected indicator uses Gravity `HeartFill`.

## Executed evidence

The isolated Chromium harness compiled demo consumers and package StyleX maps
with `dev:false`, without CSS layers, using the real RAC controls and source
theme CSS. No simulated paint or postprocessed component styles were used.

- All 52 examples mounted, and all picker examples opened, in light/dark themes
  with normal/reduced motion: **208 smoke cases**.
- `packages/react/src/components/color-picker/browser-proof.mjs` passed in all
  four theme/motion combinations. It tests dynamic color spaces/axes, RGB and
  alpha keyboard edits, area pointer edits, field channel edits and resets,
  malformed text, form saving/reset, shared picker state, shuffle, Escape/focus
  restoration, nested select selection, swatch keyboard selection, and native
  render-state examples.
- PNG screenshot samples prove the alpha checkerboard/red endpoints, vertical
  hue gradient, the custom 135-degree swatch gradient, opaque source blue and
  transparent checkerboard paint. Vertical tracks measure 20 × 172 pixels in
  the source's 192-pixel example.
- Strict TypeScript diagnostics passed using the parent's shared standard React
  configuration and read-only dependency graph. Shared-standard oxlint and oxfmt
  checks passed for the owned source directories.

The source records do not specify locale-switching color workflows. No
locale-specific parity claim is made. The evidence is an isolated compiled
source harness, not a production Next documentation build or a full upstream
side-by-side screenshot comparison.

The durable browser proof accepts `COLOR_DEMO_URL` for a compiled exact-key
source harness (`?demo=family/basename&theme=light|dark`). The parent aggregate
harness owns invocation; no shared manifest or root configuration was changed.
