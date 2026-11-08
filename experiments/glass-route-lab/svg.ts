import { generateTs } from "./kernel.ts";
const NS = "http://www.w3.org/2000/svg";
const node = (tag: string, attrs: Record<string, string | number> = {}) => {
  const result = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) result.setAttribute(key, String(value));
  return result;
};

// The Aave-inspired route filters the owned live content itself. No DOM screenshot.
export function svgGlass(element: HTMLElement, lenses: Float32Array, material: Float32Array) {
  const [version, dark, medium, dpr] = material;
  const svg = node("svg", {
    width: 600,
    height: 400,
    viewBox: "0 0 600 400",
    "aria-hidden": "true",
  });
  // Keep the filter viewport aligned with its source in WebKit as well as Chromium.
  svg.style.cssText = "position:absolute;inset:0;pointer-events:none";
  const id = `glass-content-${crypto.randomUUID()}`;
  const filter = node("filter", {
    id,
    x: 0,
    y: 0,
    width: 600,
    height: 400,
    filterUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  });
  svg.append(filter);
  element.before(svg);
  const add = (tag: string, attrs: Record<string, string | number>) =>
    filter.append(node(tag, attrs));
  add("feFlood", { "flood-color": "#808080", result: "neutral" });
  const mapNames = ["neutral"],
    maskNames = [];
  const cache = new Map();
  let maximum = 0;
  for (let i = 0; i < lenses.length; i += 8) {
    const [x, y, w, h, r, b, t, level] = Array.from(lenses.subarray(i, i + 8), (n, j) =>
      j === 7 ? n : n / dpr,
    );
    const key = [w, h, r, b, t].join();
    let map = cache.get(key);
    if (!map) {
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas
        .getContext("2d")!
        .putImageData(
          new ImageData(new Uint8ClampedArray(generateTs(w, h, r, b, t, true)), w * 2, h * 2),
          0,
          0,
        );
      map = canvas.toDataURL();
      cache.set(key, map);
    }
    for (let sample = 0; sample < 128; sample++) {
      const progress = Math.max(0.001, sample / 127);
      const surface = (1 - (1 - progress) ** 4) ** 0.25;
      const incident = Math.atan((1 - progress) ** 3 / surface ** 3);
      maximum = Math.max(
        maximum,
        Math.tan(incident - Math.asin(Math.sin(incident) / 1.5)) * (t + surface * b) * level * 2,
      );
    }
    const name = `map${i}`;
    add("feImage", {
      href: map,
      x,
      y,
      width: w,
      height: h,
      preserveAspectRatio: "none",
      result: name,
    });
    mapNames.push(name);
    const mask = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="${NS}" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="white"/></svg>`)}`;
    const maskName = `mask${i}`;
    add("feImage", { href: mask, x, y, width: w, height: h, result: maskName });
    maskNames.push(maskName);
  }
  for (const [name, inputs] of [
    ["map", mapNames],
    ["mask", maskNames],
  ] as const) {
    const merge = node("feMerge", { result: name });
    for (const input of inputs) merge.append(node("feMergeNode", { in: input }));
    filter.append(merge);
  }
  const blur = medium ? (version === 26 ? 6 : 8) : version === 26 ? 3.5 : 3;
  add("feGaussianBlur", {
    in: "SourceGraphic",
    stdDeviation: blur,
    edgeMode: "duplicate",
    result: "frost",
  });
  const channels = [];
  for (const [index, factor] of (version === 26 ? [1, 1, 1] : [1.02, 1, 0.98]).entries()) {
    const ray = `ray${index}`,
      channel = `channel${index}`;
    add("feDisplacementMap", {
      in: "frost",
      in2: "map",
      scale: maximum * factor,
      xChannelSelector: "R",
      yChannelSelector: "G",
      result: ray,
    });
    const matrix = Array(20).fill(0);
    matrix[index * 5 + index] = 1;
    matrix[18] = 1;
    add("feColorMatrix", { in: ray, type: "matrix", values: matrix.join(" "), result: channel });
    channels.push(channel);
  }
  add("feComposite", {
    in: channels[0],
    in2: channels[1],
    operator: "arithmetic",
    k2: 1,
    k3: 1,
    result: "rg",
  });
  add("feComposite", {
    in: "rg",
    in2: channels[2],
    operator: "arithmetic",
    k2: 1,
    k3: 1,
    result: "rays",
  });
  let current = "rays",
    sequence = 0;
  const paint = (color: string, alpha: number, mode = "normal") => {
    const name = `paint${sequence++}`;
    add("feFlood", { "flood-color": color, "flood-opacity": alpha, result: `${name}-color` });
    add("feBlend", { in: `${name}-color`, in2: current, mode, result: name });
    current = name;
  };
  const affine = (a: number, b: number) => {
    const name = `matrix${sequence++}`;
    add("feColorMatrix", {
      in: current,
      type: "matrix",
      values: `${a} 0 0 0 ${b} 0 ${a} 0 0 ${b} 0 0 ${a} 0 ${b} 0 0 0 1 0`,
      result: name,
    });
    current = name;
  };
  if (version === 26) {
    if (dark) {
      paint("#ccc", medium ? 1 : 0.5, "color-burn");
      paint("black", 0.6);
      paint("white", 0.06);
      add("feComposite", {
        in: current,
        in2: "rays",
        operator: "arithmetic",
        k2: 0.67,
        k3: 0.33,
        result: "face",
      });
      current = "face";
    } else if (medium) {
      paint("rgb(15% 15% 15%)", 1, "color-dodge");
      paint("#f5f5f5", 0.6);
    } else {
      paint("white", 0.65);
      paint("#ddd", 1, "color-burn");
      paint("rgb(96.9970703125% 96.9970703125% 96.9970703125%)", 1, "darken");
    }
  } else if (medium) {
    if (dark) {
      paint("#1a1a1a", 0.7, "luminosity");
      paint("#1a1a1a", 0.9, "luminosity");
      paint("#1a1a1a", 1, "lighten");
    } else {
      affine(0.3, 0.7);
      paint("#bfbfbf", 0.1, "darken");
    }
  } else if (dark) {
    const a = 0.17,
      l = [0.3, 0.59, 0.11].map((n) => n * a),
      v = [
        1 - l[0],
        -l[1],
        -l[2],
        0,
        a * 0.6,
        -l[0],
        1 - l[1],
        -l[2],
        0,
        a * 0.6,
        -l[0],
        -l[1],
        1 - l[2],
        0,
        a * 0.6,
        0,
        0,
        0,
        1,
        0,
      ];
    add("feColorMatrix", { in: current, type: "matrix", values: v.join(" "), result: "face" });
    current = "face";
  } else {
    affine(0.5625, 0.41);
    paint("#f8f8f8", 0.2, "luminosity");
  }
  add("feComposite", { in: current, in2: "mask", operator: "in", result: "inside" });
  add("feComposite", { in: "SourceGraphic", in2: "mask", operator: "out", result: "outside" });
  const merge = node("feMerge");
  for (const input of ["outside", "inside"]) merge.append(node("feMergeNode", { in: input }));
  filter.append(merge);
  const previousTransform = element.style.transform;
  // WebKit needs a local compositing layer to resolve this CSS SVG filter in source coordinates.
  element.style.transform = "translateZ(0)";
  element.style.filter = `url(#${id})`;
  return {
    maps: cache.size,
    dispose() {
      element.style.filter = "";
      element.style.transform = previousTransform;
      svg.remove();
    },
  };
}
