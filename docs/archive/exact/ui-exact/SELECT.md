> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Select for Exact Web

Select keeps its canonical string array in the caller's Exact state. Single
selection uses an empty array or one entry; multiple selection toggles individual
entries without joining or parsing their values. Labels are display content.

## Composition

Import `Select`, `SelectState` and `SelectOption` from `@lenso/ui-exact` for the
convenience composition. Supply `state`, `options`, `placeholder` and the Exact
`change` action. The runnable [example](example/select.contract) supplies every
state field and demonstrates both convenience and compound composition.

Compound exports are `SelectRoot`, `SelectTrigger`, `SelectValue`,
`SelectIndicator`, `SelectPortal`, `SelectPositioner`, `SelectPopover`,
`SelectList`, `SelectItem`, `SelectItemText`, `SelectItemIndicator`, `SelectLabel`,
`SelectGroup`, `SelectGroupLabel` and `SelectSeparator`. Keep the trigger and
positioner within their owning root. Give each root a stable, unique `id`; the
trigger controls its generated list ID. Compound items call the root's Exact
`change` action. `SelectValue` accepts caller-derived text and an empty state.

`SelectState` includes `id`, `label`, `labelledBy`, `describedBy`, `value`,
`defaultValue`, `multiple`, `disabled`, `readOnly`, `required`, `invalid`, `name`,
`form`, `variant`, `fullWidth`, `direction`, `side`, `align`, `sideOffset` and
`collisionPadding`. Variants are primary/secondary. Sides are top/bottom/left/right
and alignments are start/center/end. Options supply `value`, `label` and `disabled`.

## Interaction and materials

Exact actions own selection. Native buttons and the HTML popover API provide
activation and top-layer light dismissal. The Web adapter adds listbox keyboard
navigation, selected-item focus, disabled-item skipping, incremental typeahead,
Escape/Tab dismissal, focus restoration and collision-aware positioning.
Closed typeahead changes only single selection. Multiple selection keeps the
popup open while choosing items. Disabled and read-only controls reject changes.

Trigger geometry and presentation reuse the source popup-button/select tokens.
Rows reuse the source menu tokens. The popup uses medium Glass, tracks live
geometry/backdrop, and uses an opaque treatment under forced colors or reduced
transparency. Opening/closing creates/disposes its optical work. Root, trigger
and positioner disposal restore adapter-owned attributes and styles.

Named hidden inputs submit one entry per selected value. A separate clipped
validity input carries required validation and redirects invalid focus to the
trigger. Reset invokes the caller's Exact action with `defaultValue`; a canceled
reset is respected. The optional `form` field associates inputs with an external
form. The browser fixture creates an HTML form before adapter initialization;
it does not establish parity with the separate public Form family.

## Acceptance and open coverage

An isolated compiled consumer passed Chromium 156.0.8078.4 and WebKit 27.2 on
November 11, 2026. Each engine checked 25 affected presentation recipes, keyboard
navigation/typeahead, native pre-adapter open/selection, single/multiple values,
Unicode/comma values, caller changes, disabled/read-only transitions, groups,
dynamic items, outside/Tab dismissal, native form submission/reset/required
validation and removal/remount cleanup. Sixteen screenshots cover primary and
secondary, light/dark, and 390/820px layouts. RTL/full width and forced-color
fallback are also checked. No page or console errors were recorded.

The candidate builds 4340 core and 5856 consumer recipes, with the existing
Popover lower-dialog-role warning. Its 107 runtime assets are fingerprinted in
`.cache/acceptance/select-acceptance.json`. The upstream Exact pin and compiler
remain unchanged. Focused checks are distinct from the full catalog browser gate,
which was not rerun for this slice.

This family remains **Partial**. Controlled open state and open-change/completion
callbacks, object values/custom equality, selected-item alignment, scroll arrows,
arrow/backdrop parts, custom portal ownership, autofill and the source spring/morph
motion still need implementation or acceptance. Physical touch, assistive
technology, Safari application/device behavior, Glass optical parity and
comparative performance are not established by these browser tests.

The pinned Exact compiler does not expose a native label declaration or all
required/readonly/listbox attributes. The adapter supplies supported DOM
attributes after initialization; the label uses the existing focus connector.
Pre-adapter validation/label semantics remain limited. This preserves the owner's
decision to keep upstream unchanged; see [semantic gaps](SEMANTIC_GAPS.md).
