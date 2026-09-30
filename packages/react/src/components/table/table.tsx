"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { tableStyles } from "@lenso/tokens/table";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import { useCollectionWindow, type WindowOptions } from "../list-box/windowed.js";
import { resolveColumnWidths, type ColumnSize, type ColumnWidth } from "./column-layout.js";
import { ButtonRoot } from "../button/button.js";
import {
  useCollectionModel,
  type CollectionKey,
  type SelectionProps,
  type CollectionDragProps,
} from "../list-box/list-box.js";

export interface SortDescriptor {
  column: CollectionKey;
  direction: "ascending" | "descending";
}
type Widths = ReadonlyMap<CollectionKey, number>;
function withHeaderRow(position: number | undefined) {
  return position === undefined ? undefined : position + 1;
}
const DepthContext = React.createContext(0);
const VariantContext = React.createContext<"primary" | "secondary">("primary");
const TableContext = React.createContext<{
  selection: ReturnType<typeof useCollectionModel>;
  sort?: SortDescriptor;
  sortBy: (key: CollectionKey) => void;
  expanded: ReadonlySet<CollectionKey>;
  toggleExpanded: (key: CollectionKey) => void;
  widths: Widths;
  resize: (key: CollectionKey, width: number) => void;
  treeColumn?: CollectionKey;
  registerColumn: (column: ColumnSize) => () => void;
} | null>(null);
const ColumnContext = React.createContext<{
  key: CollectionKey;
  width: number;
  min: number;
  max: number;
} | null>(null);
const RowContext = React.createContext<{
  key: CollectionKey;
  expanded: boolean;
  disabled: boolean;
  depth: number;
  hasChildItems: boolean;
} | null>(null);

