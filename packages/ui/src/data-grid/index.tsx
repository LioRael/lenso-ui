"use client";

/* oxlint-disable jsx-a11y/no-noninteractive-element-to-interactive-role -- Native table markup carries editable grid semantics. */

import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import {
  useDataGrid,
  type DataGridColumn as PrimitiveColumn,
  type DataGridValue,
  type DataGridTable,
  type UseDataGridOptions,
} from "@lenso/primitives/data-grid";
import { ResizeHandle } from "../resize-handle/index.js";
import { Checkbox } from "../checkbox/index.js";
import type { StyleXProps } from "../shared/stylex-props.js";
import { styles } from "./data-grid.stylex.js";

export interface DataGridColumn<
  TRow extends object,
  TValidationData = unknown,
> extends PrimitiveColumn<TRow, TValidationData> {
  icon?: React.ReactNode;
  renderCell?: (value: DataGridValue, row: TRow) => React.ReactNode;
  renderEditor?: (props: {
    value: string;
    onChange: (value: string) => void;
    onCommit: () => void;
    onCancel: () => void;
    inputRef: React.Ref<HTMLInputElement>;
    row: TRow;
    error: string | null;
  }) => React.ReactNode;
}

export interface DataGridProps<TRow extends object, TValidationData = unknown>
  extends
    Omit<UseDataGridOptions<TRow, TValidationData>, "columns" | "rowSelection" | "sorting">,
    Omit<StyleXProps<React.ComponentPropsWithoutRef<"div">>, "children" | "onChange"> {
  columns: readonly DataGridColumn<TRow, TValidationData>[];
  label: string;
  showRowSelection?: boolean;
  showRowNumbers?: boolean;
  sortable?: boolean;
  resizable?: boolean;
  rowHeight?: number;
  headerHeight?: number;
  maxHeight?: number | string;
  emptyState?: React.ReactNode;
  onColumnWidthChange?: (columnId: string, width: number) => void;
  onCellEditStart?: (rowId: string, columnId: string) => void;
  onCellEditCancel?: (rowId: string, columnId: string) => void;
  tableRef?: React.Ref<DataGridTable<TRow>>;
}

interface EditingCell {
  rowId: string;
  columnId: string;
  value: string;
}

interface GridError {
  message: string;
  rowId?: string;
  columnId?: string;
}

