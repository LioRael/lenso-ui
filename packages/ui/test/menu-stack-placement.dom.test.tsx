import { expect, test } from "bun:test";
import { act, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { useMenuStackOffset } from "../src/utils/interaction/menu-placement.js";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

// Short children end 8px above the parent bottom; tall children overlap 62%.
test("stacked placement follows both panels' size without pulling short children upwards", async () => {
  const original = globalThis.ResizeObserver;
  const callbacks = new Set<() => void>();
  globalThis.ResizeObserver = class {
    constructor(callback: () => void) {
      callbacks.add(callback);
      this.callback = callback;
    }
    callback: () => void;
    observe() {}
    unobserve() {}
    disconnect() {
      callbacks.delete(this.callback);
    }
  } as unknown as typeof ResizeObserver;
  const host = document.createElement("div");
  const parent = document.createElement("div");
  document.body.append(host, parent);
  let parentHeight = 367,
    childHeight = 167;
  Object.defineProperty(parent, "offsetHeight", { get: () => parentHeight });
  function Example({ enabled = true }: { enabled?: boolean }) {
    const [popup, setPopup] = useState<HTMLDivElement | null>(null);
    const attach = useCallback((node: HTMLDivElement | null) => {
      if (node)
        Object.defineProperty(node, "offsetHeight", { configurable: true, get: () => childHeight });
      setPopup(node);
    }, []);
    const offset = useMenuStackOffset(popup, parent, enabled);
    return <div ref={attach} data-offset={offset} />;
  }
  const root = createRoot(host);
  try {
    await act(() => root.render(<Example />));
    expect(host.firstElementChild!.getAttribute("data-offset")).toBe("-175");
    childHeight = 400;
    await act(() => callbacks.forEach((callback) => callback()));
    expect(Number(host.firstElementChild!.getAttribute("data-offset"))).toBeCloseTo(-367 * 0.62);
    parentHeight = 200;
    await act(() => callbacks.forEach((callback) => callback()));
    expect(host.firstElementChild!.getAttribute("data-offset")).toBe("-124");
    await act(() => root.render(<Example enabled={false} />));
    expect(callbacks.size).toBe(0);
  } finally {
    await act(() => root.unmount());
    host.remove();
    parent.remove();
    globalThis.ResizeObserver = original;
  }
});
