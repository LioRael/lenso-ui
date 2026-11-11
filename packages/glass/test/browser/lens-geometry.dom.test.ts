import { expect, test } from "bun:test";
import { createControlLens, lensMap } from "../../src/control-lens.js";
import { observeGlassPreferences } from "../../src/preferences.js";

// Channel packing must preserve both displacement bytes and mask coverage;
// a refit must not reuse the packed cache entry for spectral rays.
// At DPR 1.5, unconditionally mirroring the short axis of the 126 × 11 and 11 × 126
// fixtures changes 175 coverage bytes.
test.each([
  ["AppleWebKit/605.1.15", 1, 17, 29],
  ["AppleWebKit/605.1.15", 2, 17, 29],
  ["AppleWebKit/605.1.15", 1.5, 126, 11],
  ["AppleWebKit/605.1.15", 1.5, 11, 126],
  ["Chrome/156", 1, 17, 29],
  ["Chrome/156", 2, 17, 29],
] as const)("%s exact ink bytes at DPR %s, %s × %s", (agent, density, width, height) => {
  const userAgent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
  Object.defineProperty(navigator, "userAgent", { configurable: true, value: agent });
  const combined = agent.startsWith("AppleWebKit");
  const count = combined ? 2 : 3;
  const ratio = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: density });
  const context = HTMLCanvasElement.prototype.getContext,
    url = HTMLCanvasElement.prototype.toDataURL;
  const images: Uint8ClampedArray[] = [];
  HTMLCanvasElement.prototype.getContext = (() => ({
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    putImageData(image: ImageData) {
      images.push(image.data.slice());
    },
  })) as unknown as typeof context;
  HTMLCanvasElement.prototype.toDataURL = () => `data:image/png;base64,packed${images.length}`;
  const glass = document.createElement("div"),
    content = document.createElement("div");
  glass.style.cssText = "border-radius:5px;--test-packed-dispersion:0";
  document.body.append(glass, content);
  for (const node of [glass, content])
    Object.defineProperties(node, {
      offsetWidth: { value: width },
      offsetHeight: { value: height },
    });
  const options = {
    strength: 0.16,
    dispersion: 0,
    dispersionProperty: "--test-packed-dispersion",
    depth: 0.12,
    dome: 0.05,
    splay: 0.7,
    relative: true,
    ink: true,
    paintsLight: true,
  };
  let lens: ReturnType<typeof createControlLens> | undefined;
  try {
    const reference = lensMap(
      { width, height, radius: 5 },
      options,
      {
        angle: 45,
        glow: 0.4,
        spread: 0.5,
        glowPower: 1.5,
        edge: 0.5,
        edgeWidth: 2,
        edgePower: 1.5,
      },
      density,
    );
    const field = new Uint8ClampedArray(reference.across.length),
      mask = new Uint8ClampedArray(reference.light.length);
    for (let i = 0; i < field.length; i += 4) {
      field[i] = reference.across[i]!;
      field[i + 1] = reference.down[i]!;
      field[i + 3] = 255;
      mask[i + 3] = reference.light[i + 3]!;
    }
    lens = createControlLens(glass, content, options);
    lens.update(1, { contentWidth: width, contentHeight: height, x: 0, y: 0, width, height });
    lens.setActive(true);
    expect(images).toHaveLength(count);
    if (combined) expect(images[0]).toEqual(field);
    else {
      expect(images[0]).toEqual(reference.across);
      expect(images[1]).toEqual(reference.down);
    }
    expect(images[count - 1]).toEqual(mask);
    const graph = () => document.querySelector("[data-lenso-control-lenses] filter")!;
    expect(graph().querySelectorAll("feImage")).toHaveLength(count);
    expect(graph().querySelectorAll("feComponentTransfer")).toHaveLength(combined ? 1 : 2);
    expect(
      [...graph().querySelectorAll("feDisplacementMap")].map((node) => [
        node.getAttribute("xChannelSelector"),
        node.getAttribute("yChannelSelector"),
      ]),
    ).toEqual([
      ["R", "A"],
      ["A", combined ? "G" : "R"],
    ]);
    glass.style.setProperty("--test-packed-dispersion", "1");
    lens.refit();
    const afterRefit = images.length;
    expect(graph().querySelectorAll("feImage")).toHaveLength(3);
    expect(graph().querySelectorAll("feDisplacementMap")).toHaveLength(6);
    glass.style.setProperty("--test-packed-dispersion", "0");
    lens.refit();
    expect(images).toHaveLength(afterRefit);
    expect(graph().querySelectorAll("feImage")).toHaveLength(count);
  } finally {
    lens?.destroy();
    glass.remove();
    content.remove();
    HTMLCanvasElement.prototype.getContext = context;
    HTMLCanvasElement.prototype.toDataURL = url;
    if (ratio) Object.defineProperty(globalThis, "devicePixelRatio", ratio);
    else Reflect.deleteProperty(globalThis, "devicePixelRatio");
    if (userAgent) Object.defineProperty(navigator, "userAgent", userAgent);
    else Reflect.deleteProperty(navigator, "userAgent");
  }
});