export function DataGrid<TRow extends object, TValidationData = unknown>({
  rows,
  columns,
  getRowId,
  label,
  showRowSelection = true,
  showRowNumbers = true,
  sortable = true,
  resizable = true,
  cellSelection = true,
  readOnly = false,
  rowHeight = 48,
  headerHeight = 32,
  maxHeight,
  emptyState = "No records",
  onRowsChange,
  onCellEditComplete,
  cellEvents,
  onRowEditComplete,
  onRowSelectionChange,
  onCellSelectionChange,
  onSortingChange,
  onColumnWidthChange,
  onCellEditStart,
  onCellEditCancel,
  validationData,
  tableOptions,
  tableRef,
  xstyle,
  style,
  ...props
}: DataGridProps<TRow, TValidationData>) {
  const { table, commitCells } = useDataGrid<TRow, TValidationData>({
    rows,
    columns,
    getRowId,
    readOnly,
    rowSelection: showRowSelection,
    cellSelection,
    sorting: sortable,
    ...(onRowsChange && { onRowsChange }),
    ...(onCellEditComplete && { onCellEditComplete }),
    ...(cellEvents && { cellEvents }),
    ...(onRowEditComplete && { onRowEditComplete }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    ...(onCellSelectionChange && { onCellSelectionChange }),
    ...(onSortingChange && { onSortingChange }),
    ...(validationData !== undefined && { validationData }),
    ...(tableOptions && { tableOptions }),
  });
  React.useImperativeHandle(tableRef, () => table, [table]);
  const [editing, setEditing] = React.useState<EditingCell | null>(null);
  const [error, setError] = React.useState<GridError | null>(null);
  const tableId = React.useId();
  const errorId = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);
  const canEdit = !readOnly && Boolean(onRowsChange);
  const orderedRows = table.getRowModel().rows;
  const leadWidth = (showRowSelection ? 40 : 0) + (showRowNumbers ? 44 : 0);
  const tableWidth =
    leadWidth + table.getAllLeafColumns().reduce((total, column) => total + column.getSize(), 0);
  const pinnedOffsets = new Map<string, number>();
  let pinnedOffset = leadWidth;
  for (const column of columns) {
    if (column.pinned) {
      pinnedOffsets.set(column.id, pinnedOffset);
      pinnedOffset += table.getColumn(column.id)?.getSize() ?? column.width ?? 180;
    }
  }
  const columnById = new Map(columns.map((column) => [column.id, column]));
  const isCellError = (rowId: string, columnId: string) =>
    error?.rowId === rowId && error.columnId === columnId;
  const beginEdit = (rowId: string, columnId: string, initial?: string) => {
    const column = columnById.get(columnId);
    const row = rows.find((item) => getRowId(item) === rowId);
    if (
      !canEdit ||
      !column?.setValue ||
      !row ||
      column.editable === false ||
      (typeof column.editable === "function" && !column.editable(row))
    )
      return;
    const value = column.getValue(row);
    setError(null);
    setEditing({ rowId, columnId, value: initial ?? (value == null ? "" : String(value)) });
    onCellEditStart?.(rowId, columnId);
  };
  const commitEdit = () => {
    const current = editing;
    if (!current) return;
    const row = rows.find((item) => getRowId(item) === current.rowId);
    const column = columnById.get(current.columnId);
    if (!row || !column) return;
    let value: DataGridValue;
    try {
      value = column.parse ? column.parse(current.value, row) : current.value;
    } catch (cause) {
      setError({
        message: cause instanceof Error ? cause.message : "Invalid value",
        rowId: current.rowId,
        columnId: current.columnId,
      });
      return;
    }
    const result = commitCells([{ rowId: current.rowId, columnId: current.columnId, value }]);
    if (result.ok) {
      setEditing(null);
      setError(null);
    } else setError({ message: result.error, rowId: current.rowId, columnId: current.columnId });
  };
  const cancelEdit = () => {
    if (editing) onCellEditCancel?.(editing.rowId, editing.columnId);
    setEditing(null);
    setError(null);
  };
  const focusActiveCell = () => {
    requestAnimationFrame(() => {
      const focused = table.getFocusedCell();
      if (!focused) return;
      document
        .querySelector<HTMLElement>(
          `[data-grid-row="${CSS.escape(focused.row.id)}"] [data-grid-column="${CSS.escape(focused.column.id)}"]`,
        )
        ?.focus();
    });
  };
  const onCellKeyDown = (
    event: React.KeyboardEvent<HTMLTableCellElement>,
    rowId: string,
    columnId: string,
  ) => {
    if (editing) return;
    const movement = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    } as const;
    const direction = movement[event.key as keyof typeof movement];
    if (direction && cellSelection) {
      event.preventDefault();
      if (event.shiftKey) table.extendCellSelection(direction);
      else table.moveCellSelection(direction);
      focusActiveCell();
    } else if (event.key === "Enter" || event.key === "F2") {
      event.preventDefault();
      beginEdit(rowId, columnId);
    } else if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      beginEdit(rowId, columnId, event.key);
    }
  };
  const copySelection = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (editing || !cellSelection) return;
    const values = table.getSelectedCellRangesData()[0];
    if (!values) return;
    event.preventDefault();
    event.clipboardData.setData(
      "text/plain",
      values
        .map((row) => row.map((value) => (value == null ? "" : String(value))).join("\t"))
        .join("\n"),
    );
  };
  const pasteSelection = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (editing || !canEdit || !cellSelection) return;
    const focused = table.getFocusedCell();
    if (!focused) return;
    const source = event.clipboardData.getData("text/plain");
    if (!source) return;
    const rowIndex = orderedRows.findIndex((row) => row.id === focused.row.id);
    const columnIndex = columns.findIndex((column) => column.id === focused.column.id);
    if (rowIndex < 0 || columnIndex < 0) return;
    let edits: { rowId: string; columnId: string; value: DataGridValue }[];
    try {
      edits = source
        .replace(/\r\n?/g, "\n")
        .replace(/\n$/, "")
        .split("\n")
        .flatMap((line, y) =>
          line.split("\t").flatMap((input, x) => {
            const row = orderedRows[rowIndex + y];
            const column = columns[columnIndex + x];
            if (!row || !column?.setValue) return [];
            return [
              {
                rowId: row.id,
                columnId: column.id,
                value: column.parse ? column.parse(input, row.original) : input,
              },
            ];
          }),
        );
    } catch (cause) {
      event.preventDefault();
      setError({ message: cause instanceof Error ? cause.message : "Invalid value" });
      return;
    }
    if (edits.length === 0) return;
    event.preventDefault();
    const result = commitCells(edits, "paste");
    setError(result.ok ? null : { message: result.error });
  };
  return (
    <div
      {...props}
      {...stylex.props(styles.root, xstyle)}
      data-slot="data-grid"
      style={{ ...style, maxHeight }}
      onCopy={copySelection}
      onPaste={pasteSelection}
    >
      <table
        {...stylex.props(styles.table)}
        id={tableId}
        role="grid"
        aria-label={label}
        aria-readonly={!canEdit}
        aria-rowcount={orderedRows.length + 1}
        style={{ width: tableWidth }}
      >
        <colgroup>
          {showRowSelection && <col style={{ width: 40 }} />}
          {showRowNumbers && <col style={{ width: 44 }} />}
          {table.getAllLeafColumns().map((column) => (
            <col key={column.id} style={{ width: column.getSize() }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {showRowSelection && (
              <th
                scope="col"
                {...stylex.props(styles.head, styles.pinnedHead)}
                style={{ left: 0, height: headerHeight }}
              >
                <Checkbox.Root
                  aria-label="Select all rows"
                  checked={table.getIsAllRowsSelected()}
                  indeterminate={table.getIsSomeRowsSelected()}
                  onCheckedChange={(checked) => table.toggleAllRowsSelected(checked)}
                >
                  <Checkbox.Indicator />
                </Checkbox.Root>
              </th>
            )}
            {showRowNumbers && (
              <th
                scope="col"
                aria-label="Row number"
                {...stylex.props(styles.head, styles.pinnedHead)}
                style={{ left: showRowSelection ? 40 : 0, height: headerHeight }}
              />
            )}
            {table.getFlatHeaders().map((header) => {
              const config = columnById.get(header.column.id)!;
              const pinned = pinnedOffsets.has(header.column.id);
              const isSorted = header.column.getIsSorted();
              return (
                <th
                  key={header.id}
                  scope="col"
                  aria-sort={isSorted ? (isSorted === "asc" ? "ascending" : "descending") : "none"}
                  {...stylex.props(styles.head, pinned && styles.pinnedHead)}
                  style={{
                    height: headerHeight,
                    ...(pinned ? { left: pinnedOffsets.get(header.column.id) } : {}),
                  }}
                >
                  <span {...stylex.props(styles.headContent)}>
                    {sortable && header.column.getCanSort() ? (
                      <button
                        type="button"
                        {...stylex.props(styles.sortButton)}
                        onClick={header.column.getToggleSortingHandler()}
                        aria-label={`Sort by ${config.header}`}
                      >
                        {config.icon && (
                          <span aria-hidden="true" {...stylex.props(styles.icon)}>
                            {config.icon}
                          </span>
                        )}
                        <span {...stylex.props(styles.ellipsis)}>{config.header}</span>
                        {isSorted && (
                          <span aria-hidden="true">{isSorted === "asc" ? "↑" : "↓"}</span>
                        )}
                      </button>
                    ) : (
                      <>
                        {config.icon && (
                          <span aria-hidden="true" {...stylex.props(styles.icon)}>
                            {config.icon}
                          </span>
                        )}
                        <span {...stylex.props(styles.ellipsis)}>{config.header}</span>
                      </>
                    )}
                  </span>
                  {resizable && header.column.getCanResize() && (
                    <ResizeHandle
                      aria-controls={tableId}
                      aria-label={`Resize ${config.header} column`}
                      min={config.minWidth ?? 80}
                      max={config.maxWidth ?? 1200}
                      step={8}
                      value={header.column.getSize()}
                      onValueChange={(width) => {
                        table.setColumnSizing((current) => ({
                          ...current,
                          [header.column.id]: width,
                        }));
                        onColumnWidthChange?.(header.column.id, width);
                      }}
                      xstyle={styles.resizeHandle}
                    />
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {orderedRows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + Number(showRowSelection) + Number(showRowNumbers)}
                {...stylex.props(styles.cell, styles.muted)}
                style={{ height: rowHeight }}
              >
                {emptyState}
              </td>
            </tr>
          )}
          {orderedRows.map((row, index) => (
            <tr
              key={row.id}
              data-grid-row={row.id}
              data-selected={row.getIsSelected() ? "" : undefined}
              {...stylex.props(styles.row, row.getIsSelected() && styles.selectedRow)}
            >
              {showRowSelection && (
                <td
                  {...stylex.props(styles.cell, styles.lead, styles.center)}
                  style={{ left: 0, height: rowHeight }}
                >
                  <Checkbox.Root
                    aria-label={`Select row ${index + 1}`}
                    checked={row.getIsSelected()}
                    onCheckedChange={(checked) => row.toggleSelected(checked)}
                  >
                    <Checkbox.Indicator />
                  </Checkbox.Root>
                </td>
              )}
              {showRowNumbers && (
                <td
                  {...stylex.props(styles.cell, styles.lead, styles.center, styles.muted)}
                  style={{ left: showRowSelection ? 40 : 0, height: rowHeight }}
                >
                  {index + 1}
                </td>
              )}
              {row.getAllCells().map((cell) => {
                const config = columnById.get(cell.column.id)!;
                const pinned = pinnedOffsets.has(cell.column.id);
                const isEditing = editing?.rowId === row.id && editing.columnId === cell.column.id;
                const value = config.getValue(row.original);
                return (
                  <td
                    key={cell.id}
                    data-grid-column={cell.column.id}
                    data-selected={cell.getIsSelected() ? "" : undefined}
                    data-focused={cell.getIsFocused() ? "" : undefined}
                    tabIndex={cellSelection ? cell.getTabIndex() : 0}
                    aria-selected={cellSelection ? cell.getIsSelected() : undefined}
                    {...stylex.props(
                      styles.cell,
                      pinned && styles.lead,
                      cell.getIsSelected() && styles.selectedCell,
                      cell.getIsFocused() && styles.focusedCell,
                      isEditing && styles.editingCell,
                    )}
                    style={{
                      height: rowHeight,
                      ...(pinned ? { left: pinnedOffsets.get(cell.column.id) } : {}),
                    }}
                    onMouseDown={
                      cellSelection && !isEditing
                        ? (event) => {
                            if (event.button !== 0) return;
                            if (
                              (event.target as HTMLElement).closest(
                                "a, button, input, textarea, select",
                              )
                            )
                              return;
                            event.preventDefault();
                            cell.getSelectionStartHandler()(event);
                          }
                        : undefined
                    }
                    onMouseEnter={cellSelection ? cell.getSelectionExtendHandler() : undefined}
                    onClick={(event) => {
                      if (!isEditing) event.currentTarget.focus();
                    }}
                    onDoubleClick={() => {
                      if (!isEditing) beginEdit(row.id, cell.column.id);
                    }}
                    onKeyDown={(event) => onCellKeyDown(event, row.id, cell.column.id)}
                  >
                    {isEditing ? (
                      <div
                        {...stylex.props(
                          styles.editorWrap,
                          isCellError(row.id, cell.column.id) && styles.editorWrapInvalid,
                        )}
                      >
                        {config.renderEditor ? (
                          config.renderEditor({
                            value: editing.value,
                            onChange: (next) => setEditing({ ...editing, value: next }),
                            onCommit: commitEdit,
                            onCancel: cancelEdit,
                            inputRef,
                            row: row.original,
                            error: isCellError(row.id, cell.column.id)
                              ? (error?.message ?? null)
                              : null,
                          })
                        ) : (
                          <input
                            ref={inputRef}
                            aria-label={`Edit ${config.header}, row ${index + 1}`}
                            aria-invalid={isCellError(row.id, cell.column.id)}
                            aria-describedby={
                              isCellError(row.id, cell.column.id) ? errorId : undefined
                            }
                            value={editing.value}
                            onChange={(event) =>
                              setEditing({ ...editing, value: event.target.value })
                            }
                            onBlur={commitEdit}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                event.stopPropagation();
                                commitEdit();
                              } else if (event.key === "Escape") {
                                event.preventDefault();
                                event.stopPropagation();
                                cancelEdit();
                              }
                            }}
                            {...stylex.props(styles.editor)}
                          />
                        )}
                        {isCellError(row.id, cell.column.id) && (
                          <span id={errorId} role="alert" {...stylex.props(styles.editorError)}>
                            {error?.message}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span {...stylex.props(styles.ellipsis)}>
                        {config.renderCell
                          ? config.renderCell(value, row.original)
                          : value == null
                            ? ""
                            : String(value)}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {error && !error.rowId && (
        <div role="alert" {...stylex.props(styles.error)}>
          {error.message}
        </div>
      )}
    </div>
  );
}
