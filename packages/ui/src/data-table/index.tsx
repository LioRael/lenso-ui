"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { ResizeHandle } from "../resize-handle/index.js";

import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./data-table.stylex.js";

export interface DataTableColumn {
  id: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  pinned?: boolean;
}

interface DataTableContextValue {
  columns: readonly DataTableColumn[];
  widths: Readonly<Record<string, number>>;
  resize: (id: string, width: number) => void;
  pinnedLeft: Readonly<Record<string, number>>;
  tableId: string;
}

const DataTableContext = React.createContext<DataTableContextValue | null>(null);
const SectionContext = React.createContext<"body" | "head" | "foot">("body");
const RowJoinContext = React.createContext({ previous: false, next: false });

function useDataTable() {
  const context = React.useContext(DataTableContext);
  if (!context) throw new Error("DataTable parts must be inside DataTable.Root");
  return context;
}

export interface DataTableRootProps extends StyleXProps<React.ComponentPropsWithoutRef<"div">> {
  columns: readonly DataTableColumn[];
  label: string;
  maxHeight?: number | string;
  onColumnWidthChange?: (id: string, width: number) => void;
}

export const DataTableRoot = React.forwardRef<HTMLDivElement, DataTableRootProps>(
  function DataTableRoot(
    { children, columns, label, maxHeight, onColumnWidthChange, style, xstyle, ...props },
    ref,
  ) {
    const tableId = React.useId();
    const [widths, setWidths] = React.useState<Record<string, number>>(() =>
      Object.fromEntries(columns.map((column) => [column.id, column.width])),
    );
    const resize = React.useCallback(
      (id: string, width: number) => {
        const column = columns.find((item) => item.id === id);
        if (!column) return;
        const next = Math.min(
          column.maxWidth ?? 4096,
          Math.max(column.minWidth ?? 64, Math.round(width)),
        );
        setWidths((current) => ({ ...current, [id]: next }));
        onColumnWidthChange?.(id, next);
      },
      [columns, onColumnWidthChange],
    );
    const pinnedLeft = React.useMemo(() => {
      const left: Record<string, number> = {};
      let offset = 0;
      for (const column of columns) {
        if (!column.pinned) continue;
        left[column.id] = offset;
        offset += widths[column.id] ?? column.width;
      }
      return left;
    }, [columns, widths]);
    const context = React.useMemo(
      () => ({ columns, widths, resize, pinnedLeft, tableId }),
      [columns, widths, resize, pinnedLeft, tableId],
    );
    const tableWidth = columns.reduce(
      (sum, column) => sum + (widths[column.id] ?? column.width),
      0,
    );
    return (
      <DataTableContext.Provider value={context}>
        <div
          {...props}
          {...stylex.props(styles.root, xstyle)}
          data-slot="data-table"
          ref={ref}
          style={{ ...style, ...(maxHeight === undefined ? {} : { maxHeight }) }}
        >
          <table
            aria-label={label}
            {...stylex.props(styles.table)}
            data-slot="data-table-table"
            id={tableId}
            style={{ minWidth: tableWidth, width: "100%" }}
          >
            <colgroup>
              {columns.map((column) => (
                <col key={column.id} style={{ width: widths[column.id] ?? column.width }} />
              ))}
            </colgroup>
            {children}
          </table>
        </div>
      </DataTableContext.Provider>
    );
  },
);

export const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  StyleXProps<React.ComponentPropsWithoutRef<"thead">>
>(function DataTableHeader({ children, xstyle, ...props }, ref) {
  return (
    <SectionContext.Provider value="head">
      <thead {...props} {...stylex.props(styles.header, xstyle)} ref={ref}>
        {children}
      </thead>
    </SectionContext.Provider>
  );
});

