import * as stylex from "@stylexjs/stylex";
import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";
import "@fontsource/inter/400.css";
import "virtual:stylex:runtime";

import "../../../tokens/src/styles.css";
import { ThemeScope } from "../theme-scope/index.js";
import { Popover } from "./index.js";
import { styles } from "./popover.stylex.js";

type Placement = "bottom" | "left" | "right" | "top";

function TriggerPreview({ state }: { state: string }) {
  return (
    <button data-visual-state={state} type="button" {...stylex.props(styles.trigger)}>
      <span style={{ flex: 1, textAlign: "left" }}>Open popover</span>
      <span aria-hidden="true">{state === "open" ? "⌃" : "⌄"}</span>
    </button>
  );
}

function ContentPreview({ arrow, placement }: { arrow: boolean; placement: Placement }) {
  const popupPosition = {
    bottom: { left: 8, top: 8 },
    left: { left: 16, top: 8 },
    right: { left: 0, top: 8 },
    top: { left: 8, top: 0 },
  }[placement];
  const arrowPosition = {
    bottom: { left: 116.5, top: -3.66 },
    left: { left: 231, top: 52.34 },
    right: { left: 2, top: 52.34 },
    top: { left: 116.5, top: 104.34 },
  }[placement];
  return (
    <div style={{ height: 124, position: "relative", width: 241 }}>
      <div
        data-slot="popover-popup-preview"
        style={{ height: 108, position: "absolute", ...popupPosition }}
        {...stylex.props(styles.popup)}
      >
        <Popover.Item data-visual-state="highlighted">Edit issue</Popover.Item>
        <Popover.Item>Set reminder</Popover.Item>
        <Popover.Item tone="danger">Delete</Popover.Item>
      </div>
      {arrow && <span style={arrowPosition} {...stylex.props(styles.arrowPreview)} />}
    </div>
  );
}

test("Popover matches Figma and supports composed interaction", async () => {
  const triggerStates = ["default", "hover", "pressed", "focus-visible", "open"];
  const contentVariants = (["top", "right", "bottom", "left"] as const).flatMap((placement) => [
    { arrow: false, placement },
    { arrow: true, placement },
  ]);
  const screen = await render(
    <>
      <div
        data-testid="popover-figma-state-board"
        style={{ background: "#fafafa", boxSizing: "border-box", height: 520, width: 795 }}
      >
        <div style={{ display: "flex", gap: 24, height: 60, padding: 16 }}>
          {triggerStates.map((state) => (
            <TriggerPreview key={state} state={state} />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(3, 241px)",
            gridTemplateRows: "repeat(3, 124px)",
            height: 444,
            padding: 16,
          }}
        >
          {contentVariants.map(({ arrow, placement }) => (
            <ContentPreview
              arrow={arrow}
              key={`${placement}-${arrow ? "arrow" : "plain"}`}
              placement={placement}
            />
          ))}
        </div>
      </div>
      <ThemeScope theme="light">
        <Popover.Root>
          <Popover.Trigger>Open details</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side="bottom">
              <Popover.Popup aria-label="Project actions" data-testid="runtime-popover">
                <Popover.Arrow />
                <Popover.Item render={<a aria-label="Edit issue" href="#edit" />}>
                  Edit issue
                </Popover.Item>
                <Popover.Item>Set reminder</Popover.Item>
                <Popover.Item tone="danger">Delete</Popover.Item>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </ThemeScope>
    </>,
  );

  await document.fonts.load('400 13px "Inter"', "Open popover");
  await document.fonts.ready;
  const board = screen.getByTestId("popover-figma-state-board");
  const previews = board
    .element()
    .querySelectorAll<HTMLElement>('[data-slot="popover-popup-preview"]');
  await expect.poll(() => getComputedStyle(previews[0]!).height).toBe("108px");
  await expect.poll(() => getComputedStyle(previews[0]!).width).toBe("225px");
  expect(previews).toHaveLength(8);
  expect(previews[0]!.getBoundingClientRect().width).toBe(225);
  expect(getComputedStyle(previews[0]!).boxShadow).toContain("18px");
  const openPreview = board.element().querySelector<HTMLElement>('[data-visual-state="open"]');
  const highlightedItem = previews[0]!.querySelector<HTMLElement>(
    '[data-visual-state="highlighted"]',
  );
  expect(getComputedStyle(openPreview!).backgroundColor).toBe("rgb(240, 240, 241)");
  expect(getComputedStyle(highlightedItem!).backgroundColor).toBe("rgb(240, 240, 241)");

  const trigger = screen.getByRole("button", { name: "Open details" });
  await userEvent.click(trigger);
  const popup = screen.getByTestId("runtime-popover");
  await expect.element(popup).toBeVisible();
  await expect.poll(() => getComputedStyle(popup.element()).opacity).toBe("1");
  const customItem = popup.element().querySelector<HTMLAnchorElement>('a[href="#edit"]');
  expect(customItem?.textContent).toBe("Edit issue");
  expect(
    (
      await axe.run(document.body, {
        rules: { "aria-hidden-focus": { enabled: false }, region: { enabled: false } },
      })
    ).violations,
  ).toEqual([]);
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => trigger.element().hasAttribute("data-popup-open")).toBe(false);
  await expect.poll(() => document.activeElement === trigger.element()).toBe(true);
});
