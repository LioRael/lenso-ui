import { expect, spyOn, test } from "bun:test";
import { trackSheetPresentation } from "../src/components/sheet/track-presentation.js";

function fixture(initial = 0, target = 0, owner = document, compositor = false) {
  const view = owner.defaultView!;
  const viewport = owner.createElement("div");
  const popup = owner.createElement("div");
  const surface = owner.createElement("div");
  viewport.append(popup);
  popup.append(surface);
  owner.body.append(viewport);
  Object.defineProperty(viewport, "offsetHeight", { value: 800 });
  Object.defineProperty(popup, "offsetHeight", { value: 738 });
  let actual = initial;
  let nextId = 0;
  const pending = new Map<number, FrameRequestCallback>();
  const raf = spyOn(view, "requestAnimationFrame").mockImplementation((callback) => {
    pending.set(++nextId, callback);
    return nextId;
  });
  const cancel = spyOn(view, "cancelAnimationFrame").mockImplementation((id) => {
    pending.delete(id);
  });
  const computed = view.getComputedStyle.bind(view);
  const css = spyOn(view, "getComputedStyle").mockImplementation((element, pseudo) => {
    if (element !== popup) return computed(element, pseudo);
    return {
      translate: `0px ${actual}px`,
      transform: "none",
      getPropertyValue: (name: string) =>
        name === "--drawer-progress"
          ? String(1 - (compositor ? target : actual) / 738)
          : popup.style.getPropertyValue(name),
    } as CSSStyleDeclaration;
  });
  popup.setAttribute("data-snap-point", String(target === 318 ? 0.525 : target === 538 ? 0.25 : 1));
  if (initial !== target) popup.setAttribute("data-starting-style", "");
  const stop = trackSheetPresentation(popup, surface, viewport, {
    snapPoints: [0.25, 0.525, 1],
    attached: [0.25, 1],
  });
  return {
    popup,
    surface,
    pending,
    stop,
    async sample(position: number) {
      actual = position;
      popup.style.setProperty("--drawer-progress", String(1 - position / 738));
      await new Promise((resolve) => setTimeout(resolve, 0));
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(0);
    },
    value(name: string) {
      return Number.parseFloat(surface.style.getPropertyValue(name));
    },
    async target(offset: number) {
      target = offset;
      popup.setAttribute(
        "data-snap-point",
        String(offset === 538 ? 0.25 : offset === 318 ? 0.525 : 1),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
    cleanup() {
      stop();
      raf.mockRestore();
      cancel.mockRestore();
      css.mockRestore();
      viewport.remove();
    },
  };
}

// Endpoint interpolation tests cannot detect that full-to-low skips the floating
// shape entirely, or that interruption jumps the material to the new target.
test("full-to-low snap visits the floating detent using the actual animated position", async () => {
  const f = fixture();
  try {
    await f.target(538);
    await f.sample(0);
    expect(f.value("--sheet-solid-opacity")).toBe(1);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(0);
    await f.sample(159);
    expect(f.value("--sheet-solid-opacity")).toBeCloseTo(0.5);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(3);
    await f.sample(318);
    expect(f.value("--sheet-edge-inset")).toBe(6);
    expect(f.value("--sheet-bottom-radius")).toBe(58);
    expect(f.value("--sheet-solid-opacity")).toBe(0);
    await f.sample(428);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(3);
    await f.sample(538);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(0);
    expect(f.value("--sheet-presentation-offset")).toBe(538);
    expect(f.pending.size).toBe(0);
  } finally {
    f.cleanup();
  }
});

test("reversing a snap retains its current shape and cleanup stops the animation observer", async () => {
  const f = fixture();
  try {
    await f.target(538);
    await f.sample(159);
    const inset = f.value("--sheet-edge-inset");
    await f.target(0);
    await f.sample(159);
    expect(f.value("--sheet-edge-inset")).toBe(inset);
    expect(f.value("--sheet-solid-opacity")).toBeCloseTo(0.5);
    await f.sample(0);
    expect(f.value("--sheet-solid-opacity")).toBe(1);
    expect(f.pending.size).toBe(0);
    await f.target(538);
    const callbacks = [...f.pending.values()];
    f.stop();
    for (const callback of callbacks) callback(0);
    expect(f.surface.style.getPropertyValue("--sheet-presentation-offset")).toBe("");
    expect(f.pending.size).toBe(0);
  } finally {
    f.cleanup();
  }
});

test("opening and closing retain their settled surface rather than collapsing their content", async () => {
  const f = fixture(738, 318);
  try {
    expect(f.value("--sheet-edge-inset")).toBe(6);
    f.popup.removeAttribute("data-starting-style");
    await f.sample(318);
    f.popup.setAttribute("data-ending-style", "");
    await new Promise((resolve) => setTimeout(resolve, 0));
    await f.sample(738);
    expect(f.value("--sheet-edge-inset")).toBe(6);
  } finally {
    f.cleanup();
  }
});

test("surface follows compositor motion when native progress already names the destination", async () => {
  const f = fixture(0, 0, document, true);
  try {
    await f.target(538);
    await f.sample(159);
    expect(f.value("--sheet-solid-opacity")).toBeCloseTo(0.5);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(3);
    expect(f.value("--sheet-presentation-offset")).toBeCloseTo(159);
    expect(f.pending.size).toBe(1);
    await f.sample(318);
    expect(f.value("--sheet-edge-inset")).toBe(6);
    await f.sample(538);
    expect(f.value("--sheet-edge-inset")).toBe(0);
    expect(f.pending.size).toBe(0);
  } finally {
    f.cleanup();
  }
});
