import * as React from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import axe from "axe-core";

import { ResizeHandle, type ResizeHandleChangeDetails } from "./index.js";

function ControlledHandle({
  inverted = false,
  onCollapseToggle,
  onValueCommit,
  orientation = "vertical",
}: {
  inverted?: boolean;
  onCollapseToggle?: () => void;
  onValueCommit?: (value: number, details: ResizeHandleChangeDetails) => void;
  orientation?: "horizontal" | "vertical";
}) {
  const [value, setValue] = React.useState(320);
  return (
    <>
      <aside id="inspector">Inspector</aside>
      <ResizeHandle
        aria-controls="inspector"
        aria-label="Resize inspector"
        inverted={inverted}
        max={480}
        min={200}
        {...(onCollapseToggle ? { onCollapseToggle } : {})}
        onValueChange={setValue}
        {...(onValueCommit ? { onValueCommit } : {})}
        orientation={orientation}
        style={orientation === "vertical" ? { height: 100, width: 7 } : { height: 7, width: 100 }}
        value={value}
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

test("exposes a focusable window splitter and clamps keyboard changes", async () => {
  const onCommit = vi.fn();
  const onCollapseToggle = vi.fn();
  const screen = await render(
    <ControlledHandle onCollapseToggle={onCollapseToggle} onValueCommit={onCommit} />,
  );
  const handle = screen.getByRole("separator", { name: "Resize inspector" });

  await expect.element(handle).toHaveAttribute("aria-controls", "inspector");
  await expect.element(handle).toHaveAttribute("aria-orientation", "vertical");
  await expect.element(handle).toHaveAttribute("aria-valuemin", "200");
  await expect.element(handle).toHaveAttribute("aria-valuemax", "480");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "320");
  await expect.element(handle).toHaveAttribute("tabindex", "0");

  await handle.click();
  expect(onCollapseToggle).toHaveBeenCalledTimes(1);
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(screen.getByTestId("value")).toHaveTextContent("336");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "336");
  expect(onCommit).toHaveBeenLastCalledWith(
    336,
    expect.objectContaining({ delta: 16, reason: "keyboard", value: 336 }),
  );

  await userEvent.keyboard("{End}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "480");
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "480");
  await userEvent.keyboard("{Home}");
  await expect.element(handle).toHaveAttribute("aria-valuenow", "200");
  await userEvent.keyboard("{Enter}");
  expect(onCollapseToggle).toHaveBeenCalledTimes(2);

  expect(
    (await axe.run(document.body, { rules: { region: { enabled: false } } })).violations,
  ).toEqual([]);
});

test("maps physical keyboard direction for horizontal and inverted handles", async () => {
  const screen = await render(
    <>
      <ControlledHandle inverted />
      <ControlledHandle orientation="horizontal" />
    </>,
  );
  const handles = screen.getByRole("separator", { name: "Resize inspector" });
  const inverted = handles.first();
  const horizontal = handles.nth(1);

  await inverted.click();
  await userEvent.keyboard("{ArrowRight}");
  await expect.element(inverted).toHaveAttribute("aria-valuenow", "304");

  await horizontal.click();
  await expect.element(horizontal).toHaveAttribute("aria-orientation", "horizontal");
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(horizontal).toHaveAttribute("aria-valuenow", "336");
});

test("tracks pointer movement, commits once, and suppresses collapse after dragging", async () => {
  const onCommit = vi.fn();
  const onCollapseToggle = vi.fn();
  const screen = await render(
    <ControlledHandle onCollapseToggle={onCollapseToggle} onValueCommit={onCommit} />,
  );
  const element = screen.getByRole("separator", { name: "Resize inspector" }).element();

  element.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      button: 0,
      clientX: 100,
      pointerId: 7,
    }),
  );
  await expect.poll(() => element.hasAttribute("data-dragging")).toBe(true);
  expect(document.body.style.cursor).toBe("col-resize");
  expect(document.body.style.userSelect).toBe("none");

  element.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, clientX: 140, pointerId: 7 }),
  );
  element.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, clientX: 100, pointerId: 7 }),
  );
  await expect.poll(() => element.getAttribute("aria-valuenow")).toBe("320");
  element.dispatchEvent(
    new PointerEvent("pointermove", { bubbles: true, clientX: 140, pointerId: 7 }),
  );
  await expect.poll(() => element.getAttribute("aria-valuenow")).toBe("360");
  element.dispatchEvent(
    new PointerEvent("pointerup", { bubbles: true, clientX: 140, pointerId: 7 }),
  );
  await expect.poll(() => element.hasAttribute("data-dragging")).toBe(false);
  expect(document.body.style.cursor).toBe("");
  expect(document.body.style.userSelect).toBe("");
  expect(onCommit).toHaveBeenCalledTimes(1);
  expect(onCommit).toHaveBeenLastCalledWith(
    360,
    expect.objectContaining({ delta: 40, reason: "pointer", value: 360 }),
  );

  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(onCollapseToggle).not.toHaveBeenCalled();
  element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(onCollapseToggle).toHaveBeenCalledTimes(1);
});

test("disabled and custom-rendered handles receive semantic defaults", async () => {
  const onValueChange = vi.fn();
  const ref = React.createRef<HTMLElement>();
  const screen = await render(
    <ResizeHandle
      aria-controls="details"
      aria-labelledby="details-title"
      disabled
      max={400}
      min={200}
      onValueChange={onValueChange}
      ref={ref}
      render={<span />}
      style={{ height: 100, width: 7 }}
      value={280}
    />,
  );
  const handle = screen.getByRole("separator");

  expect(ref.current).toBe(handle.element());
  expect(handle.element().tagName).toBe("SPAN");
  await expect.element(handle).toHaveAttribute("aria-disabled", "true");
  expect(handle.element().getAttribute("tabindex")).toBeNull();
  handle.element().dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(onValueChange).not.toHaveBeenCalled();
});
