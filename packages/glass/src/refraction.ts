/**
 * Adapted optical renderer.
 * Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT
 * Modified: reference-counted lifetime, Base UI/StyleX composition and opt-in Apple optics.
 */
import { appleShade, appleContour, appendAppleMaterial } from "./apple-material.js";
import { encodeImageData, encodeOpticalMap } from "./canvas.js";
import { findBackdrop, copyBackdrop } from "./backdrop.js";
import { paintBackdrop } from "./panel-backdrop.js";
import { paintMaterialBackdrop } from "./backdrop-paints.js";
import { glassIsOpaque, watchGlassPreferences } from "./preferences.js";
import { attachBackdropSnapshot, type GlassBackdropSource } from "./backdrop-snapshot.js";
import { whenNearViewport } from "./initial-visibility.js";

// Refraction model: https://kube.io/blog/liquid-glass-css-svg/

const SVG = "http://www.w3.org/2000/svg";
interface Lens {
  silhouette?: string;
  key: string;
  bytes: number;
  filter: string;
  rim: string;
  node?: SVGElement;
  users: number;
  sourceReach: number;
}

export interface Shape {
  anchorEdge?: boolean;
  edgeStrength?: number;
  bezel: number | undefined;
  thickness: number | undefined;
  level: number;
  zoom: number;
  saturation: number;
  dispersion: number;
  faceSaturation: number;
  lightIntensity: number | undefined;
  lightAngle: number;
  bevel: number | undefined;
  splay: number | undefined;
  appleMode: "light" | "dark" | undefined;
  materialTint: string | undefined;
  materialVersion?: "ios26" | "ios27";
  materialProfile?: "small" | "medium" | "large" | "clear" | "toggle-knob" | "slider-knob";
  sourceBlur: number | undefined;
}

const lenses = new Map<string, Lens>();
// Detached lenses retain their encoded fields for remounts, without retaining
// consumers or live filter nodes. Account for encoded strings and decoded RGBA.
const spareLenses = new Map<string, Lens>();
// A DPR 2 main menu and its submenu retain about 9 MB together. Keep that
// working set through dismissal so reopening does not re-encode the child.
const SPARE_BYTES = 16 * 1024 * 1024;
const SPARE_COUNT = 32;
let spareBytes = 0;
const pendingLenses = new Map<string, Promise<Lens>>();
let nextId = 0;
let defs: SVGDefsElement | undefined;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function svg(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function container(): SVGDefsElement {
  if (defs?.isConnected) return defs;
  const root = svg("svg", { width: 0, height: 0, "aria-hidden": "true" });
  root.style.cssText = "position:absolute;pointer-events:none";
  defs = svg("defs", {}) as SVGDefsElement;
  root.append(defs);
  document.body.append(root);
  return defs;
}

function profile(bezel: number, thickness: number): { samples: Float32Array; maximum: number } {
  const samples = new Float32Array(128);
  let maximum = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = Math.max(0.001, i / (samples.length - 1));
    const surface = (1 - (1 - t) ** 4) ** 0.25;
    const incident = Math.atan((1 - t) ** 3 / surface ** 3);
    const refracted = Math.asin(Math.sin(incident) / 1.5);
    samples[i] = Math.tan(incident - refracted) * (thickness + surface * bezel);
    maximum = Math.max(maximum, samples[i]!);
  }
  return { samples, maximum };
}

export interface OpticalPoint {
  distance: number;
  nx: number;
  ny: number;
  thickness?: number;
  localY?: number;
  localHeight?: number;
}
export type GeometrySampler = ((x: number, y: number) => OpticalPoint) & {
  signedDistance?: (x: number, y: number) => number;
};

