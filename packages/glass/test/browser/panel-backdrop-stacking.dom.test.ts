import { afterAll, expect, test } from "bun:test";
import { paintBackdrop } from "../../src/panel-backdrop.js";

const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
afterAll(() => {
  if (fonts) Object.defineProperty(document, "fonts", fonts);
  else Reflect.deleteProperty(document, "fonts");
});

// A body-level paint can cover a sticky header inside an isolated app even
// though its text remains visible to DOM visibility and geometry assertions.
for (const position of ["sticky", "fixed"]) {
  test(`panel paints remain inside their ${position} foreground owner`, () => {
    const app = document.createElement("div");
    app.style.isolation = "isolate";
    const header = document.createElement("header");
    header.style.cssText = `position:${position};z-index:20`;
    const glass = document.createElement("div");
    header.append(glass);
    app.append(header);
    document.body.append(app);
    const stop = paintBackdrop(glass);
    try {
      const paints = header.querySelector("[data-material-live-paints]");
      expect(paints?.parentElement).toBe(header);
      expect(header.firstElementChild).toBe(paints);
      expect(paints?.nextElementSibling).toBe(glass);
      stop.setVisible(false);
      expect((paints as HTMLElement).style.display).toBe("none");
    } finally {
      stop();
      expect(header.querySelector("[data-material-live-paints]")).toBeNull();
      app.remove();
    }
  });
}

test("ordinary application-root paints retain their sibling order", () => {
  const portal = document.createElement("div");
  const glass = document.createElement("div");
  portal.append(glass);
  document.body.append(portal);
  const stop = paintBackdrop(glass);
  try {
    expect(portal.previousElementSibling?.hasAttribute("data-material-live-paints")).toBe(true);
  } finally {
    stop();
    portal.remove();
  }
});

for (const tag of ["dialog", "div"]) {
  test(`native ${tag} popup paints stay inside their fixed host`, () => {
    const popup = document.createElement(tag);
    if (tag === "div") popup.setAttribute("popover", "manual");
    popup.style.position = "fixed";
    const glass = document.createElement("div");
    popup.append(glass);
    document.body.append(popup);
    const stop = paintBackdrop(glass);
    try {
      const paints = popup.querySelector("[data-material-live-paints]");
      expect(paints?.parentElement).toBe(popup);
      expect(popup.firstElementChild).toBe(paints);
    } finally {
      stop();
      expect(popup.querySelector("[data-material-live-paints]")).toBeNull();
      popup.remove();
    }
  });
}
