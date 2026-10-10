# RadioGroup source examples

Authority: HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`. Scenario content was audited against
`content/examples/en/radio-group/*.json`, not the previous basic demo.

## Implemented source keys

Each matching TSX entry is a genuine named reexport from `examples.tsx`.

| Source key                       | Export             | Preserved scenario                                           |
| -------------------------------- | ------------------ | ------------------------------------------------------------ |
| radio-group-basic                | Basic              | Three described plans; premium initially selected            |
| radio-group-controlled           | Controlled         | React-owned selection and selected-plan output               |
| radio-group-uncontrolled         | Uncontrolled       | Native default selection and last-chosen output              |
| radio-group-disabled             | Disabled           | Entire subscription group disabled; pro selected             |
| radio-group-horizontal           | Horizontal         | Horizontal subscription options and short descriptions       |
| radio-group-validation           | Validation         | Required selection, field error, submit and FormData result  |
| radio-group-variants             | Variants           | Primary and secondary groups with source descriptions        |
| radio-group-on-surface           | OnSurface          | Secondary group inside padded rounded Surface                |
| radio-group-render-function      | RenderFunction     | Native render composition retains data-custom="foo"          |
| radio-group-custom-indicator     | CustomIndicator    | Checked-only checkmark instead of default dot                |
| radio-group-custom-styles        | CustomStyles       | Green billing cards, selected text/control/indicator styling |
| radio-group-delivery-and-payment | DeliveryAndPayment | Delivery prices, payment logos, nested responsive cards      |

## Contract adaptations

- Base UI `onValueChange`, `disabled`, `required` and indicator
  `render(props, state)` replace source React Aria callbacks and state names.
- Base UI Field owns group labels, descriptions and validation. Option
  descriptions use native spans with individual `aria-describedby` IDs:
  registering every option description with the group Field would incorrectly
  make every description part of the group description.
- Horizontal layout uses StyleX plus native `aria-orientation`; native Base UI
  arrow-key behavior is retained.
- State-dependent demo styles use Base UI radio ancestor selectors.
- The three original Iconify logos use exact embedded Iconify data so live
  rendering does not depend on a network request. Attribution is in
  `payment-icons.ts`.
- Billing uses native indicator render composition with an explicit dot instead
  of a pseudo-element. This preserves the source's selected scale and avoids
  a built-package versus consumer pseudo-element specificity conflict.
- The pinned twelve scenarios contain a disabled group, not an individual
  disabled-option or read-only example. No extra source scenarios were invented.

## Executed evidence

An isolated scratch consumer used the parent worktree's dependencies and built
packages read-only. No dependencies, configuration or generated files were
modified in either worktree.

- Strict TypeScript: passed for every local demo and StyleX module.
- Shared standard oxlint: zero warnings/errors.
- Shared standard oxfmt: passed.
- Production Vite consumer: built with StyleX `dev:false`, `devMode:"off"`,
  no CSS layers and LightningCSS `exclude:4`.
- Real headless Chromium: all twelve rendered in light/dark themes at
  1200px and 390px viewport widths; 48 screenshot captures.
- Chromium workflows passed:
  controlled selection updates output; uncontrolled selection updates output;
  every disabled-group radio is disabled; render composition retains its
  custom attribute and selection; empty required submit shows the custom error
  without success output; valid selection submits the expected FormData value;
  ArrowDown changes the basic selection; custom indicator displays one
  checkmark; billing, delivery and payment cards change selection.
- Forced activation of a disabled radio leaves the selected value unchanged;
  billing's selected dot computes to scale `0.5`; all three payment SVGs render.
- No page errors during those workflows.

## Remaining integration evidence

The preceding historical runs used the parent’s existing built component graph. They prove the
demo workflows and production compilation, not final component visual parity.
The consumer showed missing rounded-control geometry and secondary checked
colors. The component worker confirmed the pinned source uses rounded-lg
controls, not necessarily circles, and reported Vite extraction differences
versus direct Babel compilation. Check matched stylesheet rules and repeat
production screenshots against the consolidated component build before
attributing those differences to component behavior.

No pinned upstream rendered baseline was available in this isolated consumer;
pixel-identical upstream comparison, RTL and reduced-motion visual proof are
not claimed. Screenshots were scratch artifacts, not committed baselines.

## Shared-style correction

The current source audit used the pinned raw `radio.css`, `radio-group.css`,
`utilities/index.css` and English/Chinese RadioGroup demos.

- Radio keeps 16px controls, a 12px content gap and 14px medium labels.
- Option help text is 12px muted with a 28px logical indent. English and Chinese
  live demos consume the same StyleX map; card descriptions remain unindented.
- Vertical groups space radios with 16px top margins, including nested card
  radios, rather than adding a gap between every label and description.
  Horizontal groups retain a 16px wrapping row gap.
- Secondary controls set background variables instead of overriding the
  control's entire background state map. Upstream checked selectors have higher
  specificity than the secondary base selector, so checked accent fill remains.
  Unchecked indicator hover uses field/default hover colors.
- Invalid feedback follows the source utility: a danger outline, or a danger
  ring when focused, without replacing the selected background.
- Billing retains its explicit 12px group gap, zero radio margins and custom
  20px controls.

Current executed checks: six-file oxfmt and oxlint, English/Chinese demo oxlint
(27 files), strict scoped demo TypeScript using the docs configuration,
tokens/UI typechecks and builds, six existing tokens tests, Storybook TypeScript
and script TypeScript, `node --check` for the production choice proof and
`git diff --check`. UI bundling emitted the existing module-level `"use client"`
warnings.

The consolidated production Storybook build now passes `test:browser choice`:
100 light/dark story mounts, including the added radio geometry, secondary
checked/hover feedback, invalid outline and horizontal spacing assertions.
Selection, ArrowDown navigation, validation and responsive card checks pass
without page errors.

The production docs build and scoped live-example browser proof also pass for
toolbar, toggle-button, toggle-button-group and radio-group: 272 mounts across
English/Chinese, light/dark, desktop/mobile, including mobile RTL/reduced motion.
Every requested source example is implemented; no viewport overflow, client
errors or checked accessibility-semantic violations were found. This runner
disables color-contrast checks and is not a WCAG AA certification.

A separate settled-render comparison used the published HeroUI 3.2.6 CSS,
compiled only in scratch, with native state attributes mapped to source state
attributes and matching frame/font settings. RadioGroup Default was captured
at 1200px and 390px in both themes. Control dimensions, colors, radii, font
sizes and spacing matched; text-width rounding differed by 1/64px. This is
representative static-style evidence, not upstream React Aria runtime proof
or an exhaustive pixel baseline.