export async function maps(
  width: number,
  height: number,
  radius: number,
  selection: boolean,
  shape: Shape,
  geometry?: GeometrySampler,
  rimOnly = false,
) {
  const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
  const bezel = shape.bezel ?? clamp(Math.min(width, height) * 0.12, 4, 10);
  const thickness = shape.thickness ?? clamp(Math.min(width, height) * 0.2, 8, 24);
  const { samples, maximum } = profile(bezel, thickness);
  const baseSamples = geometry ? profile(bezel, 0).samples : undefined;
  const slopeSamples = geometry
    ? profile(bezel, 1).samples.map((value, index) => value - baseSamples![index]!)
    : undefined;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * density);
  canvas.height = Math.ceil(height * density);
  const context = canvas.getContext("2d")!;
  const field = context.createImageData(canvas.width, canvas.height);
  const shine = context.createImageData(canvas.width, canvas.height);
  const outline = geometry ? context.createImageData(canvas.width, canvas.height) : undefined;
  const magnify = shape.zoom > 1 ? context.createImageData(canvas.width, canvas.height) : undefined;
  const reach = Math.max(width, height) / 2;
  const direction = selection ? 1 : -1;

  const paint = (x: number, y: number) => {
    const px = ((x + 0.5) * width) / canvas.width - width / 2;
    const py = ((y + 0.5) * height) / canvas.height - height / 2;
    const qx = Math.abs(px) - (width / 2 - radius);
    const qy = Math.abs(py) - (height / 2 - radius);
    const ox = Math.max(qx, 0);
    const oy = Math.max(qy, 0);
    const length = Math.hypot(ox, oy);
    const point = geometry?.(px + width / 2, py + height / 2);
    const distance = point?.distance ?? radius - (length + Math.min(Math.max(qx, qy), 0));
    const nx =
      point?.nx ?? (length > 0 ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0);
    const ny =
      point?.ny ?? (length > 0 ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py));

    let shift = 0;
    if (distance >= 0 && distance < bezel) {
      if (shape.anchorEdge && shape.level > 0) {
        const clearance = Math.min(width, height) * 0.08;
        const band = Math.max(0, bezel - clearance);
        const progress = band ? clamp((distance - clearance) / band, 0, 1) : 0;
        // The bounded slope keeps strokes joined and prevents the field folding back.
        shift =
          (band * 0.22 * (shape.edgeStrength ?? 1) * Math.sin(Math.PI * progress)) /
          (shape.level * (1 + shape.dispersion * 0.1));
      } else {
        const sample = (distance / bezel) * (samples.length - 1);
        const lower = Math.floor(sample);
        const upper = Math.min(lower + 1, samples.length - 1);
        const localThickness = point?.thickness;
        const a =
          localThickness !== undefined && localThickness !== thickness
            ? baseSamples![lower]! + slopeSamples![lower]! * localThickness
            : samples[lower]!;
        const b =
          localThickness !== undefined && localThickness !== thickness
            ? baseSamples![upper]! + slopeSamples![upper]! * localThickness
            : samples[upper]!;
        shift = a + (b - a) * (sample - lower);
      }
    }

    const i = (y * canvas.width + x) * 4;
    if (outline) {
      outline.data[i] = outline.data[i + 1] = outline.data[i + 2] = 255;
      outline.data[i + 3] = Math.round(clamp(0.5 + distance * density, 0, 1) * 255);
    }
    field.data[i] = Math.round(127.5 + ((direction * nx * shift) / maximum) * 127.5);
    field.data[i + 1] = Math.round(127.5 + ((direction * ny * shift) / maximum) * 127.5);
    field.data[i + 2] = 128;
    field.data[i + 3] = 255;

    // A linear field: each point samples from closer to the centre, which
    // enlarges the whole face evenly.
    if (magnify) {
      magnify.data[i] = Math.round(127.5 - (px / reach) * 127.5);
      magnify.data[i + 1] = Math.round(127.5 - (py / reach) * 127.5);
      magnify.data[i + 2] = 128;
      magnify.data[i + 3] = 255;
    }

    const angle = (shape.lightAngle * Math.PI) / 180;
    const ios26Dark = shape.materialVersion === "ios26" && shape.appleMode === "dark";
    const light =
      ios26Dark || shape.lightIntensity === undefined
        ? -(nx + ny) * Math.SQRT1_2
        : nx * Math.sin(angle) - ny * Math.cos(angle);
    const exponent = ios26Dark || shape.splay === undefined ? 3 : 1 / Math.max(0.1, shape.splay);
    const glint = Math.max(light, 0) ** exponent;
    const reflected = Math.max(-light, 0) ** exponent;
    shine.data[i] = shine.data[i + 1] = shine.data[i + 2] = 255;

    let alpha = 0;
    if (distance >= 0 && selection && shape.anchorEdge) {
      const clearance = Math.min(width, height) * 0.08;
      const feather = Math.max(0.75, Math.min(width, height) * 0.02);
      const start = clamp((distance - clearance) / feather, 0, 1);
      const end = clamp((bezel - distance) / feather, 0, 1);
      alpha = start * start * (3 - 2 * start) * end * end * (3 - 2 * end);
    } else if (distance >= 0 && selection) {
      const bands = [0.18, 0.42, 0.66].map((centre) =>
        Math.exp(-(((distance - centre) / 0.22) ** 2)),
      );
      const peak = Math.max(...bands);
      alpha = peak * (0.06 + 0.8 * glint + 0.35 * reflected) * 0.85;
      for (let channel = 0; channel < 3; channel++) {
        shine.data[i + channel] = Math.round(
          255 * (0.65 + 0.35 * (peak ? bands[channel]! / peak : 0)),
        );
      }
    } else if (distance >= 0 && ios26Dark) {
      // The wider directional reflection restores the dark iOS 26 edge.
      // Keep the Figma-derived displacement and face paints independent of it.
      const rim = Math.exp(-(((distance - 0.4) / 0.38) ** 2));
      const bloom = Math.exp(-((distance / (bezel * 0.22)) ** 2));
      alpha = rim * (0.045 + 0.52 * glint + 0.2 * reflected) + bloom * 0.02 * glint;
    } else if (distance >= 0) {
      const rim = Math.exp(
        -(
          ((distance - (shape.bevel === undefined ? 0.4 : shape.bevel / 2)) /
            (shape.bevel === undefined ? 0.38 : shape.bevel * 0.38)) **
          2
        ),
      );
      const bloom = Math.exp(
        -((distance / ((shape.appleMode ? (shape.bevel ?? 1) : bezel) * 0.22)) ** 2),
      );
      alpha =
        rim *
          ((shape.appleMode ? 0.015 : 0.045) +
            (shape.lightIntensity ?? 0.52) * glint +
            (shape.appleMode
              ? (shape.lightIntensity ?? 0.25) * (shape.splay ?? 0.2)
              : (shape.lightIntensity ?? 0.2)) *
              reflected) +
        bloom * 0.02 * glint;
    }
    // Pixel coverage calibration against the native kit, independent of its light-intensity input.
    if (shape.appleMode && !ios26Dark) alpha *= 0.8;
    shine.data[i + 3] = Math.round(clamp(alpha, 0, 1) * 255);
  };
  const fieldWords = new Uint32Array(field.data.buffer);
  const shineWords = new Uint32Array(shine.data.buffer);
  const px = (x: number) => ((x + 0.5) * width) / canvas.width - width / 2;
  let straightStart = Math.max(0, Math.ceil((radius * canvas.width) / width - 0.5));
  let straightEnd = Math.min(
    canvas.width,
    Math.floor(((width - radius) * canvas.width) / width - 0.5) + 1,
  );
  while (straightStart < straightEnd && Math.abs(px(straightStart)) > width / 2 - radius)
    straightStart++;
  while (straightEnd > straightStart && Math.abs(px(straightEnd - 1)) > width / 2 - radius)
    straightEnd--;
  // Only repeated pixels are copied. In the central rectangle the displacement
  // is neutral and both Gaussian bands round to zero at this distance; the
  // straight side rims are identical from row to row. Other profiles fall back.
  const repeatCenter =
    !geometry &&
    !!shape.appleMode &&
    !selection &&
    !magnify &&
    radius >= bezel &&
    (shape.bevel ?? 1) > 0 &&
    radius >= 8 * (shape.bevel ?? 1) &&
    (shape.lightIntensity ?? 0.52) >= 0 &&
    (shape.lightIntensity ?? 0.52) <= 1 &&
    (shape.splay ?? 0.2) >= 0 &&
    (shape.splay ?? 0.2) <= 1;
  let centerRow = -1;
  for (let y = 0; y < canvas.height; y++) {
    const py = ((y + 0.5) * height) / canvas.height - height / 2;
    const straightY = Math.abs(py) < height / 2 - radius;
    const row = y * canvas.width;
    if (repeatCenter && straightY && centerRow >= 0) {
      fieldWords.copyWithin(row, centerRow, centerRow + canvas.width);
      shineWords.copyWithin(row, centerRow, centerRow + canvas.width);
      continue;
    }
    for (let x = 0; x < canvas.width; x++) {
      paint(x, y);
      // Across a horizontal straight rim, distance and normal are constant.
      // Magnification depends on x, so that field keeps the original path.
      if (!geometry && !magnify && !straightY && x === straightStart && straightEnd > x) {
        fieldWords.fill(fieldWords[row + x]!, row + x + 1, row + straightEnd);
        shineWords.fill(shineWords[row + x]!, row + x + 1, row + straightEnd);
        x = straightEnd - 1;
      }
    }
    if (repeatCenter && straightY) centerRow = row;
  }

  const material =
    !rimOnly && shape.appleMode
      ? {
          mode: shape.appleMode,
          tint: shape.materialTint,
          profile: shape.materialProfile,
          version: shape.materialVersion,
        }
      : undefined;
  const encode = geometry ? encodeOpticalMap : encodeImageData;
  const [displacement, highlight, zoomMap, contour, shade, silhouette] = await Promise.all([
    rimOnly ? "" : encode(field),
    encode(shine),
    !rimOnly && magnify ? encodeImageData(magnify) : undefined,
    material
      ? appleContour(
          width,
          height,
          radius,
          density,
          material,
          geometry
            ? (x, y) => -(geometry.signedDistance?.(x, y) ?? geometry(x, y).distance)
            : undefined,
        )
      : undefined,
    material
      ? appleShade(
          width,
          height,
          density,
          material,
          geometry
            ? (x, y) => {
                const point = geometry(x, y);
                return { y: point.localY ?? y, height: point.localHeight ?? height };
              }
            : undefined,
        )
      : undefined,
    outline ? encode(outline) : undefined,
  ]);
  return {
    displacement,
    highlight,
    zoom: zoomMap ? { map: zoomMap, scale: 2 * reach * (1 - 1 / shape.zoom) } : undefined,
    scale: maximum * 2 * shape.level,
    contour,
    shade,
    silhouette,
  };
}

