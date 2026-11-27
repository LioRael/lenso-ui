import {
  createCollectionDrag,
  type CollectionDragAndDrop,
  resolveColumnWidths,
  type ColumnSize,
  type TableKey,
} from "@lenso/primitives/table/core";
import { createMemo, createSignal } from "solid-js";

export interface SortDescriptor {
  column: TableKey;
  direction: "ascending" | "descending";
}

type Widths = ReadonlyMap<TableKey, number>;

export interface TableStateProps {
  treeColumn?: TableKey;
  dragAndDrop?: CollectionDragAndDrop;
  selectionMode?: "none" | "single" | "multiple";
  selectedKeys?: ReadonlySet<TableKey>;
  defaultSelectedKeys?: ReadonlySet<TableKey>;
  disabledKeys?: ReadonlySet<TableKey>;
  onSelectionChange?: (keys: Set<TableKey>) => void;
  sortDescriptor?: SortDescriptor;
  defaultSortDescriptor?: SortDescriptor;
  onSortChange?: (sort: SortDescriptor) => void;
  expandedKeys?: ReadonlySet<TableKey>;
  defaultExpandedKeys?: ReadonlySet<TableKey>;
  onExpandedChange?: (keys: Set<TableKey>) => void;
  columnWidths?: Widths;
  defaultColumnWidths?: Widths;
  onColumnWidthsChange?: (widths: Map<TableKey, number>) => void;
}

export function createTableState(props: TableStateProps, available: () => number) {
  const [localSelection, setSelection] = createSignal(new Set(props.defaultSelectedKeys));
  const [localSort, setSort] = createSignal(props.defaultSortDescriptor);
  const [localExpanded, setExpanded] = createSignal(new Set(props.defaultExpandedKeys));
  const [localWidths, setWidths] = createSignal(new Map(props.defaultColumnWidths));
  const [columns, setColumns] = createSignal<readonly ColumnSize[]>([]);
  const [rows, setRows] = createSignal<
    ReadonlyMap<TableKey, { node: HTMLTableRowElement; disabled: () => boolean }>
  >(new Map());
  const [windowRows, updateWindowRows] =
    createSignal<readonly { key: TableKey; disabled?: boolean }[]>();
  let anchor: TableKey | undefined;
  let range = new Set<TableKey>();

  const mode = () => props.selectionMode ?? "none";
  const selected = () => props.selectedKeys ?? localSelection();
  const sort = () => props.sortDescriptor ?? localSort();
  const expanded = () => props.expandedKeys ?? localExpanded();
  const resized = () => props.columnWidths ?? localWidths();
  const widths = createMemo(() =>
    available() > 0 ? resolveColumnWidths(columns(), available(), resized()) : resized(),
  );

  const disabled = (key: TableKey) => Boolean(props.disabledKeys?.has(key));
  const enabledKeys = () =>
    windowRows()
      ?.filter((item) => !disabled(item.key) && !item.disabled)
      .map((item) => item.key) ??
    [...rows()]
      .filter(([key, row]) => !disabled(key) && !row.disabled())
      .sort(([, a], [, b]) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      .map(([key]) => key);

  function commitSelection(next: Set<TableKey>) {
    if (props.selectedKeys === undefined) setSelection(next);
    props.onSelectionChange?.(next);
  }

  const [announcement, announce] = createSignal("");
  let focusInWindow: ((key: TableKey) => void) | undefined;
  const focus = (key: TableKey) => {
    if (focusInWindow) {
      focusInWindow(key);
      return;
    }
    rows().get(key)?.node.cells[0]?.focus();
  };
  const drag = createCollectionDrag({
    configuration: () => props.dragAndDrop,
    enabledKeys,
    selected,
    focus,
    announce,
  });
  return {
    collectionSize: () => windowRows()?.length,
    rowFor: (key: TableKey) => rows().get(key)?.node,
    drag,
    announcement,
    setWindowRows(
      items: readonly { key: TableKey; disabled?: boolean }[] | undefined,
      focusRow?: (key: TableKey) => void,
    ) {
      focusInWindow = focusRow;
      updateWindowRows(items);
    },
    focus,
    treeColumn: () => props.treeColumn,
    mode,
    selected,
    sort,
    expanded,
    widths,
    disabled,
    enabledKeys,
    fixedLayout: () => columns().some((column) => column.width !== undefined),
    registerRow(key: TableKey, node: HTMLTableRowElement, disabled: () => boolean) {
      setRows((previous) => {
        if (previous.has(key)) throw new Error(`Duplicate Table itemKey: ${String(key)}`);
        return new Map(previous).set(key, { node, disabled });
      });
      return () =>
        setRows((previous) => {
          const next = new Map(previous);
          next.delete(key);
          return next;
        });
    },
    registerColumn(column: ColumnSize) {
      setColumns((previous) => [...previous, column]);
      return () => setColumns((previous) => previous.filter((entry) => entry !== column));
    },
    sortBy(key: TableKey) {
      const current = sort();
      const next: SortDescriptor = {
        column: key,
        direction:
          current?.column === key && current.direction === "ascending" ? "descending" : "ascending",
      };
      if (props.sortDescriptor === undefined) setSort(next);
      props.onSortChange?.(next);
    },
    select(key: TableKey, extend = false) {
      if (mode() === "none" || !enabledKeys().includes(key)) return;
      if (mode() === "single") {
        commitSelection(new Set([key]));
        return;
      }
      const next = new Set(selected());
      if (extend && anchor !== undefined) {
        const keys = enabledKeys();
        const from = keys.indexOf(anchor);
        const to = keys.indexOf(key);
        if (from !== -1 && to !== -1) {
          for (const previous of range) next.delete(previous);
          range = new Set(keys.slice(Math.min(from, to), Math.max(from, to) + 1));
          for (const item of range) next.add(item);
        }
      } else {
        anchor = key;
        range = new Set([key]);
        if (next.has(key)) next.delete(key);
        else next.add(key);
      }
      commitSelection(next);
    },
    selectAll(checked = true) {
      if (mode() === "multiple") commitSelection(new Set(checked ? enabledKeys() : []));
    },
    toggleExpanded(key: TableKey) {
      const next = new Set(expanded());
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (props.expandedKeys === undefined) setExpanded(next);
      props.onExpandedChange?.(next);
    },
    resize(key: TableKey, width: number) {
      const next = new Map(resized());
      next.set(key, width);
      if (props.columnWidths === undefined) setWidths(next);
      props.onColumnWidthsChange?.(next);
    },
  };
}
