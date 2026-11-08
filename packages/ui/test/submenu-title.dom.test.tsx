import { expect, test } from "bun:test";
import { act, createRef } from "react";
import { createRoot } from "react-dom/client";
import { useSubmenuPopupRef } from "../src/utils/interaction/submenu.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test.each([false, true])(
  "stacked submenu retains one real title through opening, rest and return (reduced motion: %s)",
  async (reduced) => {
    const frameCallbacks = new Map<number, FrameRequestCallback>();
    let id = 0,
      time = performance.now(),
      closed = 0;
    const raf = globalThis.requestAnimationFrame,
      cancel = globalThis.cancelAnimationFrame;
    const media = globalThis.matchMedia;
    globalThis.matchMedia = (query) => {
      const result = media(query);
      if (query.includes("prefers-reduced-motion"))
        Object.defineProperty(result, "matches", { value: reduced });
      return result;
    };
    globalThis.requestAnimationFrame = (callback) => {
      frameCallbacks.set(++id, callback);
      return id;
    };
    globalThis.cancelAnimationFrame = (key) => {
      frameCallbacks.delete(key);
    };
    const host = document.createElement("div");
    document.body.append(host);
    const parent = document.createElement("div");
    parent.dataset["slot"] = "menu-popup";
    parent.setAttribute("data-open", "");
    parent.innerHTML =
      '<div data-slot="menu-surface"></div><div data-slot="menu-content"><div role="menuitem">View Options</div></div>';
    host.append(parent);
    const item = parent.querySelector<HTMLElement>('[role="menuitem"]')!;
    item.style.fontWeight = "400";
    Object.defineProperties(item, {
      offsetWidth: { value: 218 },
      offsetHeight: { value: 40 },
    });
    const parentContent = parent.querySelector<HTMLElement>('[data-slot="menu-content"]')!;
    item.getBoundingClientRect = () =>
      new DOMRect(100, 250, 218 * (Number(parentContent.style.scale) || 1), 40);
    const trigger = createRef<HTMLElement>();
    trigger.current = item;
    const caller = createRef<HTMLDivElement>();
    const unmount = () => closed++;
    function Example({
      owner = trigger,
      popupRef = caller,
      onUnmount = unmount,
    }: {
      owner?: typeof trigger;
      popupRef?: typeof caller;
      onUnmount?: () => void;
    }) {
      const ref = useSubmenuPopupRef(popupRef, owner, onUnmount, true);
      return (
        <div ref={ref} data-slot="menu-popup" data-open="">
          <div data-slot="menu-surface" />
          <div data-slot="menu-content">
            <div data-slot="menu-plate" />
            <div data-slot="menu-submenu-heading" role="menuitem" style={{ fontWeight: 600 }}>
              View Options
            </div>
            <div data-slot="menu-submenu-body">Zoom In</div>
          </div>
        </div>
      );
    }
    const mount = document.createElement("div");
    host.append(mount);
    const root = createRoot(mount);
    const frames = () => {
      time += 1000 / 60;
      const callbacks = [...frameCallbacks.values()];
      frameCallbacks.clear();
      callbacks.forEach((callback) => callback(time));
    };
    try {
      await act(() => root.render(<Example />));
      const popup = caller.current!;
      const heading = popup.querySelector<HTMLElement>('[data-slot="menu-submenu-heading"]')!;
      const surface = popup.querySelector<HTMLElement>('[data-slot="menu-surface"]')!;
      for (const [node, width, height] of [
        [popup, 250, 180],
        [surface, 250, 180],
        [heading, 206, 40],
      ] as const) {
        Object.defineProperties(node, {
          offsetWidth: { value: width },
          offsetHeight: { value: height },
        });
        node.getBoundingClientRect = () => new DOMRect(100, 100, width, height);
      }
      await act(() => {
        for (let i = 0; i < 8; i++) frames();
      });
      expect(heading.style.opacity).toBe("1");
      if (!reduced) {
        expect(heading.style.transform).not.toBe("");
        expect(Number(heading.style.fontWeight)).toBeGreaterThan(400);
        expect(Number(heading.style.fontWeight)).toBeLessThan(600);
        // A narrower child row must not enlarge the source glyphs horizontally.
        const scale = heading.style.transform.match(/scale\(([^,]+),/)!;
        expect(Number(scale[1])).toBeLessThanOrEqual(1);
      }
      expect(popup.querySelector('[data-slot="menu-submenu-glyph"]')).toBeNull();
      await act(() => {
        for (let i = 0; i < 120; i++) {
          frames();
          expect(heading.style.opacity).toBe("1");
        }
      });
      expect(popup.querySelector('[data-slot="menu-submenu-heading"]')).toBe(heading);
      expect(heading.style.transform).toBe("");
      expect(heading.style.fontWeight).toBe("600");
      expect(item.style.opacity).toBe("0");
      if (!reduced) {
        await act(async () => {
          popup.removeAttribute("data-open");
          await Promise.resolve();
        });
        await act(() => {
          for (let i = 0; i < 5; i++) frames();
        });
        await act(async () => {
          popup.setAttribute("data-open", "");
          await Promise.resolve();
        });
        await act(() => {
          for (let i = 0; i < 120; i++) frames();
        });
        expect(closed).toBe(0);
        expect(popup.querySelector('[data-slot="menu-submenu-heading"]')).toBe(heading);
        expect(heading.style.opacity).toBe("1");
      }
      await act(async () => {
        popup.removeAttribute("data-open");
        await Promise.resolve();
      });
      await act(() => {
        let weight = Number(heading.style.fontWeight);
        for (let i = 0; i < 120; i++) {
          frames();
          const next = Number(heading.style.fontWeight);
          expect(next).toBeLessThanOrEqual(weight);
          expect(next).toBeGreaterThanOrEqual(400);
          weight = next;
        }
      });
      expect(heading.style.fontWeight).toBe("400");
      expect(closed).toBe(1);
      expect(item.style.opacity).toBe("");
      expect(parentContent.style.pointerEvents).toBe("");
      expect(parent.hasAttribute("data-menu-child-count")).toBe(false);

      if (!reduced) {
        // Reopening a sibling during return must not snapshot a dimmed parent.
        await act(async () => {
          popup.setAttribute("data-open", "");
          await Promise.resolve();
        });
        await act(() => {
          for (let i = 0; i < 120; i++) frames();
        });
        await act(async () => {
          popup.removeAttribute("data-open");
          await Promise.resolve();
        });
        await act(() => {
          for (let i = 0; i < 5; i++) frames();
        });
        const siblingItem = item.cloneNode(true) as HTMLElement;
        siblingItem.style.opacity = "";
        Object.defineProperties(siblingItem, {
          offsetWidth: { value: 218 },
          offsetHeight: { value: 40 },
        });
        parentContent.append(siblingItem);
        siblingItem.getBoundingClientRect = item.getBoundingClientRect;
        const siblingTrigger = createRef<HTMLElement>();
        siblingTrigger.current = siblingItem;
        const siblingPopup = createRef<HTMLDivElement>();
        let siblingClosed = 0;
        const closeSibling = () => siblingClosed++;
        await act(() =>
          root.render(
            <>
              <Example />
              <Example owner={siblingTrigger} popupRef={siblingPopup} onUnmount={closeSibling} />
            </>,
          ),
        );
        await act(() => {
          for (let i = 0; i < 120; i++) frames();
        });
        expect(parentContent.style.pointerEvents).toBe("none");
        expect(Number(parentContent.style.opacity)).toBeCloseTo(0.45);
        expect(closed).toBe(2);
        await act(async () => {
          siblingPopup.current!.removeAttribute("data-open");
          await Promise.resolve();
        });
        await act(() => {
          for (let i = 0; i < 120; i++) frames();
        });
        expect(siblingClosed).toBe(1);
        expect(parentContent.style.pointerEvents).toBe("");
        expect(parentContent.style.opacity).toBe("");
        expect(parentContent.style.scale).toBe("");
        expect(parent.hasAttribute("data-menu-child-count")).toBe(false);
      }
    } finally {
      await act(() => root.unmount());
      host.remove();
      globalThis.requestAnimationFrame = raf;
      globalThis.cancelAnimationFrame = cancel;
      globalThis.matchMedia = media;
    }
  },
);