// The filter only bends the rim. Blur and the rim highlight are applied in CSS,
// which Chromium positions correctly when it repaints part of the glass.
async function lens(
  width: number,
  height: number,
  radius: number,
  selection: boolean,
  shape: Shape,
  filtered = true,
): Promise<Lens> {
  const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
  const opticalKey = Object.values({ width, height, radius, selection, ...shape, density }).join(
    "-",
  );
  const key = (filtered ? "" : "rim-") + opticalKey;
  const cached = lenses.get(key);
  if (cached) {
    cached.users++;
    return cached;
  }
  const spare = spareLenses.get(key);
  if (spare) {
    spareLenses.delete(key);
    spareBytes -= spare.bytes;
    spare.users = 1;
    if (spare.node) container().append(spare.node);
    lenses.set(key, spare);
    return spare;
  }
  let pending = pendingLenses.get(key);
  if (!pending) {
    // An explicit prewarm may already own the identical rim in its full lens.
    if (
      !filtered &&
      (lenses.has(opticalKey) || spareLenses.has(opticalKey) || pendingLenses.has(opticalKey))
    )
      return lens(width, height, radius, selection, shape);
    pending = buildLens(width, height, radius, selection, shape, key, filtered);
    pendingLenses.set(key, pending);
    void pending.finally(() => pendingLenses.delete(key));
  }
  const result = await pending;
  result.users++;
  return result;
}

