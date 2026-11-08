import { expect, test } from "bun:test";
import { attachGlass, createMaterialLens, readLens } from "../../src/refraction.js";

// Hold optical work cold: an old decoded lens must never be needed to paint the new appearance.
test.each([false, true])(
  "a material has its current transfer before optical work runs (live: %s)",
  async (liveBackdrop) => {
    const agent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
    const raf = globalThis.requestAnimationFrame;
    const cancel = globalThis.cancelAnimationFrame;
    const intersection = globalThis.IntersectionObserver;
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: "Chrome/150" });
    globalThis.requestAnimationFrame = () => 1;
    globalThis.cancelAnimationFrame = () => {};
    globalThis.IntersectionObserver = undefined!;
    const scope = document.createElement("div");
    const surface = document.createElement("span");
    surface.setAttribute("data-material-lens", "");
    surface.style.cssText =
      "--lg-material:apple;--apple-material-profile:medium;--lenso-material-action-mode:light;border-radius:22px";
    Object.defineProperties(surface, {
      offsetWidth: { value: 250 },
      offsetHeight: { value: 487 },
    });
    scope.append(surface);
    document.body.append(scope);
    const stop = attachGlass(surface, { profileKey: "glass-medium", liveBackdrop });
    const filter = () =>
      document.getElementById(
        surface.style.getPropertyValue("--lg-filter").match(/#([^)"']+)/)![1]!,
      )!;
    let last: Element | undefined;
    try {
      expect(filter().getAttribute("data-lenso-tone")).toBe("light");
      expect(filter().querySelector('[result="material-face"]')).not.toBeNull();
      expect(filter().querySelector("feImage")).toBeNull();
      for (const mode of ["dark", "light", "dark"]) {
        const previous = filter();
        surface.style.setProperty("--lenso-material-action-mode", mode);
        scope.setAttribute("data-theme", mode);
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(filter().getAttribute("data-lenso-tone")).toBe(mode);
        expect(filter().querySelector('[result="material-face"]')).not.toBeNull();
        expect(previous.isConnected).toBe(false);
      }
      last = filter();
    } finally {
      stop();
      scope.remove();
      if (agent) Object.defineProperty(navigator, "userAgent", agent);
      else Reflect.deleteProperty(navigator, "userAgent");
      globalThis.requestAnimationFrame = raf;
      globalThis.cancelAnimationFrame = cancel;
      globalThis.IntersectionObserver = intersection;
    }
    expect(last?.isConnected).toBe(false);
    expect(surface.style.getPropertyValue("--lg-filter")).toBe("");
  },
);

// Appearance-only tests cannot catch routing a group through the standalone
// dark luminance table. The two surfaces have intentionally different transfers.
test("group material uses the linear large-surface transfer without changing standalone optics", () => {
  const element = document.createElement("div");
  element.style.cssText =
    "--lg-material:apple;--lenso-material-action-mode:dark;border-radius:30px";
  Object.defineProperties(element, { offsetWidth: { value: 60 }, offsetHeight: { value: 60 } });
  document.body.append(element);
  const shape = readLens(element)!.shape;
  const isolated = createMaterialLens(shape);
  const group = createMaterialLens({ ...shape, materialSize: 1, materialSurface: "group" });
  const filter = (value: string) => document.getElementById(value.match(/#([^)"]+)/)![1]!)!;
  try {
    expect(filter(isolated.filter).querySelector('[result="tone-luminance"]')).not.toBeNull();
    expect(filter(isolated.filter).getAttribute("data-lenso-tone-size")).toBe("0");
    expect(filter(group.filter).getAttribute("data-lenso-tone-size")).toBe("1");
    expect(filter(group.filter).getAttribute("data-lenso-tone-transfer")).toBe("linear");
    expect(filter(group.filter).querySelector('[result="tone-luminance"]')).toBeNull();
  } finally {
    isolated.destroy();
    group.destroy();
    element.remove();
  }
});

// The foreground rim owns the modern edge shade. A rectangular post-tone
// shade would reintroduce a white plate across the host's interior.
test("foreground-owned materials do not also apply the legacy rectangular shade", () => {
  const element = document.createElement("div");
  element.style.cssText = "--lg-material:apple;border-radius:20px";
  Object.defineProperties(element, { offsetWidth: { value: 320 }, offsetHeight: { value: 140 } });
  document.body.append(element);
  const shape = readLens(element)!.shape;
  const old = createMaterialLens(shape, "data:image/png;base64,shade");
  const front = createMaterialLens(
    { ...shape, materialForeground: true },
    "data:image/png;base64,shade",
  );
  const get = (v: string) => document.getElementById(v.match(/#([^)"]+)/)![1]!)!;
  try {
    expect(get(old.filter).querySelector('[result="material-shade"]')).not.toBeNull();
    expect(get(front.filter).querySelector('[result="material-shade"]')).toBeNull();
    expect(get(front.filter).querySelector('[result="material-face"]')).not.toBeNull();
  } finally {
    old.destroy();
    front.destroy();
    element.remove();
  }
});