const RootPart = styledPart("div", "table", tableStyles.root);
export function TableRoot({
  variant = "primary",
  xstyle,
  ...props
}: React.ComponentProps<typeof RootPart> & { variant?: "primary" | "secondary" }) {
  return (
    <VariantContext.Provider value={variant}>
      <RootPart {...props} xstyle={[variant === "primary" && tableStyles.primary, xstyle]} />
    </VariantContext.Provider>
  );
}
export const TableScrollContainer = styledPart(
  "div",
  "table-scroll-container",
  tableStyles.scrollContainer,
);
export const TableResizableContainer = styledPart(
  "div",
  "table-resizable-container",
  tableStyles.scrollContainer,
);
export const TableFooter = styledPart("div", "table-footer", tableStyles.footer);
export interface TableContentProps
  extends StyleXProps<React.ComponentPropsWithRef<"table">>, SelectionProps, CollectionDragProps {
  sortDescriptor?: SortDescriptor;
  defaultSortDescriptor?: SortDescriptor;
  onSortChange?: (sort: SortDescriptor) => void;
  expandedKeys?: ReadonlySet<CollectionKey>;
  defaultExpandedKeys?: ReadonlySet<CollectionKey>;
  onExpandedChange?: (keys: Set<CollectionKey>) => void;
  columnWidths?: Widths;
  defaultColumnWidths?: Widths;
  onColumnWidthsChange?: (widths: Map<CollectionKey, number>) => void;
  treeColumn?: CollectionKey;
}
export function TableContent({
  selectionMode,
  selectedKeys,
  defaultSelectedKeys,
  disabledKeys,
  onSelectionChange,
  dragAndDrop,
  sortDescriptor,
  defaultSortDescriptor,
  onSortChange,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedChange,
  columnWidths,
  defaultColumnWidths,
  onColumnWidthsChange,
  xstyle,
  style,
  onKeyDown,
  treeColumn,
  ref,
  ...props
}: TableContentProps) {
  const node = React.useRef<HTMLTableElement>(null);
  const [available, setAvailable] = React.useState(0);
  const [columns, setColumns] = React.useState<readonly ColumnSize[]>([]);
  const registerColumn = React.useCallback((column: ColumnSize) => {
    setColumns((previous) => [...previous.filter((entry) => entry.key !== column.key), column]);
    return () => setColumns((previous) => previous.filter((entry) => entry.key !== column.key));
  }, []);
  React.useLayoutEffect(() => {
    if (!node.current) return;
    const table = node.current;
    const update = () =>
      setAvailable(
        Math.max(
          table.parentElement?.clientWidth ?? 0,
          parseFloat(getComputedStyle(table).minWidth) || 0,
        ),
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(table.parentElement ?? table);
    return () => observer.disconnect();
  }, []);
  const selection = useCollectionModel({
    selectionMode,
    selectedKeys,
    defaultSelectedKeys,
    disabledKeys,
    onSelectionChange,
    dragAndDrop,
  });
  const [internalSort, setSort] = React.useState(defaultSortDescriptor);
  const [internalExpanded, setExpanded] = React.useState(() => new Set(defaultExpandedKeys));
  const [internalWidths, setWidths] = React.useState(() => new Map(defaultColumnWidths));
  const sort = sortDescriptor ?? internalSort;
  const expanded = expandedKeys ?? internalExpanded;
  const resized = columnWidths ?? internalWidths;
  const widths = React.useMemo(
    () => (available > 0 ? resolveColumnWidths(columns, available, resized) : resized),
    [columns, available, resized],
  );
  const compiled = stylex.props(tableStyles.content, xstyle);
  const value = React.useMemo<NonNullable<React.ContextType<typeof TableContext>>>(
    () => ({
      selection,
      sort,
      expanded,
      widths,
      treeColumn,
      registerColumn,
      sortBy(key) {
        const next: SortDescriptor = {
          column: key,
          direction:
            sort?.column === key && sort.direction === "ascending" ? "descending" : "ascending",
        };
        if (sortDescriptor === undefined) setSort(next);
        onSortChange?.(next);
      },
      toggleExpanded(key) {
        const next = new Set(expanded);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        if (expandedKeys === undefined) setExpanded(next);
        onExpandedChange?.(next);
      },
      resize(key, width) {
        const next = new Map(resized);
        next.set(key, width);
        if (columnWidths === undefined) setWidths(next);
        onColumnWidthsChange?.(next);
      },
    }),
    [
      selection,
      sort,
      expanded,
      widths,
      resized,
      sortDescriptor,
      onSortChange,
      expandedKeys,
      onExpandedChange,
      columnWidths,
      onColumnWidthsChange,
      treeColumn,
      registerColumn,
    ],
  );
  // oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- The native table delegates arrow navigation from focusable cells; the table itself remains non-focusable with native table semantics.
  return (
    <TableContext.Provider value={value}>
      {dragAndDrop && (
        <span
          aria-live="polite"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            overflow: "hidden",
            clipPath: "inset(50%)",
          }}
        >
          {selection.drag.announcement}
        </span>
      )}
      <table
        {...props}
        {...compiled}
        role={props.role ?? (treeColumn !== undefined ? "treegrid" : undefined)}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{
          ...compiled.style,
          ...style,
          tableLayout: columns.some((column) => column.width !== undefined) ? "fixed" : undefined,
        }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "table-content"}
        aria-rowcount={
          props["aria-rowcount"] ??
          (selection.collectionSize !== undefined ? selection.collectionSize + 1 : undefined)
        }
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          const target = event.target as HTMLElement;
          if (target.closest("button,input,a,[role=separator]")) return;
          if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
            event.preventDefault();
            selection.selectAll();
            return;
          }
          const cell = target.closest<HTMLTableCellElement>("td,th");
          if (!cell) return;
          const row = cell.parentElement as HTMLTableRowElement;
          const rows = [...event.currentTarget.rows].filter(
            (entry) => entry.getAttribute("aria-disabled") !== "true",
          );
          const rowIndex = rows.indexOf(row);
          const column = cell.cellIndex;
          const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
          let destination: HTMLElement | undefined;
          if (treeColumn !== undefined && cell.dataset["treeColumn"] !== undefined) {
            const key = selection.keyForNode(row);
            const level = Number(row.getAttribute("aria-level"));
            const expandKey = rtl ? "ArrowLeft" : "ArrowRight";
            const collapseKey = rtl ? "ArrowRight" : "ArrowLeft";
            if (event.key === expandKey || event.key === collapseKey) {
              event.preventDefault();
              const isExpanded = key !== undefined && expanded.has(key);
              if (
                key !== undefined &&
                row.hasAttribute("aria-expanded") &&
                ((event.key === expandKey && !isExpanded) ||
                  (event.key === collapseKey && isExpanded))
              )
                value.toggleExpanded(key);
              else if (event.key === expandKey && isExpanded) {
                const child = rows[rowIndex + 1];
                if (child && Number(child.getAttribute("aria-level")) > level)
                  child.cells[column]?.focus();
              } else if (event.key === collapseKey) {
                rows
                  .slice(0, rowIndex)
                  .reverse()
                  .find((entry) => {
                    const parentLevel = Number(entry.getAttribute("aria-level"));
                    return parentLevel > 0 && parentLevel < level;
                  })
                  ?.cells[column]?.focus();
              }
              return;
            }
          }
          if (event.key === "ArrowDown")
            destination = rows[Math.min(rowIndex + 1, rows.length - 1)]?.cells[column];
          else if (event.key === "ArrowUp")
            destination = rows[Math.max(rowIndex - 1, 0)]?.cells[column];
          else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight"))
            destination = row.cells[Math.min(column + 1, row.cells.length - 1)];
          else if (event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
            destination = row.cells[Math.max(column - 1, 0)];
          else if (event.key === "Home") destination = (event.ctrlKey ? rows[0] : row)?.cells[0];
          else if (event.key === "End") {
            const last = event.ctrlKey ? rows.at(-1) : row;
            destination = last?.cells[last.cells.length - 1];
          }
          if (destination) {
            event.preventDefault();
            if (event.shiftKey) {
              const from = selection.keyForNode(row);
              const to = selection.keyForNode(destination.parentElement as HTMLElement);
              if (from !== undefined && to !== undefined) selection.extendSelection(from, to);
            }
            destination.focus();
          }
        }}
      />
    </TableContext.Provider>
  );
  // oxlint-enable jsx-a11y/no-noninteractive-element-interactions
}
const HeaderPart = styledPart("thead", "table-header", tableStyles.header);
export function TableHeader<T extends { key: CollectionKey }>({
  children,
  columns,
  ...props
}: Omit<React.ComponentProps<typeof HeaderPart>, "children"> & {
  columns?: readonly T[];
  children?: React.ReactNode | ((column: T) => React.ReactNode);
}) {
  return (
    <HeaderPart {...props}>
      <tr>
        {typeof children === "function"
          ? columns?.map((column) => (
              <React.Fragment key={`${typeof column.key}:${String(column.key)}`}>
                {children(column)}
              </React.Fragment>
            ))
          : children}
      </tr>
    </HeaderPart>
  );
}
const BodyPart = styledPart("tbody", "table-body", tableStyles.body);
export function TableBody<T extends { key: CollectionKey }>({
  xstyle,
  children,
  items,
  virtualized,
  ref,
  ...props
}: Omit<React.ComponentProps<typeof BodyPart>, "children"> & {
  items?: readonly T[];
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  virtualized?: WindowOptions;
}) {
  const variant = React.useContext(VariantContext);
  const table = React.useContext(TableContext);
  const setCollectionItems = table?.selection.setCollectionItems;
  const isVirtualized = !!virtualized;
  React.useLayoutEffect(() => {
    if (!items || !isVirtualized) return;
    setCollectionItems?.(
      items.map((item) => ({
        key: item.key,
        textValue: String(
          (item as { name?: string; textValue?: string }).textValue ??
            (item as { name?: string }).name ??
            item.key,
        ),
        disabled: (item as { disabled?: boolean }).disabled,
      })),
    );
    return () => setCollectionItems?.(undefined);
  }, [items, isVirtualized, setCollectionItems]);
  const viewport = React.useRef<HTMLElement | null>(null);
  const body = React.useRef<HTMLTableSectionElement>(null);
  const window = useCollectionWindow(items?.length ?? 0, virtualized, viewport);
  React.useLayoutEffect(() => {
    viewport.current =
      body.current?.closest<HTMLElement>('[data-slot="table-scroll-container"]') ?? null;
  });
  const renderItems = () => {
    if (!items || typeof children !== "function")
      return typeof children === "function" ? null : children;
    if (!virtualized)
      return items.map((item) => (
        <React.Fragment key={`${typeof item.key}:${String(item.key)}`}>
          {children(item)}
        </React.Fragment>
      ));
    const rows: React.ReactNode[] = [];
    let previous = 0;
    for (const index of window.indices) {
      if (index > previous)
        rows.push(
          <tr key={`space-${index}`} aria-hidden="true">
            <td
              aria-hidden="true"
              colSpan={1000}
              style={{ height: (index - previous) * virtualized.rowHeight, padding: 0, border: 0 }}
            />
          </tr>,
        );
      const row = children(items[index]!);
      if (React.isValidElement<TableRowProps>(row))
        rows.push(
          React.cloneElement(row, {
            key: `${typeof items[index]!.key}:${String(items[index]!.key)}`,
            "data-window-index": index,
            style: { ...row.props.style, height: virtualized.rowHeight },
            onFocus: () => window.setFocused(index),
          }),
        );
      previous = index + 1;
    }
    if (previous < items.length)
      rows.push(
        <tr key="space-end" aria-hidden="true">
          <td
            aria-hidden="true"
            colSpan={1000}
            style={{
              height: (items.length - previous) * virtualized.rowHeight,
              padding: 0,
              border: 0,
            }}
          />
        </tr>,
      );
    return rows;
  };
  return (
    <BodyPart
      {...props}
      ref={(value) => {
        body.current = value;
        if (typeof ref === "function") return ref(value);
        if (ref) ref.current = value;
      }}
      onKeyDown={(event) => {
        props.onKeyDown?.(event);
        if (!virtualized || !items || event.defaultPrevented) return;
        const current = (event.target as HTMLElement).closest<HTMLElement>("[data-window-index]");
        const index = Number(current?.dataset["windowIndex"] ?? 0);
        const next =
          event.key === "Home" && event.ctrlKey
            ? 0
            : event.key === "End" && event.ctrlKey
              ? items.length - 1
              : event.key === "ArrowDown"
                ? index + 1
                : event.key === "ArrowUp"
                  ? index - 1
                  : undefined;
        if (next !== undefined && next >= 0 && next < items.length) {
          event.preventDefault();
          window.scrollTo(next);
        }
      }}
      xstyle={[variant === "secondary" && tableStyles.secondaryBody, xstyle]}
    >
      {renderItems()}
    </BodyPart>
  );
}
export interface TableColumnProps extends StyleXProps<
  Omit<React.ComponentPropsWithRef<"th">, "children">
