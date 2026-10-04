import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "vitest-browser-react";
import { cdp, page, userEvent } from "vitest/browser";
import type {} from "@vitest/browser-playwright";
import { Modal } from "./modal.js";
import { AlertDialog } from "../alert-dialog/alert-dialog.js";
import { Drawer } from "../drawer/drawer.js";
import { Toast } from "../toast/toast.js";
import { Tooltip } from "../tooltip/tooltip.js";
import { ThemeScope } from "../../utils/theme-scope.js";

afterEach(async () => {
  cleanup();
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
  await page.viewport(1280, 900);
});

async function painted(element: Element, property: string, value: string) {
  // Development StyleX installs cross-module constant CSS after the first paint.
  await new Promise((resolve) => setTimeout(resolve, 150));
  await expect.poll(() => getComputedStyle(element).getPropertyValue(property)).toBe(value);
}

describe("source overlay geometry and paint", () => {
  it("uses source modal width, top placement, outside scrolling and scoped overlay paint", async () => {
    await render(
      <ThemeScope
        theme="dark"
        style={{ "--overlay": "oklch(0.3 0.02 250)" } as React.CSSProperties}
      >
        <Modal.Root defaultOpen scroll="outside">
          <Modal.Portal>
            <Modal.Backdrop variant="blur" />
            <Modal.Viewport>
              <Modal.Popup size="xs" placement="top">
                <Modal.Title>Geometry</Modal.Title>
                <Modal.Body>
                  <div style={{ height: 1200 }}>Scrollable body</div>
                </Modal.Body>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal.Root>
      </ThemeScope>,
    );
    const popup = document.querySelector('[data-slot="modal-popup"]')!;
    const viewport = document.querySelector('[data-slot="modal-viewport"]')!;
    const body = document.querySelector('[data-slot="modal-body"]')!;
    await painted(popup, "max-width", "320px");
    await painted(popup, "background-color", "oklch(0.3 0.02 250)");
    expect(getComputedStyle(viewport).alignItems).toBe("flex-start");
    expect(getComputedStyle(viewport).overflowY).toBe("auto");
    expect(getComputedStyle(body).overflowY).toBe("visible");
    expect(popup.getBoundingClientRect().top).toBe(40);
    expect(
      getComputedStyle(document.querySelector('[data-slot="modal-backdrop"]')!).backdropFilter,
    ).toBe("blur(12px)");
  });

  it("paints alert icon soft tones and large modal geometry", async () => {
    await render(
      <AlertDialog.Root defaultOpen>
        <AlertDialog.Portal>
          <AlertDialog.Viewport>
            <AlertDialog.Popup size="lg" placement="center">
              <AlertDialog.Title>Confirm</AlertDialog.Title>
              <AlertDialog.Icon
                variant="danger"
                style={
                  {
                    "--danger-soft": "oklch(0.9 0.05 20)",
                    "--danger-soft-foreground": "oklch(0.4 0.1 20)",
                  } as React.CSSProperties
                }
              >
                !
              </AlertDialog.Icon>
            </AlertDialog.Popup>
          </AlertDialog.Viewport>
        </AlertDialog.Portal>
      </AlertDialog.Root>,
    );
    await expect
      .poll(() => document.querySelector('[data-slot="alert-dialog-popup"]'))
      .not.toBeNull();
    await painted(
      document.querySelector('[data-slot="alert-dialog-popup"]')!,
      "max-width",
      "512px",
    );
    const icon = document.querySelector('[data-slot="alert-dialog-icon"]')!;
    await painted(icon, "background-color", "oklch(0.9 0.05 20)");
    expect(getComputedStyle(icon).color).toBe("oklch(0.4 0.1 20)");
  });

  it("keeps right drawer flush, square and uses source handle geometry", async () => {
    await render(
      <Drawer.Root defaultOpen swipeDirection="right">
        <Drawer.Portal>
          <Drawer.Backdrop variant="transparent" />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Title>Edge</Drawer.Title>
              <Drawer.Handle />
              <Drawer.Body>Content</Drawer.Body>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>,
    );
    await expect.poll(() => document.querySelector('[data-slot="drawer-popup"]')).not.toBeNull();
    const popup = document.querySelector('[data-slot="drawer-popup"]')!;
    await painted(popup, "width", "384px");
    expect(popup.getBoundingClientRect().right).toBe(window.innerWidth);
    expect(getComputedStyle(popup).borderTopLeftRadius).toBe("0px");
    expect(
      getComputedStyle(document.querySelector('[data-slot="drawer-handle-bar"]')!).height,
    ).toBe("4px");
  });
});

