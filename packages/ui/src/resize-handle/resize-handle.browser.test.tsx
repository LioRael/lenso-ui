import * as React from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { ResizeHandle } from "./index.js";

function ControlledHandle({ theme }: { theme: "dark" | "light" }) {
  const [value, setValue] = React.useState(280);
  return (
    <ThemeScope style={{ display: "flex", height: 160, width: 320 }} theme={theme}>
      <aside aria-label={`${theme} inspector`} id={`${theme}-inspector`} style={{ width: value }}>
        Inspector
      </aside>
      <ResizeHandle
        aria-controls={`${theme}-inspector`}
        aria-label={`Resize ${theme} inspector`}
        max={300}
        min={160}
        onValueChange={setValue}
        value={value}
      />
    </ThemeScope>
  );
}

test("keeps Linear-inspired geometry and reveals the indicator on interaction", async () => {
  const screen = await render(
    <>
      <ControlledHandle theme="light" />
      <ControlledHandle theme="dark" />
      <ThemeScope style={{ height: 80, width: 200 }} theme="light">
        <div id="preview" />
        <ResizeHandle
          aria-controls="preview"
          aria-label="Resize preview"
          data-visual-state="hover"
          max={100}
          min={20}
          onValueChange={vi.fn()}
          orientation="horizontal"
          value={60}
        />
      </ThemeScope>
    </>,
  );
  const lightHandle = screen.getByRole("separator", { name: "Resize light inspector" });
  const darkHandle = screen.getByRole("separator", { name: "Resize dark inspector" });
  const horizontal = screen.getByRole("separator", { name: "Resize preview" });
  const lightIndicator = lightHandle
    .element()
    .querySelector<HTMLElement>('[data-slot="resize-handle-indicator"]')!;
  const darkIndicator = darkHandle
    .element()
    .querySelector<HTMLElement>('[data-slot="resize-handle-indicator"]')!;

  await expect.poll(() => getComputedStyle(lightHandle.element()).width).toBe("7px");
  expect(getComputedStyle(lightHandle.element()).cursor).toBe("col-resize");
  expect(getComputedStyle(lightIndicator).width).toBe("0.5px");
  expect(getComputedStyle(lightIndicator).top).toBe("12px");
  expect(getComputedStyle(lightIndicator).bottom).toBe("12px");
  expect(getComputedStyle(lightIndicator).opacity).toBe("0");
  expect(getComputedStyle(lightIndicator).transitionDuration).toBe("0.25s");

  await userEvent.hover(lightHandle);
  await expect.poll(() => getComputedStyle(lightIndicator).opacity).toBe("1");
  await userEvent.unhover(lightHandle);
  lightHandle.element().focus();
  await expect.poll(() => getComputedStyle(lightIndicator).opacity).toBe("1");
  expect(getComputedStyle(lightIndicator).backgroundImage).not.toBe(
    getComputedStyle(darkIndicator).backgroundImage,
  );

  await expect.poll(() => getComputedStyle(horizontal.element()).height).toBe("7px");
  expect(getComputedStyle(horizontal.element()).cursor).toBe("row-resize");
  const horizontalIndicator = horizontal
    .element()
    .querySelector<HTMLElement>('[data-slot="resize-handle-indicator"]')!;
  expect(getComputedStyle(horizontalIndicator).height).toBe("0.5px");
  expect(getComputedStyle(horizontalIndicator).left).toBe("12px");
  expect(getComputedStyle(horizontalIndicator).right).toBe("12px");
  expect(getComputedStyle(horizontalIndicator).opacity).toBe("1");

  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("keeps the visible line active for keyboard and pointer resizing", async () => {
  const screen = await render(<ControlledHandle theme="light" />);
  const handle = screen.getByRole("separator", { name: "Resize light inspector" });
  const indicator = handle
    .element()
    .querySelector<HTMLElement>('[data-slot="resize-handle-indicator"]')!;

  await handle.click();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "296");
  await expect.poll(() => getComputedStyle(indicator).opacity).toBe("1");

  handle
    .element()
    .dispatchEvent(
      new PointerEvent("pointerdown", { bubbles: true, button: 0, clientX: 120, pointerId: 5 }),
    );
  await expect.element(handle).toHaveAttribute("data-dragging");
  expect(getComputedStyle(indicator).opacity).toBe("1");
  handle
    .element()
    .dispatchEvent(new PointerEvent("pointerup", { bubbles: true, clientX: 120, pointerId: 5 }));
});
