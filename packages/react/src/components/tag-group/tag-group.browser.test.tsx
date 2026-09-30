import * as React from "react";
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { TagGroup } from "./tag-group.js";
import { Tag } from "../tag/tag.js";
const items = [
  { key: "a", textValue: "Alpha" },
  { key: "b", textValue: "Beta" },
  { key: "c", textValue: "Charlie" },
];
const list = (
  <TagGroup.List>
    {(item) => (
      <Tag itemKey={item.key} textValue={item.textValue}>
        {item.textValue}
      </Tag>
    )}
  </TagGroup.List>
);
// Removal can otherwise strand focus on document.body or mutate a controlled owner's collection.
test("keyboard and control removal restore next, previous, then empty-root focus", async () => {
  const selection = vi.fn();
  await render(
    <TagGroup
      aria-label="Tags"
      defaultItems={items}
      selectionMode="multiple"
      onSelectionChange={selection}
    >
      {list}
    </TagGroup>,
  );
  await page.getByRole("row").filter({ hasText: "Beta" }).click();
  await userEvent.keyboard("{Delete}");
  expect(selection.mock.lastCall?.[0]).toEqual(new Set());
  await expect.element(page.getByRole("row").filter({ hasText: "Charlie" })).toHaveFocus();
  await page.getByRole("button", { name: "Remove Charlie" }).click();
  await expect.element(page.getByRole("row").filter({ hasText: "Alpha" })).toHaveFocus();
  await userEvent.keyboard("{Backspace}");
  await expect.element(page.getByRole("grid", { name: "Tags" })).toHaveFocus();
});
test("controlled removal does not hide an item before the owner accepts", async () => {
  const change = vi.fn();
  await render(
    <TagGroup aria-label="Controlled tags" items={items} onItemsChange={change}>
      {list}
    </TagGroup>,
  );
  await page.getByRole("button", { name: "Remove Alpha" }).click();
  expect(change).toHaveBeenCalledWith(items.slice(1));
  await expect.element(page.getByRole("row").filter({ hasText: "Alpha" })).toBeInTheDocument();
});
test("controlled removal commits restore focus using key identity rather than stringified DOM keys", async () => {
  function Controlled() {
    const [values, setValues] = React.useState([
      { key: 1 as React.Key, textValue: "Number" },
      { key: "1" as React.Key, textValue: "String" },
    ]);
    return (
      <TagGroup aria-label="Identity" items={values} onItemsChange={setValues}>
        <TagGroup.List>
          {(item) => (
            <Tag itemKey={item.key} textValue={item.textValue}>
              {item.textValue}
            </Tag>
          )}
        </TagGroup.List>
      </TagGroup>
    );
  }
  await render(<Controlled />);
  await page.getByRole("row").filter({ hasText: "String" }).click();
  await userEvent.keyboard("{Delete}");
  await expect.element(page.getByRole("row").filter({ hasText: "Number" })).toHaveFocus();
  await expect.element(page.getByRole("row").filter({ hasText: "String" })).not.toBeInTheDocument();
});
// Item-local keyboard handling must not double-toggle through the composite owner or steal button activation.
test("tag keyboard selection runs once, while focused remove controls retain native Enter activation", async () => {
  const selection = vi.fn();
  await render(
    <TagGroup
      aria-label="Keyboard tags"
      defaultItems={items}
      selectionMode="multiple"
      onSelectionChange={selection}
    >
      {list}
    </TagGroup>,
  );
  await page.getByRole("row").filter({ hasText: "Alpha" }).click();
  selection.mockClear();
  await userEvent.keyboard(" ");
  expect(selection).toHaveBeenCalledExactlyOnceWith(new Set());
  await expect
    .element(page.getByRole("grid", { name: "Keyboard tags" }))
    .toHaveAttribute("aria-multiselectable", "true");
  const remove = page.getByRole("button", { name: "Remove Beta" });
  (remove.element() as HTMLButtonElement).focus();
  await expect.element(remove).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(page.getByRole("row").filter({ hasText: "Beta" })).not.toBeInTheDocument();
  await expect.element(page.getByRole("row").filter({ hasText: "Charlie" })).toHaveFocus();
});
