/**
 * Adapted optical renderer.
 * Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT
 * Modified: worker-safe field preparation and shared geometry samples.
 */
import { appleShade, appleContour, uniformFusionShade } from "./apple-material.js";
import { encodeImageData, encodeOpticalMap } from "./canvas.js";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  materialSize?: number;
  materialSurface?: "group";
  materialForeground?: boolean;
  materialClarity?: number;
  materialProfile?: "small" | "medium" | "large" | "clear" | "toggle-knob" | "slider-knob";
  sourceBlur: number | undefined;
}

export function profile(
  bezel: number,
  thickness: number,
): { samples: Float32Array; maximum: number } {
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
  materialRows?: { top: number; height: number; count: number };
};

export async function maps(
  width: number,
  height: number,
  radius: number,
  selection: boolean,
  shape: Shape,
  geometry?: GeometrySampler,
  rimOnly = false,
  outputs: {
    rim?: boolean;
    contour?: boolean;
    silhouette?: boolean;
  } = {},
) {
  const density = shape.appleMode ? 2 : Math.min(globalThis.devicePixelRatio || 1, 2);
  const bezel = shape.bezel ?? clamp(Math.min(width, height) * 0.12, 4, 10);
  const thickness = shape.thickness ?? clamp(Math.min(width, height) * 0.2, 8, 24);
  const { samples, maximum } = profile(bezel, thickness);
  const baseSamples = geometry ? profile(bezel, 0).samples : undefined;
  const slopeSamples = geometry
    ? profile(bezel, 1).samples.map((value, index) => value - baseSamples![index]!)
    : undefined;

  const pixelWidth = Math.ceil(width * density);
  const pixelHeight = Math.ceil(height * density);
  const field = new ImageData(pixelWidth, pixelHeight);
  const shine = new ImageData(pixelWidth, pixelHeight);
  const outline =
    geometry && outputs.silhouette !== false ? new ImageData(pixelWidth, pixelHeight) : undefined;
  const magnify = shape.zoom > 1 ? new ImageData(pixelWidth, pixelHeight) : undefined;
  const fieldBytes = field.data;
  const shineBytes = shine.data;
  const outlineBytes = outline?.data;
  const magnifyBytes = magnify?.data;
  const reach = Math.max(width, height) / 2;
  const direction = selection ? 1 : -1;
  // A shared fusion plane draws its rim separately. Keep the highlight field
  // when the SVG material itself consumes it for spectral edge saturation.
  const highlightNeeded = outputs.rim !== false || selection || shape.saturation > 1;
  const angle = (shape.lightAngle * Math.PI) / 180;
  const lightX = Math.sin(angle);
  const lightY = Math.cos(angle);
  const exponent = shape.splay === undefined ? 3 : 1 / Math.max(0.1, shape.splay);
  const material =
    !rimOnly && shape.appleMode
      ? {
          mode: shape.appleMode,
          tint: shape.materialTint,
          profile: shape.materialProfile,
          size: shape.materialSize,
          clarity: shape.materialClarity,
          foreground: shape.materialForeground,
          surface: shape.materialSurface,
        }
      : undefined;
  const repeatedShade =
    material && geometry?.materialRows
      ? uniformFusionShade(width, height, density, material, geometry.materialRows)
      : undefined;
  // The shade uses the same sample grid for integral optical planes. Retain
  // only its local coordinates, rather than sampling the union a second time.
  // Fractional planes keep the original, independently positioned shade grid.
  const localCoordinates =
    geometry &&
    !repeatedShade &&
    !rimOnly &&
    shape.appleMode &&
    shape.materialSurface !== "group" &&
    pixelWidth === width * density &&
    pixelHeight === height * density
      ? new Float64Array(pixelWidth * pixelHeight * 2)
      : undefined;

  const paint = (x: number, y: number) => {
    const px = ((x + 0.5) * width) / pixelWidth - width / 2;
    const py = ((y + 0.5) * height) / pixelHeight - height / 2;
    let point: OpticalPoint | undefined;
    let distance: number, nx: number, ny: number;
    if (geometry) {
      point = geometry(px + width / 2, py + height / 2);
      ({ distance, nx, ny } = point);
    } else {
      const qx = Math.abs(px) - (width / 2 - radius);
      const qy = Math.abs(py) - (height / 2 - radius);
      const ox = Math.max(qx, 0);
      const oy = Math.max(qy, 0);
      const length = Math.hypot(ox, oy);
      distance = radius - (length + Math.min(Math.max(qx, qy), 0));
      nx = length > 0 ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0;
      ny = length > 0 ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py);
    }

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

    const i = (y * pixelWidth + x) * 4;
    if (localCoordinates) {
      localCoordinates[i / 2] = point?.localY ?? py + height / 2;
      localCoordinates[i / 2 + 1] = point?.localHeight ?? height;
    }
    if (outline) {
      outlineBytes![i] = outlineBytes![i + 1] = outlineBytes![i + 2] = 255;
      outlineBytes![i + 3] = Math.round(clamp(0.5 + distance * density, 0, 1) * 255);
    }
    fieldBytes[i] = Math.round(127.5 + ((direction * nx * shift) / maximum) * 127.5);
    fieldBytes[i + 1] = Math.round(127.5 + ((direction * ny * shift) / maximum) * 127.5);
    fieldBytes[i + 2] = 128;
    fieldBytes[i + 3] = 255;

    // A linear field: each point samples from closer to the centre, which
    // enlarges the whole face evenly.
    if (magnify) {
      magnifyBytes![i] = Math.round(127.5 - (px / reach) * 127.5);
      magnifyBytes![i + 1] = Math.round(127.5 - (py / reach) * 127.5);
      magnifyBytes![i + 2] = 128;
      magnifyBytes![i + 3] = 255;
    }

    if (!highlightNeeded) return;
    const light =
      shape.lightIntensity === undefined ? -(nx + ny) * Math.SQRT1_2 : nx * lightX - ny * lightY;
    const glint = Math.max(light, 0) ** exponent;
    const reflected = Math.max(-light, 0) ** exponent;
    shineBytes[i] = shineBytes[i + 1] = shineBytes[i + 2] = 255;

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
        shineBytes[i + channel] = Math.round(
          255 * (0.65 + 0.35 * (peak ? bands[channel]! / peak : 0)),
        );
      }
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
    if (shape.appleMode) alpha *= 0.8;
    shineBytes[i + 3] = Math.round(clamp(alpha, 0, 1) * 255);
  };
  const fieldWords = new Uint32Array(fieldBytes.buffer);
  const shineWords = new Uint32Array(shineBytes.buffer);
  const px = (x: number) => ((x + 0.5) * width) / pixelWidth - width / 2;
  let straightStart = Math.max(0, Math.ceil((radius * pixelWidth) / width - 0.5));
  let straightEnd = Math.min(
    pixelWidth,
    Math.floor(((width - radius) * pixelWidth) / width - 0.5) + 1,
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
  for (let y = 0; y < pixelHeight; y++) {
    const py = ((y + 0.5) * height) / pixelHeight - height / 2;
    const straightY = Math.abs(py) < height / 2 - radius;
    const row = y * pixelWidth;
    if (repeatCenter && straightY && centerRow >= 0) {
      fieldWords.copyWithin(row, centerRow, centerRow + pixelWidth);
      shineWords.copyWithin(row, centerRow, centerRow + pixelWidth);
      continue;
    }
    for (let x = 0; x < pixelWidth; x++) {
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

  const encode = geometry ? encodeOpticalMap : encodeImageData;
  const [displacement, highlight, zoomMap, contour, shade, silhouette] = await Promise.all([
    rimOnly ? "" : encode(field),
    highlightNeeded ? encode(shine) : "",
    !rimOnly && magnify ? encodeImageData(magnify) : undefined,
    material && outputs.contour !== false
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
    repeatedShade ??
      (material
        ? appleShade(
            width,
            height,
            density,
            material,
            localCoordinates
              ? (x, y) => {
                  const at = (Math.floor(y * density) * pixelWidth + Math.floor(x * density)) * 2;
                  return { y: localCoordinates[at]!, height: localCoordinates[at + 1]! };
                }
              : geometry
                ? (x, y) => {
                    const point = geometry(x, y);
                    return { y: point.localY ?? y, height: point.localHeight ?? height };
                  }
                : undefined,
          )
        : undefined),
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

export type OpticalFields = Awaited<ReturnType<typeof maps>>;
