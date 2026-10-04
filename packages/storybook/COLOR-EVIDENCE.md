# Final color Storybook batch

## Outcome and boundary

The six color families retain all **51 case-sensitive source exports**, in source
order, and mount in **102 production iframes** across light and dark themes.
Fresh tokens and UI distributions, strict Storybook TypeScript, the production
Storybook build, and the color workflow proof passed with **Node 24.18.0 and
pnpm 11.5.0**. Scoped oxlint reports zero errors/warnings; oxfmt passes.

Only the six `stories/color-*.stories.tsx` files, uniquely color-named story
fixtures/styles/proofs, and this evidence file belong to this batch. No component
implementation, theme package, primitive, shared configuration, inventory,
coverage document, dependency manifest, release or publication was changed.

All component/model/type imports come from `@lenso/ui`. There are **no bare
React Aria, RAC, React Stately, color-model or provider imports** to add to the
Storybook manifest. React, compiled StyleX and `@storybook/react-vite` are the
existing direct story dependencies. Proof tooling loads the already-installed
Playwright from the readonly dependency project.

## Immutable source

Authority: HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
Each complete raw file was read before implementation:

`https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/<family>/<family>.stories.tsx`

| Family                     | Exports, in exact source order                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color-area` (6)           | Default, WithDots, Controlled, ColorChannels, Disabled, WithColorPreview                                                                                          |
| `color-field` (13)         | Default, Variants, FullWidth, WithDescription, Required, Invalid, Disabled, Controlled, ChannelEditing, RGBChannels, FormExample, WithColorPresets, AllVariations |
| `color-picker` (5)         | Default, Controlled, WithSwatches, **WidthFields**, WithSliders                                                                                                   |
| `color-slider` (9)         | Default, SaturationChannel, LightnessChannel, AlphaChannel, RGBChannels, Vertical, Disabled, Controlled, WithoutLabel                                             |
| `color-swatch-picker` (10) | Default, Sizes, Variants, Layouts, AllVariants, Controlled, Disabled, WithDefaultValue, WithCustomIndicator, ExtendedPalette                                      |
| `color-swatch` (8)         | Default, Shapes, Colors, Sizes, Transparency, WithColorName, StyleRenderProps, AllVariants                                                                        |

`WidthFields` is the upstream spelling, not a new alias. There are no additional
local story exports. Source defaults, palettes, descriptions, invalid messages,
HSL/HSB/RGB channels, alpha values and controlled workflows remain represented.
The proof verifies both export order and the complete raw-file hashes:

| Complete source file | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| color-area           | `01fa1d874300796b5ca977f58888013acc4df06ec1c999cbe56edef3a4e29132` |
| color-field          | `aa31aa2e950e7bead78898d2ad196db498d1ee8a1942813f3a126c1764398abf` |
| color-picker         | `3daf2aab6ee1a160e55dcd2d7fc0d82d04e48b0605177b10d3cc9123b92ffbb0` |
| color-slider         | `58418a096d11ef161fe23b3251728097090aaea6a3bd8b5fd34ccab677504cd2` |
| color-swatch-picker  | `03dab83e09d632f54c5821dd850cdcce05046837a81531e58fb72e7b92697d4a` |
| color-swatch         | `4cce881d2ecf2e663a1bdaa86a518a1f9f77d35734c626350d3e9bf26ba3a4ed` |

## Native composition and source adaptations

- `color.stylex.ts` supplies compiled story geometry, spacing and typography.
  No Tailwind classes/runtime, source-rendering shim or default-export alias is
  used. Stateful tracks, gradients, thumb positions, colors and keyboard behavior
  remain the native Lenso color components and real `parseColor`/Color models.
- `ColorStoryField` only assembles exported `ColorField.Label`, `.Group`,
  `.Input`, `.Prefix`, `.Suffix`, `.Description` and `.Error`. Supporting text
  stays in the color context rather than using ordinary Base UI field parts.
- Ordinary actions use the exported Base UI-backed `Button`: `onClick`,
  `disabled` and `isLoading` replace the source ordinary RAC button spellings.
  `FormExample` uses a native HTML form, retaining the source required
  `brand-color` field, 1.5-second pending/reset workflow and submitted hex value.
- Color presets use named native buttons around swatches instead of making
  nonfocusable images clickable. Source preset colors and controlled updates
  remain intact; keyboard users can activate the same workflow.
- Every picker popover explicitly contains exported `ColorPicker.Dialog`.
  The ordinary `Select` uses its native `.Portal`, `.Positioner`, `.Popover`,
  `.List`, `.Item` and `.ItemText` parts. Its portal container is inside the
  color dialog: a body-level ordinary Select portal would fall outside the RAC
  modal interaction/focus boundary. This is explicit story composition, not a
  component implementation patch or an overlay replacement.
- Slider space/channel correlation is maintained with typed HSL/HSB/RGB branches,
  not source `@ts-expect-error` suppressions or unsafe channel assertions.
- **Source custom-shadow correction:** upstream `StyleRenderProps` appends `40`
  and `80` to `color.toString("css")`. CSS strings can be `rgb(...)`, making the
  concatenated result invalid CSS. The adaptation uses the actual color model's
  `withChannelValue("alpha", 64 / 255)` and `128 / 255`: the same intended hex
  alpha values, five original colors and source 3px border/14px shadow geometry.
  The proof checks actual computed dimensions, so a surviving default swatch
  shadow cannot masquerade as a working custom callback.

## Live proof, separate from imported source

`stories/color-proof.mjs` serves **production output**, checks the production
index, checks every source export against the pinned full-file hashes and
measures a visible native color component in all 102 iframe mounts.

The following workflows pass in **both themes**:

- Color area pointer updates and 2D keyboard operation, controlled value text,
  explicit RGB axes and disabled behavior. RAC exposes one accessible 2D slider
  with a supporting hidden second-axis input; the proof does not invent two
  accessible sliders.
- Slider pointer and keyboard updates, alpha model value `0.5`, percentage
  output, controlled HSL, RGB channels, disabled inputs and three usable
  vertical tracks with measured height greater than 100px.
- Field external controlled updates, clearing and typed hex input; actual
  description association; HSL hue editing yielding `#007F00`; RGB red editing
  yielding `#FF82F6`; native required `reportValidity()` and displayed invalid
  state; source invalid message; keyboard preset activation.