export const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  StyleXProps<React.ComponentPropsWithoutRef<"tbody">>
>(function DataTableBody({ xstyle, ...props }, ref) {
  const children = React.Children.toArray(props.children);
  const isSelectedRow = (child: React.ReactNode) =>
    React.isValidElement<DataTableRowProps>(child) &&
    child.type === DataTableRow &&
    child.props.selected === true;
  return (
    <SectionContext.Provider value="body">
      <tbody {...props} {...stylex.props(styles.body, xstyle)} ref={ref}>
        {children.map((child, index) =>
          isSelectedRow(child)
            ? React.cloneElement(child as React.ReactElement<DataTableRowProps>, {
                joinsPrevious: isSelectedRow(children[index - 1]),
                joinsNext: isSelectedRow(children[index + 1]),
              })
            : child,
        )}
      </tbody>
    </SectionContext.Provider>
  );
});

export interface DataTableGroupRowProps extends StyleXProps<
  Omit<React.ComponentPropsWithoutRef<"tr">, "children">
> {
  label: string;
  count?: number;
}

export const DataTableGroupRow = React.forwardRef<HTMLTableRowElement, DataTableGroupRowProps>(
  function DataTableGroupRow({ label, count, xstyle, ...props }, ref) {
    const { columns } = useDataTable();
    return (
      <tr
        {...props}
        {...stylex.props(styles.groupRow, xstyle)}
        data-slot="data-table-group-row"
        ref={ref}
      >
        <th colSpan={columns.length} scope="rowgroup" {...stylex.props(styles.groupCell)}>
          <span {...stylex.props(styles.groupSurface)}>
            <span {...stylex.props(styles.groupContent)}>
              <span>{label}</span>
              {count !== undefined && <span {...stylex.props(styles.groupCount)}>{count}</span>}
            </span>
          </span>
        </th>
      </tr>
    );
  },
);

export const DataTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  StyleXProps<React.ComponentPropsWithoutRef<"tfoot">>
>(function DataTableFooter({ children, xstyle, ...props }, ref) {
  return (
    <SectionContext.Provider value="foot">
      <tfoot {...props} {...stylex.props(styles.footer, xstyle)} ref={ref}>
        {children}
      </tfoot>
    </SectionContext.Provider>
  );
});

export interface DataTableRowProps extends StyleXProps<React.ComponentPropsWithoutRef<"tr">> {
  selected?: boolean;
  /** Set automatically for adjacent selected rows rendered directly inside DataTable.Body. */
  joinsPrevious?: boolean;
  joinsNext?: boolean;
}

export const DataTableRow = React.forwardRef<HTMLTableRowElement, DataTableRowProps>(
  function DataTableRow(
    { selected = false, joinsPrevious = false, joinsNext = false, xstyle, ...props },
    ref,
  ) {
    const section = React.useContext(SectionContext);
    const rowJoin = React.useMemo(
      () => ({ previous: joinsPrevious, next: joinsNext }),
      [joinsPrevious, joinsNext],
    );
    return (
      <RowJoinContext.Provider value={rowJoin}>
        <tr
          {...props}
          aria-selected={selected || undefined}
          {...stylex.props(
            styles.row,
            section === "body" && styles.bodyRow,
            selected && styles.selectedRow,
            xstyle,
          )}
          data-selected={selected ? "" : undefined}
          data-slot="data-table-row"
          ref={ref}
        />
      </RowJoinContext.Provider>
    );
  },
);

interface ColumnCellProps {
  columnId: string;
}

function columnStyles(columnId: string, context: DataTableContextValue): React.CSSProperties {
  const column = context.columns.find((item) => item.id === columnId);
  if (!column) throw new Error(`Unknown DataTable column: ${columnId}`);
  return column.pinned ? { left: context.pinnedLeft[columnId] } : {};
}

export interface DataTableHeadProps
  extends ColumnCellProps, StyleXProps<React.ComponentPropsWithoutRef<"th">> {
  icon?: React.ReactNode;
  resizable?: boolean;
  resizeLabel?: string;
  onSort?: () => void;
  sortDirection?: "asc" | "desc" | null;
  sortLabel?: string;
}

