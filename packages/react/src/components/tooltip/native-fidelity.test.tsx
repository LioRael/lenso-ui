import * as React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { cdp, page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import { Tooltip } from "./tooltip.js";
import { Toast } from "../toast/toast.js";
import { Drawer } from "../drawer/drawer.js";
import { Popover } from "../popover/popover.js";

let touchActive = false;
beforeEach(async () => {
  await page.viewport(1280, 900);
});
afterEach(async () => {
  if (touchActive) {
    await cdp().send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    touchActive = false;
  }
  cleanup();
});
const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function touch(type: "touchStart" | "touchMove", x: number, y: number) {
  // Vitest scales its iframe to fit the runner; CDP takes outer-page coordinates.
  const frame = window.frameElement?.getBoundingClientRect();
  const scaleX = frame ? frame.width / window.innerWidth : 1;
  const scaleY = frame ? frame.height / window.innerHeight : 1;
  await cdp().send("Input.dispatchTouchEvent", {
    type,
    touchPoints: [{ x: (frame?.x ?? 0) + x * scaleX, y: (frame?.y ?? 0) + y * scaleY, id: 1 }],
  });
}

// Existing overlay proofs only sample inherited delays once at mount.
it("re-reads changed inherited tooltip timings without remounting the trigger", async () => {
  function DynamicDelay() {
    const [fast, setFast] = React.useState(false);
    return (
      <div
        style={
          {
            "--tooltip-delay": fast ? "0ms" : "2s",
            "--tooltip-close-delay": fast ? "0ms" : "2s",
          } as React.CSSProperties
        }
      >
        <button onClick={() => setFast(true)}>Change inherited timing</button>
        <Tooltip>
          <Tooltip.Trigger aria-describedby="dynamic-hint">Dynamic hint</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup id="dynamic-hint">Updated timing</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
      </div>
    );
  }
  await render(<DynamicDelay />);
  const trigger = page.getByRole("button", { name: "Dynamic hint" });
  await userEvent.hover(trigger);
  await pause(100);
  expect(document.querySelector('[data-slot="tooltip-popup"]')).toBeNull();
  await userEvent.unhover(trigger);
  await userEvent.click(page.getByRole("button", { name: "Change inherited timing" }));
  await userEvent.hover(trigger);
  await expect
    .poll(() => document.querySelector('[data-slot="tooltip-popup"]'), { timeout: 1000 })
    .not.toBeNull();
  await expect.element(trigger).toHaveAccessibleDescription("Updated timing");
  await userEvent.unhover(trigger);
  await expect
    .poll(() => document.querySelector('[data-slot="tooltip-popup"]'), { timeout: 1000 })
    .toBeNull();
});

it("keeps explicit native provider timing above inherited CSS and local timing above the provider", async () => {
  await render(
    <div style={{ "--tooltip-delay": "2s" } as React.CSSProperties}>
      <Tooltip.Provider delay={0}>
        <Tooltip>
          <Tooltip.Trigger>Provider instant</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Provider hint</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
      </Tooltip.Provider>
      <Tooltip.Provider delay={2000}>
        <Tooltip>
          <Tooltip.Trigger delay={0}>Local instant</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner>
              <Tooltip.Popup>Local hint</Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip>
      </Tooltip.Provider>
    </div>,
  );
  await userEvent.hover(page.getByRole("button", { name: "Provider instant" }));
  await expect.element(page.getByRole("tooltip")).toHaveTextContent("Provider hint");
  await userEvent.unhover(page.getByRole("button", { name: "Provider instant" }));
  await userEvent.hover(page.getByRole("button", { name: "Local instant" }));
  await expect
    .poll(() => document.querySelector('[data-slot="tooltip-popup"]')?.textContent)
    .toBe("Local hint");
});

function PromiseQueue({ fail = false }: { fail?: boolean }) {
  const manager = Toast.useToastManager();
  const settle = React.useRef<() => void>(() => {});
  return (
    <>
      <button
        onClick={() => {
          const promise = new Promise<string>((resolve, reject) => {
            settle.current = () => (fail ? reject(new Error("Failed")) : resolve("Saved"));
          });
          void manager
            .promise(promise, {
              loading: { title: "Saving" },
              success: (value) => ({ title: value }),
              error: { title: "Failed" },
            })
            .catch(() => {});
        }}
      >
        Start promise
      </button>
      <button onClick={() => settle.current()}>Settle promise</button>
      <Toast.Portal>
        <Toast.Viewport>
          {manager.toasts.map((toast) => (
            <Toast key={toast.id} toast={toast}>
              <Toast.Indicator />
              <Toast.Content>
                <Toast.Title>{toast.title}</Toast.Title>
              </Toast.Content>
              <Toast.Close aria-label="Dismiss toast" />
            </Toast>
          ))}
        </Toast.Viewport>
      </Toast.Portal>
    </>
  );
}

// Collapsed stack tests never settled a native promise or rendered a default indicator.
it.each([false, true])(
  "settles native promise loading to the source default indicator (error=%s)",
  async (fail) => {
    await render(
      <Toast.Provider>
        <PromiseQueue fail={fail} />
      </Toast.Provider>,
    );
    await userEvent.click(page.getByRole("button", { name: "Start promise" }));
    await expect
      .poll(() => document.querySelector('[data-slot="toast-indicator"] [data-slot="spinner"]'))
      .not.toBeNull();
    const originalToast = document.querySelector('[data-slot="toast"]')!;
    expect(
      document.querySelector('[data-slot="toast-indicator"]')?.hasAttribute("data-swapped"),
    ).toBe(false);
    await userEvent.click(page.getByRole("button", { name: "Settle promise" }));
    await expect
      .poll(() => document.querySelector('[data-slot="toast-title"]')?.textContent)
      .toBe(fail ? "Failed" : "Saved");
    expect(document.querySelector('[data-slot="toast"]')).toBe(originalToast);
    expect(originalToast.getAttribute("data-variant")).toBe(fail ? "danger" : "success");
    const indicator = originalToast.querySelector('[data-slot="toast-indicator"]')!;
    await expect.poll(() => indicator.getAttribute("data-swapped")).toBe("true");
    expect(indicator.querySelector('[data-slot="spinner"]')).toBeNull();
    expect(indicator.querySelector('[data-slot="toast-default-icon"]')).not.toBeNull();
    expect(getComputedStyle(indicator).animationName).not.toBe("none");
    await userEvent.hover(originalToast);
    await userEvent.click(originalToast.querySelector('[data-slot="toast-close"]')!);
    await expect.poll(() => document.querySelector('[data-slot="toast"]')).toBeNull();
  },
);

// Base UI supports vertical snap points; horizontal directions intentionally ignore them.
it.each(["up", "down", "left", "right"] as const)(
  "uses native directional snap semantics for %s",
  async (direction) => {
    await render(
      <Drawer defaultOpen swipeDirection={direction} snapPoints={[0.5, 1]} defaultSnapPoint={0.5}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup style={{ height: 600 }}>
              <Drawer.Title>Directional snaps</Drawer.Title>
              <Drawer.Body>Native offset</Drawer.Body>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>,
    );
    const popup = document.querySelector('[data-slot="drawer-popup"]')!;
    const offset = direction === "up" ? -150 : direction === "down" ? 150 : 0;
    await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(offset);
    expect(new DOMMatrix(getComputedStyle(popup).transform).m41).toBe(0);
  },
);

it.each(["up", "down", "left", "right"] as const)(
  "returns an interrupted native %s drawer swipe to its snapped position",
  async (direction) => {
    await render(
      <Drawer defaultOpen swipeDirection={direction}>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup style={{ height: 400 }}>
              <Drawer.Handle />
              <Drawer.Title>Cancel swipe</Drawer.Title>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>,
    );
    const popup = document.querySelector('[data-slot="drawer-popup"]')!;
    const backdrop = document.querySelector('[data-slot="drawer-backdrop"]')!;
    await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(0);
    await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m41).toBe(0);
    const bounds = popup.getBoundingClientRect();
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + bounds.height / 2;
    const dx = direction === "left" ? -60 : direction === "right" ? 60 : 0;
    const dy = direction === "up" ? -60 : direction === "down" ? 60 : 0;
    await touch("touchStart", x, y);
    touchActive = true;
    await touch("touchMove", x + dx / 3, y + dy / 3);
    await touch("touchMove", x + dx, y + dy);
    await expect
      .poll(() => {
        const matrix = new DOMMatrix(getComputedStyle(popup).transform);
        return Math.abs(dx ? matrix.m41 : matrix.m42);
      })
      .toBeGreaterThan(0);
    await cdp().send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    touchActive = false;
    await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(0);
    await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m41).toBe(0);
    await expect.poll(() => Number.parseFloat(getComputedStyle(backdrop).opacity)).toBe(1);
    expect(document.querySelector('[data-slot="drawer-popup"]')).toBe(popup);
  },
);

