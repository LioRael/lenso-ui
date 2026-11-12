import { lensFilter } from "./filter-split.js";
import type { Shape } from "./refraction.js";

export interface CoreOptics {
  mode: "light" | "dark";
  profile: "small" | "medium";
  width: number;
  height: number;
  radius: number;
  bezel: number;
  thickness: number;
  level: number;
  foreground?: boolean;
}

const inputs = new WeakMap<Element, CoreOptics>();

/** Analytic replacement is valid only for the material equations implemented by the core. */
export function coreOptics(
  width: number,
  height: number,
  radius: number,
  shape: Shape,
): CoreOptics | undefined {
  if (
    radius <= 0 ||
    !shape.appleMode ||
    (shape.materialProfile !== "small" && shape.materialProfile !== "medium") ||
    shape.materialTint ||
    shape.zoom !== 1 ||
    shape.saturation !== 1 ||
    shape.dispersion !== 0.2 ||
    shape.faceSaturation !== 1 ||
    shape.anchorEdge ||
    (shape.edgeStrength !== undefined && shape.edgeStrength !== 1) ||
    (shape.materialClarity ?? 0) !== 0 ||
    shape.sourceBlur !== 15.3
  )
    return;
  return {
    mode: shape.appleMode,
    profile: shape.materialProfile,
    width,
    height,
    radius,
    bezel: shape.bezel ?? Math.min(10, Math.max(4, Math.min(width, height) * 0.12)),
    thickness: shape.thickness ?? Math.min(24, Math.max(8, Math.min(width, height) * 0.2)),
    level: shape.level,
    ...(shape.materialForeground ? { foreground: true } : {}),
  };
}

export function registerCoreOptics(filter: Element, optics: CoreOptics) {
  inputs.set(filter, optics);
}

export function readCoreOptics(filter: string): CoreOptics | undefined {
  const node = lensFilter(filter);
  return node ? inputs.get(node) : undefined;
}
