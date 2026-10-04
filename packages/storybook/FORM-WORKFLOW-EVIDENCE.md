# Remaining form Storybook batch

## Result and boundary

The batch provides the exact **35 named source scenarios**: SearchField 12,
NumberField 14, and InputOTP 9. These are adaptations of the pinned Storybook
files, not re-exports of documentation demos and not aliases of a default story.

Only the three story files, `stories/form-workflow*` fixtures/styles/proof, and
this report belong to this batch. No UI, shared styles, documentation demos,
primitives, dependency/configuration files, source inventory, general coverage,
release, or landing files were changed for this work.

Source adaptation and executable workflow coverage are established below.
**Full pixel parity is not established.** There is no paired upstream browser
capture or pixel-diff baseline in this batch. In particular, native OTP inputs
replace the upstream single-input/painted-slot architecture intentionally.

## Immutable authority and provenance

HeroUI **3.2.6**, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
All three complete raw files were fetched and read before implementation. The
proof fetches them again and compares their exact ordered named exports with
both the local source files and the production Storybook index.

| Family      | Raw source                                                                                                                                                                                   | SHA-256 of full source file                                        |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| SearchField | [search-field.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/search-field/search-field.stories.tsx) | `8cbd8fda1580e726900812384410398b135576d0cd5f30cd189b2c8db091d110` |
| NumberField | [number-field.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/number-field/number-field.stories.tsx) | `94b1184840cef8696df7ee2502fc781a96460713e47c87633cd3e33d5b9ab1da` |
| InputOTP    | [input-otp.stories.tsx](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components/input-otp/input-otp.stories.tsx)          | `e822ba41e4c50e21c288550bac097cde9af98563ffa05d963dcd57f8aee7c872` |

Derived files carry HeroUI Apache-2.0 attribution. The original custom filter,
clear, zoom-minus, zoom-plus, and chevron SVG path data are retained verbatim and
checked against the pin. No substitute illustrations, stock imagery, or
generated assets were introduced. Existing upstream notices and
`GRAVITY-ICONS-LICENSE.txt` remain untouched.

## Exact scenario inventory

- **SearchField (12):** `Default`, `Variants`, `FullWidth`, `WithDescription`,
  `Required`, `Invalid`, `Disabled`, `Controlled`, `WithValidation`,
  `CustomIcons`, `FormExample`, `WithKeyboardShortcut`.
- **NumberField (14):** `Default`, `Variants`, `FullWidth`, `WithDescription`,
  `Required`, `Invalid`, `Disabled`, `Controlled`, `WithValidation`, `WithStep`,
  `WithFormatOptions`, `CustomIcons`, `WithChevrons`, `FormExample`.
- **InputOTP (9):** `Default`, `Variants`, `FourDigits`, `Disabled`,
  `WithPattern`, `Controlled`, `WithValidation`, `OnComplete`, `FormExample`.

## Adaptation decisions

- **Search:** Base Field owns name, disabled and invalid state; Base Input owns
  value, required and the forwarded input ref. The field has genuine search
  inputs, icons and a native clear action. Controlled example/clear actions,
  live minimum-three-character feedback, native form values, the 1500ms search
  submission/reset, and Cmd/Ctrl+K and Escape focus behavior are separate
  workflows. The pin contains no results dataset or list-filtering scenario;
  none was invented or conflated with the documentation filter demos.
- **Number:** Each source scenario composes `TextField` around native
  `NumberField` parts to retain Base Field label/error/registration context.
  `minValue`/`maxValue`/`formatOptions`/`onChange` become native
  `min`/`max`/`format`/`onValueChange`; empty controlled values use `null`.
  The original 1024/100 defaults, -5/150% invalid examples, 1/5/10 steps, EUR
  accounting/USD/percentage/two-decimal/kilogram formats, and custom icons are
  retained. The stacked-chevron layout remains distinct, with 24px half-height
  buttons. The order form keeps native maximum 5 separate from stock policy 3,
  its exact messages, and its 1500ms processing/reset.
