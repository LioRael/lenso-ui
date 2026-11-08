import { expect, spyOn, test } from "bun:test";
import { act, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useTabsListRef } from "../src/utils/interaction/tabs.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

test.each([
  ["ltr", 0],
  ["rtl", 0],
  ["ltr", 2],
  ["rtl", 2],
] as const)(
  "tabs retain hit geometry and resting lens inset (%s, %ipx)",
  async (direction, inset) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = createRoot(host);
    const itemWidth = 96.125;
    const activations: number[] = [];
    function Example() {
      const prepare = useCallback((bar: HTMLDivElement | null) => {
        if (!bar) return;
        const geometry = (node: HTMLElement, left: number, width: number, height: number) => {
          Object.defineProperties(node, {
            offsetWidth: { value: Math.round(width), configurable: true },
            offsetHeight: { value: height, configurable: true },
            offsetLeft: { value: Math.round(left), configurable: true },
            offsetTop: { value: 2, configurable: true },
          });
          node.getBoundingClientRect = () => new DOMRect(10 + left, 20, width, height);
        };
        geometry(bar, 0, 304, 48);
        const tabs = bar.querySelectorAll<HTMLElement>('[data-slot="tabs-tab"]');
        tabs.forEach((tab, index) => {
          const position = direction === "rtl" ? 2 - index : index;
          geometry(tab, 2 + position * (itemWidth + 4), itemWidth, 44);
        });
        geometry(bar.querySelector('[data-lg-tabs-lens="native"]')!, 2, itemWidth, 44);
      }, []);
      const ref = useTabsListRef(prepare, true);
      return (
        <div
          ref={ref}
          role="tablist"
          data-slot="tabs-list"
          style={{
            direction,
            gap: 4,
            padding: 2,
            ...{ "--lg-tabs-indicator-inset": `${inset}px` },
          }}
        >
          <span data-slot="tabs-glass" />
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              role="tab"
              id={`tab-${index}`}
              data-slot="tabs-tab"
              aria-selected={index === 2}
              onClick={() => {
                activations.push(index);
                if (index === 2) host.scrollTop = 999;
              }}
            >
              Tab {index}
            </button>
          ))}
          <span data-lg-tabs-lens="native" />
          <span data-slot="tabs-tint" />
          <span data-slot="tabs-row" />
          <span data-slot="tabs-centre-row" />
          <span data-slot="tabs-highlight-ring" />
          <span data-slot="tabs-highlight-centre" />
          <span data-slot="tabs-highlight-optics" />
        </div>
      );
    }
    try {
      await act(() => root.render(<Example />));
      const bar = host.querySelector<HTMLElement>('[data-slot="tabs-list"]')!;
      const tint = host.querySelector<HTMLElement>('[data-slot="tabs-tint"]')!;
      expect(bar.hasAttribute("data-ready")).toBe(true);
      expect(tint.style.width).toBe(`${itemWidth}px`);
      expect(tint.style.left).toBe(direction === "rtl" ? "202.25px" : "2px");
      expect(tint.style.getPropertyValue("--lg-tabs-transform")).toBe(
        `translate(${direction === "rtl" ? -200.25 : 200.25}px, 0px) scale(${1 - (2 * inset) / itemWidth}, ${1 - (2 * inset) / 44})`,
      );
      expect(bar.style.getPropertyValue("--lg-tabs-mask-diameter")).toBe(`${44 - 2 * inset}px`);
      expect(bar.querySelector('[aria-selected="true"]')!.getBoundingClientRect().height).toBe(44);
      // A drag back to the selected tab must not invoke consumer reselect actions.
      host.scrollTop = 137;
      let captured = false;
      bar.setPointerCapture = () => {
        captured = true;
      };
      bar.hasPointerCapture = () => captured;
      bar.releasePointerCapture = () => {
        captured = false;
      };
      const selected = bar.querySelector<HTMLElement>('[aria-selected="true"]')!;
      const box = selected.getBoundingClientRect();
      const start = box.x + box.width / 2;
      const sign = direction === "rtl" ? -1 : 1;
      const pointer = (type: string, x: number) =>
        new PointerEvent(type, {
          bubbles: true,
          cancelable: true,
          isPrimary: true,
          button: 0,
          buttons: 1,
          pointerType: "mouse",
          pointerId: 7,
          clientX: x,
          clientY: 42,
        });
      const drag = async (positions: number[], end = "pointerup") => {
        await act(() => {
          selected.dispatchEvent(pointer("pointerdown", start));
          for (const position of positions)
            window.dispatchEvent(pointer("pointermove", start + position * sign));
          window.dispatchEvent(pointer(end, start + positions.at(-1)! * sign));
        });
      };
      await drag([-10]);
      expect(activations).toEqual([]);
      expect(host.scrollTop).toBe(137);
      await drag([-110, 0]);
      expect(activations).toEqual([]);
      expect(host.scrollTop).toBe(137);
      await drag([-110], "pointercancel");
      expect(activations).toEqual([]);
      await act(() => {
        selected.dispatchEvent(pointer("pointerdown", start));
        const clock = spyOn(performance, "now").mockReturnValue(performance.now() + 1000);
        try {
          window.dispatchEvent(pointer("pointerup", start));
        } finally {
          clock.mockRestore();
        }
      });
      expect(activations).toEqual([]);
      expect(host.scrollTop).toBe(137);
      await drag([-110]);
      expect(activations).toEqual([1]);
      // Deliberate reselect taps retain their existing click contract.
      await drag([0]);
      expect(activations).toEqual([1, 2]);
      expect(host.scrollTop).toBe(999);
    } finally {
      await act(() => root.unmount());
      host.remove();
    }
  },
);
