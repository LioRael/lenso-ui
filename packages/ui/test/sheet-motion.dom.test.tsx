import { expect, spyOn, test } from "bun:test";
import {
  registerSheetClock,
  trackSheetPresentation,
} from "../src/components/sheet/track-presentation.js";

function fixture(initial = 0, target = 0, owner = document) {
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
      transform: `matrix(1, 0, 0, 1, 0, ${actual})`,
      getPropertyValue: (name: string) => popup.style.getPropertyValue(name),
    } as CSSStyleDeclaration;
  });
  const matrixDescriptor = Object.getOwnPropertyDescriptor(view, "DOMMatrixReadOnly");
  Object.defineProperty(view, "DOMMatrixReadOnly", {
    configurable: true,
    value: class {
      m42: number;
      constructor(transform: string) {
        this.m42 = Number(transform.slice(7, -1).split(",")[5]);
      }
    },
  });
  popup.style.setProperty("--drawer-snap-point-offset", `${target}px`);
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
    sample(position: number) {
      actual = position;
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(0);
    },
    value(name: string) {
      return Number.parseFloat(surface.style.getPropertyValue(name));
    },
    async target(offset: number) {
      popup.style.setProperty("--drawer-snap-point-offset", `${offset}px`);
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
    cleanup() {
      stop();
      raf.mockRestore();
      cancel.mockRestore();
      css.mockRestore();
      if (matrixDescriptor) Object.defineProperty(view, "DOMMatrixReadOnly", matrixDescriptor);
      else Reflect.deleteProperty(view, "DOMMatrixReadOnly");
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
    f.sample(0);
    expect(f.value("--sheet-solid-opacity")).toBe(1);
    expect(f.value("--sheet-edge-inset")).toBe(0);
    f.sample(159);
    expect(f.value("--sheet-solid-opacity")).toBeCloseTo(0.5);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(3);
    f.sample(318);
    expect(f.value("--sheet-edge-inset")).toBe(6);
    expect(f.value("--sheet-bottom-radius")).toBe(58);
    expect(f.value("--sheet-solid-opacity")).toBe(0);
    f.sample(428);
    expect(f.value("--sheet-edge-inset")).toBeCloseTo(3);
    f.sample(538);
    expect(f.value("--sheet-edge-inset")).toBe(0);
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
    f.sample(159);
    const inset = f.value("--sheet-edge-inset");
    await f.target(0);
    f.sample(159);
    expect(f.value("--sheet-edge-inset")).toBe(inset);
    expect(f.value("--sheet-solid-opacity")).toBeCloseTo(0.5);
    f.sample(0);
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
    f.sample(318);
    f.popup.setAttribute("data-ending-style", "");
    await new Promise((resolve) => setTimeout(resolve, 0));
    f.sample(738);
    expect(f.value("--sheet-edge-inset")).toBe(6);
  } finally {
    f.cleanup();
  }
});

test("the browser position clock is inherited by the visible surface and released on cleanup", () => {
  const registrations: PropertyDefinition[] = [];
  const registry = {
    registerProperty: (definition: PropertyDefinition) => {
      registrations.push(definition);
    },
  };
  expect(registerSheetClock(registry)).toBe(true);
  expect(registerSheetClock(registry)).toBe(true);
  expect(registrations).toEqual([
    {
      name: "--lenso-sheet-position",
      syntax: "<length>",
      inherits: true,
      initialValue: "0px",
    },
  ]);
  const view = document.defaultView!;
  const descriptor = Object.getOwnPropertyDescriptor(view, "CSS");
  Object.defineProperty(view, "CSS", { configurable: true, value: registry });
  const f = fixture();
  try {
    expect(f.popup.hasAttribute("data-sheet-clock")).toBe(true);
    expect(f.popup.style.getPropertyValue("--sheet-popup-height")).toBe("738px");
    f.stop();
    expect(f.popup.hasAttribute("data-sheet-clock")).toBe(false);
    expect(f.popup.style.getPropertyValue("--sheet-popup-height")).toBe("");
  } finally {
    f.cleanup();
    if (descriptor) Object.defineProperty(view, "CSS", descriptor);
    else Reflect.deleteProperty(view, "CSS");
  }
});
