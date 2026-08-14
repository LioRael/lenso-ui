import * as stylex from "@stylexjs/stylex";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Tooltip } from "./index.js";
import { styles } from "./tooltip.stylex.js";

function TooltipPreview({ shortcut = false }: { shortcut?: boolean }) {
  return (
    <div
      data-slot="tooltip-popup-preview"
      style={{ width: shortcut ? 92 : 66 }}
      {...stylex.props(styles.popup)}
    >
      <span>Help with</span>
      {shortcut && <Tooltip.Shortcut>?</Tooltip.Shortcut>}
    </div>
  );
}

test("Tooltip matches Figma and exposes hover, focus, and Escape behavior", async () => {
  const screen = await render(
    <>
      <div
        data-testid="tooltip-figma-state-board"
        style={{
          alignItems: "start",
          background: "#e9e9eb",
          boxSizing: "border-box",
          display: "flex",
          gap: 110,
          height: 35,
          padding: 4,
          width: 276,
        }}
      >
        <TooltipPreview />
        <TooltipPreview shortcut />
      </div>
      <ThemeScope theme="light">
        <Tooltip.Provider closeDelay={0} delay={0}>
          <Tooltip.Root>
            <Tooltip.Trigger render={<button aria-label="Help" type="button" />}>
              Help
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner>
                <Tooltip.Popup data-testid="runtime-tooltip">
                  Help with <Tooltip.Shortcut>?</Tooltip.Shortcut>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </ThemeScope>
    </>,
  );
  await document.fonts.load('500 11px "Inter"', "Help with");
  const board = screen.getByTestId("tooltip-figma-state-board");
  const previews = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="tooltip-popup-preview"]');
  await expect.poll(() => getComputedStyle(previews[0]!).height).toBe("27px");
  expect(previews[0]!.getBoundingClientRect().width).toBe(66);
  expect(previews[1]!.getBoundingClientRect().width).toBe(92);

  const trigger = screen.getByRole("button", { name: "Help" });
  await userEvent.hover(trigger);
  const runtimeTooltip = screen.getByTestId("runtime-tooltip");
  await expect.element(runtimeTooltip).toBeVisible();
  expect(runtimeTooltip.element().getBoundingClientRect().width).toBeCloseTo(92, 0);
  expect(trigger.element().getAttribute("aria-describedby")).toBe(runtimeTooltip.element().id);
  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => trigger.element().hasAttribute("data-popup-open")).toBe(false);
  await userEvent.unhover(trigger);
  trigger.element().blur();
  trigger.element().focus();
  await expect.poll(() => trigger.element().hasAttribute("data-popup-open")).toBe(true);
  await expect.element(board).toMatchScreenshot("tooltip-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.025 },
  });
});
