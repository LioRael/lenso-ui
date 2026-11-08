import * as React from "react";
import { expect, mock, test } from "bun:test";

import { click, render } from "../../tests/dom.js";

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

function Fixture({ onCommit }: { onCommit: (rows: Row[]) => void }) {
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
  const onCommit = mock((_rows: Row[]) => {});
  const container = await render(<Fixture onCommit={onCommit} />);
  const buttons = container.querySelectorAll("button");
  await click(buttons[0]!);
  expect(container.textContent).toContain("Total exceeds budget");
  expect(container.querySelector("output")?.textContent).toBe("1,1");
  expect(onCommit).not.toHaveBeenCalled();
  await click(buttons[1]!);
  expect(container.querySelector("output")?.textContent).toBe("3,2");
  expect(onCommit).toHaveBeenCalledTimes(1);
});
