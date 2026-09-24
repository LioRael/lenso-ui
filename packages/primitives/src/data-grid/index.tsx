"use client";

import * as React from "react";
import {
  cellSelectionFeature,
  columnResizingFeature,
  columnSizingFeature,
  createSortedRowModel,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  useTable,
  type ColumnDef,
  type CellSelectionState,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";

export type DataGridValue = string | number | boolean | null;
export type DataGridEditReason = "edit" | "paste" | "fill" | "programmatic";

export interface DataGridCellChange<TRow> {
  rowId: string;
  rowIndex: number;
  columnId: string;
  previousValue: DataGridValue;
  value: DataGridValue;
  previousRow: TRow;
  row: TRow;
  reason: DataGridEditReason;
}

export interface DataGridRowChange<TRow> {
  rowId: string;
  rowIndex: number;
  previousRow: TRow;
  row: TRow;
  changes: readonly DataGridCellChange<TRow>[];
  reason: DataGridEditReason;
}

export interface DataGridColumn<TRow> {
  id: string;
  header: string;
  getValue: (row: TRow) => DataGridValue;
  setValue?: (row: TRow, value: DataGridValue) => TRow;
  parse?: (input: string, row: TRow) => DataGridValue;
  validate?: (value: DataGridValue, row: TRow) => string | null;
  editable?: boolean | ((row: TRow) => boolean);
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  pinned?: boolean;
  onCellEditComplete?: (change: DataGridCellChange<TRow>) => void;
}

export interface DataGridEdit {
  rowId: string;
  columnId: string;
  value: DataGridValue;
}

export interface DataGridCellEvent<TRow> {
  rowId: string;
  columnId: string;
  onEditComplete: (change: DataGridCellChange<TRow>) => void;
}

export type DataGridCommitResult<TRow> =
  | { ok: true; changes: readonly DataGridCellChange<TRow>[] }
  | { ok: false; error: string; edit: DataGridEdit };

export interface UseDataGridOptions<TRow extends RowData> {
  rows: readonly TRow[];
  columns: readonly DataGridColumn<TRow>[];
  getRowId: (row: TRow) => string;
  readOnly?: boolean;
  rowSelection?: boolean;
  cellSelection?: boolean;
  sorting?: boolean;
  onRowsChange?: (rows: TRow[], changes: readonly DataGridCellChange<TRow>[]) => void;
  onCellEditComplete?: (change: DataGridCellChange<TRow>) => void;
  cellEvents?: readonly DataGridCellEvent<TRow>[];
  onRowEditComplete?: (change: DataGridRowChange<TRow>) => void;
  onRowSelectionChange?: (rowIds: ReadonlySet<string>) => void;
  onCellSelectionChange?: (ranges: CellSelectionState) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

const features = tableFeatures({
  cellSelectionFeature,
  columnSizingFeature,
  columnResizingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

export function useDataGrid<TRow extends RowData>({
  rows,
  columns,
  getRowId,
  readOnly = false,
  rowSelection = true,
  cellSelection = true,
  sorting = true,
  onRowsChange,
  onCellEditComplete,
  cellEvents,
  onRowEditComplete,
  onRowSelectionChange,
  onCellSelectionChange,
  onSortingChange,
}: UseDataGridOptions<TRow>) {
  const tableColumns = React.useMemo<ColumnDef<typeof features, TRow, unknown>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        header: column.header,
        accessorFn: column.getValue,
        enableSorting: sorting && column.sortable !== false,
        enableCellSelection: cellSelection,
        size: column.width ?? 180,
        minSize: column.minWidth ?? 80,
        maxSize: column.maxWidth ?? 1200,
      })),
    [cellSelection, columns, sorting],
  );

  const table = useTable({
    features,
    columns: tableColumns,
    data: rows,
    getRowId,
    enableRowSelection: rowSelection,
    enableCellSelection: cellSelection,
    enableCellSelectionDrag: cellSelection,
    autoResetCellSelection: false,
    enableSorting: sorting,
  });

  const commitCells = React.useCallback(
    (
      edits: readonly DataGridEdit[],
      reason: DataGridEditReason = "edit",
    ): DataGridCommitResult<TRow> => {
      if (edits.length === 0) return { ok: true, changes: [] };
      if (readOnly || !onRowsChange) {
        return { ok: false, error: "This grid is read-only", edit: edits[0]! };
      }

      const nextRows = [...rows];
      const rowIndexById = new Map(rows.map((row, index) => [getRowId(row), index]));
      const columnById = new Map(columns.map((column) => [column.id, column]));
      const changes: DataGridCellChange<TRow>[] = [];

      for (const edit of edits) {
        const rowIndex = rowIndexById.get(edit.rowId);
        const column = columnById.get(edit.columnId);
        if (rowIndex === undefined || !column) {
          return { ok: false, error: "Unknown row or column", edit };
        }
        const row = nextRows[rowIndex]!;
        const canEdit =
          column.setValue &&
          (typeof column.editable === "function"
            ? column.editable(row)
            : column.editable !== false);
        if (!canEdit) return { ok: false, error: "This cell is read-only", edit };

        const previousValue = column.getValue(row);
        const value = edit.value;
        const validationError = column.validate?.(value, row);
        if (validationError) return { ok: false, error: validationError, edit };
        if (Object.is(previousValue, value)) continue;

        const updatedRow = column.setValue!(row, value);
        nextRows[rowIndex] = updatedRow;
        changes.push({
          rowId: edit.rowId,
          rowIndex,
          columnId: column.id,
          previousValue,
          value,
          previousRow: row,
          row: updatedRow,
          reason,
        });
      }

      if (changes.length === 0) return { ok: true, changes };
      onRowsChange(nextRows, changes);
      for (const change of changes) {
        onCellEditComplete?.(change);
        columnById.get(change.columnId)?.onCellEditComplete?.(change);
        for (const event of cellEvents ?? []) {
          if (event.rowId === change.rowId && event.columnId === change.columnId) {
            event.onEditComplete(change);
          }
        }
      }
      const changedRows = new Map<string, DataGridCellChange<TRow>[]>();
      for (const change of changes) {
        const rowChanges = changedRows.get(change.rowId) ?? [];
        rowChanges.push(change);
        changedRows.set(change.rowId, rowChanges);
      }
      for (const [rowId, rowChanges] of changedRows) {
        const first = rowChanges[0]!;
        const last = rowChanges[rowChanges.length - 1]!;
        onRowEditComplete?.({
          rowId,
          rowIndex: first.rowIndex,
          previousRow: first.previousRow,
          row: last.row,
          changes: rowChanges,
          reason,
        });
      }
      return { ok: true, changes };
    },
    [
      cellEvents,
      columns,
      getRowId,
      onCellEditComplete,
      onRowEditComplete,
      onRowsChange,
      readOnly,
      rows,
    ],
  );

  const previousState = React.useRef<{
    rowSelection?: string;
    cellSelection?: string;
    sorting?: string;
  }>({});
  React.useEffect(() => {
    const rowSelectionState = JSON.stringify(table.state.rowSelection);
    const cellSelectionState = JSON.stringify(table.state.cellSelection);
    const sortingState = JSON.stringify(table.state.sorting);
    if (
      previousState.current.rowSelection !== undefined &&
      previousState.current.rowSelection !== rowSelectionState
    ) {
      onRowSelectionChange?.(
        new Set(Object.keys(table.state.rowSelection).filter((id) => table.state.rowSelection[id])),
      );
    }
    if (
      previousState.current.cellSelection !== undefined &&
      previousState.current.cellSelection !== cellSelectionState
    ) {
      onCellSelectionChange?.(table.state.cellSelection);
    }
    if (
      previousState.current.sorting !== undefined &&
      previousState.current.sorting !== sortingState
    ) {
      onSortingChange?.(table.state.sorting);
    }
    previousState.current = {
      rowSelection: rowSelectionState,
      cellSelection: cellSelectionState,
      sorting: sortingState,
    };
  }, [
    table.state.cellSelection,
    table.state.rowSelection,
    table.state.sorting,
    onCellSelectionChange,
    onRowSelectionChange,
    onSortingChange,
  ]);

  return { table, commitCells };
}