async function buildLens(
  width: number,
  height: number,
  radius: number,
  selection: boolean,
  shape: Shape,
  key: string,
  filtered: boolean,
  geometry?: GeometrySampler,
  fields?: Awaited<ReturnType<typeof maps>>,
  fieldBox?: { x: number; y: number; width: number; height: number },
): Promise<Lens> {
  const { displacement, highlight, zoom, scale, shade, contour, silhouette } =
    fields ?? (await maps(width, height, radius, selection, shape, geometry, !filtered));
  if (!filtered) {
    const image = new Image();
    image.src = highlight;
    await image.decode();
    const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
    const result: Lens = {
      key,
      bytes: highlight.length * 2 + Math.ceil(width * density) * Math.ceil(height * density) * 4,
      filter: "",
      rim: `url("${highlight}")`,
      users: 0,
      sourceReach: 0,
    };
    lenses.set(key, result);
    return result;
  }
  const sourceReach = (Math.abs(scale) * (1 + shape.dispersion * 0.1)) / 2;
  const sourceMargin = Math.ceil(sourceReach + (shape.sourceBlur ?? 3) * 3 + 1);
  const id = `lenso-glass-${nextId++}`;
  const box = { x: 0, y: 0, width, height };
  const imageBox = fieldBox ?? box;
  const filter = svg("filter", {
    id,
    ...box,
    // WebKit clips copied HTML input with a user-space filter region.
    ...((selection || shape.appleMode) && !refractsBackdrop()
      ? {
          filterUnits: "objectBoundingBox",
          x: -sourceMargin / width,
          y: -sourceMargin / height,
          width: 1 + (2 * sourceMargin) / width,
          height: 1 + (2 * sourceMargin) / height,
        }
      : {
          filterUnits: "userSpaceOnUse",
          ...(selection
            ? {
                x: -sourceMargin,
                y: -sourceMargin,
                width: width + 2 * sourceMargin,
                height: height + 2 * sourceMargin,
              }
            : shape.appleMode
              ? { x: -1, y: -1, width: width + 2, height: height + 2 }
              : {}),
        }),
    primitiveUnits: "userSpaceOnUse",
    "color-interpolation-filters": "sRGB",
  });

  filter.append(
    svg("feImage", {
      href: displacement,
      ...imageBox,
      preserveAspectRatio: "none",
      result: "field",
    }),
  );

  if (!selection) {
    if (zoom) {
      filter.append(
        svg("feImage", {
          href: zoom.map,
          ...imageBox,
          preserveAspectRatio: "none",
          result: "zoom",
        }),
        svg("feDisplacementMap", {
          in: "SourceGraphic",
          in2: "zoom",
          scale: zoom.scale,
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "magnified",
        }),
      );
    }
  }
  if (selection || shape.dispersion > 0) {
    const spread = selection && shape.dispersion === 0 ? 0.035 : shape.dispersion * 0.1;
    const alpha = selection ? "0 0 0 0 1" : "0 0 0 1 0";
    const channels = [
      ["r", 1 + spread, `1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${alpha}`],
      ["g", 1, `0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 ${alpha}`],
      ["b", 1 - spread, `0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 ${alpha}`],
    ] as const;
    for (const [name, factor, values] of channels) {
      filter.append(
        svg("feDisplacementMap", {
          in: zoom ? "magnified" : "SourceGraphic",
          in2: "field",
          scale: scale * factor,
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: `${name}-ray`,
        }),
        svg("feColorMatrix", { in: `${name}-ray`, type: "matrix", values, result: name }),
      );
    }
    filter.append(
      svg("feComposite", { in: "r", in2: "g", operator: "arithmetic", k2: 1, k3: 1, result: "rg" }),
      svg("feComposite", {
        in: "rg",
        in2: "b",
        operator: "arithmetic",
        k2: 1,
        k3: 1,
        result: selection ? "spectral-rgb" : "bent",
      }),
    );
    if (selection) {
      // Adding the three transparent glyph alphas creates opaque dark fringes.
      // Restore the displaced glyph alpha after recombining its color channels.
      filter.append(
        svg("feComposite", {
          in: "spectral-rgb",
          in2: "g-ray",
          operator: "in",
          result: "spectral",
        }),
        svg("feComposite", {
          in: "spectral",
          in2: "g-ray",
          operator: "arithmetic",
          k2: 0.35,
          k3: 0.65,
          ...(shape.anchorEdge ? { result: "foreground-bent" } : {}),
        }),
      );
      if (shape.anchorEdge) {
        filter.append(
          svg("feImage", {
            href: highlight,
            ...imageBox,
            preserveAspectRatio: "none",
            result: "edge-mask",
          }),
          svg("feComposite", {
            in: "foreground-bent",
            in2: "edge-mask",
            operator: "in",
            result: "foreground-edge",
          }),
          svg("feComposite", {
            in: "SourceGraphic",
            in2: "edge-mask",
            operator: "out",
            result: "foreground-centre",
          }),
          svg("feComposite", {
            in: "foreground-edge",
            in2: "foreground-centre",
            operator: "arithmetic",
            k2: 1,
            k3: 1,
          }),
        );
      }
    }
  }
  if (!selection) {
    if (shape.dispersion === 0) {
      filter.append(
        svg("feDisplacementMap", {
          in: zoom ? "magnified" : "SourceGraphic",
          in2: "field",
          scale,
          xChannelSelector: "R",
          yChannelSelector: "G",
          result: "bent",
        }),
      );
    }
    // Sub-pixel smoothing also applies after spectral recombination.
    filter.append(
      svg("feGaussianBlur", {
        in: "bent",
        stdDeviation: shape.anchorEdge ? 0 : 0.4,
        result: "displaced",
        ...(shape.appleMode ? { edgeMode: "duplicate" } : {}),
      }),
      svg("feColorMatrix", {
        in: "displaced",
        type: "saturate",
        values: shape.faceSaturation,
        result: "face",
      }),
    );
    // Along the rim highlight, show the bent backdrop far more saturated, so
    // strong edges break into colour where they cross it.
    if (shape.saturation > 1) {
      const mask = svg("feComponentTransfer", { in: "shine", result: "mask" });
      mask.append(svg("feFuncA", { type: "linear", slope: 1.8 }));
      filter.append(
        svg("feColorMatrix", {
          in: "displaced",
          type: "saturate",
          values: shape.saturation,
          result: "vivid",
        }),
        svg("feImage", {
          href: highlight,
          ...imageBox,
          preserveAspectRatio: "none",
          result: "shine",
        }),
        mask,
        svg("feComposite", { in: "vivid", in2: "mask", operator: "in", result: "edge" }),
        svg("feBlend", { in: "edge", in2: "face", mode: "normal", result: "optical-face" }),
      );
    }
  }
  if (shape.appleMode && shade) {
    appendAppleMaterial(
      filter,
      shape.saturation > 1 ? "optical-face" : "face",
      imageBox,
      {
        mode: shape.appleMode,
        tint: shape.materialTint,
        profile: shape.materialProfile,
        version: shape.materialVersion,
      },
      shade,
      contour,
      refractsBackdrop(),
    );
  }
  // Installing an SVG filter before its PNG inputs decode blanks the entire
  // material face for a compositor frame, even when the preceding lens is warm.
  await Promise.all(
    [...filter.querySelectorAll("feImage")].map(async (node) => {
      const source = node.getAttribute("href");
      if (!source) return;
      const image = new Image();
      image.src = source;
      await image.decode();
    }),
  );
  container().append(filter);

  const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
  const decodedBytes = Math.ceil(width * density) * Math.ceil(height * density) * 4;
  const result = {
    silhouette,
    key,
    bytes: [displacement, highlight, zoom?.map, shade, contour].reduce(
      (total, data) => total + (data ? data.length * 2 + decodedBytes : 0),
      0,
    ),
    filter: `url("#${id}")`,
    rim: `url("${highlight}")`,
    node: filter,
    users: 0,
    sourceReach,
  };
  if (!geometry) lenses.set(key, result);
  return result;
}

