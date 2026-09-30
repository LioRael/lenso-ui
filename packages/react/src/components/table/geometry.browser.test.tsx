import * as React from "react";
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { Table } from "./table.js";

// Pixel-only resize tests did not prove bounded percent/fr allocation, responsive reflow or range selection.
test("bounded percent and weighted flexible columns reflow and resize logically in RTL", async () => {
  const screen = await render(
    <div style={{ width: 800 }} dir="rtl">
      <Table>
        <Table.ResizableContainer>
          <Table.Content aria-label="Flexible">
            <Table.Header>
              <Table.Column columnKey="a" width="25%" minWidth={100} maxWidth={180}>
                Percent
                <Table.ColumnResizer />
              </Table.Column>
              <Table.Column columnKey="b" width="1fr" minWidth={100}>
                One
              </Table.Column>
              <Table.Column columnKey="c" width="2fr" minWidth={100}>
                Two
              </Table.Column>
            </Table.Header>
            <Table.Body>
              <Table.Row itemKey="row">
                <Table.Cell>A</Table.Cell>
                <Table.Cell>B</Table.Cell>
                <Table.Cell>C</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Content>
        </Table.ResizableContainer>
      </Table>
    </div>,
  );
  const columns = () =>
    [...screen.container.querySelectorAll("th")].map((node) => node.getBoundingClientRect().width);
  await expect.poll(() => columns()[0]).toBeCloseTo(180, 0);
  expect(columns()[2]! / columns()[1]!).toBeCloseTo(2, 1);
  screen.container.firstElementChild!.setAttribute("style", "width:600px");
  await expect.poll(() => columns()[0]).toBeCloseTo(148, 0);
  await page.getByRole("separator").click();
  await userEvent.keyboard("{ArrowLeft}");
  await expect.element(page.getByRole("separator")).toHaveAttribute("aria-valuenow", "158");
});
test("native table range navigation skips disabled rows and header checkbox selects all", async () => {
  await render(
    <Table>
      <Table.Content aria-label="Ranges" selectionMode="multiple" disabledKeys={new Set(["b"])}>
        <Table.Header>
          <Table.Column columnKey="name">
            Name
            <Table.SelectionCheckbox />
          </Table.Column>
        </Table.Header>
        <Table.Body>
          {["a", "b", "c", "d"].map((key) => (
            <Table.Row key={key} itemKey={key}>
              <Table.Cell>{key}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Content>
    </Table>,
  );
  await page.getByRole("cell", { name: "a" }).click();
  await userEvent.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
  await expect
    .element(page.getByRole("row", { name: "d" }))
    .toHaveAttribute("aria-selected", "true");
  await userEvent.keyboard("{Shift>}{ArrowUp}{/Shift}");
  await expect
    .element(page.getByRole("row", { name: "d" }))
    .toHaveAttribute("aria-selected", "false");
  await page.getByRole("checkbox", { name: "Select all" }).click();
  await expect
    .element(page.getByRole("row", { name: "d" }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(page.getByRole("row", { name: "b" }))
    .toHaveAttribute("aria-selected", "false");
});
// The previous sentinel test suite never exercised a real IntersectionObserver.
test("load-more sentinel calls the owner only while idle and visible", async () => {
  const load = vi.fn();
  function Example() {
    const [loading, setLoading] = React.useState(false);
    return (
      <Table>
        <Table.Content aria-label="Loading">
          <Table.Header>
            <Table.Column columnKey="name">Name</Table.Column>
          </Table.Header>
          <Table.Body>
            <Table.Row itemKey="a">
              <Table.Cell>Alpha</Table.Cell>
            </Table.Row>
            <Table.LoadMore
              colSpan={1}
              loading={loading}
              onLoadMore={() => {
                setLoading(true);
                load();
              }}
            >
              <Table.LoadMoreContent>Loading</Table.LoadMoreContent>
            </Table.LoadMore>
          </Table.Body>
        </Table.Content>
      </Table>
    );
  }
  await render(<Example />);
  await expect.poll(() => load.mock.calls.length).toBe(1);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(load).toHaveBeenCalledTimes(1);
});
