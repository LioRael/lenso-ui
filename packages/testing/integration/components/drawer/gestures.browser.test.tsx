import { expect, test, vi } from "vitest";
import { cdp } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Drawer } from "@lenso/ui";

const swipe = async (element: HTMLElement, direction: "x" | "y") => {
  const rect = element.getBoundingClientRect();
  const frameRect = window.frameElement?.getBoundingClientRect();
  const startX = (frameRect?.left ?? 0) + rect.left + 10;
  const startY = (frameRect?.top ?? 0) + rect.top + 10;
  const endX = startX + (direction === "x" ? 220 : 0);
  const endY = startY + (direction === "y" ? 220 : 0);

  await cdp().send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: startX, y: startY, id: 1 }],
  });
  for (let step = 1; step <= 12; step++) {
    await cdp().send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: startX + ((endX - startX) * step) / 12,
          y: startY + ((endY - startY) * step) / 12,
          id: 1,
        },
      ],
    });
    await new Promise(requestAnimationFrame);
  }
  await cdp().send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
};

test.each([
  { direction: "down", axis: "y", ignored: true },
  { direction: "right", axis: "x", ignored: true },
  { direction: "down", axis: "x", ignored: false },
  { direction: "right", axis: "y", ignored: false },
  { direction: "down", axis: undefined, ignored: false },
  { direction: "right", axis: undefined, ignored: false },
] as const)(
  "$direction drawer $axis gesture ignore marker $ignored dismisses only on eligible touch swipes",
  async ({ direction, axis, ignored }) => {
    const onOpenChange = vi.fn();
    const screen = await render(
      <Drawer.Root swipeDirection={direction} onOpenChange={onOpenChange}>
        <Drawer.Trigger>Open drawer</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Title>Gesture drawer</Drawer.Title>
              </Drawer.Content>
              <div
                data-testid="swipe-target"
                {...(axis ? { "data-base-ui-swipe-ignore": axis } : {})}
                style={{ width: 280, height: 280, touchAction: "none" }}
              />
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>,
    );

    await screen.getByRole("button", { name: "Open drawer" }).click();
    await expect
      .poll(() => getComputedStyle(screen.getByRole("dialog").element()).transform)
      .toBe("matrix(1, 0, 0, 1, 0, 0)");
    onOpenChange.mockClear();
    const target = screen.getByTestId("swipe-target").element() as HTMLElement;
    await swipe(target, direction === "down" ? "y" : "x");

    if (ignored) {
      await expect.element(screen.getByRole("dialog")).toBeInTheDocument();
      expect(onOpenChange).not.toHaveBeenCalled();
    } else {
      await expect.element(screen.getByRole("dialog")).not.toBeInTheDocument();
      expect(onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason: "swipe" }),
      );
    }
  },
);
