/**
 * Adapted optical renderer.
 * Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT
 * Modified: reference-counted lifetime, Base UI/StyleX composition and opt-in Apple optics.
 */
import { appendAppleMaterial } from "./apple-material.js";
import { foregroundRim, foregroundRimShadow, hasForegroundRim } from "./foreground-rim.js";
import { maps, type Shape, type GeometrySampler, type OpticalFields } from "./optical-fields.js";
export {
  maps,
  type Shape,
  type OpticalPoint,
  type GeometrySampler,
  type OpticalFields,
} from "./optical-fields.js";
import { findBackdrop, copyBackdrop } from "./backdrop.js";
import { paintBackdrop } from "./panel-backdrop.js";
import { paintMaterialBackdrop } from "./backdrop-paints.js";
import { glassIsOpaque, observeGlassPreferences, watchGlassPreferences } from "./preferences.js";
import { attachBackdropSnapshot, type GlassBackdropSource } from "./backdrop-snapshot.js";
import { coreOptics, registerCoreOptics } from "./core-optics.js";
import { whenNearViewport } from "./initial-visibility.js";
import { createResizableFilter } from "./resizable-filter.js";
import { afterGeometrySettles } from "./settled-geometry.js";
import { createLiveRim } from "./live-rim.js";
import { splitFilter } from "./filter-split.js";

// Refraction model: https://kube.io/blog/liquid-glass-css-svg/