test.each(["Chrome/130", "AppleWebKit/605.1.15"])(
  "%s owner geometry avoids layout reads and redundant bounds writes",
  async (agent) => {
    const userAgent = Object.getOwnPropertyDescriptor(navigator, "userAgent");
    Object.defineProperty(navigator, "userAgent", { configurable: true, value: agent });
    const original = HTMLCanvasElement.prototype.getContext;
    const originalURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.getContext = (() => ({
      createImageData: (width: number, height: number) => ({
        data: new Uint8ClampedArray(width * height * 4),
      }),
      putImageData() {},
    })) as unknown as typeof original;
    HTMLCanvasElement.prototype.toDataURL = () => "data:image/png;base64,map";
    const glass = document.createElement("div"),
      content = document.createElement("div");
    glass.style.borderRadius = "20px";
    glass.style.setProperty("--lenso-glass-transparency", "0");
    document.body.append(glass, content);
    let fits = 0;
    Object.defineProperties(glass, {
      offsetWidth: {
        get: () => {
          fits++;
          return 120;
        },
      },
      offsetHeight: { value: 80 },
    });
    let reads = 0;
    Object.defineProperties(content, {
      offsetWidth: {
        get: () => {
          reads++;
          return 200;
        },
      },
      offsetHeight: {
        get: () => {
          reads++;
          return 160;
        },
      },
    });
    content.getBoundingClientRect = () => {
      reads++;
      return new DOMRect(100, 40, 300, 240);
    };
    glass.getBoundingClientRect = () => {
      reads++;
      return new DOMRect(130, 70, 180, 120);
    };
    const lens = createControlLens(glass, content, {
      strength: 0.16,
      dispersion: 0,
      depth: 12,
      dome: 0,
      splay: 0.7,
      paintsLight: true,
    });
    const snapshot = () =>
      document
        .querySelector("[data-lenso-control-lenses] filter")!
        .outerHTML.replace(/ id="[^"]*"/, "");
    try {
      lens.setActive(true);
      lens.refit();
      expect(fits).toBe(0);
      expect(content.style.filter).toBe("");
      glass.style.setProperty("--lenso-glass-transparency", "1");
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(content.style.filter).toContain("url(");
      reads = 0;
      lens.update(0.6, {
        contentWidth: 200,
        contentHeight: 160,
        x: 35,
        y: 10,
        width: 132,
        height: 90,
      });
      expect(reads).toBe(0);
      const supplied = snapshot();
      glass.getBoundingClientRect = () => new DOMRect(152.5, 55, 198, 135);
      lens.update(0.6);
      expect(snapshot()).toBe(supplied);
      // Layout-read coverage misses repeated SVG bounds invalidation during motion.
      const filter = document.querySelector("[data-lenso-control-lenses] filter")!;
      const bounds = new MutationObserver(() => {});
      bounds.observe(filter, { attributes: true, attributeFilter: ["x", "y", "width", "height"] });
      try {
        const geometry = {
          contentWidth: 200,
          contentHeight: 160,
          x: 35,
          y: 10,
          width: 132,
          height: 90,
        };
        lens.update(0.5, geometry);
        expect(bounds.takeRecords()).toHaveLength(0);
        lens.update(0.6, { ...geometry, contentWidth: 220 });
        if (filter.getAttribute("filterUnits") === "objectBoundingBox") {
          expect(filter.getAttribute("width")).toBe("1");
          expect(bounds.takeRecords()).toHaveLength(0);
        } else {
          expect(filter.getAttribute("width")).toBe("220");
          expect(bounds.takeRecords().map((record) => record.attributeName)).toEqual(["width"]);
        }
      } finally {
        bounds.disconnect();
      }
      reads = 0;
      glass.style.setProperty("--lenso-glass-transparency", "0");
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(content.style.filter).toBe("");
      expect(reads).toBe(0);
      glass.style.setProperty("--lenso-glass-transparency", "1");
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(content.style.filter).toContain("url(");
    } finally {
      lens.destroy();
      glass.remove();
      content.remove();
      HTMLCanvasElement.prototype.getContext = original;
      HTMLCanvasElement.prototype.toDataURL = originalURL;
      if (userAgent) Object.defineProperty(navigator, "userAgent", userAgent);
      else Reflect.deleteProperty(navigator, "userAgent");
    }
  },
);

