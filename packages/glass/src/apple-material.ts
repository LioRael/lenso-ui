/** Material transfer: fitted iOS 27 tone and explicit Web optical approximations. */
import { encodeCanvas, encodeOpticalMap, opticalCanvas } from "./canvas.js";
import { appendMaterialTone } from "./material-tone-svg.js";
import { materialContours } from "@lenso/tokens/materials";

export interface AppleMaterial {
  mode: "light" | "dark";
  tint?: string;
  size?: number;
  surface?: "group";
  foreground?: boolean;
  clarity?: number;
  profile?: "small" | "medium" | "large" | "clear" | "toggle-knob" | "slider-knob";
}
const SVG = "http://www.w3.org/2000/svg";
// Complementary Gaussian integral; evaluated once per row when fitting a lens.
function gaussianTail(distance: number, sigma: number) {
  const x = distance / (Math.SQRT2 * sigma);
  const t = 1 / (1 + 0.3275911 * x);
  return (
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
    t *
    Math.exp(-x * x)
  );
}
function primitive(name: string, attributes: Record<string, string | number>) {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  return node;
}

function shadeSampler(material: AppleMaterial) {
  // Clear has one source recipe, including its shadows, in both appearances.
  const dark = material.mode === "dark" && material.profile !== "clear";
  const knob = material.profile === "toggle-knob" || material.profile === "slider-knob";
  const panel = material.profile === "medium" || material.profile === "large";
  const peak = panel ? 0 : !material.tint && dark ? 6.5 / 255 : 8 / 255;
  const reflected = dark ? 26 / 255 : 40 / 255;
  return (py: number, localHeight: number) => {
    const shadow = peak * Math.exp(-(((py / localHeight - 0.2) / 0.3) ** 2));
    // Source: +/-40px Linear Dodge, blur 10, spread -40, gray 26/255.
    // Native Medium blue edge samples fit Gaussian tails (upper 9.6/2.6,
    // lower 14.2/5.9: amplitude/sigma); Large and warm samples are holdouts.
    // These attenuation/kernel mappings are Web calibration, not source values.
    const reflection =
      panel && dark
        ? (9.6 * gaussianTail(py, 2.6) + 14.2 * gaussianTail(localHeight - py, 5.9)) / 255
        : reflected * Math.exp(-(localHeight - py) / (10 / 3));
    // Decoded knob inner shadows. Gaussian sigma is the Web blur mapping;
    // blend operands and offsets are source values (see controls evidence).
    const knobBurn = knob
      ? material.profile === "slider-knob"
        ? 0.1 * gaussianTail(py - 5, 25 / 2)
        : (25 / 255) * gaussianTail(py, 30 / 2)
      : 0;
    const knobLight = knob
      ? (40 / 255) * gaussianTail(localHeight - py, 10 / 2) +
        (material.profile === "slider-knob" ? 0.25 : 40 / 255) * gaussianTail(py, 10 / 2)
      : 0;
    return 255 * (knob ? 0.5 - knobBurn + knobLight : 0.5 - shadow + reflection);
  };
}

const uniformShades = new Map<string, Promise<string>>();

/** Equal-height, aligned members have one material row. Reuse its lossless
 * image only when floating-point interpolation cannot change a quantized byte. */
export function uniformFusionShade(
  width: number,
  height: number,
  density: number,
  material: AppleMaterial,
  local: { top: number; height: number; count: number } | undefined,
) {
  if (material.surface === "group" || !local) return undefined;
  if (material.profile && !["small", "clear"].includes(material.profile)) return undefined;
  const pixelWidth = Math.ceil(width * density),
    pixelHeight = Math.ceil(height * density);
  const key = JSON.stringify([pixelWidth, pixelHeight, density, material, local]);
  const cached = uniformShades.get(key);
  if (cached) return cached;
  const sample = shadeSampler(material);
  const values = new Uint8Array(pixelHeight);
  const dark = material.mode === "dark" && material.profile !== "clear";
  const peak = !material.tint && dark ? 6.5 / 255 : 8 / 255;
  const reflected = dark ? 26 / 255 : 40 / 255;
  for (let y = 0; y < pixelHeight; y++) {
    const py = (y + 0.5) / density - local.top;
    const epsilon = Number.EPSILON * 64 * local.count * Math.max(1, Math.abs(py), local.height);
    const h = local.height - epsilon;
    if (h <= 0) return undefined;
    const reflectionSlope = reflected * 0.3 * Math.exp((py + epsilon - h) * 0.3);
    const error =
      255 *
        epsilon *
        (((peak * Math.sqrt(2 / Math.E)) / (0.3 * h)) * (1 + (Math.abs(py) + epsilon) / h) +
          2 * reflectionSlope) +
      1e-9;
    const value = sample(py, local.height);
    if (Math.abs(value - Math.floor(value) - 0.5) <= error) return undefined;
    values[y] = Math.max(0, Math.min(255, Math.round(value)));
  }
  const image = new ImageData(pixelWidth, pixelHeight);
  const bytes = image.data;
  const words = new Uint32Array(bytes.buffer);
  for (let y = 0; y < pixelHeight; y++) {
    const value = values[y]!;
    bytes.set([value, value, value, 255], y * pixelWidth * 4);
    words.fill(words[y * pixelWidth]!, y * pixelWidth + 1, (y + 1) * pixelWidth);
  }
  const encoded = encodeOpticalMap(image);
  uniformShades.set(key, encoded);
  if (uniformShades.size > 128) uniformShades.delete(uniformShades.keys().next().value!);
  void encoded.catch(() => uniformShades.delete(key));
  return encoded;
}

