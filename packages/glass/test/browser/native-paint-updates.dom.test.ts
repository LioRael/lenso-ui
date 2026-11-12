import { expect, test } from "bun:test";
import { paintMaterialBackdrop } from "../../src/backdrop-paints.js";
import { paintBackdrop } from "../../src/panel-backdrop.js";

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

async function withNativePaints(run: () => Promise<void>) {
  const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
  const raf = globalThis.requestAnimationFrame;
  Object.defineProperty(document, "fonts", { configurable: true, value: new EventTarget() });
  globalThis.requestAnimationFrame = () => 1;
  try {
    await run();
  } finally {
    globalThis.requestAnimationFrame = raf;
    if (fonts) Object.defineProperty(document, "fonts", fonts);
    else Reflect.deleteProperty(document, "fonts");
  }
}

test("native paint recipes add and retire only their visible layers", () =>
  withNativePaints(async () => {
    const lens = document.createElement("div");
    lens.style.cssText =
      "--apple-material-profile:medium;--lg-blur:15.3px;--lenso-material-action-mode:light;--lenso-panel-paint-1:red;--lenso-panel-paint-2:green;--lenso-panel-paint-3:blue;--lenso-panel-blend-1:multiply;--lenso-panel-blend-2:normal;--lenso-panel-blend-3:screen";
    document.body.append(lens);
    const stop = paintMaterialBackdrop(lens, true);
    const paints = lens.previousElementSibling!;
    try {
      await settle();
      expect(paints.children.length).toBe(1);
      const blur = paints.firstElementChild as HTMLElement;
      expect(blur.style.backdropFilter).toContain("contrast(");
      lens.dataset["variant"] = "filled";
      await settle();
      expect(paints.children.length).toBe(4);
      expect((paints.children[1] as HTMLElement).style.mixBlendMode).toBe("multiply");
      expect(blur.style.backdropFilter).not.toContain("contrast(");
      delete lens.dataset["variant"];
      await settle();
      expect(paints.children.length).toBe(1);
      expect(paints.firstElementChild).toBe(blur);
      expect(blur.style.backdropFilter).toContain("contrast(");
    } finally {
      stop();
      lens.remove();
    }
  }));

test("moving a native backdrop does not repeatedly mutate its paint marker", () =>
  withNativePaints(async () => {
    const lens = document.createElement("div");
    let left = 10;
    lens.style.cssText =
      "--lenso-panel-paint-1:red;--lenso-panel-paint-2:green;--lenso-panel-paint-3:transparent;--lenso-panel-blend-1:normal;--lenso-panel-blend-2:normal;--lenso-panel-blend-3:normal";
    lens.getBoundingClientRect = () => new DOMRect(left, 20, 250, 524);
    document.body.append(lens);
    let markers = 0;
    const observer = new MutationObserver((records) => {
      markers += records.length;
    });
    observer.observe(lens, { attributes: true, attributeFilter: ["data-material-paints"] });
    const stop = paintBackdrop(lens);
    const paints = lens.previousElementSibling!;
    try {
      await settle();
      expect(markers).toBe(1);
      expect(paints.children.length).toBe(3);
      const blur = paints.firstElementChild;
      lens.style.setProperty("--lenso-panel-paint-3", "blue");
      await settle();
      expect(paints.children.length).toBe(4);
      lens.style.setProperty("--lenso-panel-paint-3", "transparent");
      await settle();
      expect(paints.children.length).toBe(3);
      expect(paints.firstElementChild).toBe(blur);
      for (left of [30, 60]) {
        lens.style.marginLeft = `${left}px`;
        await settle();
        expect((paints.firstElementChild as HTMLElement).style.transform).toContain(
          `translate(${left}px, 20px)`,
        );
      }
      expect(markers).toBe(1);
      stop.setVisible(false);
      left = 90;
      lens.style.marginLeft = "90px";
      await settle();
      expect((paints.firstElementChild as HTMLElement).style.transform).toContain(
        "translate(60px, 20px)",
      );
      stop.setVisible(true);
      await settle();
      expect((paints.firstElementChild as HTMLElement).style.transform).toContain(
        "translate(90px, 20px)",
      );
    } finally {
      observer.disconnect();
      stop();
      lens.remove();
    }
  }));

test("transparent material resumes with its latest geometry and recipe", () =>
  withNativePaints(async () => {
    const lens = document.createElement("div");
    lens.dataset["variant"] = "filled";
    lens.style.cssText = "opacity:1;--lg-blur:3px;--lenso-panel-paint-1:red";
    let left = 10;
    lens.getBoundingClientRect = () => new DOMRect(left, 20, 250, 524);
    document.body.append(lens);
    let ready = 0;
    const stop = paintMaterialBackdrop(lens, true, false, () => ready++);
    const paints = lens.previousElementSibling as HTMLElement;
    try {
      await settle();
      expect(paints.style.display).not.toBe("none");
      lens.style.opacity = "0";
      await settle();
      expect(paints.style.display).toBe("none");
      left = 80;
      lens.style.setProperty("--lg-blur", "8px");
      lens.style.setProperty("--lenso-panel-paint-1", "blue");
      await settle();
      expect(paints.style.display).toBe("none");
      lens.style.opacity = "1";
      await settle();
      expect(paints.style.display).not.toBe("none");
      expect((paints.firstElementChild as HTMLElement).style.transform).toContain(
        "translate(80px, 20px)",
      );
      expect((paints.firstElementChild as HTMLElement).style.backdropFilter).toContain("blur(8px)");
      expect((paints.children[1] as HTMLElement).style.backgroundColor).toBe("blue");
      expect(ready).toBe(1);
    } finally {
      stop();
      lens.remove();
    }
  }));