function ToastQueue() {
  const { add, toasts } = Toast.useToastManager();
  React.useEffect(() => {
    add({ id: "short", title: "Short", timeout: 0 });
    add({ id: "front", title: "Front", description: "A taller front toast", timeout: 0 });
  }, [add]);
  return (
    <Toast.Viewport placement="top-start">
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} variant="success">
          <Toast.Indicator>✓</Toast.Indicator>
          <Toast.Content>
            <Toast.Title>{toast.title}</Toast.Title>
            <Toast.Description>{toast.description}</Toast.Description>
          </Toast.Content>
          <Toast.Close aria-label="Dismiss">×</Toast.Close>
        </Toast.Root>
      ))}
    </Toast.Viewport>
  );
}

it.each([false, true])(
  "unifies collapsed toast heights, hides rear content and paints only source tone parts (prehover=%s)",
  async (prehover) => {
    await render(
      <Toast.Provider>
        <ToastQueue />
      </Toast.Provider>,
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    const roots = [...document.querySelectorAll('[data-slot="toast"]')];
    expect(roots).toHaveLength(2);
    const front = roots.find((root) => root.hasAttribute("data-frontmost"))!;
    const rear = roots.find((root) => !root.hasAttribute("data-frontmost"))!;
    if (prehover) {
      await userEvent.hover(front);
      await expect.poll(() => rear.hasAttribute("data-expanded")).toBe(true);
      await expect
        .poll(() => getComputedStyle(rear).height)
        .toBe(getComputedStyle(rear).getPropertyValue("--toast-height").trim());
    }
    // A retained browser pointer can expand this top-start stack before the assertion.
    await cdp().send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: window.innerWidth - 1,
      y: window.innerHeight - 1,
    });
    await expect.poll(() => rear.hasAttribute("data-expanded")).toBe(false);
    await expect.poll(() => getComputedStyle(rear).height).toBe(getComputedStyle(front).height);
    expect(getComputedStyle(rear.querySelector('[data-slot="toast-content"]')!).opacity).toBe("0");
    expect(getComputedStyle(front.querySelector('[data-slot="toast-content"]')!).opacity).toBe("1");
    expect(
      getComputedStyle(document.querySelector('[data-slot="toast-viewport"]')!).insetInlineStart,
    ).toBe("16px");
    expect(getComputedStyle(front).transformOrigin.endsWith(" 0px")).toBe(true);
    await userEvent.hover(front);
    await expect.poll(() => rear.hasAttribute("data-expanded")).toBe(true);
    await painted(rear.querySelector('[data-slot="toast-content"]')!, "opacity", "1");
    expect(getComputedStyle(rear, "::after").content).toBe('""');
    const sourceColor = document.createElement("span");
    sourceColor.style.color = "var(--success-soft-foreground)";
    front.append(sourceColor);
    expect(getComputedStyle(front.querySelector('[data-slot="toast-title"]')!).color).toBe(
      getComputedStyle(sourceColor).color,
    );
    sourceColor.remove();
  },
);

it("removes motion and fills the viewport for full modals", async () => {
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await render(
    <Modal.Root defaultOpen>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup size="full">
            <Modal.Title>Full</Modal.Title>
            <Modal.Body>Body</Modal.Body>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>,
  );
  await expect.poll(() => document.querySelector('[data-slot="modal-popup"]')).not.toBeNull();
  const popup = document.querySelector('[data-slot="modal-popup"]')!;
  await painted(popup, "transition-duration", "0s");
  expect(getComputedStyle(popup).borderRadius).toBe("0px");
  expect(getComputedStyle(document.querySelector('[data-slot="modal-viewport"]')!).padding).toBe(
    "0px",
  );
  expect(popup.getBoundingClientRect().width).toBe(window.innerWidth);
  expect(popup.getBoundingClientRect().height).toBe(window.innerHeight);
});

it("keeps toast start placement logical in RTL", async () => {
  await render(
    <ThemeScope theme="light" dir="rtl">
      <Toast.Provider>
        <Toast.Portal>
          <ToastQueue />
        </Toast.Portal>
      </Toast.Provider>
    </ThemeScope>,
  );
  await expect.poll(() => document.querySelector('[data-slot="toast-viewport"]')).not.toBeNull();
  const viewport = document.querySelector('[data-slot="toast-viewport"]')!;
  await painted(viewport, "direction", "rtl");
  expect(Math.round(viewport.getBoundingClientRect().right)).toBe(window.innerWidth - 16);
});

