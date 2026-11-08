/**
 * Adapted from onlymoein/liquidglass, internal/refraction.ts at 89f8b736.
 * Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
 * Modified: fitted host contour, shared optical lifetime, independent foreground paint and pixel-area coverage.
 */
import { encodeImageData } from "./canvas.js";
import type { Shape } from "./optical-fields.js";

const depth = 24;

export function hasForegroundRim(shape: Shape): boolean {
  return (
    shape.appleMode !== undefined &&
    !shape.materialTint &&
    shape.materialSurface !== "group" &&
    shape.materialProfile !== "toggle-knob" &&
    shape.materialProfile !== "slider-knob"
  );
}

export function foregroundRimShadow(size = 0) {
  return `0 ${4 + 4 * size}px ${8 + 13 * size}px rgb(0 0 0 / ${0.016 + 0.054 * size})`;
}

/** Includes the outside hairline; CSS places this image one pixel beyond the host. */
export function foregroundRimPixels(width: number, height: number, radius: number, shape: Shape) {
  const density = 2;
  const columns = Math.ceil((width + 2) * density),
    rows = Math.ceil((height + 2) * density);
  const image = { width: columns, height: rows, data: new Uint8ClampedArray(columns * rows * 4) };
  const pitchX = (width + 2) / image.width,
    pitchY = (height + 2) / image.height;
  const shine = Math.max(0, (shape.lightIntensity ?? 0.25) / 0.25);
  const clear = shape.materialProfile === "clear" ? 1 : (shape.materialClarity ?? 0);
  const lightPanel = shape.appleMode === "light" && shape.materialProfile === "medium";
  const angle = (shape.lightAngle * Math.PI) / 180;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  const innerWidth = width / 2 - (depth + 0.5),
    innerHeight = height / 2 - (depth + 0.5);
  const innerRadius = Math.max(0, radius - (depth + 0.5));
  const sample = (px: number, py: number): readonly [number, number] => {
    const qx = Math.abs(px) - (width / 2 - radius),
      qy = Math.abs(py) - (height / 2 - radius);
    const ox = Math.max(qx, 0),
      oy = Math.max(qy, 0),
      length = Math.hypot(ox, oy);
    const distance = radius - length - Math.min(Math.max(qx, qy), 0);
    if (distance > depth) return [0, 0];
    const nx = length ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0;
    const ny = length ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py);
    const vertical = ny * cos - nx * sin;
    const end = vertical * vertical,
      side = Math.max(0, 1 - end);
    let light = 0,
      shade = 0;
    if (distance >= 0) {
      const line = Math.max(0, 0.39 - 0.29 * distance);
      if (lightPanel) {
        // Rex's light reference has a 1px white crest and a bright inward
        // decay, rather than the small-control recipe's dark upper band.
        light = end * (distance < 1 ? 1 : 0.55 * Math.exp(-(distance - 1) / 1.8));
      } else if (vertical < 0) {
        light = end * (line + (distance > 1 ? 0.05 * Math.max(0, 1 - (distance - 1) / 2.5) : 0));
        const onset = Math.max(0, Math.min(1, (distance - 1.5) / 1.5));
        shade = end * 0.02 * onset * Math.exp(-0.5 * ((distance - 3) / 4) ** 2);
      } else if (vertical > 0) light = end * line;
      if (side > 0) shade += side * 0.028 * Math.exp(-0.5 * (distance / 10) ** 2);
    } else shade = (side * 0.75 + end * 0.2) * Math.max(0, Math.min(1, 1 + distance / 0.75));
    light = Math.min(1, light * shine * (1 + clear * 1.1));
    shade = Math.min(1, shade * shine);
    const alpha = light + shade - light * shade;
    return alpha > 0 ? [(light / (light + shade)) * alpha, alpha] : [0, 0];
  };
  for (let y = 0; y < image.height; y++) {
    const py = (y + 0.5) * pitchY - 1 - height / 2;
    const cornerY = Math.max(0, Math.abs(py) - (innerHeight - innerRadius));
    const span = innerWidth - innerRadius + Math.sqrt(Math.max(0, innerRadius ** 2 - cornerY ** 2));
    const skip = innerWidth > 0 && innerHeight > 0 && Math.abs(py) < innerHeight;
    const skipStart = Math.ceil((width / 2 - span + 1) / pitchX - 0.5);
    const skipEnd = Math.floor((width / 2 + span + 1) / pitchX - 0.5);
    for (let x = 0; x < image.width; x++) {
      // The inset contour is beyond every nonzero rim band. Leave its pixels
      // transparent instead of sampling the whole interior of large panels.
      if (skip && x >= skipStart && x <= skipEnd) {
        x = skipEnd;
        continue;
      }
      const px = (x + 0.5) * pitchX - 1 - width / 2;
      const qx = Math.abs(px) - (width / 2 - radius),
        qy = Math.abs(py) - (height / 2 - radius);
      const distance =
        radius - Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - Math.min(Math.max(qx, qy), 0);
      if (distance > depth) continue;
      let premult = 0,
        alpha = 0;
      // Integrate the narrow discontinuous band only. Averaging straight RGB
      // would turn transparent samples into dark fringes.
      const count =
        Math.abs(distance) < Math.hypot(pitchX, pitchY) / 2
          ? 16
          : distance > -1.1 && distance < 1.7
            ? 4
            : 1;
      const samplesX = qx <= 0 && qy >= qx ? 1 : count;
      const samplesY = qy <= 0 && qx > qy ? 1 : count;
      for (let sy = 0; sy < samplesY; sy++)
        for (let sx = 0; sx < samplesX; sx++) {
          const [p, a] = sample(
            px + ((sx + 0.5) / samplesX - 0.5) * pitchX,
            py + ((sy + 0.5) / samplesY - 0.5) * pitchY,
          );
          premult += p;
          alpha += a;
        }
      if (alpha <= 0) continue;
      const at = (y * image.width + x) * 4;
      image.data[at] =
        image.data[at + 1] =
        image.data[at + 2] =
          Math.round((255 * premult) / alpha);
      image.data[at + 3] = Math.round((255 * alpha) / (samplesX * samplesY));
    }
  }
  return image;
}

export function foregroundRim(width: number, height: number, radius: number, shape: Shape) {
  const image = foregroundRimPixels(width, height, radius, shape);
  return encodeImageData(new ImageData(image.data, image.width, image.height));
}

/** Reuse unscaled corner pixels and constant edge strips as a live surface resizes. */
export function foregroundRimTiles(radius: number, shape: Shape) {
  const extent = Math.ceil(Math.max(radius, depth) + 1);
  const source = foregroundRimPixels(extent * 2 - 1, extent * 2 - 1, radius, shape);
  const pixels = new Uint32Array(source.data.buffer);
  const band = extent * 2;
  return (width: number, height: number) => {
    const columns = Math.ceil((width + 2) * 2);
    const rows = Math.ceil((height + 2) * 2);
    const data = new Uint8ClampedArray(columns * rows * 4);
    const target = new Uint32Array(data.buffer);
    const left = Math.min(band, Math.floor(columns / 2));
    const top = Math.min(band, Math.floor(rows / 2));
    for (let y = 0; y < rows; y++) {
      const sourceY = y < top ? y : y >= rows - top ? source.height - (rows - y) : band;
      const row = sourceY * source.width;
      const offset = y * columns;
      target.set(pixels.subarray(row, row + left), offset);
      target.fill(pixels[row + band]!, offset + left, offset + columns - left);
      target.set(
        pixels.subarray(row + source.width - left, row + source.width),
        offset + columns - left,
      );
    }
    return { width: columns, height: rows, data };
  };
}