export function appleShade(
  width: number,
  height: number,
  density: number,
  material: AppleMaterial,
  local?: (x: number, y: number) => { y: number; height: number },
) {
  if (material.foreground || material.surface === "group") return undefined;
  const pixelWidth = Math.ceil(width * density);
  const pixelHeight = Math.ceil(height * density);
  const image = new ImageData(pixelWidth, pixelHeight);
  const bytes = image.data;
  const rows = new Uint32Array(bytes.buffer);
  const sample = shadeSampler(material);
  let previousY = NaN;
  let previousHeight = NaN;
  let previousPixel = 0;
  for (let y = 0; y < pixelHeight; y++) {
    for (let x = 0; x < (local ? pixelWidth : 1); x++) {
      const point = local?.((x + 0.5) / density, (y + 0.5) / density);
      const py = point?.y ?? ((y + 0.5) * height) / pixelHeight;
      const localHeight = point?.height ?? height;
      if (py === previousY && localHeight === previousHeight) {
        rows[y * pixelWidth + x] = previousPixel;
        continue;
      }
      const delta = Math.round(sample(py, localHeight));
      const at = (y * pixelWidth + x) * 4;
      bytes[at] = bytes[at + 1] = bytes[at + 2] = delta;
      bytes[at + 3] = 255;
      previousY = py;
      previousHeight = localHeight;
      previousPixel = rows[y * pixelWidth + x]!;
      if (!local) rows.fill(rows[y * pixelWidth]!, y * pixelWidth + 1, (y + 1) * pixelWidth);
    }
  }
  if (local) return encodeOpticalMap(image);
  const canvas = opticalCanvas();
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  return encodeCanvas(canvas);
}

/** Opaque subtractive field: white leaves the backdrop unchanged.
 * Generated once with the fitted lens, not during pointer interaction.
 * The outer contour is inset into the host clip by 0.5px; antialias coverage is
 * a Web rasterization approximation, not a native Figma shadow rasterizer.
 */