export const DataTableHead = React.forwardRef<HTMLTableCellElement, DataTableHeadProps>(
  function DataTableHead(
    {
      children,
      columnId,
      icon,
      resizable = false,
      resizeLabel,
      onSort,
      sortDirection,
      sortLabel,
      scope = "col",
      style,
      xstyle,
      ...props
    },
    ref,
  ) {
    const context = useDataTable();
    const pinned = context.columns.find((column) => column.id === columnId)?.pinned;
    return (
      <th
        {...props}
        aria-sort={
          sortDirection === "asc"
            ? "ascending"
            : sortDirection === "desc"
              ? "descending"
              : undefined
        }
        {...stylex.props(styles.cell, styles.head, pinned && styles.pinnedHead, xstyle)}
        data-column-id={columnId}
        data-slot="data-table-head"
        ref={ref}
        scope={scope}
        style={{ ...style, ...columnStyles(columnId, context) }}
      >
        {onSort ? (
          <button
            type="button"
            aria-label={sortLabel}
            title={sortLabel}
            onClick={onSort}
            {...stylex.props(styles.headContent, styles.sortButton)}
          >
            {icon && <span {...stylex.props(styles.headIcon)}>{icon}</span>}
            <span {...stylex.props(styles.ellipsis)}>{children}</span>
            {sortDirection && <span aria-hidden="true">{sortDirection === "asc" ? "↑" : "↓"}</span>}
          </button>
        ) : (
          <span {...stylex.props(styles.headContent)}>
            {icon && <span {...stylex.props(styles.headIcon)}>{icon}</span>}
            <span {...stylex.props(styles.ellipsis)}>{children}</span>
          </span>
        )}
        {resizable && (
          <DataTableResizeHandle columnId={columnId} label={resizeLabel ?? "Resize column"} />
        )}
      </th>
    );
  },
);

export interface DataTableCellProps
  extends ColumnCellProps, StyleXProps<React.ComponentPropsWithoutRef<"td">> {
  muted?: boolean;
}

export const DataTableCell = React.forwardRef<HTMLTableCellElement, DataTableCellProps>(
  function DataTableCell({ columnId, muted = false, style, xstyle, ...props }, ref) {
    const context = useDataTable();
    const section = React.useContext(SectionContext);
    const rowJoin = React.useContext(RowJoinContext);
    const pinned = context.columns.find((column) => column.id === columnId)?.pinned;
    return (
      <td
        {...props}
        {...stylex.props(
          styles.cell,
          styles.bodyCell,
          rowJoin.previous && styles.joinsPrevious,
          rowJoin.next && styles.joinsNext,
          section === "foot" && styles.footCell,
          pinned && styles.pinnedCell,
          section === "foot" && pinned && styles.pinnedFootCell,
          muted && styles.mutedCell,
          xstyle,
        )}
        data-column-id={columnId}
        data-slot="data-table-cell"
        ref={ref}
        style={{ ...style, ...columnStyles(columnId, context) }}
      />
    );
  },
);

export interface DataTableResizeHandleProps {
  columnId: string;
  label?: string;
}

export function DataTableResizeHandle({
  columnId,
  label = "Resize column",
}: DataTableResizeHandleProps) {
  const context = useDataTable();
  const column = context.columns.find((item) => item.id === columnId);
  if (!column) throw new Error(`Unknown DataTable column: ${columnId}`);
  const width = context.widths[columnId] ?? column.width;
  return (
    <ResizeHandle
      aria-controls={context.tableId}
      aria-label={label}
      aria-valuetext={`${width} pixels`}
      max={column.maxWidth ?? 4096}
      min={column.minWidth ?? 64}
      onValueChange={(next) => context.resize(columnId, next)}
      step={8}
      value={width}
      xstyle={styles.resizeHandle}
    />
  );
}

export const DataTable = {
  Body: DataTableBody,
  Cell: DataTableCell,
  Footer: DataTableFooter,
  GroupRow: DataTableGroupRow,
  Head: DataTableHead,
  Header: DataTableHeader,
  ResizeHandle: DataTableResizeHandle,
  Root: DataTableRoot,
  Row: DataTableRow,
} as const;