- Native form data `["brand-color", "#0485F7"]`, disabled empty submit, pending
  button state and post-submit clearing/reset.
- Swatch-picker native listbox/options, pointer selection, arrow navigation plus
  Space activation, controlled value text, disabled options and a selected
  custom star indicator.
- Transparency checkerboard/alpha background and all three custom style callback
  groups, including computed 3px border, 14px shadow and 4px inset outline.
- All five color pickers open from Enter, expose a dialog, close with Escape and
  return focus. Presets, typed field updates, shuffle, hue/area interaction and
  native color-space selection propagate through the shared model.
  `WithSliders` changes HSL/HSB/RGB channels and alpha without resetting the color.
- Portalled pickers resolve different theme backgrounds:
  light `oklch(97.02% 0 0)`, dark `oklch(12% .005 285.823)`.

Additional deliberately scoped checks:

- `WidthFields`, both themes, at **390×844**, under reduced motion: popup fits
  the viewport, RGB selection remains usable, computed transition and animation
  durations are zero.
- A fresh **Arabic `ar-AE` browser locale with RTL document direction**:
  horizontal alpha ArrowLeft increases the model from `0.5` to `0.51`.
  No locale-specific export exists in these six source files; this is
  supplemental locale/direction coverage, not a fabricated source story.
- Six production screenshots are recreated: controlled picker, custom swatches
  and mobile picker, each in light/dark. Mobile and custom-swatch captures were
  inspected during implementation. Controlled screenshots contain the source's
  random shuffle and are not deterministic golden images.

No page errors occurred. No core implementation blocker remains for the
exercised source workflows. This is **not** an upstream pixel-parity claim,
a full-family responsive/RTL audit, a touch-device proof, an exhaustive
accessibility audit or a WCAG AA claim. Wide source comparison matrices are not
claimed to fit mobile; only the specified picker workflow has mobile coverage.
Exact upstream colors retain the contrast caveat in `DESIGN.md`.

## Rerun from fresh distributions, without parent writes

Activate Node **24.18.0** and pnpm **11.5.0**, then run from the repository root:

```sh
scratch="$(mktemp -d "${TMPDIR:-/tmp}/lenso-color-proof.XXXXXX")"
readonly_deps="/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui"
node packages/storybook/stories/color-build.fixture.mjs "$scratch" "$readonly_deps"
```

The fixture refuses scratch paths inside either repository and creates a new
`color-validation` directory. It copies current source without existing
`dist`, `node_modules` or Storybook output, links only inside scratch to one
physical readonly dependency root, and remaps `@lenso/ui`/`@lenso/tokens` to
fresh scratch distributions. It uses direct existing build binaries rather
than invoking an installer; no parent files, repository dependency links,
manifests or lockfiles are written.

It reproduces the declared token/UI build stages, strict Storybook `tsc --noEmit`,
production Storybook build and the live proof. Output:

- `color-build.json`: toolchain, executed stages and source/dist/static tree hashes.
- `color-proof.json`: exact source/export hashes, implementation hashes,
  production index hash, 102 mount geometries, workflow results and screenshot hashes.
- Six `color-*.png` screenshots and production `color-storybook-static/`.
- On assertion failure, the proof also saves `color-failure.html`.

