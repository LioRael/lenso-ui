# Autocomplete source comparison

Reference: HeroUI 3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`.
The exact commit's codeload archive was read, including:

- `packages/styles/components/autocomplete.css`
- `packages/styles/src/components/autocomplete/autocomplete.styles.ts`
- `packages/react/src/components/autocomplete/autocomplete.tsx`
- `packages/styles/components/list-box.css`, `list-box-item.css`,
  `list-box-section.css`, `search-field.css`, `input-group.css`, `tag.css`
- `packages/styles/utilities/index.css`
- `apps/docs/src/demos/en/autocomplete/default.tsx` and `custom-indicator.tsx`

The source is a selection trigger with search **inside the popup**. Its
structural InputGroup must not acquire an editable ComboBox's field surface.
Base UI owns the adapted selection, collection, disabled activation and focus.

## Corrections

- Value: replace the unstyled native fragment with a styled span around the
  unchanged native Value; flexible start-aligned text and field placeholder paint.
- Phone Value: replace inherited 14px/20px text with 16px/24px below 640px;
  the trigger grows from 36px to 40px.
- Popup/options: replace inherited page typography with 14px/20px text.
- Rows: add 4px sibling spacing; retain 36px minimum height and 6px list padding.
- Indicator gutters: use 28px trailing padding only when an indicator exists;
  otherwise use 12px on the trigger and 10px on items.
- Invalid secondary trigger: retain danger border/outline on hover and focus;
  secondary keeps the default fill and no field shadow.
- Search input: replace 4px vertical padding / 24px line height with the source's
  8px vertical padding and responsive 24px/20px line height.
- Motion: replace the single smooth curve with out-fluid 250ms entrance and
  out-quad 100ms exit; retain reduced-motion overrides.
- Clear: add the default 14px close glyph and source pressed scale, preserving
  caller-provided children.

The direct-child row spacing excludes native `virtualized` lists: external
virtualizers own row pitch and spacer heights. Adding margins there would break
the existing 50px row calculations.

## Browser evidence

Node 24.18.0; current-source fixture with the already-installed read-only
dependency graph copied locally and all local `@lenso` links rebound to that
fixture. No install or edits to the dependency input.

Five Chromium tests passed in `appearance.browser.test.tsx`:

- Light and dark scoped portalled paint, 256px popup/trigger alignment,
  36px desktop trigger and input, 14px popup typography, 4px row spacing,
  disabled opacity, disabled activation blocked, keyboard selection and focus
  restoration.
- 390px phone viewport: 16px Value / 40px trigger, search filtering and Escape.
- Secondary invalid hover/focus paint, native refs, render state and style
  callbacks, disabled trigger.
- Actual docs Default adaptation: RTL indicator 8px from logical trailing edge,
  popup typography/spacing, search, empty state, Escape/focus restoration.
- 160px constrained popup: list scroll reaches option 30, keyboard End/Enter
  selects it, and dynamic 287px xstyle width, 19px radius, native ref/render and
  state style survive.

## Final merged verification

The current [appearance integration tests](../../../../testing/integration/autocomplete-appearance.browser.test.tsx)
retain the six browser regressions below. Run them with
`pnpm --filter @lenso/testing test:integration` after the ordinary package build.
Historical merged-validation reports are not acceptance authority.

All six appearance tests passed. The added virtualized-list regression preserves
external 50px row pitch without the nonvirtualized list's 4px margin, including
native keyboard selection. Two relevant existing virtualization tests also passed.

The final Empty rule removes padding only when the native live region has no
children. Tests cover mounted, polite, atomic status semantics and zero height
with results, padded content with no matches, and zero height after recovery.
The node is never hidden or unmounted to collapse its spacing.

The canonical EN SearchField/Tag composition was corrected separately and
regenerated into CN. Its 16 theme/viewport/direction cases passed, with 32 actual
screenshots. Caller styles remain last; no provider or primitive edits were used
to conceal geometry differences.

No rendered HeroUI reference was compared: this remains source-derived geometry
and native behavior evidence, **not pixel-parity proof**. The stylesheet retains
its reduced-motion override; this final run does not certify live reduced-motion
emulation.
