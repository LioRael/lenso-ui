import {
  createCollectionDrag,
  type CollectionDragAndDrop,
  resolveColumnWidths,
  type ColumnSize,
  type TableKey,
} from "@lenso/primitives/table/core";
import { computed, shallowRef } from "vue";

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
  const localSelection = shallowRef(new Set(props.defaultSelectedKeys));
  const localSort = shallowRef(props.defaultSortDescriptor);
  const localExpanded = shallowRef(new Set(props.defaultExpandedKeys));
  const localWidths = shallowRef(new Map(props.defaultColumnWidths));
  const columns = shallowRef<readonly ColumnSize[]>([]);
  const rows = shallowRef<
    ReadonlyMap<TableKey, { node: HTMLTableRowElement; disabled: () => boolean }>
  >(new Map());
  const windowRows = shallowRef<readonly { key: TableKey; disabled?: boolean }[]>();
  let anchor: TableKey | undefined;
  let range = new Set<TableKey>();

  const mode = () => props.selectionMode ?? "none";
  const selected = () => props.selectedKeys ?? localSelection.value;
  const sort = () => props.sortDescriptor ?? localSort.value;
  const expanded = () => props.expandedKeys ?? localExpanded.value;
  const resized = () => props.columnWidths ?? localWidths.value;
  const widths = computed(() =>
    available() > 0 ? resolveColumnWidths(columns.value, available(), resized()) : resized(),
  );

  const disabled = (key: TableKey) => Boolean(props.disabledKeys?.has(key));
  const enabledKeys = () =>
    windowRows.value
      ?.filter((item) => !disabled(item.key) && !item.disabled)
      .map((item) => item.key) ??
    [...rows.value]
      .filter(([key, row]) => !disabled(key) && !row.disabled())
      .sort(([, a], [, b]) =>
        a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      )
      .map(([key]) => key);

  function commitSelection(next: Set<TableKey>) {
    if (props.selectedKeys === undefined) localSelection.value = next;
    props.onSelectionChange?.(next);
  }

  const announcement = shallowRef("");
  let focusInWindow: ((key: TableKey) => void) | undefined;
  const focus = (key: TableKey) => {
    if (focusInWindow) {
      focusInWindow(key);
      return;
    }
    rows.value.get(key)?.node.cells[0]?.focus();
  };
  const drag = createCollectionDrag({
    configuration: () => props.dragAndDrop,
    enabledKeys,
    selected,
    focus,
    announce: (value) => {
      announcement.value = value;
    },
  });
  return {
    collectionSize: () => windowRows.value?.length,
    rowFor: (key: TableKey) => rows.value.get(key)?.node,
    drag,
    announcement: () => announcement.value,
    setWindowRows(
      items: readonly { key: TableKey; disabled?: boolean }[] | undefined,
      focusRow?: (key: TableKey) => void,
    ) {
      focusInWindow = focusRow;
      windowRows.value = items;
    },
    focus,
    treeColumn: () => props.treeColumn,
    mode,
    selected,
    sort,
    expanded,
    widths: () => widths.value,
    disabled,
    enabledKeys,
    fixedLayout: () => columns.value.some((column) => column.width !== undefined),
    registerRow(key: TableKey, node: HTMLTableRowElement, disabled: () => boolean) {
      if (rows.value.has(key)) throw new Error(`Duplicate Table itemKey: ${String(key)}`);
      rows.value = new Map(rows.value).set(key, { node, disabled });
      return () => {
        const next = new Map(rows.value);
        next.delete(key);
        rows.value = next;
      };
    },
    registerColumn(column: ColumnSize) {
      columns.value = [...columns.value, column];
      return () => {
        columns.value = columns.value.filter((entry) => entry !== column);
      };
    },
    sortBy(key: TableKey) {
      const current = sort();
      const next: SortDescriptor = {
        column: key,
        direction:
          current?.column === key && current.direction === "ascending" ? "descending" : "ascending",
      };
      if (props.sortDescriptor === undefined) localSort.value = next;
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
      if (props.expandedKeys === undefined) localExpanded.value = next;
      props.onExpandedChange?.(next);
    },
    resize(key: TableKey, width: number) {
      const next = new Map(resized());
      next.set(key, width);
      if (props.columnWidths === undefined) localWidths.value = next;
      props.onColumnWidthsChange?.(next);
    },
  };
}
