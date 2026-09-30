import * as React from "react";
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Table } from "./table.js";
// Native table structure alone does not prove sorting, resize propagation, selection or expansion.
test("sort, resize, keyboard cell navigation, selection and expansion remain independent", async () => {
  const sort = vi.fn();
  await render(
    <Table>
      <Table.Content aria-label="People" selectionMode="multiple" onSortChange={sort}>
        <Table.Header>
          <Table.Column columnKey="name" allowsSorting width={180}>
            Name
            <Table.ColumnResizer />
          </Table.Column>
          <Table.Column columnKey="actions">Actions</Table.Column>
        </Table.Header>
        <Table.Body>
          <Table.Row itemKey="a" expandedContent="Details" expandedColSpan={2}>
            <Table.Cell>Alpha</Table.Cell>
            <Table.Cell>
              <Table.SelectionCheckbox />
              <Table.ExpandButton />
            </Table.Cell>
          </Table.Row>
          <Table.Row itemKey="b" disabled>
            <Table.Cell>Beta</Table.Cell>
            <Table.Cell>Disabled</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Content>
    </Table>,
  );
  await page.getByRole("columnheader", { name: /Name/ }).click();
  expect(sort).toHaveBeenCalledWith({ column: "name", direction: "ascending" });
  await expect
    .element(page.getByRole("columnheader", { name: /Name/ }))
    .toHaveAttribute("aria-sort", "ascending");
  await page.getByRole("separator").click();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "190");
  await page.getByRole("cell", { name: "Alpha" }).click();
  await userEvent.keyboard("{ArrowRight}");
  await expect
    .element(page.getByRole("cell").filter({ has: page.getByRole("checkbox") }))
    .toHaveFocus();
  await expect.element(page.getByRole("checkbox")).toBeChecked();
  await page.getByRole("checkbox").click();
  await expect.element(page.getByRole("checkbox")).not.toBeChecked();
  await page.getByRole("button", { name: "Expand row" }).click();
  await expect.element(page.getByRole("cell", { name: "Details" })).toBeVisible();
});
test("logical source corners and header resizing follow RTL without crossing width bounds", async () => {
  await render(
    <Table
      dir="rtl"
      style={
        {
          "--radius": "12px",
          "--radius-2xl": "24px",
          "--surface": "oklch(0.98 0.002 250)",
          "--foreground": "oklch(0.2 0.01 250)",
        } as React.CSSProperties
      }
    >
      <Table.Content aria-label="RTL">
        <Table.Header>
          <Table.Column columnKey="name" width={100} minWidth={80} maxWidth={120}>
            Name
            <Table.ColumnResizer />
          </Table.Column>
          <Table.Column columnKey="age">Age</Table.Column>
        </Table.Header>
        <Table.Body>
          <Table.Row itemKey="a">
            <Table.Cell>Alpha</Table.Cell>
            <Table.Cell>22</Table.Cell>
          </Table.Row>
          <Table.Row itemKey="b">
            <Table.Cell>Beta</Table.Cell>
            <Table.Cell>33</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Content>
    </Table>,
  );
  const alpha = page.getByRole("cell", { name: "Alpha" }).element();
  await expect.poll(() => getComputedStyle(alpha).color).toBe("oklch(0.2 0.01 250)");
  expect(getComputedStyle(alpha).borderTopRightRadius).toBe("24px");
  expect(getComputedStyle(alpha).paddingRight).toBe("16px");
  await page.getByRole("separator").click();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "110");
  await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "120");
  await userEvent.keyboard("{Home}");
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "80");
  await userEvent.dragAndDrop(
    page.getByRole("separator"),
    page.getByRole("columnheader", { name: "Age" }),
  );
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "120");
});