- **Number source quirk:** `WithValidation` compares the fractional percentage
  model against 100 while its native maximum is 1. That predicate is preserved,
  not silently “corrected” or used as evidence for the stock form's error path.
- **OTP:** Slots are genuine Base UI inputs, registered by composition rather
  than upstream slot indexes. Numeric filtering, whitespace normalization,
  truncation, clipboard distribution, typing/backspace, controlled clearing,
  and hidden native form values come from the native OTP contract. The
  alphabetic source pattern becomes `validationType="alpha"`. Source
  `onComplete` becomes `onValueComplete`, which fires after the value change.
  The validation form still accepts only `123456` and alerts then resets.
  `OnComplete` accepts any completed code and resets after 2000ms; the
  two-factor form verifies `123456` after 1500ms and retains invalid values with
  an error on failure.
- **OTP controls:** The story-only `isDisabled`, `isInvalid`, and `maxLength`
  controls retain their original boolean/boolean/number types with no invented
  default args. They are not UI package compatibility props. Just as in the
  pin, explicit per-story six/four lengths override the `maxLength` control.
  `Variants` intentionally does not spread args, as in the source.
- **StyleX:** The original 4/8/16/24px story spacing and 120/280/400px widths
  are compiled StyleX. The 400px full-width specimens are viewport-bounded on
  narrow screens. No Tailwind runtime or React Aria ordinary controls were
  introduced. Timers are cleaned up on unmount, and duplicate async activation
  is blocked without making a loading action unfocusable.

## Executable proof

`stories/form-workflow-build.fixture.mjs` builds fresh tokens and UI
distributions, checks the entire Storybook project with strict TypeScript,
builds production Storybook, and builds a separate native-contract consumer.
The supplemental consumer is not a source story or an additional export.

`stories/form-workflow-proof.mjs` serves those production artifacts and drives
actual Chromium pages. It does not render imported source snippets.

Verified with **Node 24.18.0** and the provided **pnpm 11.5.0** dependency
environment:

| Check                                                                       | Result                                                                         |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Exact ordered exports versus all three immutable raw files                  | PASS: 12 + 14 + 9 = 35                                                         |
| Genuine custom SVG path data versus raw source                              | PASS                                                                           |
| Fresh tokens/UI builds, declarations, CSS and notices                       | PASS                                                                           |
| Strict Storybook TypeScript, including owned fixtures                       | PASS                                                                           |
| Production Storybook and supplemental consumer builds                       | PASS                                                                           |
| Actual production iframe mounts at 1100 × 900                               | PASS: all 35 in both themes = 70                                               |
| Source search control/clear/Escape/shortcut/validation/form                 | PASS in both themes                                                            |
| Source number invalid values/formats/steps/chevrons/stock form              | PASS in both themes                                                            |
| Source OTP controlled/PIN/alphabetic/validation/completion/two-factor forms | PASS in both themes                                                            |
| Native clipboard paste and numeric/alphabetic rejection/truncation          | PASS in both themes                                                            |
| Native FormData values, visible errors, loading and async reset             | PASS in both themes                                                            |
| Supplemental de-DE parsing, en-US reformatting, 0.5 step, max clamping      | PASS in both themes                                                            |
| Supplemental native number/input refs, disabled omission, required error    | PASS in both themes                                                            |
| Mobile iframe overflow at 390 × 844                                         | PASS: all 35 in both themes = 70 additional mounts                             |
| Reduced-motion form mounts and zero-duration group/slot transitions         | PASS                                                                           |
| Browser page errors                                                         | PASS: none                                                                     |
| Scoped oxlint                                                               | PASS: zero errors and warnings                                                 |
| Scoped oxfmt                                                                | PASS                                                                           |
| React Doctor changed-scope regression scan                                  | BLOCKED: scratch-only npx attempt failed with npm ECONNRESET; no score claimed |

