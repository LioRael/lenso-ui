import { TableColumn, TableColumnResizer, TableSortableColumnHeader } from "./table-column.js";
import { TableExpandButton, TableLoadMore, TableSelectionCheckbox } from "./table-controls.js";
import type { CollectionDragAndDrop, TableKey } from "@lenso/primitives/table/core";
import { tableStyles as s } from "@lenso/tokens/table";
import { isRTL } from "@ui-sdk/core";
import * as stylex from "@stylexjs/stylex";
import {
  defineComponent,
  h,
  mergeProps,
  provide,
  shallowRef,
  watchPostEffect,
  type HTMLAttributes,
  type PropType,
  type TableHTMLAttributes,
} from "vue";
import { htmlPart, partAttributes, type ComponentProps, type StyledPart } from "./parts.js";
import { TableBody, TableCollection, TableHeader } from "./table-body.js";
import { hasControl, keyType, TableModel, Variant, type TableVariant } from "./table-context.js";
import { TableCell, TableRow } from "./table-row.js";
import { createTableState, type SortDescriptor, type TableStateProps } from "./table-state.js";

export type {
  CollectionDragAndDrop,
  CollectionDrop,
  ColumnWidth,
  TableKey,
  WindowOptions,
} from "@lenso/primitives/table/core";
export type { SortDescriptor } from "./table-state.js";
export { TableBody, TableCell, TableCollection, TableHeader, TableRow };
export type { TableRowProps } from "./table-row.js";

const Root = defineComponent({
  name: "LensoTable",
  inheritAttrs: false,
  props: { variant: { type: String as PropType<TableVariant>, default: "primary" } },
  setup(props, { attrs, slots }) {
    provide(Variant, () => props.variant);
    return () =>
      h(
        "div",
        partAttributes("table", [s.root, props.variant === "primary" && s.primary], attrs),
        slots["default"]?.(),
      );
  },
});
export const TableRoot: StyledPart<typeof Root, HTMLAttributes> = Root as unknown as StyledPart<
  typeof Root,
  HTMLAttributes
>;
export type TableRootProps = ComponentProps<typeof TableRoot>;
export const TableScrollContainer = htmlPart(
  "div",
  "table-scroll-container",
  () => s.scrollContainer,
);
export const TableResizableContainer = htmlPart(
  "div",
  "table-resizable-container",
  () => s.scrollContainer,
);
export const TableFooter = htmlPart("div", "table-footer", () => s.footer);
export const TableLoadMoreContent = htmlPart(
  "div",
  "table-load-more-content",
  () => s.loadMoreContent,
);

