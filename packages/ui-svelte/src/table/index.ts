import TableRoot from "./root.svelte";
import TableScrollContainer from "./table-scroll-container.svelte";
import TableResizableContainer from "./table-resizable-container.svelte";
import TableContent from "./content.svelte";
import TableHeader from "./header.svelte";
import TableColumn from "./column.svelte";
import TableBody from "./body.svelte";
import TableRow from "./row.svelte";
import TableCell from "./cell.svelte";
import TableFooter from "./table-footer.svelte";
import TableSortableColumnHeader from "./sortable-column-header.svelte";
import TableSelectionCheckbox from "./selection-checkbox.svelte";
import TableExpandButton from "./expand-button.svelte";
import TableColumnResizer from "./column-resizer.svelte";
import TableLoadMore from "./load-more.svelte";
import TableLoadMoreContent from "./table-load-more-content.svelte";
import TableCollection from "./collection.svelte";

export {
  TableRoot,
  TableScrollContainer,
  TableResizableContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableFooter,
  TableSortableColumnHeader,
  TableSelectionCheckbox,
  TableExpandButton,
  TableColumnResizer,
  TableLoadMore,
  TableLoadMoreContent,
  TableCollection,
};
export type {
  CollectionDragAndDrop,
  CollectionDrop,
  ColumnWidth,
  TableKey,
  WindowOptions,
} from "@lenso/primitives/table/core";
export type { SortDescriptor } from "./state.svelte.js";
export type { TableContentProps } from "./content.svelte";
export type { TableColumnProps } from "./column.svelte";
export type { TableRowProps } from "./row.svelte";

export const Table: typeof TableRoot & {
  Root: typeof TableRoot;
  ScrollContainer: typeof TableScrollContainer;
  ResizableContainer: typeof TableResizableContainer;
  Content: typeof TableContent;
  Header: typeof TableHeader;
  Column: typeof TableColumn;
  Body: typeof TableBody;
  Row: typeof TableRow;
  Cell: typeof TableCell;
  Footer: typeof TableFooter;
  SortableColumnHeader: typeof TableSortableColumnHeader;
  SelectionCheckbox: typeof TableSelectionCheckbox;
  ExpandButton: typeof TableExpandButton;
  ColumnResizer: typeof TableColumnResizer;
  LoadMore: typeof TableLoadMore;
  LoadMoreContent: typeof TableLoadMoreContent;
  Collection: typeof TableCollection;
} = Object.assign(TableRoot, {
  Root: TableRoot,
  ScrollContainer: TableScrollContainer,
  ResizableContainer: TableResizableContainer,
  Content: TableContent,
  Header: TableHeader,
  Column: TableColumn,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Footer: TableFooter,
  SortableColumnHeader: TableSortableColumnHeader,
  SelectionCheckbox: TableSelectionCheckbox,
  ExpandButton: TableExpandButton,
  ColumnResizer: TableColumnResizer,
  LoadMore: TableLoadMore,
  LoadMoreContent: TableLoadMoreContent,
  Collection: TableCollection,
});
