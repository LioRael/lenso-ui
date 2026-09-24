import * as React from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

import { useDataGrid, type DataGridColumn } from "./index.js";

type Row = { id: string; amount: number };
type Limits = { maxTotal: number };
const columns: readonly DataGridColumn<Row, Limits>[] = [
  {
    id: "amount",
    header: "Amount",
    getValue: (row) => row.amount,
    setValue: (row, value) => ({ ...row, amount: Number(value) }),
    validate: (value, _row, context) => {
      if (typeof value !== "number") return "Amount must be numeric";
      return context.rows.reduce((sum, item) => sum + item.amount, 0) >
        (context.data?.maxTotal ?? 0)
        ? "Total exceeds budget"
        : null;
    },
  },
];

function Fixture({ onCommit }: { onCommit: ReturnType<typeof vi.fn<(rows: Row[]) => void>> }) {
  const [rows, setRows] = React.useState<Row[]>([
    { id: "a", amount: 1 },
    { id: "b", amount: 1 },
  ]);
  const [message, setMessage] = React.useState("");
  const { table, commitCells } = useDataGrid<Row, Limits>({
    rows,
    columns,
    getRowId: (row) => row.id,
    validationData: { maxTotal: 5 },
    tableOptions: { initialState: { sorting: [{ id: "amount", desc: true }] } },
    onRowsChange: (next) => {
      setRows(next);
      onCommit(next);
    },
  });
  const commit = (amount: number) => {
    const result = commitCells(
      [
        { rowId: "a", columnId: "amount", value: amount },
        { rowId: "b", columnId: "amount", value: 2 },
      ],
      "paste",
    );
    setMessage(result.ok ? "saved" : result.error);
  };
  return (
    <div>
      <output>{rows.map((row) => row.amount).join(",")}</output>
      <span>{message}</span>
      <span>{table.getRowModel().rows.length} rows</span>
      <button type="button" onClick={() => commit(4)}>
        Invalid batch
      </button>
      <button type="button" onClick={() => commit(3)}>
        Valid batch
      </button>
    </div>
  );
}

test("validates against the final candidate rows and external data before applying a batch", async () => {
  const onCommit = vi.fn<(rows: Row[]) => void>();
  const screen = await render(<Fixture onCommit={onCommit} />);
  await userEvent.click(screen.getByRole("button", { name: "Invalid batch" }));
  await expect.element(screen.getByText("Total exceeds budget")).toBeVisible();
  await expect.element(screen.getByText("1,1")).toBeVisible();
  expect(onCommit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Valid batch", exact: true }));
  await expect.element(screen.getByText("3,2")).toBeVisible();
  expect(onCommit).toHaveBeenCalledTimes(1);
});
