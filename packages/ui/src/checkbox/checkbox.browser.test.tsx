import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Checkbox } from "./index.js";

test("Checkbox keeps the checkmark anchored while activation settles", async () => {
  const screen = await render(
    <Checkbox.Root aria-label="Toggle checkbox">
      <Checkbox.Indicator />
    </Checkbox.Root>,
  );
  const checkbox = screen.getByRole("checkbox", { name: "Toggle checkbox" });
  const indicator = checkbox
    .element()
    .querySelector<HTMLElement>('[data-slot="checkbox-indicator"]');

  const readMarkPosition = () => {
    const indicatorStyle = getComputedStyle(indicator!);
    const markStyle = getComputedStyle(indicator!, "::after");
    return {
      x: Number.parseFloat(markStyle.left) + Number.parseFloat(indicatorStyle.borderLeftWidth),
      y: Number.parseFloat(markStyle.top) + Number.parseFloat(indicatorStyle.borderTopWidth),
    };
  };

  await userEvent.click(checkbox);
  const duringActivation = readMarkPosition();
  await new Promise((resolve) => setTimeout(resolve, 100));
  const afterActivation = readMarkPosition();

  expect(duringActivation).toEqual(afterActivation);
});