Geometry checks include 280px default search inputs, 120px default number
inputs, 38 × 40px OTP slots, 400px full-width desktop groups, and stacked
24px chevron hit areas. The proof collects input colors, font sizes and group
rectangles for every desktop mount, and captures default/invalid/chevron
screenshots for inspection. Those artifacts are scratch-only, not an upstream
pixel-parity baseline.

The assertions cover actual `FormData` (`search`, `quantity`, `code`, and
normalized `amount`), invalid `-5`/`150%`, live stock errors, loading focusability,
duplicate-search keyboard activation blocking, the OTP success alert, and
the distinct 1500/2000ms reset paths. The native-contract consumer proves
`1.500,50` parses to hidden `1500.5`, reformatting to `1,500.50`, and disabled
numbers disappear from `FormData`.

## Reproduction without parent writes

Use an empty scratch directory and a read-only dependency project. Nothing is
linked into the repository; all writable package distributions, Vite caches,
Storybook output, consumer output and dependency links live in scratch.
`@lenso/ui` and `@lenso/tokens` links target fresh scratch distributions, never
the parent's built packages.

```sh
export PATH=/Users/leosouthey/.local/share/mise/installs/node/24.18.0/bin:$PATH
DEPS=/Users/leosouthey/Projects/framework/lenso-ui/.delta/worktrees/gh6m3ndgjcxx/lenso-ui
SCRATCH="$(mktemp -d)"
node --version
pnpm --version
node packages/storybook/stories/form-workflow-build.fixture.mjs "$SCRATCH" "$DEPS"
node packages/storybook/stories/form-workflow-proof.mjs \
  "$SCRATCH/form-workflow-storybook-static" \
  "$SCRATCH/form-workflow-contract-static" \
  "$DEPS/packages/react/node_modules/playwright/index.mjs"
```

When `DELTA_SCRATCH_DIR` is available, proof JSON and screenshots are written
there. The JSON records pin, source hashes, exact exports, mount counts, all
desktop geometry, page errors, and observed core parity gaps.

## Remaining limits and delivery gate

- **Native acceptance:** All 35 source workflows remain accepted by the scoped
  proof. The separate invalid-outline appearance defect below does not block
  native validation, errors, FormData, controls, or async submit/reset.
- **Core visual gap:** Unfocused invalid SearchField and NumberField groups
  lack the pinned danger outline in both themes. The two invalid specimens per
  family produce eight mismatch measurements in the iframe proof. No shared
  fix is included in this batch; the parent owns diagnosis and follow-up.
  Ordinary group heights, empty-search clear opacity and entered OTP digit
  typography produced no additional measured discrepancy.
- **Reference links:** The pin's `Resend` and `Use backup code` links have no
  destination or handler. They remain source-reference content, not live
  resend or backup-code workflows. No backend, fake success or invented route
  was supplied.
- **Full-pixel parity:** Not claimed. Native OTP selection/caret behavior and
  the upstream painted value/caret animation architecture are not equivalent
  pixel baselines. RTL, browser autofill and cross-browser fidelity are not
  established by this proof.
- **Integration:** Full-repository browser integration remains parent-owned.
  Nothing was published, committed, released, merged or landed.

### Durable invalid-outline reproduction

[`form-workflow-invalid.fixture.tsx`](stories/form-workflow-invalid.fixture.tsx)
is a minimal reproduction without compensating styles. It contains
`SearchField invalid` with value `ab`, and `TextField invalid` around
`NumberField value={-5} min={0}`. It has real labels and visible native
`FieldError match` messages. The build recipe adds a production consumer route
`/contracts/?case=invalid&theme=light` or `theme=dark`; the proof records both.

The exact pinned
[invalid-field-ring utility](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/utilities/index.css)
contains:

