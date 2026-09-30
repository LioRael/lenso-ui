import * as React from "react";
import { test, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { ListBox } from "./list-box.js";
import { ListBoxItem } from "../list-box-item/list-box-item.js";

// No prior collection coverage exists: prove disabled navigation, key identity and controlled ownership.
function Options() {
  return (
    <>
      <ListBoxItem itemKey={1} textValue="Alpha">
        Alpha
      </ListBoxItem>
      <ListBoxItem itemKey={2} textValue="Beta" disabled>
        Beta
      </ListBoxItem>
      <ListBoxItem itemKey="1" textValue="Charlie">
        Charlie
      </ListBoxItem>
    </>
  );
}
test("roves past disabled items, supports boundaries/typeahead, and keeps numeric/string keys distinct", async () => {
  const change = vi.fn();
  await render(
    <ListBox aria-label="Choices" selectionMode="multiple" onSelectionChange={change}>
      <Options />
    </ListBox>,
  );
  await page.getByRole("option", { name: "Alpha" }).click();
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(page.getByRole("option", { name: "Charlie" })).toHaveFocus();
  await userEvent.keyboard(" ");
  expect(change.mock.lastCall?.[0]).toEqual(new Set([1, "1"]));
  await userEvent.keyboard("{Home}c");
  await expect.element(page.getByRole("option", { name: "Charlie" })).toHaveFocus();
  await expect
    .element(page.getByRole("option", { name: "Beta" }))
    .toHaveAttribute("tabindex", "-1");
});
test("controlled selection requests a change without claiming it committed", async () => {
  const change = vi.fn();
  await render(
    <ListBox
      aria-label="Controlled"
      selectionMode="single"
      selectedKeys={new Set([1])}
      onSelectionChange={change}
    >
      <Options />
    </ListBox>,
  );
  await page.getByRole("option", { name: "Charlie" }).click();
  expect(change).toHaveBeenCalledWith(new Set(["1"]));
  await expect
    .element(page.getByRole("option", { name: "Alpha" }))
    .toHaveAttribute("aria-selected", "true");
  await expect
    .element(page.getByRole("option", { name: "Charlie" }))
    .toHaveAttribute("aria-selected", "false");
});
test("compiled styles retain source padding, logical indicator placement and live OKLCH colors", async () => {
  await render(
    <ListBox
      aria-label="Geometry"
      dir="rtl"
      style={
        { "--foreground": "oklch(0.2 0.01 250)", "--radius-2xl": "12px" } as React.CSSProperties
      }
    >
      <ListBoxItem itemKey="a" textValue="Alpha">
        Alpha
        <ListBoxItem.Indicator />
      </ListBoxItem>
    </ListBox>,
  );
  const option = page.getByRole("option").element();
  await expect.poll(() => getComputedStyle(option).color).toBe("oklch(0.2 0.01 250)");
  expect(getComputedStyle(option).paddingRight).toBe("8px");
  expect(getComputedStyle(option).paddingLeft).toBe("28px");
  expect(getComputedStyle(option).borderRadius).toBe("12px");
  expect(getComputedStyle(option).minHeight).toBe("36px");
  expect(option.getBoundingClientRect().height).toBe(36);
  const indicator = option.querySelector('[data-slot="list-box-item-indicator"]')!;
  expect(getComputedStyle(indicator).left).toBe("8px");
});
test("changing disabled keys updates navigation instead of retaining the initial registry filter", async () => {
  function Dynamic() {
    const [disabled, setDisabled] = React.useState<ReadonlySet<React.Key>>(new Set([1]));
    return (
      <>
        <button onClick={() => setDisabled(new Set(["1"]))}>Change disabled</button>
        <ListBox aria-label="Dynamic" disabledKeys={disabled}>
          <Options />
        </ListBox>
      </>
    );
  }
  await render(<Dynamic />);
  await page.getByRole("button", { name: "Change disabled" }).click();
  await page.getByRole("option", { name: "Alpha" }).click();
  await userEvent.keyboard("{End}");
  await expect.element(page.getByRole("option", { name: "Alpha" })).toHaveFocus();
  await expect
    .element(page.getByRole("option", { name: "Alpha" }))
    .toHaveAttribute("tabindex", "0");
});
