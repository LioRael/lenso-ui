import * as React from "react";
import { expect, test, vi } from "vitest";
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
  const onSort = vi.fn();
  const screen = await render(
    <DataTable.Root columns={columns} label="Projects" maxHeight={240} style={{ width: 300 }}>
      <DataTable.Header>
        <DataTable.Row>
          <DataTable.Head
            columnId="name"
            resizable
            resizeLabel="Resize Name column"
            onSort={onSort}
            sortDirection="asc"
            sortLabel="Order by name"
          >
            Name
          </DataTable.Head>
          <DataTable.Head columnId="status">Status</DataTable.Head>
          <DataTable.Head columnId="owner">Owner</DataTable.Head>
        </DataTable.Row>
      </DataTable.Header>
      <DataTable.Body>
        <DataTable.GroupRow label="Active" count={1} />
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
  expect(handle.element().querySelector('[data-slot="resize-handle-indicator"]')).not.toBeNull();
  const statusCell = screen.getByRole("cell", { name: "Active", exact: true });

  expect(table.element().querySelectorAll("thead th")).toHaveLength(3);
  expect(table.element().querySelector('[scope="rowgroup"]')?.textContent).toBe("Active1");
  const scrollArea = table.element().parentElement!;
  const guide = handle
    .element()
    .querySelector<HTMLElement>('[data-slot="resize-handle-indicator"]')!;
  await vi.waitFor(() =>
    expect(guide.getBoundingClientRect().height).toBe(scrollArea.clientHeight),
  );
  scrollArea.scrollLeft = 100;
  const groupCell = table.element().querySelector('[scope="rowgroup"]')!;
  const groupSurface = groupCell.firstElementChild!;
  const groupLabel = groupSurface.firstElementChild!;
  await vi.waitFor(() => {
    expect(groupSurface.getBoundingClientRect().top - groupCell.getBoundingClientRect().top).toBe(
      2,
    );
    expect(
      groupCell.getBoundingClientRect().bottom - groupSurface.getBoundingClientRect().bottom,
    ).toBe(2);
  });
  await vi.waitFor(() =>
    expect(groupLabel.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      scrollArea.getBoundingClientRect().left,
    ),
  );
  await userEvent.click(screen.getByRole("button", { name: "Order by name" }));
  expect(onSort).toHaveBeenCalledOnce();
  expect(table.element().querySelector('[data-column-id="name"]')?.getAttribute("aria-sort")).toBe(
    "ascending",
  );
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

test("joins adjacent selected rows without gaps or inner corners", async () => {
  const screen = await render(
    <DataTable.Root columns={[{ id: "name", width: 200 }]} label="Selection geometry">
      <DataTable.Body>
        <DataTable.Row selected>
          <DataTable.Cell columnId="name">First</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row selected>
          <DataTable.Cell columnId="name">Second</DataTable.Cell>
        </DataTable.Row>
        <DataTable.Row>
          <DataTable.Cell columnId="name">Third</DataTable.Cell>
        </DataTable.Row>
      </DataTable.Body>
    </DataTable.Root>,
  );

  const table = screen.getByRole("table", { name: "Selection geometry" }).element();
  const cells = [...table.querySelectorAll("tbody td")];
  const [first, second, third] = cells;
  if (!first || !second || !third) throw new Error("Expected three data cells");
  expect(getComputedStyle(table).borderSpacing).toMatch(/^0px(?: 0px)?$/);
  expect(second.getBoundingClientRect().top).toBeCloseTo(first.getBoundingClientRect().bottom, 0);
  await vi.waitFor(() => expect(getComputedStyle(first).borderTopLeftRadius).not.toBe("0px"));
  expect(getComputedStyle(first).borderBottomLeftRadius).toBe("0px");
  expect(getComputedStyle(second).borderTopLeftRadius).toBe("0px");
  expect(getComputedStyle(second).borderBottomLeftRadius).not.toBe("0px");
  expect(getComputedStyle(third).borderTopLeftRadius).not.toBe("0px");
});