function SnapDrawer() {
  const [snapPoint, setSnapPoint] = React.useState<number | null>(0.5);
  return (
    <Drawer.Root defaultOpen snapPoints={[0.5, 1]} snapPoint={snapPoint}>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup style={{ height: 600 }}>
            <Drawer.Title>Snap points</Drawer.Title>
            <Drawer.Body>
              <button onClick={() => setSnapPoint(1)}>Expand drawer</button>
            </Drawer.Body>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

it("uses the native drawer snap point offset in its painted transform", async () => {
  await render(<SnapDrawer />);
  await expect.poll(() => document.querySelector('[data-slot="drawer-popup"]')).not.toBeNull();
  const popup = document.querySelector('[data-slot="drawer-popup"]')!;
  await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(150);
  await userEvent.click(page.getByRole("button", { name: "Expand drawer" }));
  await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(0);
});

it("honors inherited tooltip open and close delays through native hover", async () => {
  await render(
    <ThemeScope
      style={
        { "--tooltip-delay": "200ms", "--tooltip-close-delay": "100ms" } as React.CSSProperties
      }
    >
      <Tooltip.Root>
        <Tooltip.Trigger>Delayed tooltip</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner>
            <Tooltip.Popup>Hint</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </ThemeScope>,
  );
  const trigger = page.getByRole("button", { name: "Delayed tooltip" });
  await userEvent.hover(trigger);
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(document.querySelector('[data-slot="tooltip-popup"]')).toBeNull();
  await expect.poll(() => document.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull();
  await userEvent.unhover(trigger);
  await new Promise((resolve) => setTimeout(resolve, 30));
  expect(document.querySelector('[data-slot="tooltip-popup"]')).not.toBeNull();
  await expect.poll(() => document.querySelector('[data-slot="tooltip-popup"]')).toBeNull();
});

it("traps modal focus, closes on Escape and returns focus to its native trigger", async () => {
  await render(
    <Modal.Root>
      <Modal.Trigger>Open focused modal</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <Modal.Title>Focus boundary</Modal.Title>
            <Modal.Description>Keyboard controlled dialog</Modal.Description>
            <Modal.Body>
              <button>First action</button>
              <button>Last action</button>
            </Modal.Body>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>,
  );
  const trigger = page.getByRole("button", { name: "Open focused modal" });
  await userEvent.click(trigger);
  const first = page.getByRole("button", { name: "First action" });
  await expect.element(first).toHaveFocus();
  await expect
    .element(page.getByRole("dialog", { name: "Focus boundary" }))
    .toHaveAccessibleDescription("Keyboard controlled dialog");
  await userEvent.keyboard("{Tab}");
  await expect.element(page.getByRole("button", { name: "Last action" })).toHaveFocus();
  await userEvent.keyboard("{Tab}");
  await expect.element(first).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.poll(() => document.querySelector('[data-slot="modal-popup"]')).toBeNull();
  await expect.element(trigger).toHaveFocus();
});

it("paints native drawer movement and backdrop fade during a touch swipe, then dismisses", async () => {
  await render(
    <Drawer.Root defaultOpen>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup style={{ height: 400 }}>
            <Drawer.Handle />
            <Drawer.Title>Swipe drawer</Drawer.Title>
            <Drawer.Body>Drag to dismiss</Drawer.Body>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>,
  );
  const popup = document.querySelector('[data-slot="drawer-popup"]')!;
  const backdrop = document.querySelector('[data-slot="drawer-backdrop"]')!;
  await expect.poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42).toBe(0);
  const handle = document.querySelector('[data-slot="drawer-handle"]')!.getBoundingClientRect();
  const frame = window.frameElement?.getBoundingClientRect();
  const scaleX = frame ? frame.width / window.innerWidth : 1;
  const scaleY = frame ? frame.height / window.innerHeight : 1;
  const x = (frame?.x ?? 0) + (handle.x + handle.width / 2) * scaleX;
  const y = (frame?.y ?? 0) + (handle.y + handle.height / 2) * scaleY;
  await cdp().send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp().send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y + 40 * scaleY, id: 1 }],
  });
  await cdp().send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x, y: y + 180 * scaleY, id: 1 }],
  });
  await expect
    .poll(() => new DOMMatrix(getComputedStyle(popup).transform).m42)
    .toBeGreaterThan(100);
  expect(Number.parseFloat(getComputedStyle(backdrop).opacity)).toBeLessThan(1);
  expect(getComputedStyle(popup).transitionDuration).toBe("0s");
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => document.querySelector('[data-slot="drawer-popup"]')).toBeNull();
});

it("dismisses the front toast and promotes the remaining toast with visible content", async () => {
  await render(
    <Toast.Provider>
      <ToastQueue />
    </Toast.Provider>,
  );
  await expect.poll(() => document.querySelectorAll('[data-slot="toast"]').length).toBe(2);
  const front = document.querySelector('[data-slot="toast"][data-frontmost]')!;
  await userEvent.hover(front);
  await userEvent.click(front.querySelector('[data-slot="toast-close"]')!);
  await expect.poll(() => document.querySelectorAll('[data-slot="toast"]').length).toBe(1);
  const remaining = document.querySelector('[data-slot="toast"]')!;
  expect(remaining.hasAttribute("data-frontmost")).toBe(true);
  await painted(remaining.querySelector('[data-slot="toast-content"]')!, "opacity", "1");
});
