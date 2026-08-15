import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import { ChevronRightIcon, SettingsIcon } from "lucide-react";
import "@fontsource/inter/500.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { QuickLink } from "./index.js";

function Example() {
  return (
    <QuickLink
      leadingIcon={<SettingsIcon size={16} />}
      trailingIcon={<ChevronRightIcon size={14} />}
    >
      Team settings
    </QuickLink>
  );
}

test("Quick Link matches the approved Default and Hover Figma states", async () => {
  const screen = await render(
    <div
      data-testid="quick-link-figma-state-board"
      style={{
        background: "#f9f9fa",
        boxSizing: "border-box",
        height: 92,
        padding: 32,
        position: "relative",
        width: 336,
      }}
    >
      <div style={{ left: 32, position: "absolute", top: 32 }}>
        <Example />
      </div>
      <div style={{ left: 180, position: "absolute", top: 32 }}>
        <Example />
      </div>
    </div>,
  );
  await document.fonts.load('500 13px "Inter"', "Team settings");
  const board = screen.getByTestId("quick-link-figma-state-board");
  const links = board.element().querySelectorAll<HTMLElement>('[data-slot="quick-link"]');
  const trailing = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="quick-link-trailing"]');
  expect(links).toHaveLength(2);
  expect(links[0]?.getBoundingClientRect().height).toBe(28);
  await expect.poll(() => links[0]?.getBoundingClientRect().width).toBeCloseTo(139.25, 1);
  await userEvent.hover(links[1]!);
  await expect.poll(() => getComputedStyle(trailing[0]!).opacity).toBe("0");
  await expect.poll(() => getComputedStyle(trailing[1]!).opacity).toBe("1");
  expect((await axe.run(board.element())).violations).toEqual([]);
  await expect.element(board).toMatchScreenshot("quick-link-figma-state-board", {
    comparatorName: "pixelmatch",
    comparatorOptions: { allowedMismatchedPixelRatio: 0.03 },
  });
});
