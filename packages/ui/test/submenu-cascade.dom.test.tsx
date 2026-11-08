import { expect, test } from "bun:test";
import { presentCascadingSubmenu } from "../src/utils/interaction/submenu-cascade.js";

// The old cascade only scaled/faded: no moving ink contour, no optical tail,
// and reduced-motion changes could leave an active return holding its parent.
test.each(["left", "right"])(
  "cascade %s clips moving ink and releases its parent after an interrupted return",
  async (side) => {
    const raf = globalThis.requestAnimationFrame,
      cancel = globalThis.cancelAnimationFrame,
      media = globalThis.matchMedia,
      clock = performance.now;
    const frames = new Map<number, FrameRequestCallback>();
    let id = 0,
      time = performance.now(),
      closed = 0;
    performance.now = () => time;
    const reduced = new EventTarget() as MediaQueryList;
    Object.defineProperty(reduced, "matches", { configurable: true, value: false });
    globalThis.matchMedia = (query) =>
      query.includes("prefers-reduced-motion") ? reduced : media(query);
    globalThis.requestAnimationFrame = (callback) => {
      frames.set(++id, callback);
      return id;
    };
    globalThis.cancelAnimationFrame = (key) => {
      frames.delete(key);
    };
    const host = document.createElement("div");
    document.body.append(host);
    host.innerHTML =
      '<div data-open><button>View Options</button></div><div data-open style="border-radius:34px"><div data-slot="menu-surface"></div><div data-slot="menu-content"><div data-slot="menu-plate"></div><button role="menuitem">Zoom In</button></div></div>';
    const parent = host.children[0] as HTMLElement,
      popup = host.children[1] as HTMLElement;
    popup.dataset["side"] = side;
    const source = parent.firstElementChild as HTMLElement;
    source.getBoundingClientRect = () => new DOMRect(side === "left" ? 350 : 10, 120, 240, 44);
    popup.getBoundingClientRect = () => new DOMRect(100, 110, 240, 200);
    const surface = popup.firstElementChild as HTMLElement,
      content = popup.lastElementChild as HTMLElement;
    for (const element of [popup, surface, content])
      Object.defineProperties(element, {
        offsetWidth: { value: 240 },
        offsetHeight: { value: 200 },
      });
    const step = (count = 1) => {
      for (let i = 0; i < count; i++) {
        time += 1000 / 60;
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((callback) => callback(time));
      }
    };
    const sync = async () => {
      await Promise.resolve();
      await Promise.resolve();
    };
    let dispose: (() => void) | undefined;
    try {
      dispose = presentCascadingSubmenu(popup, source, parent, () => closed++);
      step(4);
      expect(content.style.clipPath).toContain("inset(");
      expect(content.style.filter).toContain("blur(");
      expect(surface.style.transform).not.toContain("NaN");
      const geometry = [...surface.style.transform.matchAll(/-?\d+(?:\.\d+)?/g)].map((value) =>
        Number(value[0]),
      );
      expect(geometry[2]! * 240).toBeGreaterThanOrEqual(240 * 0.6);
      if (side === "left") expect(geometry[0]! + geometry[2]! * 240).toBeCloseTo(240, 5);
      else expect(geometry[0]).toBe(0);
      expect(parent.getAttribute("data-menu-child-count")).toBe("1");
      const before = surface.style.transform;
      popup.removeAttribute("data-open");
      await sync();
      expect(surface.style.transform).toBe(before);
      step(2);
      popup.setAttribute("data-open", "");
      await sync();
      step(25);
      expect(closed).toBe(0);
      expect(surface.style.transform).toBe("");
      expect(content.style.clipPath).toBe("");
      expect(content.style.filter).not.toContain("blur(");
      popup.removeAttribute("data-open");
      await sync();
      step(2);
      Object.defineProperty(reduced, "matches", { configurable: true, value: true });
      reduced.dispatchEvent(new Event("change"));
      expect(closed).toBe(1);
      expect(parent.hasAttribute("data-menu-child-count")).toBe(false);
      expect(source.style.opacity).toBe("");
      expect(source.style.transform).toBe("");
    } finally {
      dispose?.();
      host.remove();
      globalThis.requestAnimationFrame = raf;
      globalThis.cancelAnimationFrame = cancel;
      globalThis.matchMedia = media;
      performance.now = clock;
    }
  },
);
