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

These runs used the parent’s existing built component graph. They prove the
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
