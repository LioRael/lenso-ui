# Collection implementation and evidence

## Source and ownership

The anatomy and StyleX maps adapt HeroUI v3.2.6, commit
`e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e`, under Apache-2.0.
Source: https://github.com/heroui-inc/heroui/tree/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/packages/react/src/components
and the corresponding `packages/styles/components/*.css`.
The upstream license is retained in `third-party/heroui`.

Only the six assigned React/styles families and their collection demo directories are changed.
The preserved primitives are unchanged. Their data-grid utility uses a
TanStack row/column data model and editing pipeline, which does not fit this
source-style compound native-table API without another adapter.

There are no React Aria imports, `onPress` adapters, `isDisabled` adapters or
Tailwind runtime dependencies in these families. The interaction model is native
HTML plus explicit collection contexts. Base UI's `useRender` owns render composition.

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

## Verification

The isolated harness uses exact React 19.2.8, StyleX and unplugin 0.19.0,
Base UI 1.7.0, TypeScript 7.0.2, Vitest and browser provider 4.1.10,
vitest-browser-react 2.2.0, and Playwright 1.62.1.
The isolated validation copies the current parent React/styles source, overlays
these six families, and copies the three demo directories. It reads installed
parent dependencies without modifying them. Alias `@lenso/ui` to React's source
barrel and every `@lenso/tokens/<family>` to its styles index. Include the docs
modules in the strict TypeScript check (including `noUncheckedIndexedAccess`).
The older minimal `validation/` files remain dependency/configuration templates,
not a self-contained six-directory runner: table expand controls now reuse the
ordinary Base UI-backed Button, and live imports use additional supporting families.

The harness aliases `@lenso/tokens/<family>` to styles source and compiles
StyleX with `dev: false`, `useCSSLayers: false` and commonJS module resolution.
Pre-optimize the Base UI/React Aria supporting imports and pinned Gravity,
Iconify and TanStack dependencies to avoid Vite reloading an active browser test.
Color assertions poll computed values to allow development const-metadata CSS
updates to settle. The baseline browser regressions cover:

- Disabled navigation, Arrow/Home/End, typeahead, key identity, controlled
  selection, and changes to disabled keys.
- Tag removal through keyboard and button, next/previous/empty-root focus,
  selection pruning, controlled rejection and accepted controlled removal,
  exactly-once keyboard selection and native remove-button Enter activation.
- Native table sorting, cell navigation, disabled rows, selection, expansion,
  bounded keyboard resizing and actual pointer dragging in RTL.
- Computed live OKLCH colors, source option height/padding, logical indicator
  placement, table padding and logical body corner geometry.

Live reconstruction regressions additionally cover all **35** registered
modules: **10 list-box, 12 tag-group, 13 table**. Those mount tests prove executable
modules, not complete scenario behavior. Separate behavior regressions exercise
virtual scroll and keyboard focus at row 1000, offscreen select-all, nested tree
expansion/indentation, range shrink, header select-all, bounded percent/fr reflow
and RTL resize, real native pointer/keyboard reorder, loading intersections,
the async source's three pages, source team removal, and TanStack v9 sorting and
pagination. The latter retains the pinned data-model dependency, not an imitation.

The source collection examples use native styled label/description/error spans.
They must not instantiate Base UI form Field parts without Field context.
The local text parts reuse the existing upstream StyleX maps; named groups
receive native accessible names. Imported reference JSON remains unchanged.

The final strict scratch TypeScript check passes. All **60 Chromium regressions**
pass under normal and emulated reduced motion. A local-only React Doctor scan
of the assigned React families and demos reports zero diagnostics; diff mode
falls back to a full scan because the scratch harness has no Git checkout.
The parent's shared
`packages/standard/oxlint.json` rules report no warnings or errors across the
assigned React/styles and demo directories. Oxfmt formats only the assigned paths.
The Vitest process reports
a shutdown timeout after successful tests, then exits successfully.

The shared accessibility rules have scoped `prefer-tag-over-role` exceptions
only around the custom listbox, rich options, option groups, wrapping tag-grid
rows/cells, and adjustable column separator. Native select/option/optgroup cannot
host this rich composite contract; tr/td cannot represent wrapping tags outside
a native table; hr is a thematic break rather than a value-bearing resize control.
The native table's delegated cell-navigation handler has one scoped
`no-noninteractive-element-interactions` exception; the table itself is not focusable.
Each exception states its reason beside the affected JSX and is immediately
re-enabled. TagGroup's former noninteractive owner was corrected to the grid
rather than suppressed. Option/tag keyboard handlers perform real model
operations and preserve native remove-button activation.

## Acceptance boundary

- Windowing implements the fixed-height layouts in the pinned examples, not a
  variable-height layout engine or React Aria's virtual DOM/API.
- Native props/keyed sets and explicit collection drag configuration replace
  RAC control props/hooks. This is not an ordinary-control RAC compatibility layer.
- Full upstream light/dark theme screenshot comparison, responsive and overflow
  acceptance and screen-reader review remain parent-owned acceptance work.
  The geometry/color tests are evidence for their stated cases, not full parity.
- Parent-owned barrels, exports, package builds and integrated tests remain
  pending. No integrated build claim is made.

## Antislop delivery gate

Direction is the explicitly requested HeroUI source reconstruction, not a new
marketing layout. Dials: energy 1, rhythm 2, motion 1.

- Hard gate: PASS for the tested keyboard, selection, removal, sorting,
  expansion and resizing paths. Controls perform real operations.
- Purpose gate: PASS. Indicator marks selection; removal controls edit the
  collection; accent focus/resize feedback identifies the active operation;
  source spacing and surfaces separate collection content.
- Liveliness: PASS at component scope. Source rounding, neutral surfaces and
  one accent are retained. Screen-level focal hierarchy is outside this change.
- Craftsmanship: PASS for source ownership, native semantics, key identity,
  reduced-motion declarations and measured RTL geometry. Full-theme visual
  resilience remains pending and is not represented as shipping acceptance.
