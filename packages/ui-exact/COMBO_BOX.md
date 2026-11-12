# ComboBox for Exact Web

ComboBox combines a primitive-derived editable Input, native popover invoker and
positioner, and primitive-derived option buttons with shared Lenso ComboBox
recipes. The input group reuses its source Glass field treatment; the popup uses
the source collection-field background/backdrop CSS rather than adding a new
Glass lens. Filter matching is adapted from the installed Base UI 1.9.0 pure
collator algorithm, retaining its MIT notice without React hooks/runtime imports.

## Controlled composition

`ComboBoxState` includes id, label, labelledBy, describedBy, value, inputValue,
defaultValue, defaultInputValue, multiple, disabled, readOnly, required, invalid,
name, form, placeholder, variant, fullWidth, direction, filter, locale,
autoHighlight, loop, side, align, sideOffset and collisionPadding. Value is a
unique string array; single mode uses zero or one entry. InputValue is the
application's current displayed/query text. Option values are stable keys;
labels are display/filter text. Empty, comma-containing and Unicode keys remain
values and are never joined or parsed to communicate selection.

The convenience `ComboBox(state, options, input, change, triggerLabel, clearLabel,
emptyLabel, statusLabel)` renders the labelled input group, chips in multiple
mode, options, empty message and live status. `ComboBoxOption` contains value,
label and disabled. Labels are caller-provided; statusLabel can contain `{count}`
(for example `Matching options: {count}`), formatted with the state's locale.

`input(text)` proposes edited text. `change(values, text)` proposes selection and
its associated display text together. The caller can accept both in one Exact
action or reject them; there is no independent selected-value owner in the Web
adapter. Selection chooses the option label in single mode and clears query text
in multiple mode. Chip removal retains current query text. Clearing a single
input's text also proposes clearing selection. On close, the root proposes the
selected single label or empty multiple query. Root options supply label lookup;
keep selected options in that pool when composing an independently filtered list.
A missing selected option falls back to its key. Parent-controlled behavior can
retain a proposed query/selection when rejecting normalization callbacks.

Compound parts are Root, Label, InputGroup, Input, Trigger, Indicator, ClearButton,
Portal, Positioner, Popover, List, Item, ItemText, ItemIndicator, Group, GroupLabel,
Separator, Empty, Status, Chips, Chip and ChipRemove, exported with the ComboBox
prefix. `ComboBoxRoot(state, options, change)` contains the compound control;
pass state/input to Input and state/change to item/clear/remove parts. Use stable
option indices for unique option IDs. Contract loops provide collection rendering.
See the [compiled consumer](example/combo-box.contract) for grouped single and
convenience multiple compositions with all state fields and callback signatures.

The native option projection also resets bare-button content-box sizing and
centered text, preserving the source div-like item geometry and RTL text alignment.

## Interaction and native values

Focus stays in the input while ArrowUp/Down/Page keys highlight enabled options;
aria-activedescendant points to the highlighted option. Home/End normalize caret movement across the checked browsers. Enter chooses through the option's native action. Escape closes
and restores the selected display; Tab uses native focus order while closing.
Trigger opening shows all options; typing uses contains/startsWith/none filtering.
Matching uses the declared Intl.Collator locale, with Base UI's case/accent and
fixed-span substring behavior. Filtered groups and redundant separators hide
with their rows. Empty and status output reflect matching rows, including disabled
ones; navigation skips disabled rows. AutoHighlight and Loop are explicit flags.

Multiple chips support pointer removal, Backspace from empty input and directional
keyboard navigation respecting RTL. Delete/Backspace on a focused chip requests
removal, then moves to an adjacent chip/input after accepted removal. Rejected
removal keeps the chip. Read-only/disabled states block edits and opening.

Native text is held briefly while Exact processes the input action, then reconciled
to application state. The bounded pending text is an input intent, not another
selection model. Composition drafts are retained through redraw, and composition
completion forwards one input. Synthetic composition checks do not qualify a
physical IME, mobile keyboard or every composition cancellation path.

Named hidden inputs submit selected keys, with one entry per value in multiple
mode. Query input has no submitted name. A clipped validity proxy validates
selection, including a selected empty-string key; invalid focus goes to the real
input. Form reset proposes defaultValue/defaultInputValue, respects cancelled
resets and follows an explicit external form association. Required validation is
not applied to the editable query input itself. Disabled values are excluded.

The generated native input preserves canonical editing/readonly bindings. Its
raw Input submit binding is removed: Enter is consumed for an open option list,
while closed-input Enter can follow native form submission. Its
aria-controls/haspopup/expanded and combobox role are authored on that same node.
The option derivative projects canonical menu-item buttons to options and removes
their unconditional hide command so multiple choice can remain open. Native
popover semantics come from canonical source. These are explicit UI compatibility
projections, with source/anatomy drift guards, not unchanged raw primitive APIs.

## Verification and open gates

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/combo-box-browser.mjs
```

PLAYWRIGHT_MODULE selects an installed browser module and
LENSO_EXACT_TEST_ARTIFACTS selects evidence storage. The driver validates the
loaded app.js fingerprint and checks virtual focus, filtering/accent matching,
single/multiple and unusual keys, query/selection rejection, live empty/status
output, chips, composition fixtures, dynamic options, external state, readonly/
disabled behavior, RTL, both variants and removal/remount. A native DOM form
fixture covers selected values, required/empty-key semantics, invalid focus,
reset/cancelled reset, external association and disabled exclusion. Mobile-browser
fixtures tap focus and choose an option. These are selected Web checks.

The family remains Partial for inline/modal/portal variants, custom value creation,
object/non-string value models, asynchronous/virtualized collection/window APIs,
arrow/backdrop composition, full callback/ref/render/native attribute/caller-style
coverage, initial filtering/ARIA/form readiness, reference motion/optics and native/
physical-device adapters. Unsupported aria-autocomplete/activedescendant,
multiselectable/readonly/ordinal attributes are projected by the Web adapter.
No runtime speed claim follows from these components or their generated assets.