/** A transient lens uses the ordinary material pipeline with an evolving outline. */
export async function createGeometryLens(
  width: number,
  height: number,
  shape: Shape,
  geometry: GeometrySampler,
  fields?: Awaited<ReturnType<typeof maps>>,
  fieldBox?: { x: number; y: number; width: number; height: number },
) {
  const lens = await buildLens(
    width,
    height,
    0,
    false,
    shape,
    "fusion",
    true,
    geometry,
    fields,
    fieldBox,
  );
  return {
    filter: lens.filter,
    rim: lens.rim,
    silhouette: lens.silhouette,
    sourceReach: lens.sourceReach,
    destroy: () => lens.node?.remove(),
  };
}

/** A ready material face while the geometry-specific optical maps are encoding. */
export function createMaterialLens(shape: Shape, shade?: string) {
  const id = `lenso-glass-${nextId++}`;
  const box = { x: 0, y: 0, width: 1, height: 1 };
  const filter = svg("filter", {
    id,
    ...box,
    filterUnits: "objectBoundingBox",
    primitiveUnits: "objectBoundingBox",
    "color-interpolation-filters": "sRGB",
  });

  appendAppleMaterial(
    filter,
    "SourceGraphic",
    box,
    {
      mode: shape.appleMode ?? "light",
      tint: shape.materialTint,
      profile: shape.materialProfile,
      version: shape.materialVersion,
    },
    shade,
  );
  container().append(filter);
  return {
    filter: `url(#${id})`,
    destroy: () => {
      filter.remove();
      if (!defs?.children.length) {
        defs?.parentElement?.remove();
        defs = undefined;
      }
    },
  };
}

