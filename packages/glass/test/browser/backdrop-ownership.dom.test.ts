import { expect, test } from "bun:test";
import { attachGlass } from "../../src/refraction.js";

test("WebKit ordinary glass keeps native paint without discovering marked backdrop copies", () => {
  const agent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  const intersection = Object.getOwnPropertyDescriptor(globalThis, "IntersectionObserver");
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: "Mozilla/5.0 AppleWebKit/605.1.15 Version/27.2 Safari/605.1.15",
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: undefined,
  });
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const root = document.createElement("div");
  const source = document.createElement("div");
  const lens = document.createElement("button");
  source.setAttribute("data-lenso-backdrop", "");
  let sourceReads = 0;
  source.getBoundingClientRect = () => {
    sourceReads++;
    return new DOMRect(0, 0, 300, 300);
  };
  lens.getBoundingClientRect = () => new DOMRect(10, 10, 44, 44);
  lens.style.cssText = "--lg-material:apple;--lg-blur:15.3px";
  root.append(source, lens);
  document.body.append(root);
  let stop: (() => void) | undefined;
  try {
    stop = attachGlass(lens, { profileKey: "default" });
    expect(sourceReads).toBe(0);
    expect(root.querySelectorAll("[data-material-local-paints]").length).toBe(1);
    expect(lens.hasAttribute("data-copy")).toBe(false);
  } finally {
    stop?.();
    root.remove();
    if (agent) Object.defineProperty(navigator, "userAgent", agent);
    else Reflect.deleteProperty(navigator, "userAgent");
    if (intersection) Object.defineProperty(globalThis, "IntersectionObserver", intersection);
    else Reflect.deleteProperty(globalThis, "IntersectionObserver");
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});

// An accepted page owner must not also start a clipped CSS-source copy on Safari.
test.each([true, false])("Safari uses a single backdrop owner (accepted: %s)", (accepted) => {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  Object.defineProperty(navigator, "userAgent", {
    configurable: true,
    value: "Version/27.2 Safari/605.1.15",
  });
  const intersection = Object.getOwnPropertyDescriptor(globalThis, "IntersectionObserver");
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: undefined,
  });
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const root = document.createElement("div"),
    source = document.createElement("div"),
    trigger = document.createElement("button"),
    lens = document.createElement("div");
  source.setAttribute("data-lenso-backdrop", "true");
  root.append(source, trigger);
  document.body.append(root, lens);
  source.getBoundingClientRect = () => new DOMRect(0, 0, 300, 300);
  trigger.getBoundingClientRect = lens.getBoundingClientRect = () => new DOMRect(100, 100, 44, 44);
  lens.style.setProperty("--lg-material", "apple");
  const stop = attachGlass(lens, {
    sourceAnchor: trigger,
    liveBackdrop: true,
    backdropSource: () =>
      accepted ? { source: root, ready: () => false, prepare: async () => undefined } : undefined,
  });
  try {
    // Selecting a copy must not disable native blur before its first paint.
    expect(lens.hasAttribute("data-copy")).toBe(false);
  } finally {
    stop();
    root.remove();
    lens.remove();
    if (intersection) Object.defineProperty(globalThis, "IntersectionObserver", intersection);
    else Reflect.deleteProperty(globalThis, "IntersectionObserver");
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
    if (descriptor) Object.defineProperty(navigator, "userAgent", descriptor);
    else Reflect.deleteProperty(navigator, "userAgent");
  }
});

test("detaching a live portal cancels its pending material initialization", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "IntersectionObserver");
  let notify: IntersectionObserverCallback | undefined;
  class VisibilityObserver {
    constructor(callback: IntersectionObserverCallback) {
      notify = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    value: VisibilityObserver,
  });
  const source = document.createElement("div"),
    lens = document.createElement("span");
  document.body.append(source, lens);
  let calls = 0;
  const stop = attachGlass(lens, {
    liveBackdrop: true,
    backdropSource: () => {
      calls++;
      return { source, ready: () => false, prepare: async () => undefined };
    },
  });
  try {
    expect(calls).toBe(0);
    stop();
    notify?.(
      [
        {
          target: lens,
          isIntersecting: true,
          boundingClientRect: new DOMRect(),
          intersectionRect: new DOMRect(),
          rootBounds: null,
          intersectionRatio: 1,
          time: 0,
        },
      ],
      {} as IntersectionObserver,
    );
    expect(calls).toBe(0);
    expect(lens.style.getPropertyValue("--lenso-glass-face-opacity")).toBe("");
  } finally {
    stop();
    source.remove();
    lens.remove();
    if (descriptor) Object.defineProperty(globalThis, "IntersectionObserver", descriptor);
    else Reflect.deleteProperty(globalThis, "IntersectionObserver");
  }
});
