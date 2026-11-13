import { expect, test } from "bun:test";
import { paintMaterialBackdrop } from "../../src/backdrop-paints.js";
import { observeBackdrop } from "../../src/backdrop-scheduler.js";
import { toneCSS } from "../../src/material-tone.js";

// A correct tone on a sibling below ::backdrop is still visibly darkened.
// Native popups must own their live filter without external paint siblings.
test.each(["light", "dark"] as const)(
  "%s native popup keeps its calibrated material above the dimmer",
  (mode) => {
    const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
    const popup = document.createElement("div");
    popup.setAttribute("popover", "manual");
    popup.style.cssText = `--apple-material-profile:medium;--lg-blur:15.3px;--lenso-material-action-mode:${mode};--lenso-glass-face-opacity:.6`;
    Object.defineProperties(popup, { offsetWidth: { value: 300 }, offsetHeight: { value: 200 } });
    document.body.append(popup);
    const stop = paintMaterialBackdrop(popup, true);
    try {
      expect(popup.style.getPropertyValue("--lenso-native-material-filter")).toBe(
        `blur(15.3px) ${toneCSS({ mode, size: 1, clarity: 0 })} opacity(.6)`,
      );
      expect(popup.hasAttribute("data-material-paints")).toBe(true);
      expect(
        popup.previousElementSibling?.hasAttribute("data-material-local-paints") ?? false,
      ).toBe(false);
      expect(popup.querySelector("[data-material-local-paints]")).toBeNull();
    } finally {
      stop();
      expect(popup.style.getPropertyValue("--lenso-native-material-filter")).toBe("");
      expect(popup.hasAttribute("data-material-paints")).toBe(false);
      popup.remove();
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    }
  },
);

// A popup is live source content, not a copied paint layer. Its descendants
// must still invalidate other backdrop consumers when they change.
test("native popup material keeps source edits observable", async () => {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  const popup = document.createElement("div");
  popup.setAttribute("popover", "manual");
  popup.style.cssText =
    "--apple-material-profile:medium;--lg-blur:15.3px;--lenso-material-action-mode:light";
  Object.defineProperties(popup, { offsetWidth: { value: 300 }, offsetHeight: { value: 200 } });
  const label = document.createElement("span");
  label.textContent = "Original";
  popup.append(label);
  document.body.append(popup);
  const stop = paintMaterialBackdrop(popup, true);
  let reads = 0;
  const observer = observeBackdrop({
    element: popup,
    source: popup,
    layer: document.createElement("div"),
    prepare() {},
    read() {
      reads++;
      return () => {};
    },
  });
  try {
    await new Promise((resolve) => setTimeout(resolve, 30));
    const before = reads;
    label.textContent = "Changed";
    popup.style.setProperty("--lenso-material-action-mode", "dark");
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(reads).toBeGreaterThan(before);
    expect(popup.style.getPropertyValue("--lenso-native-material-filter")).toContain(
      toneCSS({ mode: "dark", size: 1, clarity: 0 }),
    );
  } finally {
    observer.stop();
    stop();
    popup.remove();
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
});