export function readLens(element: HTMLElement) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  if (!width || !height) return;
  const style = getComputedStyle(element);
  // A composited morph may counter-scale CSS corners without resizing its
  // optical input. Keep the cached map tied to the input geometry.
  const corner = style.getPropertyValue("--lg-map-radius").trim() || style.borderTopLeftRadius;
  const radius = Math.min(
    width / 2,
    height / 2,
    corner.endsWith("%")
      ? (Math.min(width, height) * parseFloat(corner)) / 100
      : parseFloat(corner),
  );
  const length = (name: string) => {
    const value = parseFloat(style.getPropertyValue(name));
    return Number.isFinite(value) ? value : undefined;
  };
  const bezelRatio = length("--lg-edge-bezel-ratio");
  const shape = {
    anchorEdge: length("--lg-anchor-edge") === 1,
    edgeStrength: length("--lg-edge-strength"),
    bezel: bezelRatio === undefined ? length("--lg-bezel") : Math.min(width, height) * bezelRatio,
    thickness: length("--lg-thickness"),
    level: length("--lg-refraction") ?? 1,
    zoom: Math.max(1, length("--lg-zoom") ?? 1),
    saturation: Math.max(1, length("--lg-rim-saturation") ?? 1),
    dispersion: clamp(length("--lg-dispersion") ?? 0, 0, 1),
    faceSaturation: Math.max(0, length("--lg-saturation") ?? 1.5),
    lightIntensity: length("--lg-light-intensity"),
    lightAngle: length("--lg-light-angle") ?? 0,
    bevel: length("--lg-bevel"),
    splay: length("--lg-splay"),
    appleMode:
      style.getPropertyValue("--lg-material").trim() === "apple"
        ? ((style.getPropertyValue("--lenso-material-action-mode").trim() === "dark"
            ? "dark"
            : "light") as "light" | "dark")
        : undefined,
    materialProfile: (style.getPropertyValue("--apple-material-profile").trim() || "small") as
      | "small"
      | "medium"
      | "large"
      | "clear"
      | "toggle-knob"
      | "slider-knob",
    materialVersion: (style.getPropertyValue("--lenso-material-version").trim() || "ios27") as
      | "ios26"
      | "ios27",
    sourceBlur: length("--lg-blur"),
    materialTint:
      style.getPropertyValue("--lg-material").trim() === "apple" &&
      element.dataset["variant"] === "prominent"
        ? getComputedStyle(element, "::before").backgroundColor
        : undefined,
  };
  if (
    shape.materialVersion === "ios26" &&
    shape.materialProfile === "small" &&
    (shape.appleMode === "dark" || shape.materialTint)
  )
    shape.lightIntensity = 0.6;
  return { width, height, radius, shape };
}

