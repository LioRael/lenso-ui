import * as React from "react";
import { expect, mock, test } from "bun:test";

import { click, dispatch, render } from "../../tests/dom.js";

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
  const onCommit = mock(() => {});
  const onCollapseToggle = mock(() => {});
  const container = await render(
    <ControlledHandle onCollapseToggle={onCollapseToggle} onValueCommit={onCommit} />,
  );
  const handle = container.querySelector<HTMLElement>('[role="separator"]')!;
  expect(handle.getAttribute("aria-controls")).toBe("inspector");
  expect(handle.getAttribute("aria-orientation")).toBe("vertical");
  expect(handle.getAttribute("aria-valuemin")).toBe("200");
  expect(handle.getAttribute("aria-valuemax")).toBe("480");
  expect(handle.getAttribute("aria-valuenow")).toBe("320");
  expect(handle.getAttribute("tabindex")).toBe("0");

  await click(handle);
  expect(onCollapseToggle).toHaveBeenCalledTimes(1);
  await dispatch(handle, new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(container.querySelector("output")?.textContent).toBe("336");
  expect(handle.getAttribute("aria-valuenow")).toBe("336");
  expect(onCommit).toHaveBeenLastCalledWith(
    336,
    expect.objectContaining({ delta: 16, reason: "keyboard", value: 336 }),
  );
  await dispatch(handle, new KeyboardEvent("keydown", { key: "End", bubbles: true }));
  expect(handle.getAttribute("aria-valuenow")).toBe("480");
  await dispatch(handle, new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(handle.getAttribute("aria-valuenow")).toBe("480");
  await dispatch(handle, new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
  expect(handle.getAttribute("aria-valuenow")).toBe("200");
  await dispatch(handle, new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  expect(onCollapseToggle).toHaveBeenCalledTimes(2);
});

test("maps physical keyboard direction for horizontal and inverted handles", async () => {
  const container = await render(
    <>
      <ControlledHandle inverted />
      <ControlledHandle orientation="horizontal" />
    </>,
  );
  const [inverted, horizontal] = container.querySelectorAll<HTMLElement>('[role="separator"]');
  await click(inverted!);
  await dispatch(inverted!, new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  expect(inverted!.getAttribute("aria-valuenow")).toBe("304");
  await click(horizontal!);
  expect(horizontal!.getAttribute("aria-orientation")).toBe("horizontal");
  await dispatch(horizontal!, new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  expect(horizontal!.getAttribute("aria-valuenow")).toBe("336");
});

test("tracks pointer movement, commits once, and suppresses collapse after dragging", async () => {
  const onCommit = mock(() => {});
  const onCollapseToggle = mock(() => {});
  const container = await render(
    <ControlledHandle onCollapseToggle={onCollapseToggle} onValueCommit={onCommit} />,
  );
  const handle = container.querySelector<HTMLElement>('[role="separator"]')!;
  let captured = false;
  handle.setPointerCapture = () => {
    captured = true;
  };
  handle.hasPointerCapture = () => captured;
  handle.releasePointerCapture = () => {
    captured = false;
  };
  const pointer = (type: string, x: number) =>
    new PointerEvent(type, { bubbles: true, button: 0, clientX: x, pointerId: 7 });
  await dispatch(handle, pointer("pointerdown", 100));
  expect(handle.hasAttribute("data-dragging")).toBe(true);
  expect(document.body.style.cursor).toBe("col-resize");
  expect(document.body.style.userSelect).toBe("none");
  await dispatch(handle, pointer("pointermove", 140));
  await dispatch(handle, pointer("pointermove", 100));
  expect(handle.getAttribute("aria-valuenow")).toBe("320");
  await dispatch(handle, pointer("pointermove", 140));
  expect(handle.getAttribute("aria-valuenow")).toBe("360");
  await dispatch(handle, pointer("pointerup", 140));
  expect(handle.hasAttribute("data-dragging")).toBe(false);
  expect(document.body.style.cursor).toBe("");
  expect(document.body.style.userSelect).toBe("");
  expect(onCommit).toHaveBeenCalledTimes(1);
  expect(onCommit).toHaveBeenLastCalledWith(
    360,
    expect.objectContaining({ delta: 40, reason: "pointer", value: 360 }),
  );
  await click(handle);
  expect(onCollapseToggle).not.toHaveBeenCalled();
  await click(handle);
  expect(onCollapseToggle).toHaveBeenCalledTimes(1);
});

test("disabled and custom-rendered handles receive semantic defaults", async () => {
  const onValueChange = mock(() => {});
  const ref = React.createRef<HTMLElement>();
  const container = await render(
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
  const handle = container.querySelector<HTMLElement>('[role="separator"]')!;
  expect(ref.current).toBe(handle);
  expect(handle.tagName).toBe("SPAN");
  expect(handle.getAttribute("aria-disabled")).toBe("true");
  expect(handle.getAttribute("tabindex")).toBeNull();
  await click(handle);
  expect(onValueChange).not.toHaveBeenCalled();
});
