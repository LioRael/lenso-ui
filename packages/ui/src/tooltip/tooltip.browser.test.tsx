import * as stylex from "@stylexjs/stylex";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Tooltip } from "./index.js";
import { styles } from "./tooltip.stylex.js";

function TooltipPreview({ shortcut = false }: { shortcut?: boolean }) {
  return (
    <div
      data-slot="tooltip-popup-preview"
      style={{ width: shortcut ? 96 : 70 }}
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
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: 70,
          width: 276,
        }}
      >
        {(["light", "dark"] as const).map((theme) => (
          <ThemeScope
            key={theme}
            style={{
              alignItems: "start",
              background: theme === "light" ? "#e9e9eb" : "#161616",
              boxSizing: "border-box",
              display: "flex",
              gap: 110,
              height: 35,
              padding: 4,
            }}
            theme={theme}
          >
            <TooltipPreview />
            <TooltipPreview shortcut />
          </ThemeScope>
        ))}
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
  await document.fonts.load('400 12px "Inter"', "Help with");
  const board = screen.getByTestId("tooltip-figma-state-board");
  const previews = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="tooltip-popup-preview"]');
  await expect.poll(() => getComputedStyle(previews[0]!).height).toBe("29px");
  await expect.poll(() => getComputedStyle(previews[0]!).boxShadow).toContain("-2px");
  expect(previews[0]!.getBoundingClientRect().width).toBe(70);
  expect(previews[1]!.getBoundingClientRect().width).toBe(96);

  const shortcut = previews[1]!.querySelector<HTMLElement>('[data-slot="tooltip-shortcut"]')!;
  const shortcutStyle = getComputedStyle(shortcut);
  expect(shortcut.tagName).toBe("KBD");
  expect(shortcutStyle.borderRadius).toBe("4px");
  expect(shortcutStyle.fontSize).toBe("12px");
  expect(shortcutStyle.fontWeight).toBe("400");
  expect(shortcutStyle.lineHeight).toBe("13.2px");
  expect(shortcutStyle.minWidth).toBe("18px");
  expect(shortcutStyle.padding).toBe("2px");
  expect(shortcut.getBoundingClientRect().height).toBeCloseTo(18.2, 1);

  const darkShortcut = previews[3]!.querySelector<HTMLElement>('[data-slot="tooltip-shortcut"]')!;
  const darkShortcutStyle = getComputedStyle(darkShortcut);
  expect(darkShortcutStyle.borderColor).toBe("rgb(51, 51, 51)");
  expect(darkShortcutStyle.color).toBe("rgb(138, 143, 152)");
  expect(getComputedStyle(previews[3]!).backgroundColor).toBe("rgb(40, 41, 43)");

  const trigger = screen.getByRole("button", { name: "Help" });
  await userEvent.hover(trigger);
  const runtimeTooltip = screen.getByTestId("runtime-tooltip");
  await expect.element(runtimeTooltip).toBeVisible();
  await expect.poll(() => getComputedStyle(runtimeTooltip.element()).opacity).toBe("1");
  expect(runtimeTooltip.element().getBoundingClientRect().width).toBeGreaterThan(96);
  expect(runtimeTooltip.element().getBoundingClientRect().width).toBeLessThan(98);
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
});

test.each(["top", "right", "bottom", "left"] as const)(
  "Tooltip keeps an 8px centered target gap on the %s side",
  async (side) => {
    const screen = await render(
      <ThemeScope
        style={{ display: "grid", height: 300, placeItems: "center", width: 400 }}
        theme="light"
      >
        <Tooltip.Provider closeDelay={0} delay={0}>
          <Tooltip.Root defaultOpen>
            <Tooltip.Trigger
              render={
                <button
                  aria-label={`${side} target`}
                  style={{ height: 24, width: 24 }}
                  type="button"
                />
              }
            />
            <Tooltip.Portal>
              <Tooltip.Positioner side={side}>
                <Tooltip.Popup data-testid={`${side}-tooltip`}>Tooltip</Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      </ThemeScope>,
    );

    const trigger = screen.getByRole("button", { name: `${side} target` });
    const popup = screen.getByTestId(`${side}-tooltip`);
    await expect.element(popup).toBeVisible();

    const targetRect = trigger.element().getBoundingClientRect();
    const popupRect = popup.element().getBoundingClientRect();
    const gap = {
      bottom: popupRect.top - targetRect.bottom,
      left: targetRect.left - popupRect.right,
      right: popupRect.left - targetRect.right,
      top: targetRect.top - popupRect.bottom,
    }[side];
    const crossAxisDelta =
      side === "left" || side === "right"
        ? popupRect.top + popupRect.height / 2 - (targetRect.top + targetRect.height / 2)
        : popupRect.left + popupRect.width / 2 - (targetRect.left + targetRect.width / 2);

    expect(gap).toBeCloseTo(8, 0);
    expect(Math.abs(crossAxisDelta)).toBeLessThanOrEqual(0.5);
  },
);