const SVG = "http://www.w3.org/2000/svg";
interface Lens {
  width: number;
  height: number;
  silhouette?: string;
  geometryRecipe?: string;
  key: string;
  bytes: number;
  filter: string;
  rim: string;
  foregroundRim?: string;
  node?: SVGElement;
  paint?: SVGElement[];
  users: number;
  sourceReach: number;
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
// Recycle only detached transient graphs after their last optical owner releases
// them. Encoded inputs and decoded RGBA are included in this separate budget.
const geometryGraphs: Lens[] = [];
const GEOMETRY_SPARE_BYTES = 4 * 1024 * 1024;
let geometryBytes = 0;
const pendingLenses = new Map<string, Promise<Lens>>();
let nextId = 0;
let defs: SVGDefsElement | undefined;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function svg(name: string, attributes: Record<string, string | number>): SVGElement {
  const element = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
  return element;
}

function mount(lens: Lens) {
  if (lens.node) container().append(lens.node, ...(lens.paint ?? []));
}

function unmount(lens: Lens) {
  lens.node?.remove();
  for (const node of lens.paint ?? []) node.remove();
}

function container(): SVGDefsElement {
  if (defs?.isConnected) return defs;
  const root = svg("svg", { width: 0, height: 0, "aria-hidden": "true" });
  root.setAttribute("data-lenso-glass-optics", "");
  root.style.cssText = "position:absolute;pointer-events:none";
  defs = svg("defs", {}) as SVGDefsElement;
  root.append(defs);
  document.body.append(root);
  return defs;
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
    mount(spare);
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
  fields?: OpticalFields,
  fieldBox?: { x: number; y: number; width: number; height: number },
): Promise<Lens> {
  shape = { ...shape, materialForeground: !selection && !geometry && hasForegroundRim(shape) };
  const [prepared, foreground] = await Promise.all([
    fields ?? maps(width, height, radius, selection, shape, geometry, !filtered),
    !selection && !geometry && hasForegroundRim(shape)
      ? foregroundRim(width, height, radius, shape)
      : undefined,
  ]);
  const { displacement, highlight, zoom, scale, shade, contour, silhouette } = prepared;
  if (!filtered) {
    const image = new Image();
    image.src = foreground ?? highlight;
    await image.decode();
    const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
    const result: Lens = {
      width,
      height,
      key,
      bytes:
        (highlight.length + (foreground?.length ?? 0)) * 2 +
        Math.ceil((width + 2) * density) * Math.ceil((height + 2) * density) * 4,
      filter: "",
      rim: `url("${highlight}")`,
      foregroundRim: foreground ? `url("${foreground}")` : undefined,
      users: 0,
      sourceReach: 0,
    };
    lenses.set(key, result);
    return result;
  }
  const sourceReach = (Math.abs(scale) * (1 + shape.dispersion * 0.1)) / 2;
  const sourceMargin = Math.ceil(sourceReach + (shape.sourceBlur ?? 3) * 3 + 1);
  const geometryRecipe = geometry
    ? JSON.stringify([shape, scale, zoom?.scale, !!shade, !!contour])
    : undefined;
  const spareIndex = geometryRecipe
    ? geometryGraphs.findIndex((lens) => lens.geometryRecipe === geometryRecipe)
    : -1;
  const recycled = spareIndex >= 0 ? geometryGraphs.splice(spareIndex, 1)[0] : undefined;
  if (recycled) geometryBytes -= recycled.bytes;
  const id = recycled?.node?.id ?? `lenso-glass-${nextId++}`;
  const box = { x: 0, y: 0, width, height };
  const imageBox = fieldBox ?? box;
  const attributes = {
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
  };
  const filter = recycled?.node ?? svg("filter", attributes);
  if (recycled) {
    for (const [name, value] of Object.entries(attributes))
      if (filter.getAttribute(name) !== String(value)) filter.setAttribute(name, String(value));
    const sources: Record<string, string | undefined> = {
      field: displacement,
      shine: highlight,
      "edge-mask": highlight,
      zoom: zoom?.map,
      "material-shade": shade,
      "contour-paint": contour,
    };
    for (const image of filter.querySelectorAll("feImage")) {
      const result = image.getAttribute("result")!;
      const attrs = {
        ...imageBox,
        href: sources[result]!,
      };
      for (const [name, value] of Object.entries(attrs))
        if (image.getAttribute(name) !== String(value)) image.setAttribute(name, String(value));
    }
  }

  if (!recycled) {
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
      // On a fitted circular button, WebKit needs the full blur margin for the
      // copied backdrop. Each displaced colour only needs its maximum reach
      // plus a guard for interpolation and the following 0.4 px blur.
      const rayMargin = Math.ceil(sourceReach) + 4;
      const rayRegion =
        !selection &&
        !geometry &&
        shape.appleMode &&
        shape.materialProfile === "small" &&
        width === height &&
        radius === width / 2 &&
        /AppleWebKit\//.test(navigator.userAgent) &&
        !refractsBackdrop()
          ? {
              x: -rayMargin,
              y: -rayMargin,
              width: width + 2 * rayMargin,
              height: height + 2 * rayMargin,
            }
          : undefined;
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
            ...rayRegion,
            scale: scale * factor,
            xChannelSelector: "R",
            yChannelSelector: "G",
            result: `${name}-ray`,
          }),
          svg("feColorMatrix", { in: `${name}-ray`, type: "matrix", values, result: name }),
        );
      }
      filter.append(
        svg("feComposite", {
          in: "r",
          in2: "g",
          operator: "arithmetic",
          k2: 1,
          k3: 1,
          result: "rg",
        }),
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
      // WebKit quantizes tiny Gaussian radii. Blend the regular softened face
      // with the bent source so approaching clear glass stays continuous.
      const softness = shape.anchorEdge
        ? 0
        : shape.appleMode && !refractsBackdrop()
          ? 1 - (shape.materialProfile === "clear" ? 1 : (shape.materialClarity ?? 0))
          : 1;
      const blend = softness > 0 && softness < 1;
      filter.append(
        svg("feGaussianBlur", {
          in: "bent",
          stdDeviation: softness === 0 ? 0 : 0.4,
          result: blend ? "post-softened" : "displaced",
          ...(shape.appleMode ? { edgeMode: "duplicate" } : {}),
        }),
        ...(blend
          ? [
              svg("feComposite", {
                in: "bent",
                in2: "post-softened",
                operator: "arithmetic",
                k2: 1 - softness,
                k3: softness,
                result: "displaced",
              }),
            ]
          : []),
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
    if (shape.appleMode) {
      appendAppleMaterial(
        filter,
        shape.saturation > 1 ? "optical-face" : "face",
        imageBox,
        {
          mode: shape.appleMode,
          tint: shape.materialTint,
          profile: shape.materialProfile,
          size: shape.materialSize,
          surface: shape.materialSurface,
          clarity: shape.materialClarity,
          foreground: shape.materialForeground,
        },
        shade,
        contour,
        refractsBackdrop(),
      );
    }
  }
  // Installing an SVG filter before its PNG inputs decode blanks the entire
  // material face for a compositor frame, even when the preceding lens is warm.
  await Promise.all(
    [...filter.querySelectorAll("feImage")]
      .map((node) => node.getAttribute("href"))
      .concat(foreground ?? [])
      .map(async (source) => {
        if (!source) return;
        const image = new Image();
        image.src = source;
        await image.decode();
      }),
  );
  if (!geometry && !selection) {
    const input = coreOptics(width, height, radius, shape);
    if (input) registerCoreOptics(filter, input);
  }
  for (const node of recycled?.paint ?? []) node.remove();
  const paint =
    filtered && shape.appleMode && refractsBackdrop()
      ? splitFilter(filter, shape.saturation > 1 ? "optical-face" : "face")
      : undefined;
  container().append(filter, ...(paint?.nodes ?? []));

  const density = shape.appleMode ? 2 : Math.min(devicePixelRatio || 1, 2);
  const decodedBytes = Math.ceil(width * density) * Math.ceil(height * density) * 4;
  const result: Lens = {
    width,
    height,
    geometryRecipe,
    silhouette,
    key,
    bytes:
      [displacement, highlight, zoom?.map, shade, contour].reduce(
        (total, data) => total + (data ? data.length * 2 + decodedBytes : 0),
        0,
      ) +
      (foreground
        ? foreground.length * 2 +
          Math.ceil((width + 2) * density) * Math.ceil((height + 2) * density) * 4
        : 0),
    filter: paint?.value ?? `url("#${id}")`,
    rim: `url("${highlight}")`,
    foregroundRim: foreground ? `url("${foreground}")` : undefined,
    node: filter,
    paint: paint?.nodes,
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
  fields?: OpticalFields,
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
  let live = true;
  return {
    filter: lens.filter,
    rim: lens.rim,
    silhouette: lens.silhouette,
    sourceReach: lens.sourceReach,
    destroy: () => {
      if (!live) return;
      live = false;
      unmount(lens);
      if (!lens.geometryRecipe || lens.bytes > GEOMETRY_SPARE_BYTES) return;
      while (
        geometryGraphs.length &&
        (geometryGraphs.length >= 8 || geometryBytes + lens.bytes > GEOMETRY_SPARE_BYTES)
      )
        geometryBytes -= geometryGraphs.shift()!.bytes;
      geometryGraphs.push(lens);
      geometryBytes += lens.bytes;
    },
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
      size: shape.materialSize,
      surface: shape.materialSurface,
      clarity: shape.materialClarity,
      foreground: shape.materialForeground,
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
    materialSize: clamp(length("--lg-material-size") ?? (Math.min(width, height) - 60) / 60, 0, 1),
    materialClarity: length("--lenso-glass-clarity") ?? 0,
    materialProfile: (style.getPropertyValue("--apple-material-profile").trim() || "small") as
      | "small"
      | "medium"
      | "large"
      | "clear"
      | "toggle-knob"
      | "slider-knob",
    sourceBlur: length("--lg-blur"),
    materialTint:
      style.getPropertyValue("--lg-material").trim() === "apple" &&
      element.dataset["variant"] === "prominent"
        ? getComputedStyle(element, "::before").backgroundColor
        : undefined,
  };
  return { width, height, radius, shape };
}

/** Paint a transformed surface's foreground in visible pixels without refitting its optical input. */
export function createGlassContour(surface: HTMLElement) {
  let element: HTMLElement | null = null;
  let rim: ReturnType<typeof createLiveRim> | undefined;
  let geometry: ReturnType<typeof readLens>;
  let stop: (() => void) | undefined;
  const clear = () => rim?.destroy();
  return {
    paint(
      width: number,
      height: number,
      radius: number,
      layout: { width: number; height: number },
    ) {
      const current = surface.querySelector<HTMLElement>("[data-material-lens]");
      if (current !== element) {
        clear();
        stop?.();
        element = current;
        geometry = undefined;
        rim = element ? createLiveRim(element) : undefined;
        stop = element
          ? observeGlassPreferences(element, () => {
              geometry = undefined;
            })
          : undefined;
      }
      if (!element) return;
      geometry ??= readLens(element);
      if (geometry) rim!.paint(width, height, radius, geometry.shape, layout);
    },
    clear,
    destroy() {
      clear();
      stop?.();
    },
  };
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
  element.style.setProperty("--lg-rim", fitted.foregroundRim ? "none" : rim);
  if (fitted.foregroundRim) {
    element.style.setProperty("--lg-foreground-rim", fitted.foregroundRim);
    element.style.setProperty("--lg-foreground-shadow", foregroundRimShadow(shape.materialSize));
    element.setAttribute("data-lenso-glass-foreground-rim", "");
  } else {
    element.removeAttribute("data-lenso-glass-foreground-rim");
    element.style.removeProperty("--lg-foreground-rim");
    element.style.removeProperty("--lg-foreground-shadow");
  }
  return fitted;
}

function release(fitted: Lens | undefined) {
  if (!fitted || --fitted.users > 0) return;
  unmount(fitted);
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
  let resized: ReturnType<typeof createResizableFilter> | undefined;
  let fittedSize = "";
  let fittedAppearance = "";
  const liveRim = !selection ? createLiveRim(element) : undefined;
  const paintRim = () => {
    if (!liveRim || !nearViewport) return;
    const pressed = element.matches("[data-lenso-light-pressed], [data-lenso-key-pressed]");
    if ((!liveGeometry && !pressed) || element.hasAttribute("data-lenso-glass-fused")) {
      liveRim.destroy();
      return;
    }
    const geometry = readLens(element);
    if (geometry) {
      // Brighten only the foreground; pressing must not invalidate backdrop optics or tone.
      if (pressed) geometry.shape.materialClarity = 1;
      liveRim.paint(geometry.width, geometry.height, geometry.radius, geometry.shape);
    }
  };
  const pressedRim = !selection ? new MutationObserver(paintRim) : undefined;
  pressedRim?.observe(element, {
    attributes: true,
    attributeFilter: [
      "data-lenso-light-pressed",
      "data-lenso-key-pressed",
      "data-lenso-glass-fused",
    ],
  });
  const resizeFitted = (force = false) => {
    if (!fitted || selection || fittedAppearance !== appearance) return;
    const geometry = readLens(element);
    if (!geometry) return;
    const { width, height } = geometry;
    if (
      `${width}:${height}` === fittedSize &&
      !element.hasAttribute("data-material-resizing") &&
      !force
    )
      return;
    if (liveGeometry && geometry.shape.appleMode) {
      // A decoded circle/capsule field cannot follow a changing aspect ratio.
      // Keep the material transfer and live foreground until a fit settles.
      if (filtered) {
        material ??= createMaterialLens({
          ...geometry.shape,
          materialForeground:
            liveGeometry && liveRim !== undefined && hasForegroundRim(geometry.shape),
        });
        element.style.setProperty("--lg-filter", material.filter);
      }
      element.style.setProperty("--lg-rim", "none");
      element.setAttribute("data-material-resizing", "");
      return;
    }
    if (!fitted.node || !refractsBackdrop()) return;
    resized ??= createResizableFilter(fitted.node, `lenso-glass-${nextId++}`);
    resized.resize(width, height);
    element.style.setProperty("--lg-filter", resized.filter);
    element.style.setProperty("--lg-rim", "none");
    element.setAttribute("data-material-resizing", "");
  };
  let appearance = "";
  const refreshMaterial = () => {
    if (!filtered || selection) return;
    const geometry = readLens(element);
    if (!geometry?.shape.appleMode) return;
    const { shape } = geometry;
    const next = JSON.stringify([
      shape.appleMode,
      shape.materialProfile,
      shape.materialTint,
      shape.materialSize,
      shape.materialClarity,
      shape.sourceBlur,
    ]);
    if (next === appearance) return;
    appearance = next;
    const previous = material;
    material = createMaterialLens({
      ...shape,
      materialForeground: liveGeometry && liveRim !== undefined && hasForegroundRim(shape),
    });
    // Color transfer is synchronous; decoded geometry can replace it later.
    element.style.setProperty("--lg-filter", material.filter);
    element.setAttribute("data-material-filter", "");
    resized?.destroy();
    resized = undefined;
    // A class/appearance update during a morph also invalidates the old rim.
    element.toggleAttribute("data-material-resizing", liveGeometry && fitted !== undefined);
    if (liveGeometry && fitted) element.style.setProperty("--lg-rim", "none");
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
    if (liveGeometry && fitted && radiusTransitions.size) return;
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
          fittedSize = `${next.width}:${next.height}`;
          fittedAppearance = appearance;
          resized?.destroy();
          resized = undefined;
          element.removeAttribute("data-material-resizing");
          material?.destroy();
          material = undefined;
          release(previous);
          resizeFitted(radiusTransitions.size > 0);
        })
        .finally(() => {
          fitting = false;
          if (liveGeometry && pendingGeometry) {
            pendingGeometry = false;
            schedule(false);
          }
        });
    };
    if (idle) cancel = whenIdle(run);
    else if (liveGeometry && fitted) cancel = afterGeometrySettles(run);
    else frame = requestAnimationFrame(run);
  };
  const stopWaiting = whenNearViewport(element, () => {
    nearViewport = true;
    paintRim();
    refreshMaterial();
    schedule(!liveGeometry);
  });
  const observer = new ResizeObserver(() => {
    // Layout changes before paint; never show a narrow filter region on a wider surface.
    // Live geometry keeps its material transfer while exact optics wait for rest.
    paintRim();
    resizeFitted();
    schedule(!liveGeometry, liveGeometry);
  });
  observer.observe(element);
  const surface = element.parentElement;
  let rimFrame: number | undefined;
  const animateRim = () => {
    paintRim();
    rimFrame = radiusTransitions.size ? requestAnimationFrame(animateRim) : undefined;
  };
  const radiusStart = (event: TransitionEvent) => {
    if (
      (event.target !== surface && event.target !== element) ||
      !event.propertyName.endsWith("radius")
    )
      return;
    radiusTransitions.add(event.propertyName);
    if (rimFrame === undefined) animateRim();
    resizeFitted(true);
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
          paintRim();
          if (nearViewport) refreshMaterial();
          schedule(false, true);
        })
      : undefined;
  for (let node: HTMLElement | null = element; node && themes; node = node.parentElement)
    themes.observe(node, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
  return () => {
    disposed = true;
    generation++;
    stopWaiting();
    themes?.disconnect();
    pressedRim?.disconnect();
    if (frame !== undefined) cancelAnimationFrame(frame);
    if (rimFrame !== undefined) cancelAnimationFrame(rimFrame);
    liveRim?.destroy();
    cancel?.();
    observer.disconnect();
    surface?.removeEventListener("transitionrun", radiusStart);
    surface?.removeEventListener("transitionend", radiusEnd);
    surface?.removeEventListener("transitioncancel", radiusEnd);
    resized?.destroy();
    release(fitted);
    material?.destroy();
    element.removeAttribute("data-material-filter");
    element.removeAttribute("data-material-resizing");
    element.style.removeProperty("--lg-filter");
    element.style.removeProperty("--lg-rim");
    element.removeAttribute("data-lenso-glass-foreground-rim");
    element.style.removeProperty("--lg-foreground-rim");
    element.style.removeProperty("--lg-foreground-shadow");
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
  const native = refractsBackdrop();
  // Native WebKit paint avoids rebuilding marked page content on control changes.
  const nativeBlur = !native && /AppleWebKit\//.test(navigator.userAgent);
  let ownedBackdrop: ReturnType<GlassBackdropSource>;
  if (backdropSource && liveBackdrop && !selection && !liveGeometry) {
    try {
      const input = backdropSource(element);
      if (
        input &&
        input.source.ownerDocument === element.ownerDocument &&
        !input.source.contains(element) &&
        !element.contains(input.source)
      )
        ownedBackdrop = input;
    } catch {
      // A declined page owner leaves the ordinary backdrop-copy path available.
    }
  }
  const canCopy =
    !nativeBlur &&
    !selection &&
    !ownedBackdrop &&
    (!native || getComputedStyle(element).getPropertyValue("--lg-material").trim() === "apple");
  let source = canCopy ? findBackdrop(sourceAnchor ?? element) : null;
  const filtered = native;
  let stopCopy = source ? copyBackdrop(element, source, false, undefined, 0, native) : undefined;
  const material = [
    "default",
    "glass-small",
    "glass-medium",
    "glass-large",
    "glass-clear",
  ].includes(profileKey ?? "");
  const needsPaint = !filtered && !source;
  const panelPaint = needsPaint && liveBackdrop ? paintBackdrop(element) : undefined;
  let stopPaint: (() => void) | undefined =
    panelPaint ?? (!filtered && material ? paintMaterialBackdrop(element, true) : undefined);
  const ownedGeometry = ownedBackdrop ? readLens(element) : undefined;
  const ownedFilter =
    !!ownedBackdrop &&
    (!ownedGeometry ||
      !coreOptics(
        ownedGeometry.width,
        ownedGeometry.height,
        ownedGeometry.radius,
        ownedGeometry.shape,
      ));
  let stopLens = refract(
    element,
    selection,
    filtered || source !== null || ownedFilter,
    liveGeometry,
  );
  // Hydrated/hidden previews can acquire layout after the ref is attached.
  const stopDiscovery = whenNearViewport(element, () => {
    if (nativeBlur || source || selection || ownedBackdrop) return;
    if (native && getComputedStyle(element).getPropertyValue("--lg-material").trim() !== "apple")
      return;
    const found = findBackdrop(sourceAnchor ?? element);
    if (!found) return;
    source = found;
    if (!material) {
      stopPaint?.();
      stopPaint = undefined;
    }
    stopCopy = copyBackdrop(element, source, false, undefined, 0, native);
    if (!native) {
      stopLens();
      stopLens = refract(element, selection, true, liveGeometry);
    }
  });
  let stopSnapshot: (() => void) | undefined;
  if (ownedBackdrop) {
    try {
      stopSnapshot = attachBackdropSnapshot(element, ownedBackdrop, (active) =>
        panelPaint?.setVisible(!active),
      );
    } catch {
      /* Native material remains visible if the owner cannot be observed. */
    }
  }
  return () => {
    stopDiscovery();
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

/** Fit foreground light while a persistent native backdrop owns the material. */
export function attachGlassRim(element: HTMLElement, selection = false): () => void {
  let opaque: boolean | undefined;
  let stop: (() => void) | undefined;
  const observe = observeGlassPreferences(element, () => {
    const next = glassIsOpaque(element);
    if (next === opaque) return;
    opaque = next;
    stop?.();
    stop = next ? undefined : refract(element, selection, false);
  });
  return () => {
    observe();
    stop?.();
  };
}

export function attachGlass(element: HTMLElement, options: GlassOptions = {}): () => void {
  if (!options.liveBackdrop || !options.backdropSource || refractsBackdrop())
    return watchGlassPreferences(element, () => attachOptics(element, options));
  // Portalled live surfaces can use native paint until their first layout is complete.
  let stop: (() => void) | undefined;
  const cancel = whenNearViewport(element, () => {
    stop = watchGlassPreferences(element, () => attachOptics(element, options));
  });
  return () => {
    cancel();
    stop?.();
  };
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
