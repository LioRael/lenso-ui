import { expect, test } from "bun:test";
import { trackPressHighlight } from "../../glass/src/press-highlight.js";

function surface() {
  const element = document.createElement("button");
  document.body.append(element);
  element.getBoundingClientRect = () => new DOMRect(100, 40, 200, 50);
  return element;
}
function pointer(type: string, x = 120, id = 1) {
  return new PointerEvent(type, {
    bubbles: true,
    isPrimary: true,
    pointerId: id,
    button: 0,
    clientX: x,
    clientY: 65,
  });
}

// Element-local pointermove loses the light when a held gesture crosses an item boundary.
test("press light follows a held pointer outside its item without elastic motion", () => {
  const element = surface();
  const cleanup = trackPressHighlight(element);
  try {
    element.dispatchEvent(pointer("pointerdown"));
    expect(element.hasAttribute("data-lenso-light-pressed")).toBe(true);
    expect(element.style.getPropertyValue("--lg-light-x")).toBe("10%");
    window.dispatchEvent(pointer("pointermove", 260, 2));
    expect(element.style.getPropertyValue("--lg-light-x")).toBe("10%");
    window.dispatchEvent(pointer("pointermove", 340));
    expect(element.style.getPropertyValue("--lg-light-x")).toBe("120%");
    expect(element.style.getPropertyValue("--lg-light-radius")).toBe("240px");
    window.dispatchEvent(pointer("pointercancel"));
    expect(element.hasAttribute("data-lenso-light-pressed")).toBe(false);
    window.dispatchEvent(pointer("pointermove", 200));
    expect(element.style.getPropertyValue("--lg-light-x")).toBe("120%");
  } finally {
    cleanup();
    element.remove();
  }
  expect(element.style.getPropertyValue("--lg-light-x")).toBe("");
});

test("disabled descendants cannot illuminate a shared toolbar surface", () => {
  const element = surface();
  const child = document.createElement("button");
  child.disabled = true;
  element.append(child);
  const cleanup = trackPressHighlight(element);
  try {
    child.dispatchEvent(pointer("pointerdown"));
    expect(element.hasAttribute("data-lenso-light-pressed")).toBe(false);
    element.dispatchEvent(pointer("pointerdown"));
    window.dispatchEvent(new Event("blur"));
    expect(element.hasAttribute("data-lenso-light-pressed")).toBe(false);
  } finally {
    cleanup();
    element.remove();
  }
});

test("keyboard lights the focused item's location on a shared surface", () => {
  const element = surface();
  const child = document.createElement("button");
  child.getBoundingClientRect = () => new DOMRect(220, 40, 80, 50);
  element.append(child);
  const cleanup = trackPressHighlight(element);
  try {
    child.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(element.style.getPropertyValue("--lg-light-x")).toBe("80%");
    expect(element.hasAttribute("data-lenso-key-pressed")).toBe(true);
    window.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
    expect(element.hasAttribute("data-lenso-key-pressed")).toBe(false);
  } finally {
    cleanup();
    element.remove();
  }
});

// A nested detachable group must not light both itself and its enclosing bar.
test("nested optical controls own pointer and keyboard light exactly once", () => {
  const outer = surface();
  const inner = document.createElement("button");
  inner.setAttribute("data-glass", "true");
  inner.innerHTML = '<span data-slot="glass-press-highlight"></span>';
  inner.getBoundingClientRect = () => new DOMRect(100, 40, 50, 50);
  outer.append(inner);
  const cleanOuter = trackPressHighlight(outer);
  const cleanInner = trackPressHighlight(inner);
  try {
    inner.dispatchEvent(pointer("pointerdown"));
    expect(inner.hasAttribute("data-lenso-light-pressed")).toBe(true);
    expect(outer.hasAttribute("data-lenso-light-pressed")).toBe(false);
    window.dispatchEvent(pointer("pointerup"));
    expect(inner.hasAttribute("data-lenso-light-pressed")).toBe(false);
    inner.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    expect(inner.hasAttribute("data-lenso-key-pressed")).toBe(true);
    expect(outer.hasAttribute("data-lenso-key-pressed")).toBe(false);
  } finally {
    cleanInner();
    cleanOuter();
    outer.remove();
  }
});