export function appleContour(
  width: number,
  height: number,
  radius: number,
  density: number,
  material: AppleMaterial,
  outline?: (x: number, y: number) => number,
) {
  const knob = material.profile === "toggle-knob" || material.profile === "slider-knob";
  if (material.foreground) return undefined;
  if (!knob && ((material.mode !== "dark" && material.profile !== "clear") || material.tint))
    return undefined;
  const paint = knob
    ? { gray: 0.8, sideGray: 1, spread: 0.5, sideOffset: 0, sideSpread: -0.5 }
    : materialContours[material.profile === "clear" ? "clear" : "dark"];
  const pixelWidth = Math.ceil(width * density);
  const pixelHeight = Math.ceil(height * density);
  const pixels = new ImageData(pixelWidth, pixelHeight);
  const contourBytes = pixels.data;
  const distance = (x: number, y: number, shift: number, spread: number) => {
    if (outline) return outline(x - shift, y) - spread;
    const r = Math.max(0, radius + spread);
    const qx = Math.abs(x - width / 2 - shift) - (width / 2 + spread - r);
    const qy = Math.abs(y - height / 2) - (height / 2 + spread - r);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  const coverage = (value: number) => Math.max(0, Math.min(1, 0.5 - value * density));
  // The central strip is strictly inside the inner rounded rectangle. Its
  // contour contribution is identically zero; preserve the original samples
  // along all edges and corners.
  new Uint32Array(contourBytes.buffer).fill(0xffffffff);
  const innerStart = Math.ceil((radius + paint.spread + 1) * density);
  const innerEnd = Math.floor((width - radius - paint.spread - 1) * density);
  for (let y = 0; y < pixelHeight; y++)
    for (let x = 0; x < pixelWidth; x++) {
      const px = (x + 0.5) / density,
        py = (y + 0.5) / density;
      if (
        outline &&
        Math.abs(outline(px, py)) >
          Math.max(paint.spread, Math.abs(paint.sideOffset) + Math.abs(paint.sideSpread)) + 1
      )
        continue;
      if (
        !outline &&
        x === innerStart &&
        innerEnd > x &&
        py > paint.spread + 1 &&
        py < height - paint.spread - 1
      ) {
        x = innerEnd - 1;
        continue;
      }
      const outsideInner = 1 - coverage(distance(px, py, 0, -paint.spread));
      if (outsideInner === 0) continue;
      const center = coverage(distance(px, py, 0, 0)) * outsideInner;
      const left = coverage(distance(px, py, -paint.sideOffset, paint.sideSpread)) * outsideInner;
      const right = coverage(distance(px, py, paint.sideOffset, paint.sideSpread)) * outsideInner;
      const gray = Math.round(
        255 * Math.max(0, 1 - center * (1 - paint.gray) - (left + right) * (1 - paint.sideGray)),
      );
      const at = (y * pixelWidth + x) * 4;
      contourBytes[at] = contourBytes[at + 1] = contourBytes[at + 2] = gray;
      contourBytes[at + 3] = 255;
    }
  if (outline) return encodeOpticalMap(pixels);
  const canvas = opticalCanvas();
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.getContext("2d")!.putImageData(pixels, 0, 0);
  return encodeCanvas(canvas);
}

export function appendAppleMaterial(
  filter: SVGElement,
  source: string,
  box: { x: number; y: number; width: number; height: number },
  material: AppleMaterial,
  shade: string | undefined,
  contour?: string,
  _nativeBackdrop = false,
) {
  if (material.foreground) filter.setAttribute("data-lenso-material-foreground", "");
  if (contour) {
    filter.append(
      primitive("feImage", {
        href: contour,
        ...box,
        preserveAspectRatio: "none",
        result: "contour-paint",
      }),
    );
    filter.append(
      // Linear Burn: max(backdrop + paint - 1, 0), in sRGB. Not alpha-black.
      primitive("feComposite", {
        in: source,
        in2: "contour-paint",
        operator: "arithmetic",
        k2: 1,
        k3: 1,
        k4: -1,
        result: "contour-backdrop",
      }),
    );
    source = "contour-backdrop";
  }
  if (material.tint) {
    // The source's 94% white backing followed by Linear Burn tint, in premultiplied sRGB.
    filter.append(
      primitive("feColorMatrix", {
        in: source,
        type: "matrix",
        values: ".06 0 0 0 .94 0 .06 0 0 .94 0 0 .06 0 .94 0 0 0 1 0",
        result: "white-backing",
      }),
      primitive("feFlood", { "flood-color": material.tint, result: "material-tint" }),
      primitive("feComposite", {
        in: "white-backing",
        in2: "material-tint",
        operator: "arithmetic",
        k2: 1,
        k3: 1,
        k4: -1,
        result: "material-face",
      }),
    );
  } else if (material.profile !== "toggle-knob" && material.profile !== "slider-knob") {
    appendMaterialTone(
      filter,
      source,
      {
        mode: material.mode,
        size:
          material.size ?? (material.profile === "medium" || material.profile === "large" ? 1 : 0),
        clarity: material.profile === "clear" ? 1 : (material.clarity ?? 0),
      },
      material.surface === "group",
    );
  } else if (material.profile === "toggle-knob" || material.profile === "slider-knob") {
    filter.append(
      primitive("feColorMatrix", {
        in: source,
        type: "matrix",
        values: ".91 0 0 0 .09 0 .91 0 0 .09 0 0 .91 0 .09 0 0 0 1 0",
        result: "material-face",
      }),
    );
  }
  if (
    !shade ||
    material.foreground ||
    material.surface === "group" ||
    material.profile === "toggle-knob" ||
    material.profile === "slider-knob"
  )
    return;
  filter.append(
    primitive("feImage", {
      href: shade,
      ...box,
      preserveAspectRatio: "none",
      result: "material-shade",
    }),
    primitive("feComposite", {
      in: "material-face",
      in2: "material-shade",
      operator: "arithmetic",
      k2: 1,
      k3: 1,
      k4: -0.5,
    }),
  );
}
