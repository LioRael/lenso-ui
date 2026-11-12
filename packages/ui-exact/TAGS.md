# Tag and TagGroup for Exact Web

TagGroup shares the ListBox collection-selection helper, scalar selection bridge
and scoped keyboard/focus controller. It adds grid semantics and controlled tag
removal. Tags use the source Tag/TagGroup StyleX recipes and small Glass material.
No matching headless primitive currently exists; these are Lenso Web extensions.

The source selected-hover recipe pairs a strong tinted fill with tinted text;
its dark WebKit capture exposed insufficient contrast. The Exact presentation
retains the shared fill and uses native contrast-color for hovered selected
labels/icons. Where that CSS function is unsupported, the hover uses the subtle
fill and primary label tokens. This is an explicit readability adaptation, not a
change to shared source tokens or the original React implementation.

## Composition

`TagGroupState` contains id, label, keys, value, mode, disabled, readOnly, direction,
size, variant and removable. Keys and selected values are unique string arrays;
keys include every rendered tag key. Empty, comma-containing and Unicode strings
remain identities. Modes are none/single/multiple; direction is ltr/rtl. Sizes
are sm/md/lg and variants are default/surface.

Compose `TagGroup(state, change, remove)` with `TagGroupList()` and tags in its
slot. `Tag(state, id, itemKey, textValue, disabled, remove)` wraps rich content in
a grid cell and automatically adds its labelled remove button when removable.
For explicit composition use `TagRoot` with `TagContent` and `TagRemoveButton`.
TagRoot accepts the same state/id/key/text/disabled fields. TagRemoveButton takes
state, id, itemKey, label, disabled and remove. Its fallback remove action must
be the same application action as the root's remove action. The root captures
initialized remove clicks and dispatches one root request. See the
[compiled consumer](example/tag.contract).

Selection stays in the application. `change` receives the proposed selected-key
array, using the shared positional bridge without serializing authored keys.
Root state is passed explicitly to each tag; implicit context and standalone
ungrouped tags remain broader API work. Rich content must keep a valid grid-cell
structure. The convenience component uses two cells when removable and one when
not removable; custom cell arrangements need their own accessibility review.

## Removal and focus

`remove` receives the original tag key. The application decides whether and when
to remove it from its rendered keys. No optimistic hiding occurs. Delete or
Backspace on a focused tag and the remove button use the same request path.
Read-only/disabled/removable state guards selection and removal as appropriate.
Read-only still permits navigation. Disabled items are skipped.

Only after the requested row actually disconnects does the adapter propose
removing its key from selection and move focus to the recorded next enabled tag,
then the previous tag, then the group. A declined removal retains the tag and
focus. A deferred removal waits for the application's DOM update. The internal
post-removal deselection request is intentionally allowed after disabled/mode
changes, matching source cleanup after the parent has accepted removal. The
application can also reject that selection proposal. External removal without a
pending request uses the shared first-enabled focus fallback.

Arrow, Home/End, typeahead, repeated-character cycling, RTL, range selection and
Ctrl/Cmd+A/Escape use the shared collection controller. Selection mode none omits
row aria-selected after initialization. Grid row/column counts and row indices
are projected by the Web adapter because the pinned compiler does not expose
those attributes. Full initialization-free keyboard/ARIA behavior remains open.

Removing a group releases pending requests, timers, listeners, Glass effects and
adapter-owned attributes. Removed row journals are released immediately. Remount
uses the retained application selection. The existing material preference logic
provides opaque fallbacks for forced colors, contrast and reduced transparency.

## Verification and open gates

```sh
EXACT_TEST_DIST=/absolute/compiled/dist bun packages/ui-exact/test/tag-browser.mjs
```

PLAYWRIGHT_MODULE selects an installed browser module and
LENSO_EXACT_TEST_ARTIFACTS selects evidence storage. The driver validates the
actual loaded script fingerprint and also runs ListBox regression checks against
the same compiled consumer. Tag checks cover selection/ranges, Delete/Backspace,
button request count, accepted/rejected/deferred removal, next/previous/empty
focus, disabled/read-only states, removability, RTL, all sizes/variants, preference
fallback, selected-hover text contrast and removal/remount. Screenshots cover light/dark at 390/820px; native
mobile-browser taps select and remove a tag.

Both families remain Partial for standalone/default/uncontrolled and automatic
context APIs, non-string keys, full custom-cell/render/ref/native-event and caller
style coverage, qualified Glass optics and reference motion, pre-initialization
semantics, native adapters and physical-device behavior. Cross-collection and
virtualized collection capabilities also remain open in the collection layer.
The unsupported-function fallback is authored but not tested in an older browser.
This is selected Web acceptance, not full catalog or performance acceptance.
