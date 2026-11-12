> Historical Exact experiment, retired on 2026-11-13. See the [archive and recovery record](../README.md). Original runnable source is preserved at the checkpoint commit.

# Autocomplete for Exact Web

Autocomplete is popup-search selection: a native external button displays the
selected value or removable chips, and a separate native search input lives in
its anchored listbox popup. It does not accept arbitrary search text as a value.
For an editable external input, use ComboBox.

`AutocompleteState` declares the same explicit controlled selection/search,
form, filter, positioning and appearance fields as ComboBoxState, plus
`searchLabel` and `searchPlaceholder`. `placeholder` labels the empty trigger.
`input(text)` proposes search; `change(keys, text)` proposes selection and search
together. Single and multiple selection clear the query on commit. Closing
proposes an empty query without replacing selected keys. Callers may reject
requests. Selection keys remain opaque, including empty, comma and Unicode keys.

`Autocomplete` supplies a complete convenience composition; the exported Root,
Label, InputGroup, Trigger, Value, Indicator, ClearButton, Portal, Positioner,
Popover, Input, SearchClear, List, Item, ItemText, ItemIndicator, Group, GroupLabel,
Separator, Empty, Status, Chips, Chip and ChipRemove support authored composition.
Root takes the available options for API consistency; each Item owns a controlled
selection request. The application remains the only selection/search owner.

Input and native popup/trigger/option nodes derive from guarded canonical
primitives. The shared collection controller uses a popup-search mode: the trigger
is a tab stop, opening focuses the now-visible search, and Escape/selection returns
to the trigger. Search clearing retains selection and the open popup. Ordinary
field and popup recipes come from the shared Autocomplete tokens; no new Glass
lens or upstream SDK change is introduced. Named hidden values and a selection
validity proxy support native form submission, reset and external association.

The compiled example is `example/autocomplete.contract`. Browser acceptance is
recorded separately; typechecks and source snippets do not establish rendering.
Virtualization, asynchronous loading conventions, custom search text independent
of labels, automatic child context, render/refs/native forwarding, controlled
open state, reference motion/optics, physical IME and native devices remain open.

## Focused Web acceptance

The isolated stock Exact consumer passes Chromium and WebKit grouped selection,
accent filtering, disabled options, query/choice rejection, no-results status,
clear/search-clear, trigger and chip keyboard focus, RTL, readonly/disabled,
external model updates, removal/remount, native form validity/reset/external
association and native browser taps. Synthetic composition retains drafts across
a theme redraw and submits one query; physical IME remains unqualified.
Sixteen variant/theme/width popup captures and sixteen external-field captures
retain popup/option geometry assertions. Native Host input borders explicitly
yield to the source's borderless search recipe using a scoped StyleX selector.
The preceding popup candidate's border observations are preserved separately.

Receipt: `.cache/acceptance/autocomplete-borderless/acceptance.json`.
The unchanged shared controller also passes the existing ComboBox focused suite
in `.cache/acceptance/autocomplete-combo-regression/acceptance.json`; this cohort
predates the Autocomplete-only border and grouped-example changes.
The package suite passes 62 tests / 221 assertions, types cover 113 files, and
affected lint/format plus the stock isolated consumer build pass. These are
selected candidate checks, not source optical/motion parity, full API completion,
native acceptance or performance measurements.
