import * as React from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { SelectionToolbar } from "./index.js";

test("shows selection actions and clears the owning selection", async () => {
  const action = vi.fn();
  function Fixture() {
    const [count, setCount] = React.useState(2);
    return (
      <div style={{ position: "relative", height: 180 }}>
        <SelectionToolbar.Root count={count} onClear={() => setCount(0)}>
          <SelectionToolbar.Action onClick={action}>Copy names</SelectionToolbar.Action>
        </SelectionToolbar.Root>
      </div>
    );
  }
  const screen = await render(<Fixture />);
  const toolbar = screen.getByRole("toolbar", { name: "Selection actions" });
  await expect.element(toolbar).toBeVisible();
  await expect.element(screen.getByText("2 selected")).toBeVisible();
  const actionButton = screen.getByRole("button", { name: "Copy names" });
  const clearButton = screen.getByRole("button", { name: "Clear selection" });
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
  await userEvent.tab();
  await expect.element(actionButton).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenCalledOnce();
  await userEvent.tab();
  await expect.element(clearButton).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(toolbar).not.toBeInTheDocument();
});
