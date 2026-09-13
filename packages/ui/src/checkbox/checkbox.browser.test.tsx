import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { Checkbox } from "./index.js";

test("keeps the checkmark anchored while activation settles", async () => {
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

// Safari/WebKit previously rendered the SVG data-URL checkbox masks as a mosaic.
// Keep this focused compatibility regression while the mark uses portable CSS geometry.
test("renders checkbox marks without WebKit CSS masks", async () => {
  const screen = await render(
    <div>
      <Checkbox.Root defaultChecked>
        <Checkbox.Indicator />
        <Checkbox.Label>Checked</Checkbox.Label>
      </Checkbox.Root>
      <Checkbox.Root indeterminate>
        <Checkbox.Indicator />
        <Checkbox.Label>Indeterminate</Checkbox.Label>
      </Checkbox.Root>
    </div>,
  );

  for (const name of ["Checked", "Indeterminate"]) {
    const indicator = screen
      .getByRole("checkbox", { name })
      .element()
      .querySelector<HTMLElement>('[data-slot="checkbox-indicator"]');
    const mark = getComputedStyle(indicator!, "::after");
    expect(mark.maskImage).toBe("none");
    expect(mark.content).not.toBe("none");
    expect(Number.parseFloat(mark.width)).toBeGreaterThan(0);
    expect(Number.parseFloat(mark.height)).toBeGreaterThan(0);
  }
});
