# Collection implementation and evidence

## Implementation

These collection components use native HTML, explicit collection contexts and
Base UI render composition. For third-party attribution, see
[THIRD_PARTY_NOTICES.md](../../../../../THIRD_PARTY_NOTICES.md).

## API

- `ListBox` / `ListBox.Root`: native `div` props and selection props.
  Optional `items: readonly CollectionItem[]` supports `children(item)`.
  `virtualized: { rowHeight, height, overscan? }` creates a real fixed-row window.
  Keyboard boundaries/typeahead and select-all address the logical collection,
  not only mounted options. The focused option stays mounted while scrolling.
  Virtual options expose their full collection size and logical positions.
  `onAction(key)` and Base UI `render` are supported.
- `ListBoxItem.Root`: required `itemKey: React.Key` and `textValue: string`;
  native `div` props, `disabled`, and `variant: "default" | "danger"`.
  Item and indicator children accept native render-state callbacks. The default
  indicator retains the upstream polyline, dash lengths/offsets and 250ms linear
  selected transition; reduced motion disables that transition.
- `ListBoxSection.Root`: native group structure. Supply an accessible name.
- `TagGroup.Root`: selection props, native `div` props, `disabled`,
  `size: "sm" | "md" | "lg"`, `variant: "default" | "surface"`,
  `items` / `defaultItems`, `onItemsChange(items)`, and `onRemove(keys)`.
  The root owns the named, focusable grid; `TagGroup.List` is its presentational
  wrapping container and optionally accepts `children(item)`.
  `Tag.Root` takes `itemKey`, `textValue`, and native `div` props.
  `Tag.RemoveButton` is a native button; removable groups supply one by default.
- `Table.Root`: `variant: "primary" | "secondary"` and native `div` props.
  `ScrollContainer`, `ResizableContainer`, and `Footer` are native containers.
  `Content` is a native table with selection, sorting, expansion and widths.
  `Header` creates a native header row; `Column` creates a column header.
  `Body`, `Row`, and `Cell` preserve native table structure.
  `Collection` renders keyed items through a callback.
  Header `columns` and Body `items` support dynamic render functions. Body's
  `virtualized` window uses native spacer rows and preserves the focused row.
  Its native table exposes full logical row counts and row indices.
  `SortableColumnHeader`, `ColumnResizer`, `SelectionCheckbox` and
  `ExpandButton` supply the associated controls.
  `LoadMore` is a native sentinel row with `colSpan`, `loading`, `hasMore`,
  and `onLoadMore`; `LoadMoreContent` styles its content.

`CollectionItem` is `{ key: React.Key; textValue: string; disabled?: boolean }`.
Selection props are `selectionMode: "none" | "single" | "multiple"`,
`selectedKeys`, `defaultSelectedKeys`, `disabledKeys`, and
`onSelectionChange(Set<React.Key>)`. Sets preserve key type: numeric `1` and
string `"1"` are different collection identities, including React fragment keys.

Controlled props are authoritative. Default props initialize internal state
once. A requested change does not claim a controlled owner committed it.
Tag focus restoration waits for the removed DOM node to disappear, then focuses
the next enabled tag, previous enabled tag, or empty group root. Selection
pruning also waits for that commit.

Shift arrows and Shift click extend ranges, skipping disabled items; shrinking
a range removes its former tail. Ctrl/Meta+A selects all enabled keys. The
header `Table.SelectionCheckbox` selects/clears the enabled row collection.

ListBox and Table Content accept `dragAndDrop` with `onReorder`, `getItems`, and
`onDrop`. Native drag events carry the selected enabled keys and typed text
payloads. Consumers commit reordered data themselves. A native button with
`slot="drag"` starts keyboard drag with Enter; arrows choose targets, Enter
drops, Escape cancels. A polite live region announces the operation. Native
drag/drop props still forward, including custom root drop handling.

Table sorting uses `sortDescriptor` / `defaultSortDescriptor` /
`onSortChange`, with `{ column: React.Key; direction: "ascending" | "descending" }`.
As in the source, consumers sort their data in response to the descriptor.
The component does not reorder opaque JSX rows itself.

Table expansion uses `expandedKeys` / `defaultExpandedKeys` /
`onExpandedChange`. `treeColumn` and nested `Table.Collection` rows form the
source tree-row model; descendants render as sibling native rows only while
their ancestors are expanded. Tree cells receive expansion/child state and
logical depth indentation. Tree tables expose treegrid/gridcell semantics;
logical Left/Right expands, enters descendants, collapses and returns to parents,
including RTL. Detail rows remain available through `expandedContent`
and `expandedColSpan`; they are not used as substitutes in the tree example.
Widths use `columnWidths` / `defaultColumnWidths` /
`onColumnWidthsChange`, all maps keyed by column identity. Columns take
`columnKey`, `width`, `minWidth`, `maxWidth`, and `allowsSorting`.
Column widths accept pixels, percentages, or weighted `fr` units. A bounded
allocator freezes constrained columns before distributing the remaining space.
ResizeObserver updates container geometry; resized widths are bounded pixel
overrides while unresized flexible columns continue reflowing. Resizers support
pointer capture and keyboard arrows, Shift increments, Home/End bounds, and RTL.