```css
@utility invalid-field-ring {
  /* Unfocused: show 1px outline */
  @apply outline-1 outline-danger outline-solid;
  --tw-ring-offset-width: 3px;

  /* Focused: show 2px ring in danger color, remove outline */
  &:focus,
  &:focus-visible,
  &[data-focused="true"],
  &[data-focus-visible="true"],
  &:focus-within,
  &[data-focus-within="true"] {
    @apply ring-2 ring-danger ring-offset-0;
    --tw-ring-offset-width: 0px;
  }
}
@utility status-invalid-field {
  @apply invalid-field-ring;
}
```

Both pinned
[search-field.css](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/search-field.css)
and
[number-field.css](https://raw.githubusercontent.com/heroui-inc/heroui/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/styles/components/number-field.css)
apply `status-invalid-field` to the group's `&[data-invalid="true"]` state.
Base UI correctly uses presence-valued state attributes instead:

- Search root: `data-invalid=""`; input: `data-invalid=""`,
  `aria-invalid="true"`; group: `data-slot="search-field-group"` without an own
  invalid attribute.
- Number outer field, root, group and input: `data-invalid=""`; input:
  `aria-invalid="true"`.
- **Both groups match `:has([data-invalid])`.** This is not missing native
  invalid propagation. The shared group invalid rule paints border color but
  does not supply the required danger outline.

Snapshot measured at this batch's delivery, before a parent-owned core fix:

| Specimen                 | Expected unfocused outline                     | Actual computed outline                                        |
| ------------------------ | ---------------------------------------------- | -------------------------------------------------------------- |
| Search and Number, light | `1px solid` danger `oklch(65.32% .2328 25.74)` | width `3px`, style `none`, color `oklch(0.2103 0.0059 285.89)` |
| Search and Number, dark  | `1px solid` danger `oklch(59.4% .1967 24.63)`  | width `3px`, style `none`, color `oklch(0.9911 0 0)`           |

The browser's `3px` computed width is inert because the outline style is
`none`. Matched production CSS for both minimal fixtures includes:

```css
.x1a2a7pz:not(#\#):not(#\#) {
  outline: none;
}
.x1gdjkvt:has([data-invalid]):not(#\#):not(#\#) {
  border-color: var(--danger);
}
.x1hl8ikr:not(#\#):not(#\#):not(#\#) {
  outline-offset: 2px;
}
```

These generated names are recorded diagnostic output, not assertions or
implementation dependencies. The full ordered matched-rule list, group/input
attributes, ancestor states, and expected/actual computed properties are
captured in `invalidFixtures` in the proof JSON. The shared implementation
being observed is the
[group style map](../styles/src/components/input-group/input-group.styles.ts#L14-L33),
also exported as the
[number group map](../styles/src/components/number-field/number-field.styles.ts#L4).
This batch leaves both unchanged.

Antislop was applied during implementation, with the pinned HeroUI direction
instead of a new visual identity. Its delivery gate has the following scoped
status:

- **Direction/provenance PASS:** pinned scenarios, text and genuine SVG data,
  source-derived spacing, themes and focused form layouts; no invented assets.
- **Purpose/content PASS:** each scenario proves its own form behavior rather
  than a generic default; no decorative cards, gradients or marketing copy.
- **Motion PASS:** source loading feedback only, focusable pending actions,
  cleaned-up timers and tested reduced-motion transitions.
- **Responsive/theme resilience PASS:** all 35 stories mounted in both themes
  at desktop and mobile sizes; source workflows exercised with real keyboard
  and clipboard events.
- **Source invalid-ring visual parity GAP:** native invalid state is present,
  but the shared group style has no unfocused danger outline; exact source,
  fixture, computed properties and matched rules are recorded above.
- **Functional completeness LIMIT:** the form controls work; the two upstream
  reference links are intentionally not claimed as working product actions.
- **Evidence honesty PASS:** adaptation, executable workflow proof, reference
  links, blocked React Doctor scan and unproven full-pixel parity are separated.