> {
  columnKey: CollectionKey;
  allowsSorting?: boolean;
  width?: ColumnWidth;
  minWidth?: number;
  maxWidth?: number;
  children?:
    | React.ReactNode
    | ((state: { sortDirection?: SortDescriptor["direction"] }) => React.ReactNode);
}
export function TableColumn({
  columnKey,
  allowsSorting = false,
  width,
  minWidth = 48,
  maxWidth = 2000,
  children,
  xstyle,
  style,
  onClick,
  onKeyDown,
  ref,
  ...props
}: TableColumnProps) {
  const context = React.useContext(TableContext);
  const variant = React.useContext(VariantContext);
  if (!context) throw new Error("Table.Column requires Table.Content");
  const registerColumn = context.registerColumn;
  React.useLayoutEffect(
    () => registerColumn({ key: columnKey, width, min: minWidth, max: maxWidth }),
    [registerColumn, columnKey, width, minWidth, maxWidth],
  );
  const sortDirection = context.sort?.column === columnKey ? context.sort.direction : undefined;
  const node = React.useRef<HTMLTableCellElement>(null);
  const [measured, setMeasured] = React.useState(160);
  React.useLayoutEffect(() => {
    if (!node.current) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setMeasured(entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width);
    });
    observer.observe(node.current);
    return () => observer.disconnect();
  }, []);
  const currentWidth =
    context.widths.get(columnKey) ?? (typeof width === "number" ? width : measured);
  const cssWidth =
    context.widths.get(columnKey) ?? (width?.toString().endsWith("fr") ? undefined : width);
  const columnValue = React.useMemo(
    () => ({ key: columnKey, width: currentWidth, min: minWidth, max: maxWidth }),
    [columnKey, currentWidth, minWidth, maxWidth],
  );
  const compiled = stylex.props(
    tableStyles.column,
    allowsSorting && tableStyles.sortableColumn,
    variant === "secondary" && tableStyles.secondaryColumn,
    xstyle,
  );
  return (
    <ColumnContext.Provider value={columnValue}>
      <th
        scope="col"
        tabIndex={0}
        {...props}
        {...compiled}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{ ...compiled.style, ...style, width: cssWidth, minWidth, maxWidth }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "table-column"}
        data-allows-sorting={allowsSorting || undefined}
        aria-sort={allowsSorting ? (sortDirection ?? "none") : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && allowsSorting) context.sortBy(columnKey);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            !event.defaultPrevented &&
            allowsSorting &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            context.sortBy(columnKey);
          }
        }}
      >
        {typeof children === "function" ? children({ sortDirection }) : children}
      </th>
    </ColumnContext.Provider>
  );
}
export interface TableRowProps extends StyleXProps<React.ComponentPropsWithRef<"tr">> {
  "data-window-index"?: number;
  itemKey: CollectionKey;
  textValue?: string;
  disabled?: boolean;
  expandedContent?: React.ReactNode;
  expandedColSpan?: number;
}
function resolveRowChildren(children: React.ReactNode) {
  const cells: React.ReactNode[] = [];
  const nested: React.ReactNode[] = [];
  for (const child of React.Children.toArray(children)) {
    if (
      React.isValidElement<{
        items: readonly { key: CollectionKey }[];
        children: (item: { key: CollectionKey }) => React.ReactNode;
      }>(child) &&
      child.type === TableCollection
    ) {
      for (const item of child.props.items) {
        const rendered = child.props.children(item);
        const keyed = (
          <React.Fragment key={`${typeof item.key}:${String(item.key)}`}>{rendered}</React.Fragment>
        );
        if (React.isValidElement(rendered) && rendered.type === TableCell) cells.push(keyed);
        else nested.push(keyed);
      }
    } else cells.push(child);
  }
  return { cells, nested };
}
function TableDetailRow({
  expanded,
  content,
  colSpan,
}: {
  expanded: boolean;
  content: React.ReactNode;
  colSpan: number;
}) {
  return expanded && content ? (
    <tr data-slot="table-expanded-row">
      <td colSpan={colSpan}>{content}</td>
    </tr>
  ) : null;
}
export function TableRow({
  itemKey,
  textValue = String(itemKey),
  disabled = false,
  expandedContent,
  expandedColSpan = 1,
  children,
  ref,
  xstyle,
  style,
  onClick,
  onKeyDown,
  ...props
}: TableRowProps) {
  const context = React.useContext(TableContext);
  if (!context) throw new Error("Table.Row requires Table.Content");
  const selection = context.selection;
  const depth = React.useContext(DepthContext);
  const { cells, nested } = resolveRowChildren(children);
  const hasChildItems = nested.length > 0;
  const node = React.useRef<HTMLTableRowElement>(null);
  const register = selection.register;
  const isDisabled = disabled || !!selection.disabledKeys?.has(itemKey);
  React.useLayoutEffect(() => {
    if (node.current)
      return register({ key: itemKey, textValue, disabled: isDisabled, node: node.current });
  }, [itemKey, textValue, isDisabled, register]);
  const expanded = context.expanded.has(itemKey);
  const rowValue = React.useMemo(
    () => ({ key: itemKey, expanded, disabled: isDisabled, depth, hasChildItems }),
    [itemKey, expanded, isDisabled, depth, hasChildItems],
  );
  const compiled = stylex.props(tableStyles.row, isDisabled && tableStyles.disabled, xstyle);
  return (
    <RowContext.Provider value={rowValue}>
      <tr
        {...props}
        {...compiled}
        ref={(value) => {
          node.current = value;
          if (typeof ref === "function") return ref(value);
          if (ref) ref.current = value;
        }}
        style={{ ...compiled.style, ...style }}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "table-row"}
        aria-disabled={isDisabled || undefined}
        draggable={!isDisabled && (props.draggable ?? selection.drag.enabled)}
        onDragStart={(event) => {
          props.onDragStart?.(event);
          if (!event.defaultPrevented) selection.drag.start(event, itemKey);
        }}
        onDragOver={(event) => {
          props.onDragOver?.(event);
          if (!event.defaultPrevented) selection.drag.over(event, itemKey);
        }}
        onDrop={(event) => {
          props.onDrop?.(event);
          if (!event.defaultPrevented) selection.drag.drop(event, itemKey);
        }}
        onDragEnd={(event) => {
          props.onDragEnd?.(event);
          selection.drag.end();
        }}
        aria-selected={selection.mode === "none" ? undefined : selection.selected.has(itemKey)}
        aria-expanded={expandedContent || hasChildItems ? expanded : undefined}
        aria-level={context.treeColumn !== undefined ? depth + 1 : undefined}
        aria-rowindex={props["aria-rowindex"] ?? withHeaderRow(selection.itemPosition(itemKey))}
        onClick={(event) => {
          onClick?.(event);
          if (
            !event.defaultPrevented &&
            !isDisabled &&
            !(event.target as HTMLElement).closest("button,input,a")
          )
            selection.select(itemKey, event.shiftKey);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented && selection.drag.keyDown(event, itemKey)) return;
          if (
            event.defaultPrevented ||
            isDisabled ||
            (event.target as HTMLElement).closest("button,input,a")
          )
            return;
          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            selection.select(itemKey);
          }
        }}
      >
        {cells}
      </tr>
      {expanded && hasChildItems ? (
        <DepthContext.Provider value={depth + 1}>{nested}</DepthContext.Provider>
      ) : null}
      <TableDetailRow expanded={expanded} content={expandedContent} colSpan={expandedColSpan} />
    </RowContext.Provider>
  );
}
export function TableCell({
  xstyle,
  columnKey,
  children,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentPropsWithRef<"td">, "children">> & {
  columnKey?: CollectionKey;
  children?:
    | React.ReactNode
    | ((state: {
        hasChildItems: boolean;
        isExpanded: boolean;
        isDisabled: boolean;
        isTreeColumn: boolean;
      }) => React.ReactNode);
}) {
  const variant = React.useContext(VariantContext);
  const context = React.useContext(TableContext);
  const row = React.useContext(RowContext);
  const Part = TableCellPart;
  const isTreeColumn = columnKey !== undefined && columnKey === context?.treeColumn;
  return (
    <Part
      tabIndex={row?.disabled ? -1 : 0}
      {...props}
      role={props.role ?? (context?.treeColumn !== undefined ? "gridcell" : undefined)}
      data-tree-column={isTreeColumn ? "" : undefined}
      style={{
        ...style,
        ...(isTreeColumn && { paddingInlineStart: 16 + (row?.depth ?? 0) * 20 }),
      }}
      xstyle={[
        variant === "secondary" && tableStyles.secondaryCell,
        !!row && context?.selection.selected.has(row.key) && tableStyles.selectedCell,
        xstyle,
      ]}
    >
      {typeof children === "function"
        ? children({
            hasChildItems: row?.hasChildItems ?? false,
            isExpanded: row?.expanded ?? false,
            isDisabled: row?.disabled ?? false,
            isTreeColumn,
          })
        : children}
    </Part>
  );
}
const TableCellPart = styledPart("td", "table-cell", tableStyles.cell);
export function TableSelectionCheckbox(props: StyleXProps<React.ComponentPropsWithRef<"input">>) {
  const context = React.useContext(TableContext);
  const row = React.useContext(RowContext);
  if (!context) throw new Error("Table.SelectionCheckbox requires Table.Content");
  const { xstyle, style, onChange, ...native } = props;
  const compiled = stylex.props(xstyle);
  return (
    <input
      type="checkbox"
      aria-label={row ? "Select row" : "Select all"}
      {...native}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      checked={
        row
          ? context.selection.selected.has(row.key)
          : context.selection.enabledKeys().length > 0 &&
            context.selection.enabledKeys().every((key) => context.selection.selected.has(key))
      }
      disabled={row?.disabled || props.disabled}
      onChange={(event) => {
        onChange?.(event);
        if (!event.defaultPrevented) {
          if (row) context.selection.select(row.key);
          else if (event.currentTarget.checked) context.selection.selectAll();
          else context.selection.clearSelection();
        }
      }}
    />
  );
}
export function TableExpandButton({
  onClick,
  children,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"button">>) {
  const context = React.useContext(TableContext);
  const row = React.useContext(RowContext);
  if (!context || !row) throw new Error("Table.ExpandButton requires Table.Row");
  return (
    <ButtonRoot
      isIconOnly
      size="sm"
      variant="ghost"
      type="button"
      aria-label={row.expanded ? "Collapse row" : "Expand row"}
      {...props}
      aria-expanded={row.expanded}
      disabled={row.disabled || props.disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleExpanded(row.key);
      }}
    >
      {children ?? (row.expanded ? "−" : "+")}
    </ButtonRoot>
  );
}
const SortPart = styledPart(
  "span",
  "table-sortable-column-header",
  tableStyles.sortableColumnHeader,
);
export function TableSortableColumnHeader({
  sortDirection,
  children,
  showIndicator = true,
  indicator,
  ...props
}: React.ComponentProps<typeof SortPart> & {
  sortDirection?: SortDescriptor["direction"];
  showIndicator?: boolean;
  indicator?: React.ReactNode;
}) {
  return (
    <SortPart {...props}>
      {children}
      {sortDirection && showIndicator ? (
        <span
          aria-hidden="true"
          data-direction={sortDirection}
          {...stylex.props(
            tableStyles.sortableColumnIndicator,
            sortDirection === "descending" && tableStyles.descending,
          )}
        >
          {indicator ?? (
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
              <path
                d="m4 10 4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      ) : null}
    </SortPart>
  );
}
export function TableColumnResizer({
  xstyle,
  style,
  onKeyDown,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">>) {
  const context = React.useContext(TableContext);
  const column = React.useContext(ColumnContext);
  if (!context || !column) throw new Error("Table.ColumnResizer requires Table.Column");
  const drag = React.useRef<{ x: number; width: number; rtl: boolean } | null>(null);
  const resize = (width: number) =>
    context.resize(column.key, Math.min(column.max, Math.max(column.min, width)));
  const compiled = stylex.props(tableStyles.columnResizer, xstyle);
  // oxlint-disable jsx-a11y/prefer-tag-over-role -- This focusable adjustable separator exposes min/max/current column width and keyboard resizing; hr is a static thematic break.
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "table-column-resizer"}
      role="separator"
      aria-label="Resize column"
      aria-orientation="vertical"
      aria-valuemin={column.min}
      aria-valuemax={column.max}
      aria-valuenow={column.width}
      tabIndex={0}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        event.stopPropagation();
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          resize(event.key === "Home" ? column.min : column.max);
        } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          resize(
            column.width +
              (event.key === (rtl ? "ArrowLeft" : "ArrowRight") ? 1 : -1) *
                (event.shiftKey ? 50 : 10),
          );
        }
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {
          x: event.clientX,
          width: column.width,
          rtl: getComputedStyle(event.currentTarget).direction === "rtl",
        };
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (drag.current && !event.defaultPrevented)
          resize(
            drag.current.width + (event.clientX - drag.current.x) * (drag.current.rtl ? -1 : 1),
          );
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        drag.current = null;
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        drag.current = null;
      }}
    />
  );
  // oxlint-enable jsx-a11y/prefer-tag-over-role
}
export const TableLoadMoreContent = styledPart(
  "div",
  "table-load-more-content",
  tableStyles.loadMoreContent,
);
export function TableLoadMore({
  colSpan = 1,
  children,
  onLoadMore,
  loading = false,
  hasMore = true,
  ref,
  ...props
}: React.ComponentProps<typeof LoadMorePart> & {
  colSpan?: number;
  onLoadMore?: () => void;
  loading?: boolean;
  hasMore?: boolean;
}) {
  const node = React.useRef<HTMLTableRowElement>(null);
  React.useEffect(() => {
    if (!node.current || loading || !hasMore || !onLoadMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) onLoadMore();
    });
    observer.observe(node.current);
    return () => observer.disconnect();
  }, [loading, hasMore, onLoadMore]);
  return (
    <LoadMorePart
      {...props}
      ref={(value) => {
        node.current = value;
        if (typeof ref === "function") return ref(value);
        if (ref) ref.current = value;
      }}
      aria-busy={loading || undefined}
    >
      <td colSpan={colSpan}>{children}</td>
    </LoadMorePart>
  );
}
const LoadMorePart = styledPart("tr", "table-load-more");
export function TableCollection<T extends { key: CollectionKey }>({
  items,
  children,
}: {
  items: readonly T[];
  children: (item: T) => React.ReactNode;
}) {
  return items.map((item) => (
    <React.Fragment key={`${typeof item.key}:${String(item.key)}`}>{children(item)}</React.Fragment>
  ));
}
export const Table = Object.assign(TableRoot, {
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
  ColumnResizer: TableColumnResizer,
  SelectionCheckbox: TableSelectionCheckbox,
  ExpandButton: TableExpandButton,
  LoadMore: TableLoadMore,
  LoadMoreContent: TableLoadMoreContent,
  Collection: TableCollection,
});
