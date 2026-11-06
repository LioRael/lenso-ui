/** Web material transfer calibrated against the supplied Apple kit's native light/dark examples.
 * Figma GLASS is not a published shader; geometry and color-transfer approximations are explicit.
 */
import { encodeCanvas, encodeOpticalMap } from "./canvas.js";
import { materialContours } from "@lenso/tokens/materials";

export interface AppleMaterial {
  mode: "light" | "dark";
  version?: "ios26" | "ios27";
  tint?: string;
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

export function appleShade(
  width: number,
  height: number,
  density: number,
  material: AppleMaterial,
  local?: (x: number, y: number) => { y: number; height: number },
) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * density);
  canvas.height = Math.ceil(height * density);
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(canvas.width, canvas.height);
  const rows = new Uint32Array(image.data.buffer);
  // Clear has one source recipe, including its shadows, in both appearances.
  const dark = material.mode === "dark" && material.profile !== "clear";
  const knob = material.profile === "toggle-knob" || material.profile === "slider-knob";
  const panel = material.profile === "medium" || material.profile === "large";
  const peak = panel ? 0 : !material.tint && dark ? 6.5 / 255 : 8 / 255;
  const reflected = dark ? 26 / 255 : 40 / 255;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < (local ? canvas.width : 1); x++) {
      const point = local?.((x + 0.5) / density, (y + 0.5) / density);
      const py = point?.y ?? ((y + 0.5) * height) / canvas.height;
      const localHeight = point?.height ?? height;
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
      const knobBurn =
        material.profile === "slider-knob"
          ? 0.1 * gaussianTail(py - 5, 25 / 2)
          : (25 / 255) * gaussianTail(py, 30 / 2);
      const knobLight =
        (40 / 255) * gaussianTail(localHeight - py, 10 / 2) +
        (material.profile === "slider-knob" ? 0.25 : 40 / 255) * gaussianTail(py, 10 / 2);
      const delta = Math.round(
        255 * (knob ? 0.5 - knobBurn + knobLight : 0.5 - shadow + reflection),
      );
      const at = (y * canvas.width + x) * 4;
      image.data[at] = image.data[at + 1] = image.data[at + 2] = delta;
      image.data[at + 3] = 255;
      if (!local) rows.fill(rows[y * canvas.width]!, y * canvas.width + 1, (y + 1) * canvas.width);
    }
  }
  if (local) return encodeOpticalMap(image);
  context.putImageData(image, 0, 0);
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
  if (
    !knob &&
    (material.version === "ios26" ||
      (material.mode !== "dark" && material.profile !== "clear") ||
      material.tint)
  )
    return undefined;
  const paint = knob
    ? { gray: 0.8, sideGray: 1, spread: 0.5, sideOffset: 0, sideSpread: -0.5 }
    : materialContours[material.profile === "clear" ? "clear" : "dark"];
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * density);
  canvas.height = Math.ceil(height * density);
  const context = canvas.getContext("2d")!;
  const pixels = context.createImageData(canvas.width, canvas.height);
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
  new Uint32Array(pixels.data.buffer).fill(0xffffffff);
  const innerStart = Math.ceil((radius + paint.spread + 1) * density);
  const innerEnd = Math.floor((width - radius - paint.spread - 1) * density);
  for (let y = 0; y < canvas.height; y++)
    for (let x = 0; x < canvas.width; x++) {
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
      const at = (y * canvas.width + x) * 4;
      pixels.data[at] = pixels.data[at + 1] = pixels.data[at + 2] = gray;
      pixels.data[at + 3] = 255;
    }
  if (outline) return encodeOpticalMap(pixels);
  context.putImageData(pixels, 0, 0);
  return encodeCanvas(canvas);
}

