import {
  createCollectionDrag,
  resolveColumnWidths,
  type CollectionDragAndDrop,
  type ColumnSize,
  type TableKey,
} from "@lenso/primitives/table/core";
import { untrack } from "svelte";

export interface SortDescriptor {
  column: TableKey;
  direction: "ascending" | "descending";
}

type Widths = ReadonlyMap<TableKey, number>;

type WindowCollection = {
  items: readonly { key: TableKey; disabled?: boolean }[];
  focus: (key: TableKey) => void;
};

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
  let localSelection = $state.raw(new Set(props.defaultSelectedKeys));
  let localSort = $state.raw(props.defaultSortDescriptor);
  let localExpanded = $state.raw(new Set(props.defaultExpandedKeys));
  let localWidths = $state.raw(new Map(props.defaultColumnWidths));
  let columns: readonly ColumnSize[] = $state.raw([]);
  let rows = $state.raw(
    new Map<TableKey, { node: HTMLTableRowElement; disabled: () => boolean }>(),
  );
  let window = $state.raw<WindowCollection>();
  let announcement = $state("");
  let anchor: TableKey | undefined;
  let range = new Set<TableKey>();

  const mode = () => props.selectionMode ?? "none";
  const selected = () => props.selectedKeys ?? localSelection;
  const sort = () => props.sortDescriptor ?? localSort;
  const expanded = () => props.expandedKeys ?? localExpanded;
  const resized = () => props.columnWidths ?? localWidths;
  const resolvedWidths = $derived.by(() =>
    available() > 0 ? resolveColumnWidths(columns, available(), resized()) : resized(),
  );

  const disabled = (key: TableKey) => Boolean(props.disabledKeys?.has(key));
  const enabledKeys = () =>
    window
      ? window.items
          .filter(
            ({ key, disabled: inactive }) =>
              !inactive && !disabled(key) && !rows.get(key)?.disabled(),
          )
          .map(({ key }) => key)
      : [...rows]
          .filter(([key, row]) => !disabled(key) && !row.disabled())
          .sort(([, a], [, b]) =>
            a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
          )
          .map(([key]) => key);
  const drag = createCollectionDrag({
    configuration: () => props.dragAndDrop,
    selected,
    enabledKeys,
    focus(key) {
      const node = rows.get(key)?.node.querySelector<HTMLElement>("td");
      if (node) node.focus();
      else window?.focus(key);
    },
    announce(message) {
      announcement = message;
    },
  });

  function commitSelection(next: Set<TableKey>) {
    if (props.selectedKeys === undefined) localSelection = next;
    props.onSelectionChange?.(next);
  }

  return {
    mode,
    drag,
    announcement: () => announcement,
    treeColumn: () => props.treeColumn,
    collectionSize: () => window?.items.length,
    keyForRow: (node: HTMLTableRowElement) => [...rows].find(([, row]) => row.node === node)?.[0],
    registerWindow(collection: WindowCollection) {
      window = collection;
      return () => {
        if (window === collection) window = undefined;
      };
    },
    selected,
    sort,
    expanded,
    widths: () => resolvedWidths,
    disabled,
    enabledKeys,
    fixedLayout: () => columns.some((column) => column.width !== undefined),
    registerRow(key: TableKey, node: HTMLTableRowElement, disabled: () => boolean) {
      untrack(() => {
        if (rows.has(key)) throw new Error(`Duplicate Table itemKey: ${String(key)}`);
        rows = new Map(rows).set(key, { node, disabled });
      });
      return () => {
        const next = new Map(rows);
        next.delete(key);
        rows = next;
      };
    },
    registerColumn(column: ColumnSize) {
      untrack(() => {
        columns = [...columns, column];
      });
      return () => {
        columns = columns.filter((entry) => entry !== column);
      };
    },
    sortBy(key: TableKey) {
      const current = sort();
      const next: SortDescriptor = {
        column: key,
        direction:
          current?.column === key && current.direction === "ascending" ? "descending" : "ascending",
      };
      if (props.sortDescriptor === undefined) localSort = next;
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
    extendSelection(from: TableKey, to: TableKey) {
      if (mode() !== "multiple") return;
      const keys = enabledKeys();
      const start = keys.indexOf(anchor ?? from);
      const end = keys.indexOf(to);
      if (start < 0 || end < 0) return;
      anchor ??= from;
      const next = new Set(selected());
      for (const key of range) next.delete(key);
      range = new Set(keys.slice(Math.min(start, end), Math.max(start, end) + 1));
      for (const key of range) next.add(key);
      commitSelection(next);
    },
    selectAll(checked = true) {
      if (mode() === "multiple") commitSelection(new Set(checked ? enabledKeys() : []));
    },
    toggleExpanded(key: TableKey) {
      const next = new Set(expanded());
      if (next.has(key)) next.delete(key);
      else next.add(key);
      if (props.expandedKeys === undefined) localExpanded = next;
      props.onExpandedChange?.(next);
    },
    resize(key: TableKey, width: number) {
      const next = new Map(resized());
      next.set(key, width);
      if (props.columnWidths === undefined) localWidths = next;
      props.onColumnWidthsChange?.(next);
    },
  };
}
