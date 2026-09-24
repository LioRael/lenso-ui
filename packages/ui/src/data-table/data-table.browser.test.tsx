import * as React from "react";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { DataTable } from "./index.js";

const columns = [
  { id: "name", width: 180, minWidth: 160, pinned: true },
  { id: "status", width: 140, pinned: true },
  { id: "owner", width: 200 },
] as const;

test("keeps semantic table cells and pinned offsets aligned during resizing", async () => {
  const screen = await render(
    <DataTable.Root columns={columns} label="Projects" maxHeight={240}>
      <DataTable.Header>
        <DataTable.Row>
          <DataTable.Head columnId="name" resizable resizeLabel="Resize Name column">
            Name
          </DataTable.Head>
          <DataTable.Head columnId="status">Status</DataTable.Head>
          <DataTable.Head columnId="owner">Owner</DataTable.Head>
        </DataTable.Row>
      </DataTable.Header>
      <DataTable.Body>
        <DataTable.Row>
          <DataTable.Cell columnId="name">Atlas</DataTable.Cell>
          <DataTable.Cell columnId="status">Active</DataTable.Cell>
          <DataTable.Cell columnId="owner">Sam</DataTable.Cell>
        </DataTable.Row>
      </DataTable.Body>
      <DataTable.Footer>
        <DataTable.Row>
          <DataTable.Cell columnId="name">1 project</DataTable.Cell>
          <DataTable.Cell columnId="status" />
          <DataTable.Cell columnId="owner" />
        </DataTable.Row>
      </DataTable.Footer>
    </DataTable.Root>,
  );

  const table = screen.getByRole("table", { name: "Projects" });
  const handle = screen.getByRole("separator", { name: "Resize Name column" });
  const statusCell = screen.getByRole("cell", { name: "Active" });

  expect(table.element().querySelectorAll("thead th")).toHaveLength(3);
  expect(getComputedStyle(statusCell.element()).left).toBe("180px");
  handle.element().focus();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "188");
  expect(getComputedStyle(statusCell.element()).left).toBe("188px");
  expect(table.element().querySelector("col")?.getAttribute("style")).toContain("188px");
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});