async function fit(
  element: HTMLElement,
  selection: boolean,
  filtered: boolean,
  current: () => boolean,
): Promise<Lens | undefined> {
  const geometry = readLens(element);
  if (!geometry) return;
  const { width, height, radius, shape } = geometry;
  const fitted = await lens(width, height, radius, selection, shape, filtered);
  if (!current()) {
    release(fitted);
    return;
  }
  const { filter, rim } = fitted;
  if (filtered) element.style.setProperty("--lg-filter", filter);
  if (filtered && shape.appleMode) {
    element.style.setProperty("--lg-source-reach", String(fitted.sourceReach));
    element.setAttribute("data-material-filter", "");
  }
  element.style.setProperty("--lg-rim", rim);
  return fitted;
}

function release(fitted: Lens | undefined) {
  if (!fitted || --fitted.users > 0) return;
  fitted.node?.remove();
  lenses.delete(fitted.key);
  if (fitted.bytes <= SPARE_BYTES) {
    spareLenses.set(fitted.key, fitted);
    spareBytes += fitted.bytes;
    while (spareBytes > SPARE_BYTES || spareLenses.size > SPARE_COUNT) {
      const oldest = spareLenses.values().next().value!;
      spareLenses.delete(oldest.key);
      spareBytes -= oldest.bytes;
    }
  }
  if (defs && !defs.hasChildNodes()) {
    defs?.parentElement?.remove();
    defs = undefined;
  }
}

function whenIdle(callback: () => void): () => void {
  if ("requestIdleCallback" in window) {
    const handle = requestIdleCallback(callback, { timeout: 500 });
    return () => cancelIdleCallback(handle);
  }
  const handle = setTimeout(callback, 50);
  return () => clearTimeout(handle);
}

/** Only Chromium applies SVG filters to the live backdrop. */
export const refractsBackdrop = (): boolean => /Chrom(?:e|ium)\//.test(navigator.userAgent);

// Refits the lens whenever the element changes size. Unfiltered, it sets only
// the rim highlight: the nearest Safari and Firefox come to refraction over
// content they have no copy of.
function refract(
  element: HTMLElement,
  selection: boolean,
  filtered: boolean,
  liveGeometry = false,
): () => void {
  let cancel: (() => void) | undefined;
  let fitted: Lens | undefined;
  let generation = 0;
  let disposed = false;
  let frame: number | undefined;
  let fitting = false;
  let pendingGeometry = false;
  let nearViewport = false;
  let material: ReturnType<typeof createMaterialLens> | undefined;
  let appearance = "";
  const refreshMaterial = () => {
    if (!filtered || selection) return;
    const geometry = readLens(element);
    if (!geometry?.shape.appleMode) return;
    const { shape } = geometry;
    const next = JSON.stringify([
      shape.appleMode,
      shape.materialProfile,
      shape.materialVersion,
      shape.materialTint,
    ]);
    if (next === appearance) return;
    appearance = next;
    const previous = material;
    material = createMaterialLens(shape);
    // Color transfer is synchronous; decoded geometry can replace it later.
    element.style.setProperty("--lg-filter", material.filter);
    element.setAttribute("data-material-filter", "");
    previous?.destroy();
  };
  const radiusTransitions = new Set<string>();
  const schedule = (idle: boolean, invalidate = false) => {
    if (disposed || !nearViewport) return;
    // Finish the current small lens instead of starving it with every spring frame.
    if (liveGeometry && fitting) {
      if (invalidate) generation++;
      pendingGeometry = true;
      return;
    }
    cancel?.();
    if (frame !== undefined) cancelAnimationFrame(frame);
    const version = ++generation;
    const current = () => !disposed && generation === version;
    const run = () => {
      frame = undefined;
      fitting = true;
      void fit(element, selection, filtered, current)
        .then((next) => {
          if (!next) return;
          if (!current()) {
            release(next);
            return;
          }
          const previous = fitted;
          fitted = next;
          material?.destroy();
          material = undefined;
          release(previous);
        })
        .finally(() => {
          fitting = false;
          if (liveGeometry && (pendingGeometry || radiusTransitions.size)) {
            pendingGeometry = false;
            schedule(false);
          }
        });
    };
    if (idle) cancel = whenIdle(run);
    else frame = requestAnimationFrame(run);
  };
  const stopWaiting = whenNearViewport(element, () => {
    nearViewport = true;
    refreshMaterial();
    schedule(!liveGeometry);
  });
  const observer = new ResizeObserver(() => schedule(!liveGeometry));
  observer.observe(element);
  const surface = element.parentElement;
  const radiusStart = (event: TransitionEvent) => {
    if (
      (event.target !== surface && event.target !== element) ||
      !event.propertyName.endsWith("radius")
    )
      return;
    radiusTransitions.add(event.propertyName);
    schedule(false);
  };
  const radiusEnd = (event: TransitionEvent) => {
    if (
      (event.target !== surface && event.target !== element) ||
      !event.propertyName.endsWith("radius")
    )
      return;
    radiusTransitions.delete(event.propertyName);
    schedule(false);
  };
  if (liveGeometry) {
    surface?.addEventListener("transitionrun", radiusStart);
    surface?.addEventListener("transitionend", radiusEnd);
    surface?.addEventListener("transitioncancel", radiusEnd);
  }
  // A theme change invalidates an in-flight encode before it can paint stale pixels.
  const themes =
    getComputedStyle(element).getPropertyValue("--lg-material").trim() === "apple"
      ? new MutationObserver(() => {
          if (nearViewport) refreshMaterial();
          schedule(false, true);
        })
      : undefined;
  for (let node: HTMLElement | null = element; node && themes; node = node.parentElement)
    themes.observe(node, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-material-version"],
    });
  return () => {
    disposed = true;
    generation++;
    stopWaiting();
    themes?.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    cancel?.();
    observer.disconnect();
    surface?.removeEventListener("transitionrun", radiusStart);
    surface?.removeEventListener("transitionend", radiusEnd);
    surface?.removeEventListener("transitioncancel", radiusEnd);
    release(fitted);
    material?.destroy();
    element.removeAttribute("data-material-filter");
    element.style.removeProperty("--lg-filter");
    element.style.removeProperty("--lg-rim");
    element.style.removeProperty("--lg-source-reach");
  };
}