it.each(["top", "bottom", "left", "right"] as const)(
  "paints the source popover arrow outside the %s popup edge without clipping",
  async (side) => {
    await render(
      <div style={{ margin: 200 }}>
        <Popover defaultOpen>
          <Popover.Trigger>Arrow anchor</Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner side={side} sideOffset={7}>
              <Popover.Popup>
                <Popover.Arrow />
                <Popover.Title>Arrow paint</Popover.Title>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover>
      </div>,
    );
    const popup = document.querySelector('[data-slot="popover-popup"]')!;
    await expect.poll(() => getComputedStyle(popup).transform).toBe("matrix(1, 0, 0, 1, 0, 0)");
    const path = popup.querySelector("svg path")!;
    expect(getComputedStyle(popup).overflow).toBe("visible");
    const paintedBounds = path.getBoundingClientRect();
    const point = document.elementFromPoint(
      paintedBounds.x + paintedBounds.width / 2,
      paintedBounds.y + paintedBounds.height / 3,
    );
    expect(popup.contains(point)).toBe(true);
    expect(getComputedStyle(path).fill).not.toBe("none");
  },
);

it.each([false, true])(
  "does not forward hardware-canceled proposals to controlled drawer setters (snaps=%s)",
  async (snapped) => {
    const changed = vi.fn();
    const snapChanged = vi.fn();
    function ControlledDrawer() {
      const [open, setOpen] = React.useState(true);
      const [point, setPoint] = React.useState<number | string | null>(0.5);
      return (
        <>
          <output data-testid="controlled-drawer-state">
            {String(open)} {String(point)}
          </output>
          <Drawer
            open={open}
            onOpenChange={(next) => {
              changed(next);
              setOpen(next);
            }}
            {...(snapped
              ? {
                  snapPoints: [0.5, 1],
                  snapPoint: point,
                  onSnapPointChange: (next: number | string | null) => {
                    snapChanged(next);
                    setPoint(next);
                  },
                }
              : {})}
          >
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup style={{ height: 600 }}>
                  <Drawer.Title>Controlled cancellation</Drawer.Title>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer>
        </>
      );
    }
    await render(<ControlledDrawer />);
    const popup = document.querySelector('[data-slot="drawer-popup"]')!;
    const initialOffset = snapped ? 150 : 0;
    await expect
      .poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42)
      .toBe(initialOffset);
    const bounds = popup.getBoundingClientRect();
    const x = bounds.x + bounds.width / 2;
    const y = bounds.y + Math.min(100, bounds.height / 2);
    await touch("touchStart", x, y);
    touchActive = true;
    await touch("touchMove", x, y + 20);
    await touch("touchMove", x, y + 100);
    await cdp().send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    touchActive = false;
    await expect
      .poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42)
      .toBe(initialOffset);
    expect(document.querySelector('[data-testid="controlled-drawer-state"]')?.textContent).toBe(
      "true 0.5",
    );
    expect(changed).not.toHaveBeenCalled();
    expect(snapChanged).not.toHaveBeenCalled();
    // Actual native requests are still observable by controlled consumers.
    await userEvent.keyboard("{Escape}");
    await expect
      .poll(() => document.querySelector('[data-testid="controlled-drawer-state"]')?.textContent)
      .toBe("false 0.5");
    expect(changed).toHaveBeenCalledWith(false);
  },
);
