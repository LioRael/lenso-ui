# ListBox for Exact Web

ListBox provides an ordinary rich collection with controlled selection and roving
DOM focus. It shares the existing Lenso ListBox item, indicator and section
recipes. The current primitive package has no headless ListBox; this is a Lenso
Web extension, with the pinned Exact SDK and both primitive packages unchanged.

## Composition

`ListBoxState` contains id, label, labelledBy, describedBy, keys, value, mode,
disabled, readOnly, direction, loop and selectionFollowsFocus. Keys and values
are string arrays; keys must be unique and include every rendered item's key.
Value is application-owned and may retain selected keys not currently rendered.
Modes are none/single/multiple. Direction is ltr/rtl.

Compose `ListBox(state, change, activate)` with `ListBoxItem(state, itemKey, id,
textValue, disabled, variant)`. Items accept rich noninteractive slot content.
Variants are default/danger. `ListBoxItemIndicator(selected, variant)` depicts
selection. `ListBoxSection(id, labelledBy)` groups items under a
`ListBoxSectionLabel(id)` slot. See the [compiled example](example/list-box.contract).
Use stable unique IDs and keys; labels are display and typeahead text, not keys.
Nested interactive children retain their own events and must not be used as
option labels for essential selection behavior.

The change action receives the entire proposed string array. A position mask over
the current key domain crosses the scalar native-event boundary; original keys
are never joined or parsed. Empty, comma-containing and Unicode keys therefore
remain distinct. The domain also retains selected keys outside the rendered
collection. Selection reads the current application projection without a second
optimistic value owner. Parent rejection leaves the selection unchanged.
Activate receives the item's original key on click, Enter or Space, including in
selection mode none. Read-only prevents selection while allowing focus/actions;
disabled prevents interaction and removes the collection from sequential focus.
Application actions remain responsible for their own side effects.

## Interaction

Arrow keys skip disabled options; horizontal arrows follow RTL. Home/End move to
the first/last enabled item. Loop controls wrapping. Typing finds matching labels,
with repeated characters cycling and a 500ms search window. Multiple mode supports
Shift extension/contraction, Ctrl/Cmd+A and Escape to clear selection. Plain
activation toggles multiple membership; single mode replaces it. Optional single
selection follows focus. Tab uses the browser's normal focus order.

Controlled values survive external updates and item removal/recreation. Focused
item removal moves to the first enabled item, matching the source collection's
registration fallback. Parent-declined removal leaves focus intact. Sectioned
items receive their mounted ordinal and set size. Nested collections are scoped
by their nearest owning root. Root removal releases listeners, queued validation
and search timers and restores adapter-owned attributes. Remounting uses the
application's retained values. Removed row journals are released immediately.

The pinned compiler does not expose aria-multiselectable, aria-readonly,
aria-posinset or aria-setsize on these native boxes. The Web adapter supplies them;
complete pre-initialization semantics/keyboard interaction remain an open gate.
Basic roles, labels, selected and disabled state are authored in Contract.

## Verification and remaining coverage

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/list-box-browser.mjs
```

PLAYWRIGHT_MODULE chooses an installed browser module and
LENSO_EXACT_TEST_ARTIFACTS chooses evidence storage. The driver checks the loaded
app.js fingerprint and exercises selection modes, range contraction, disabled
skipping, select-all/clear, typeahead, RTL/wrapping, parent rejection, external and
unmounted selection, focus recovery, dynamic availability, actions and remount.
Captures cover light/dark at 390/820px; native mobile-browser taps check multiple
selection. Pure tests cover range contraction and arbitrary-key identity.

The family remains Partial for virtualization, drag/drop and cross-collection
operations, number-key/object collections, arbitrary render/ref/native event APIs,
full caller-style/locale/accessibility coverage, reference indicator motion,
pre-initialization behavior and native/device adapters. This slice establishes
selected Web behavior and rendering, without a runtime performance claim.

[TagGroup](TAGS.md) reuses the collection bridge/controller with grid semantics
and removal confirmation. Its focused driver also runs ListBox regression checks.

WheelPicker now uses the same native root/item composition and selection bridge
through internal presentation helpers. A private controller request method lets
native scroll settlement propose selection without duplicating mask encoding.
Ordinary public ListBox props and behavior remain unchanged; the existing full
ListBox regression passes in both engines against this composition. Confirmed
initial Wheel focus follows its selected row only within the Wheel presentation.
See WHEEL_PICKER.md for its separate scope and receipts.