export function appendAppleMaterial(
  filter: SVGElement,
  source: string,
  box: { x: number; y: number; width: number; height: number },
  material: AppleMaterial,
  shade: string | undefined,
  contour?: string,
  nativeBackdrop = false,
) {
  if (
    material.version === "ios26" &&
    material.profile !== "toggle-knob" &&
    material.profile !== "slider-knob"
  ) {
    appendIOS26Material(filter, source, material);
    return;
  }
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
  } else if (material.profile === "medium" || material.profile === "large") {
    if (material.mode === "light") {
      // Source fill order: white Lighten 70%, then #bfbfbf Darken 10%.
      filter.append(
        primitive("feColorMatrix", {
          in: source,
          type: "matrix",
          values: ".3 0 0 0 .7 0 .3 0 0 .7 0 0 .3 0 .7 0 0 0 1 0",
          result: "panel-base",
        }),
        primitive("feFlood", {
          "flood-color": "#bfbfbf",
          ...(nativeBackdrop ? { "flood-opacity": 0.1 } : {}),
          result: "panel-gray",
        }),
        primitive("feBlend", {
          in: nativeBackdrop ? "panel-gray" : "panel-base",
          in2: nativeBackdrop ? "panel-base" : "panel-gray",
          mode: "darken",
          result: nativeBackdrop ? "material-face" : "panel-darken",
        }),
      );
      // A 10% Darken paint is the same premultiplied blend, including alpha.
      // Using the backdrop once avoids evaluating its optical graph twice.
      // Copied WebKit input keeps the stages matched by the integer GPU backend.
      if (!nativeBackdrop)
        filter.append(
          primitive("feComposite", {
            in: "panel-darken",
            in2: "panel-base",
            operator: "arithmetic",
            k2: 0.1,
            k3: 0.9,
            result: "material-face",
          }),
        );
    } else {
      // The exported fill array is painted forward: 70%, then 90%
      // Luminosity, then opaque Lighten. Native blue/warm backdrop probes
      // confirm the final #1a floor; reversing this stack crushes chroma to zero.
      appendLuminosity(filter, source, 0.7, 26 / 255, "panel-base");
      appendLuminosity(filter, "panel-base", 0.9, 26 / 255, "panel-middle");
      filter.append(
        primitive("feFlood", { "flood-color": "#1a1a1a", result: "panel-gray" }),
        primitive("feBlend", {
          in: "panel-middle",
          in2: "panel-gray",
          mode: "lighten",
          result: "material-face",
        }),
      );
    }
  } else if (material.profile === "toggle-knob" || material.profile === "slider-knob") {
    filter.append(
      primitive("feColorMatrix", {
        in: source,
        type: "matrix",
        values: ".91 0 0 0 .09 0 .91 0 0 .09 0 0 .91 0 .09 0 0 0 1 0",
        result: "material-face",
      }),
    );
  } else if (material.profile === "clear") {
    appendLuminosity(filter, source, 0.04, 1, "clear-base");
    filter.append(
      primitive("feColorMatrix", {
        in: "clear-base",
        type: "matrix",
        values: "1 0 0 0 0.0627451 0 1 0 0 0.0627451 0 0 1 0 0.0627451 0 0 0 1 0",
        result: "material-face",
      }),
    );
  } else if (material.mode === "light") {
    // 10411:17582: black 25% → white 25% → #444 Linear Dodge 60%.
    // These three paints fuse to .5625 C + .41 without intermediate clipping.
    filter.append(
      primitive("feColorMatrix", {
        in: source,
        type: "matrix",
        values: ".5625 0 0 0 .41 0 .5625 0 0 .41 0 0 .5625 0 .41 0 0 0 1 0",
        result: "small-base",
      }),
    );
    appendLuminosity(filter, "small-base", 0.2, 248 / 255, "material-face");
  } else {
    // Luminosity paint retains channel differences instead of washing them out with white alpha.
    const alpha = 0.17;
    const gray = 0.6;
    const luma = [0.3, 0.59, 0.11].map((value) => value * alpha);
    const values = [
      1 - luma[0]!,
      -luma[1]!,
      -luma[2]!,
      0,
      alpha * gray,
      -luma[0]!,
      1 - luma[1]!,
      -luma[2]!,
      0,
      alpha * gray,
      -luma[0]!,
      -luma[1]!,
      1 - luma[2]!,
      0,
      alpha * gray,
      0,
      0,
      0,
      1,
      0,
    ];
    filter.append(
      primitive("feColorMatrix", {
        in: source,
        type: "matrix",
        values: values.join(" "),
        result: "material-face",
      }),
    );
  }
  if (!shade) return;
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

// SVG blend uses the source paint operation, including its gamut clipping.
function appendLuminosity(
  filter: SVGElement,
  source: string,
  alpha: number,
  gray: number,
  result: string,
) {
  filter.append(
    primitive("feFlood", {
      "flood-color": `rgb(${gray * 255} ${gray * 255} ${gray * 255})`,
      "flood-opacity": alpha,
      result: `${result}-paint`,
    }),
    primitive("feBlend", { in: `${result}-paint`, in2: source, mode: "luminosity", result }),
  );
}

/** iOS 26 source paint stacks. Native GLASS lighting remains a Web optical adaptation. */
function appendIOS26Material(filter: SVGElement, source: string, material: AppleMaterial) {
  let current = source;
  let index = 0;
  const paint = (color: string, alpha: number, mode = "normal") => {
    const result = `ios26-paint-${index++}`;
    filter.append(
      primitive("feFlood", {
        "flood-color": color,
        "flood-opacity": alpha,
        result: `${result}-color`,
      }),
      primitive("feBlend", { in: `${result}-color`, in2: current, mode, result }),
    );
    current = result;
  };
  if (material.tint) {
    paint("white", 0.75);
    paint("white", 1, "saturation");
    paint("#999", 1, "overlay");
    filter.append(
      primitive("feFlood", { "flood-color": material.tint, result: "ios26-tint" }),
      primitive("feComposite", {
        in: current,
        in2: "ios26-tint",
        operator: "arithmetic",
        k2: 1,
        k3: 1,
        k4: -1,
      }),
    );
    return;
  }
  if (material.profile === "clear") {
    paint("white", 0.07, "screen");
  } else if (material.mode === "dark") {
    paint("#ccc", material.profile === "small" ? 0.5 : 1, "color-burn");
    paint("black", material.profile === "large" ? 0.8 : 0.6);
    paint("white", 0.06);
    // The entire Fill + Shadow layer has 67% opacity, after its paint stack.
    filter.append(
      primitive("feComposite", {
        in: current,
        in2: source,
        operator: "arithmetic",
        k2: 0.67,
        k3: 0.33,
      }),
    );
  } else if (material.profile === "medium" || material.profile === "large") {
    paint("rgb(15% 15% 15%)", 1, "color-dodge");
    paint(
      material.profile === "large" ? "#fafafa" : "#f5f5f5",
      material.profile === "large" ? 0.7 : 0.6,
    );
  } else {
    paint("white", 0.65);
    paint("#ddd", 1, "color-burn");
    paint("rgb(96.9970703125% 96.9970703125% 96.9970703125%)", 1, "darken");
  }
}