const Content = defineComponent({
  name: "LensoTableContent",
  inheritAttrs: false,
  props: {
    treeColumn: keyType as PropType<TableKey>,
    dragAndDrop: Object as PropType<CollectionDragAndDrop>,
    selectionMode: String as PropType<TableStateProps["selectionMode"]>,
    selectedKeys: Set as PropType<ReadonlySet<TableKey>>,
    defaultSelectedKeys: Set as PropType<ReadonlySet<TableKey>>,
    disabledKeys: Set as PropType<ReadonlySet<TableKey>>,
    onSelectionChange: Function as PropType<TableStateProps["onSelectionChange"]>,
    sortDescriptor: Object as PropType<SortDescriptor>,
    defaultSortDescriptor: Object as PropType<SortDescriptor>,
    onSortChange: Function as PropType<TableStateProps["onSortChange"]>,
    expandedKeys: Set as PropType<ReadonlySet<TableKey>>,
    defaultExpandedKeys: Set as PropType<ReadonlySet<TableKey>>,
    onExpandedChange: Function as PropType<TableStateProps["onExpandedChange"]>,
    columnWidths: Map as PropType<ReadonlyMap<TableKey, number>>,
    defaultColumnWidths: Map as PropType<ReadonlyMap<TableKey, number>>,
    onColumnWidthsChange: Function as PropType<TableStateProps["onColumnWidthsChange"]>,
  },
  emits: {
    "update:selectedKeys": (_keys: Set<TableKey>) => true,
    "update:sortDescriptor": (_value: SortDescriptor) => true,
    "update:expandedKeys": (_keys: Set<TableKey>) => true,
    "update:columnWidths": (_widths: Map<TableKey, number>) => true,
  },
  setup(props, { attrs, slots, emit }) {
    const node = shallowRef<HTMLTableElement>();
    const available = shallowRef(0);
    const options = new Proxy(props as TableStateProps, {
      get(target, key: keyof TableStateProps) {
        if (key === "onSelectionChange")
          return (keys: Set<TableKey>) => {
            target.onSelectionChange?.(keys);
            emit("update:selectedKeys", keys);
          };
        if (key === "onSortChange")
          return (value: SortDescriptor) => {
            target.onSortChange?.(value);
            emit("update:sortDescriptor", value);
          };
        if (key === "onExpandedChange")
          return (keys: Set<TableKey>) => {
            target.onExpandedChange?.(keys);
            emit("update:expandedKeys", keys);
          };
        if (key === "onColumnWidthsChange")
          return (widths: Map<TableKey, number>) => {
            target.onColumnWidthsChange?.(widths);
            emit("update:columnWidths", widths);
          };
        return target[key];
      },
    });
    const table = createTableState(options, () => available.value);
    provide(TableModel, table);
    watchPostEffect((cleanup) => {
      const element = node.value;
      if (!element) return;
      const measure = () => {
        available.value = Math.max(
          element.parentElement?.clientWidth ?? 0,
          parseFloat(getComputedStyle(element).minWidth) || 0,
        );
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element.parentElement ?? element);
      cleanup(() => observer.disconnect());
    });
    function keydown(event: KeyboardEvent) {
      const element = node.value;
      if (
        event.defaultPrevented ||
        hasControl(event.target) ||
        !(event.target instanceof Element) ||
        !element
      )
        return;
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "a" &&
        table.mode() === "multiple"
      ) {
        event.preventDefault();
        table.selectAll();
        return;
      }
      const cell = event.target.closest<HTMLTableCellElement>("td,th");
      if (!cell || cell.closest("table") !== element) return;
      const row = cell.parentElement as HTMLTableRowElement;
      const rows = [...element.rows].filter(
        (entry) => entry.getAttribute("aria-disabled") !== "true",
      );
      const index = rows.indexOf(row);
      const column = cell.cellIndex;
      const rtl = isRTL(element);
      let destination: HTMLTableCellElement | undefined;
      if (event.key === "ArrowDown") destination = rows[index + 1]?.cells[column];
      else if (event.key === "ArrowUp") destination = rows[index - 1]?.cells[column];
      else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight"))
        destination = row.cells[column + 1];
      else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
        destination = row.cells[column - 1];
      else if (event.key === "Home") destination = (event.ctrlKey ? rows[0] : row)?.cells[0];
      else if (event.key === "End") {
        const last = event.ctrlKey ? rows.at(-1) : row;
        destination = last?.cells[last.cells.length - 1];
      }
      if (destination) {
        event.preventDefault();
        destination.focus();
      }
    }
    return () => {
      const count = table.collectionSize();
      return [
        h(
          "table",
          mergeProps(
            partAttributes("table-content", s.content, {
              ...attrs,
              "aria-rowcount":
                count === undefined
                  ? attrs["aria-rowcount"]
                  : count + (node.value?.tHead?.rows.length ?? 0),
              role: props.treeColumn === undefined ? attrs["role"] : "treegrid",
              style: [attrs["style"], table.fixedLayout() && { tableLayout: "fixed" }],
            }),
            { ref: node, onKeydown: keydown },
          ),
          slots["default"]?.(),
        ),
        props.dragAndDrop &&
          h("span", { ...stylex.attrs(s.dragStatus), "aria-live": "polite" }, table.announcement()),
      ];
    };
  },
});
export const TableContent: StyledPart<
  typeof Content,
  Omit<TableHTMLAttributes, "onSelectionChange">
> = Content as unknown as StyledPart<
  typeof Content,
  Omit<TableHTMLAttributes, "onSelectionChange">
>;
export type TableContentProps = ComponentProps<typeof TableContent>;

export { TableColumn, TableColumnResizer, TableSortableColumnHeader };
export type { TableColumnProps } from "./table-column.js";
export { TableExpandButton, TableLoadMore, TableSelectionCheckbox };

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
