# Content lists, selection and surfaces

A library, mailbox or downloads page is a content list. A picker of values is an
option list. Multiple selection alone does not make a content list a ListBox.

| Part             | Responsibility                                                             | Does not own                           |
| ---------------- | -------------------------------------------------------------------------- | -------------------------------------- |
| List / List.Item | Native list structure, row layout, editing coordination                    | Application data and persistence       |
| List.Section     | Labelled group and grouped surface; reorder boundary                       | Filtering or loading                   |
| List editing     | Row checkbox selection, exclusive swipe state, reorder handles             | Bulk deletion or saving accepted order |
| ListBox          | Option selection and coordinated option focus                              | Arbitrary interactive content rows     |
| SwipeActions     | Reveal and activate contextual row actions                                 | Group material, selection or deletion  |
| Surface          | Background, material and outer shape                                       | Collection or selection semantics      |
| RefreshControl   | Top-of-scroll pull gesture, asynchronous job feedback and explicit trigger | Fetching, caching or merging records   |

## Compose one owner for each concern

List defaults to the grouped-secondary surface and 26px outside corners. Do not
wrap each row in another Surface. For multiple groups, use `List variant="plain"`
with `List.Section`; each section paints one group. `--lenso-list-surface` changes
the group background and SwipeActions' opaque moving cover together. A swipe
cover must conceal the actions underneath, but is not a separate material choice.
List owns row spacing; SwipeActions does not add padding around a List row.

Use keyed `List.Item` with `textValue` for editable records. List manages the
checkbox controls and only one revealed action row. Entering editing closes all
swipe actions and removes their reveal controls. The children render function
can replace a normal navigation action with static content while editing.
Independent controls keep their own names and native behavior. List remains
`ul/li`, with checkbox and button semantics; rows never become options.

The owner accepts `selectedKeys/onSelectionChange` and `onReorder`. Reorder
callbacks describe keys, targetKey and before/after placement; the owner updates
its array. This shape is also used by ListBox, but neither its option model nor
its runtime selection machinery is used by List. Section membership constrains
sorting. No implicit cross-section move changes a record's category.

A handle supports pointer dragging, edge scrolling and keyboard pickup with
Space/Enter. Up/Down selects a destination, Enter commits, Escape cancels and
leaving a keyboard handle cancels. Cancellation restores the source transform;
committing retains focus on the moved handle. Ctrl/Cmd+A selects enabled rows
while editing, except inside an editable text field.

RefreshControl.Root owns a single pending `onRefresh` promise. Viewport is the
actual scroll container. Put Trigger in the header as an alternative to touch.
Only a downward single-touch gesture starting at scrollTop zero is claimed;
horizontal row gestures and upward scrolling stay with their owners. Disable
refresh during editing. A rejected promise displays an error and re-enables
retry. The application decides what data to load, delete, restore or save.

## Integrated example

`/en/list-lab` and `/cn/list-lab` provide a working library page with refresh,
section indexing, swipe deletion, multi-selection, group-local sorting, undo and
an entry details dialog. Refresh adds a record; delete and reorder change the
actual list. Undo preserves records added or reordered after a deletion. This
page is also the maintained browser regression target, rather than a collection
of unrelated demonstration controls.

See [the vocabulary](../../GLOSSARY.md) for short definitions.
