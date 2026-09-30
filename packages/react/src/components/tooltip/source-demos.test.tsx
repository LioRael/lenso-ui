import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { TooltipBasic } from "../../../../../apps/docs/src/demos/en/tooltip/basic.js";
import { TooltipPlacement } from "../../../../../apps/docs/src/demos/en/tooltip/placement.js";
import { TooltipWithArrow } from "../../../../../apps/docs/src/demos/en/tooltip/with-arrow.js";
import { RenderFunction } from "../../../../../apps/docs/src/demos/en/tooltip/render-function.js";
import { CustomStyles } from "../../../../../apps/docs/src/demos/en/tooltip/custom-styles.js";
import { TooltipCustomTrigger } from "../../../../../apps/docs/src/demos/en/tooltip/custom-trigger.js";

afterEach(() => cleanup());

// Source records alone never exercised these trigger compositions or accessible descriptions.
it.each([
  { demo: TooltipBasic, trigger: "Hover me", description: "This is a tooltip" },
  { demo: RenderFunction, trigger: "Hover me", description: "This is a tooltip" },
  { demo: CustomStyles, trigger: "Share link", description: "Copied to clipboard" },
  { demo: TooltipCustomTrigger, trigger: "User avatar", description: "Jane Doe jane@example.com" },
  { demo: TooltipCustomTrigger, trigger: "Status chip", description: "Jane is currently online" },
  {
    demo: TooltipCustomTrigger,
    trigger: "Info icon",
    description:
      "Help Information This is a helpful tooltip with more detailed information about this feature.",
  },
])(
  "opens the archived $trigger scenario with an explicit description",
  async ({ demo: Demo, trigger, description }) => {
    await render(<Demo />);
    const button = page.getByRole("button", { name: trigger });
    await userEvent.hover(button);
    await expect.element(page.getByRole("tooltip")).toBeVisible();
    await expect.element(button).toHaveAccessibleDescription(description);
    await userEvent.unhover(button);
    await expect.poll(() => document.querySelector('[data-slot="tooltip-popup"]')).toBeNull();
  },
);

it("preserves the archived render-function popup contract", async () => {
  await render(<RenderFunction />);
  await userEvent.hover(page.getByRole("button", { name: "More information" }));
  await expect
    .poll(() => document.querySelector('[data-slot="tooltip-popup"]')?.getAttribute("data-custom"))
    .toBe("foo");
});

it("opens the archived tooltip on keyboard focus and dismisses it without moving focus", async () => {
  await render(<TooltipBasic />);
  await userEvent.keyboard("{Tab}");
  const trigger = page.getByRole("button", { name: "Hover me" });
  await expect.element(trigger).toHaveFocus();
  await expect.element(trigger).toHaveAccessibleDescription("This is a tooltip");
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.querySelector('[data-slot="tooltip-popup"]')).toBeNull();
  await expect.element(trigger).toHaveFocus();
});

it.each(["Top", "Left", "Right", "Bottom"])(
  "paints the archived %s arrow and collision-free placement",
  async (label) => {
    await render(
      <div style={{ margin: 160, width: 420 }}>
        <TooltipPlacement />
      </div>,
    );
    const trigger = page.getByRole("button", { name: label, exact: true });
    await userEvent.hover(trigger);
    await expect.element(trigger).toHaveAccessibleDescription(`${label} placement`);
    const popup = document.getElementById(trigger.element().getAttribute("aria-describedby")!)!;
    await expect.poll(() => popup.getAttribute("data-side")).toBe(label.toLowerCase());
    const arrow = popup.querySelector('[data-slot="tooltip-arrow"]')!;
    expect(arrow.querySelector("svg path")?.getAttribute("d")).toBe("M0 0C5.48483 8 6.5 8 12 0Z");
    await expect.poll(() => arrow.getBoundingClientRect().width).toBe(12);
    expect(getComputedStyle(arrow).rotate).toBe(
      label === "Bottom"
        ? "180deg"
        : label === "Left"
          ? "-90deg"
          : label === "Right"
            ? "90deg"
            : "0deg",
    );
  },
);

it("uses the archived custom arrow offset instead of the source seven-pixel default", async () => {
  await render(
    <div style={{ margin: 160 }}>
      <TooltipWithArrow />
    </div>,
  );
  await userEvent.hover(page.getByRole("button", { name: "Custom Offset" }));
  await expect.element(page.getByRole("tooltip")).toBeVisible();
  const trigger = document.querySelectorAll('[data-slot="tooltip-trigger"]')[1]!;
  const popup = document.getElementById(trigger.getAttribute("aria-describedby")!)!;
  await expect.poll(() => popup.getAttribute("data-side")).toBe("top");
  await expect
    .poll(() => trigger.getBoundingClientRect().top - popup.getBoundingClientRect().bottom)
    .toBe(12);
});