test("compositor motion does not reread preferences but optical/theme inputs still do", async () => {
  const root = document.createElement("div"),
    glass = document.createElement("div");
  root.append(glass);
  document.body.append(root);
  let updates = 0;
  const stop = observeGlassPreferences(glass, () => {
    updates++;
  });
  const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
  try {
    glass.style.opacity = ".7";
    root.style.transform = "translateX(10px)";
    root.style.borderRadius = "30px";
    glass.style.setProperty("--lg-press-scale", "1.03 1.03");
    root.style.setProperty("--lg-menu-scale", ".98");
    await settle();
    expect(updates).toBe(1);
    root.style.setProperty("--lenso-glass-tint-amount", ".2");
    await settle();
    expect(updates).toBe(2);
    root.setAttribute("data-contrast", "increased");
    await settle();
    expect(updates).toBe(3);
    glass.style.setProperty("--lg-blur", "8px");
    await settle();
    expect(updates).toBe(4);
  } finally {
    stop();
    root.remove();
  }
});

// Two ordinary DPR 2 menus exceed the previous 8 MB working set. Dismissing
// one must not make reopening it encode all of its unchanged fields again.
test("main and tall menu maps survive alternating opens at native pixel density", () => {
  const ratio = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  Object.defineProperty(globalThis, "devicePixelRatio", { configurable: true, value: 2 });
  const context = HTMLCanvasElement.prototype.getContext;
  const url = HTMLCanvasElement.prototype.toDataURL;
  let encodes = 0;
  HTMLCanvasElement.prototype.getContext = (() => ({
    createImageData: (w: number, h: number) => ({ data: new Uint8ClampedArray(w * h * 4) }),
    putImageData() {},
  })) as unknown as typeof context;
  HTMLCanvasElement.prototype.toDataURL = () => {
    encodes++;
    return "data:image/png;base64,map";
  };
  const open = (height: number) => {
    const glass = document.createElement("div"),
      content = document.createElement("div");
    glass.style.borderRadius = "34px";
    document.body.append(glass, content);
    Object.defineProperties(glass, {
      offsetWidth: { value: 250 },
      offsetHeight: { value: height },
    });
    const lens = createControlLens(glass, content, {
      strength: 0.16,
      dispersion: 0,
      depth: 12,
      dome: 0,
      splay: 1,
      paintsLight: true,
    });
    lens.destroy();
    glass.remove();
    content.remove();
  };
  try {
    open(420);
    open(550);
    const initial = encodes;
    expect(initial).toBeGreaterThan(0);
    open(420);
    open(550);
    expect(encodes).toBe(initial);
  } finally {
    HTMLCanvasElement.prototype.getContext = context;
    HTMLCanvasElement.prototype.toDataURL = url;
    if (ratio) Object.defineProperty(globalThis, "devicePixelRatio", ratio);
    else Reflect.deleteProperty(globalThis, "devicePixelRatio");
  }
});

// Closing used the shell's first animated corner to encode a new input map,
// so the cache missed on every dismissal and refraction depended on frame timing.
test("control lens retains the optical input radius while its shell morphs", () => {
  const glass = document.createElement("div"),
    content = document.createElement("div");
  glass.style.cssText = "border-radius:20px;--lg-map-radius:20px";
  document.body.append(glass, content);
  for (const node of [glass, content])
    Object.defineProperties(node, {
      offsetWidth: { value: 127 },
      offsetHeight: { value: 83 },
    });
  const context = HTMLCanvasElement.prototype.getContext,
    url = HTMLCanvasElement.prototype.toDataURL;
  let encodes = 0;
  HTMLCanvasElement.prototype.getContext = (() => ({
    createImageData: (width: number, height: number) => ({
      data: new Uint8ClampedArray(width * height * 4),
    }),
    putImageData() {},
  })) as unknown as typeof context;
  HTMLCanvasElement.prototype.toDataURL = () => `data:image/png;base64,map${++encodes}`;
  let lens: ReturnType<typeof createControlLens> | undefined;
  try {
    lens = createControlLens(glass, content, {
      strength: 0.16,
      dispersion: 0,
      depth: 0.12,
      dome: 0.05,
      splay: 0.7,
      relative: true,
      paintsLight: true,
    });
    lens.setActive(true);
    const initial = encodes;
    expect(initial).toBe(3);
    lens.setActive(false);
    glass.style.borderRadius = "63px / 40px";
    lens.setActive(true);
    expect(encodes).toBe(initial);
    lens.setActive(false);
    glass.style.setProperty("--lg-map-radius", "24px");
    lens.setActive(true);
    expect(encodes).toBe(initial + 3);
  } finally {
    lens?.destroy();
    glass.remove();
    content.remove();
    HTMLCanvasElement.prototype.getContext = context;
    HTMLCanvasElement.prototype.toDataURL = url;
  }
});