By default the proof fetches the six immutable raw sources. `COLOR_SOURCE_DIR`
can point to an existing cache containing `<family>.tsx`; complete-file
hash verification remains mandatory. A previously built production directory
can be checked with `COLOR_STORYBOOK_STATIC`, `COLOR_PROOF_OUTPUT` and
`PLAYWRIGHT_MODULE` using the standalone `stories/color-proof.mjs`.

## Recorded accepted run

The following hashes identify the accepted source/build snapshot. A rerun emits
new artifact hashes: absolute scratch paths, unrelated production stories and
source random shuffle can change build/report/screenshot bytes.

| Accepted input/artifact   | SHA-256                                                            |
| ------------------------- | ------------------------------------------------------------------ |
| tokens source tree        | `2ae7131bba360cceedfbfaa343ef3ce6ae032a331cc225c835df6b9f23088b9b` |
| UI source tree            | `27faf4a6b4a9866e9244d99c4ccad92676234a290ffb9f28746ca91c359dbf8a` |
| fresh tokens dist tree    | `24c392e710bd87ad2ece5a28d0ae10e510927d6a586ab40bc74f69b6cec0078c` |
| fresh UI dist tree        | `c946e53cdf219a7104e716a8233eee2ee2f20624222fae2de3cf70cbc471d9ca` |
| production Storybook tree | `5a0d8b7d83c5cfa7cb85f5552357863b7ba802e89a8758826320f090b576626f` |
| production index          | `a320c5d021a1f02ada508f5bb3c3a37edbb5a34382eab27f1ec6d71515ef0985` |
| color-build.json          | `50048ad850ba40111740f5d9dba534052dd0006cedce6e097df13ed1da5cb406` |
| color-proof.json          | `431a2210bfc1f4004632d2e9959820e11bd92dc993fc2622dcb85c471eb989d3` |

| Delivered story/fixture         | SHA-256                                                            |
| ------------------------------- | ------------------------------------------------------------------ |
| color-area.stories.tsx          | `14f308e3b76100e5178c568787bae1084c4a075b7c5581ae060dd1990cbe9b70` |
| color-field.stories.tsx         | `5d22bd12bf204d261ed246245e83069cf46374ff00bdd4a65307658d1b1acdae` |
| color-picker.stories.tsx        | `ad67964a4e12ffad92892e8c8b51046e09834dbd20ca75dc30dc93fb1c038869` |
| color-slider.stories.tsx        | `9e3b46dc09e6e3c186c906d8f53cda93b9b83d6406e8682584d9bcebc359674b` |
| color-swatch-picker.stories.tsx | `728a611edaead813a53ea0bc9014db144f1b4f07787ed1f506f8bea487405610` |
| color-swatch.stories.tsx        | `d6166a4975a5d85b7f920bf8855cafc9a99d322541a1b020b9e34bf6caba002b` |
| color.stylex.ts                 | `c76ed7731289530ede5b37e51f7f8d3246b596f5113604f78a6bc389bcce0fad` |
| color-fixtures.tsx              | `ef9906ff94a2fcb27e036be99aa90fa4050a5e939a7a4270a65a6eb76d325431` |
| color-proof.mjs                 | `f2fb2d6bd3b97d5e7a276d61c67a805ec36ca0dc5598f3dcfa5682dcd5bc141c` |
| color-build.fixture.mjs         | `eda92baade16dd6e971452cc5eff7088d444edfa7b21022aa3acbcd3f7b9697e` |

Scoped oxlint and oxfmt were also run using readonly existing binaries.
The supplementary React Doctor changed-scope command was attempted with an
isolated scratch npm cache but timed out during tool acquisition; no score
is claimed. That does not substitute for or weaken the recorded strict
TypeScript, production and browser checks.

## Design filter and licenses

Antislop was applied **during** reconstruction using `DESIGN.md`'s pinned
source direction, not a newly invented visual style. The stories are
component demonstrations: color gradients/checkerboards encode actual channels
and alpha; shadows demonstrate source custom styling; the star demonstrates
a selected custom indicator; shuffle is a real action. No decorative marketing
panels, fake content, new motion or arbitrary palette were introduced.
Source rhythm is retained through compiled spacing. Functional delivery checks
passed within the measured scope above, not across untested viewports.

HeroUI-derived story content retains Apache-2.0 headers, Copyright NextUI Inc.;
the upstream license and notices are in `third-party/heroui/LICENSE.txt` and
`third-party/heroui/NOTICE.md`.

The two offline SVG paths in `ColorStoryIcon` are Gravity UI `star-fill` and
`shuffle`, retrieved from `https://github.com/gravity-ui/icons/tree/main/svgs`.
They preserve the source-requested icon identities with no icon runtime/network
dependency. Their license is MIT, Copyright (c) 2022 YANDEX LLC; the complete
existing license is retained at `packages/storybook/GRAVITY-ICONS-LICENSE.txt`.