export interface GlassOptions {
  selection?: boolean;
  profileKey?: string;
  sourceAnchor?: HTMLElement | null;
  liveBackdrop?: boolean;
  liveGeometry?: boolean;
  /** The owner can supply a complete, invalidatable source for this live material. */
  backdropSource?: GlassBackdropSource;
}

/** Attach decorative optics to a styled element. The caller owns layout and interaction. */
function attachOptics(
  element: HTMLElement,
  {
    selection = false,
    profileKey,
    sourceAnchor,
    liveBackdrop = false,
    liveGeometry = false,
    backdropSource,
  }: GlassOptions = {},
): () => void {
  const native = refractsBackdrop() && !element.hasAttribute("data-material-lens");
  const source = !native && !selection ? findBackdrop(sourceAnchor ?? element) : null;
  const filtered = native || (liveBackdrop && refractsBackdrop() && source === null);
  const stopCopy = source ? copyBackdrop(element, source) : undefined;
  const material = [
    "default",
    "glass-small",
    "glass-medium",
    "glass-large",
    "glass-clear",
  ].includes(profileKey ?? "");
  const stopPaint =
    !filtered && !source
      ? liveBackdrop
        ? paintBackdrop(element)
        : material
          ? paintMaterialBackdrop(element, true)
          : undefined
      : undefined;
  const stopLens = refract(element, selection, filtered || source !== null, liveGeometry);
  let stopSnapshot: (() => void) | undefined;
  if (backdropSource && liveBackdrop && filtered && !selection && !liveGeometry) {
    try {
      const input = backdropSource(element);
      if (
        input &&
        input.source.ownerDocument === element.ownerDocument &&
        !input.source.contains(element) &&
        !element.contains(input.source)
      ) {
        stopSnapshot = attachBackdropSnapshot(element, input);
      }
    } catch {
      // The source may be unavailable; the prepared native lens still owns these pixels.
    }
  }
  return () => {
    stopSnapshot?.();
    stopLens();
    stopCopy?.();
    stopPaint?.();
  };
}

/** Refract a transparent foreground layer without capturing the page backdrop. */
export function attachContentRefraction(element: HTMLElement): () => void {
  return watchGlassPreferences(element, () => refract(element, true, true));
}

export function attachGlass(element: HTMLElement, options: GlassOptions = {}): () => void {
  return watchGlassPreferences(element, () => attachOptics(element, options));
}

export interface GlassPrewarmOptions {
  selection?: boolean;
  signal?: AbortSignal;
}

/**
 * Prepare optical maps during idle time using a mounted, styled element.
 * Does not capture a backdrop, compile GPU pipelines or delay interaction.
 * Aborting skips queued work; an encode already in flight is released on completion.
 */
export async function prewarmGlass(
  element: HTMLElement,
  { selection = false, signal }: GlassPrewarmOptions = {},
): Promise<boolean> {
  if (signal?.aborted || !element.isConnected || glassIsOpaque(element)) return false;
  await new Promise<void>((resolve) => {
    const done = () => {
      cancel();
      signal?.removeEventListener("abort", done);
      resolve();
    };
    const cancel = whenIdle(done);
    signal?.addEventListener("abort", done, { once: true });
  });
  if (signal?.aborted || !element.isConnected) return false;
  const geometry = readLens(element);
  if (!geometry) return false;
  const { width, height, radius, shape } = geometry;
  const fitted = await lens(width, height, radius, selection, shape);
  release(fitted);
  return !signal?.aborted && element.isConnected;
}
