import * as React from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import type {
  DataGridCellChange,
  DataGridRowChange,
  DataGridTable,
} from "@lenso/primitives/data-grid";
import { DataGrid, type DataGridColumn } from "./index.js";

type Row = { id: string; name: string; amount: number };
const columns: readonly DataGridColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    width: 180,
    pinned: true,
    getValue: (row) => row.name,
    setValue: (row, value) => ({ ...row, name: String(value) }),
    validate: (value) => (String(value).trim() ? null : "Name is required"),
  },
  {
    id: "amount",
    header: "Amount",
    width: 120,
    getValue: (row) => row.amount,
    setValue: (row, value) => ({ ...row, amount: Number(value) }),
    parse: Number,
    validate: (value) =>
      typeof value === "number" && Number.isFinite(value) ? null : "Enter a number",
  },
];
const initialRows: Row[] = [
  { id: "a", name: "Atlas", amount: 2 },
  { id: "b", name: "Beacon", amount: 1 },
];

function Fixture({
  readOnly = false,
  showRowSelection = true,
  showRowNumbers = true,
  sortable = true,
  onCell = () => {},
  onRow = () => {},
  onExact = () => {},
}: {
  readOnly?: boolean;
  showRowSelection?: boolean;
  showRowNumbers?: boolean;
  sortable?: boolean;
  onCell?: (change: DataGridCellChange<Row>) => void;
  onRow?: (change: DataGridRowChange<Row>) => void;
  onExact?: (change: DataGridCellChange<Row>) => void;
}) {
  const [rows, setRows] = React.useState(initialRows);
  return (
    <DataGrid
      label="Projects"
      rows={rows}
      columns={columns}
      getRowId={(row) => row.id}
      onRowsChange={(next) => setRows([...next])}
      onCellEditComplete={onCell}
      onRowEditComplete={onRow}
      cellEvents={[{ rowId: "a", columnId: "name", onEditComplete: onExact }]}
      readOnly={readOnly}
      showRowSelection={showRowSelection}
      showRowNumbers={showRowNumbers}
      sortable={sortable}
    />
  );
}

test("commits a validated cell once and reports global, row, and exact-cell events", async () => {
  const onCell = vi.fn();
  const onRow = vi.fn();
  const onExact = vi.fn();
  const screen = await render(<Fixture onCell={onCell} onRow={onRow} onExact={onExact} />);
  await userEvent.dblClick(screen.getByRole("gridcell", { name: "Atlas" }));
  await userEvent.clear(screen.getByRole("textbox", { name: "Edit Name, row 1" }));
  await userEvent.keyboard("{Enter}");
  await expect.element(screen.getByRole("alert")).toHaveTextContent("Name is required");
  await expect
    .element(screen.getByRole("textbox", { name: "Edit Name, row 1" }))
    .toHaveAttribute("aria-invalid", "true");
  expect(onCell).not.toHaveBeenCalled();
  await userEvent.fill(screen.getByRole("textbox", { name: "Edit Name, row 1" }), "Atlas Labs");
  await userEvent.keyboard("{Enter}");
  await expect.element(screen.getByRole("gridcell", { name: "Atlas Labs" })).toBeVisible();
  expect(onCell).toHaveBeenCalledTimes(1);
  expect(onRow).toHaveBeenCalledTimes(1);
  expect(onExact).toHaveBeenCalledTimes(1);
});

test("forwards TanStack options and exposes the live table instance", async () => {
  const tableRef = React.createRef<DataGridTable<Row>>();
  await render(
    <DataGrid
      label="Projects"
      rows={initialRows}
      columns={columns}
      getRowId={(row) => row.id}
      tableRef={tableRef}
      tableOptions={{ initialState: { sorting: [{ id: "amount", desc: false }] } }}
      readOnly
    />,
  );
  expect(tableRef.current?.getRowModel().rows[0]?.original.id).toBe("b");
  expect(tableRef.current?.getColumn("amount")?.getIsSorted()).toBe("asc");
});

test("preserves native and convenience sorting callbacks together", async () => {
  const onNative = vi.fn();
  const onSortingChange = vi.fn();
  const screen = await render(
    <DataGrid
      label="Projects"
      rows={initialRows}
      columns={columns}
      getRowId={(row) => row.id}
      tableOptions={{ onSortingChange: onNative }}
      onSortingChange={onSortingChange}
      readOnly
    />,
  );
  await userEvent.click(screen.getByRole("button", { name: "Sort by Amount" }));
  expect(onNative).toHaveBeenCalledOnce();
  expect(onSortingChange).toHaveBeenCalledWith([{ id: "amount", desc: true }]);
});

test("keeps selected rows and cell ranges visually distinct", async () => {
  const screen = await render(<Fixture />);
  const grid = screen.getByRole("grid").element();
  const header = grid.querySelector("thead th")!;
  const firstRow = screen.getByRole("gridcell", { name: "Atlas" }).element().parentElement!;
  const firstCell = screen.getByRole("gridcell", { name: "Atlas" }).element();
  expect(header.getBoundingClientRect().height).toBe(32);
  expect(firstCell.getBoundingClientRect().height).toBe(48);
  expect(getComputedStyle(grid.parentElement!).borderTopWidth).toBe("0px");
  const canvasColor = getComputedStyle(firstRow).backgroundColor;
  await userEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
  expect(firstRow).toHaveAttribute("data-selected", "");
  expect(getComputedStyle(firstRow).backgroundColor).not.toBe(canvasColor);
  expect(firstCell).not.toHaveAttribute("data-selected");
  await userEvent.click(screen.getByRole("checkbox", { name: "Select row 1" }));
  expect(firstRow).not.toHaveAttribute("data-selected");
});

test("read-only and display switches remove edit, selection, number, and sort affordances", async () => {
  const screen = await render(
    <Fixture readOnly showRowSelection={false} showRowNumbers={false} sortable={false} />,
  );
  expect(screen.getByRole("grid").element()).toHaveAttribute("aria-readonly", "true");
  expect(screen.getByRole("button", { name: "Sort by Name" }).query()).toBeNull();
  expect(screen.getByRole("checkbox", { name: "Select all rows" }).query()).toBeNull();
  expect(screen.getByRole("columnheader", { name: "Row number" }).query()).toBeNull();
  await userEvent.dblClick(screen.getByRole("gridcell", { name: "Atlas" }));
  expect(screen.getByRole("textbox", { name: "Edit Name, row 1" }).query()).toBeNull();
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
