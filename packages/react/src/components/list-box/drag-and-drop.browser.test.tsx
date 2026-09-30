import * as React from "react";
import { test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { ListBox } from "./list-box.js";
import { ListBoxItem } from "../list-box-item/list-box-item.js";
import { Table } from "../table/table.js";
import type { CollectionDrop } from "./drag-and-drop.js";

// Native draggable attributes alone do not prove collection mutation or keyboard drop.
function Reordering({ table = false }: { table?: boolean }) {
  const [items, setItems] = React.useState(["Alpha", "Beta", "Charlie"]);
  const reorder = ({ keys, targetKey, dropPosition }: CollectionDrop) =>
    setItems((previous) => {
      const moving = previous.filter((key) => keys.has(key));
      const remaining = previous.filter((key) => !keys.has(key));
      const index = remaining.indexOf(String(targetKey)) + (dropPosition === "after" ? 1 : 0);
      return [...remaining.slice(0, index), ...moving, ...remaining.slice(index)];
    });
  if (table)
    return (
      <Table>
        <Table.Content aria-label="Reorder rows" dragAndDrop={{ onReorder: reorder }}>
          <Table.Header>
            <Table.Column columnKey="name">Name</Table.Column>
          </Table.Header>
          <Table.Body>
            {items.map((name) => (
              <Table.Row key={name} itemKey={name} textValue={name}>
                <Table.Cell>
                  <button type="button" slot="drag" aria-label={`Drag ${name}`}>
                    Drag
                  </button>
                  {name}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table>
    );
  return (
    <ListBox aria-label="Reorder options" dragAndDrop={{ onReorder: reorder }}>
      {items.map((name) => (
        <ListBoxItem key={name} itemKey={name} textValue={name} aria-label={name}>
          <button type="button" slot="drag" aria-label={`Drag ${name}`}>
            Drag
          </button>
          {name}
        </ListBoxItem>
      ))}
    </ListBox>
  );
}

test("native pointer drops move options in the controlled collection", async () => {
  await render(<Reordering />);
  await userEvent.dragAndDrop(
    page.getByRole("option", { name: "Alpha" }),
    page.getByRole("option", { name: "Charlie" }),
    {
      targetPosition: {
        x: 32,
        y:
          page.getByRole("option", { name: "Charlie" }).element().getBoundingClientRect().height -
          2,
      },
    },
  );
  await expect
    .poll(() =>
      [...document.querySelectorAll('[role="option"]')].map((item) =>
        item.getAttribute("aria-label"),
      ),
    )
    .toEqual(["Beta", "Charlie", "Alpha"]);
});
test("drag handles expose cancellable keyboard reorder for native table rows", async () => {
  await render(<Reordering table />);
  page.getByRole("button", { name: "Drag Alpha" }).element().focus();
  await userEvent.keyboard("{Enter}{ArrowDown}{ArrowDown}{Enter}");
  await expect
    .poll(() =>
      [...document.querySelectorAll("tbody tr")].map((row) => row.textContent?.replace("Drag", "")),
    )
    .toEqual(["Beta", "Alpha", "Charlie"]);
  page.getByRole("button", { name: "Drag Alpha" }).element().focus();
  await userEvent.keyboard("{Enter}{ArrowDown}{Escape}");
  expect(
    [...document.querySelectorAll("tbody tr")].map((row) => row.textContent?.replace("Drag", "")),
  ).toEqual(["Beta", "Alpha", "Charlie"]);
});
