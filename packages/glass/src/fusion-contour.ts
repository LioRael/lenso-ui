// Group rim/shadow recipes adapted from onlymoein/liquidglass 89f8b736 (MIT).
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
import type { FusionEdgePixels } from "./fusion-geometry.js";
import { materialContours } from "@lenso/tokens/materials";
import type { GeometrySampler, Shape } from "./refraction.js";

/** Rasterize the exterior itself: a blended distance field also has an interior saddle. */
export function paintFusionContour(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  outline: string,
  sample: GeometrySampler,
  shape?: Shape,
  edgePixels?: FusionEdgePixels,
) {
  const density = 2;
  if (shape?.materialSurface === "group") {
    const padding = 24;
    const pixelWidth = Math.ceil((width + padding * 2) * density);
    const pixelHeight = Math.ceil((height + padding * 2) * density);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    canvas.style.width = `${width + padding * 2}px`;
    canvas.style.height = `${height + padding * 2}px`;
    const context = canvas.getContext("2d")!;
    context.setTransform(density, 0, 0, density, padding * density, padding * density);
    context.clearRect(-padding, -padding, width + padding * 2, height + padding * 2);
    const data = decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(
      / d="([^"]*)"/,
    )![1]!;
    const path = new Path2D(data);
    context.lineWidth = 1;
    context.strokeStyle = "rgb(0 0 0 / .3)";
    context.stroke(path);
    const ys = [...data.matchAll(/[ML][\d.-]+ ([\d.-]+)/g)].map((match) => Number(match[1]));
    const gradient = context.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys));
    for (const [at, alpha] of [
      [0, 0.34],
      [0.3, 0],
      [0.7, 0],
      [1, 0.34],
    ])
      gradient.addColorStop(at!, `rgb(255 255 255 / ${alpha})`);
    context.lineWidth = 0.67;
    context.strokeStyle = gradient;
    context.stroke(path);
    return;
  }
  const targetWidth = Math.ceil(width * density),
    targetHeight = Math.ceil(height * density);
  if (canvas.width !== targetWidth) canvas.width = targetWidth;
  if (canvas.height !== targetHeight) canvas.height = targetHeight;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const pixelWidth = canvas.width;
  const pixelHeight = canvas.height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const path = decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(
    / d="([^"]*)"/,
  )![1]!;
  context.setTransform(density, 0, 0, density, 0, 0);
  context.clearRect(0, 0, pixelWidth / density, pixelHeight / density);
  context.fill(new Path2D(path));
  const mask = context.getImageData(0, 0, pixelWidth, pixelHeight).data;
  const image = context.createImageData(pixelWidth, pixelHeight);
  const pixels = image.data;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= pixelWidth || y >= pixelHeight
      ? 0
      : mask[(y * pixelWidth + x) * 4 + 3]! / 255;
  const native =
    shape &&
    !shape.materialTint &&
    (shape.appleMode === "dark" || shape.materialProfile === "clear");
  const recipe = materialContours[shape?.materialProfile === "clear" ? "clear" : "dark"];
  const dilated = (x: number, y: number) => {
    const whole = Math.floor(x),
      fraction = x - whole;
    let value = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++)
        value = Math.max(
          value,
          at(whole + dx, y + dy) * (1 - fraction) + at(whole + dx + 1, y + dy) * fraction,
        );
    return value;
  };
  const paint = (x: number, y: number) => {
    if (edgePixels && !edgePixels[y * pixelWidth + x]) return;
    const index = (y * pixelWidth + x) * 4;
    const alphaByte = mask[index + 3]!;
    if (!alphaByte) return;
    // Most samples are opaque interior. Reject them with byte reads before
    // normalizing coverage or evaluating the directional edge material.
    const innerByte = Math.min(
      alphaByte,
      x > 0 ? mask[index - 1]! : 0,
      x + 1 < pixelWidth ? mask[index + 7]! : 0,
      y > 0 ? mask[index - pixelWidth * 4 + 3]! : 0,
      y + 1 < pixelHeight ? mask[index + pixelWidth * 4 + 3]! : 0,
    );
    if (innerByte === 255) return;
    const coverage = alphaByte / 255;
    const inner = innerByte / 255;
    const ring = coverage * (1 - inner);
    const sides = native
      ? (dilated(x - recipe.sideOffset * density, y) +
          dilated(x + recipe.sideOffset * density, y)) *
        (1 - inner)
      : 0;
    // Convert the native subtractive coverage to an alpha composite over the
    // finished Web face. Keep this approximation independent of optical-map loading.
    const dark = native
      ? Math.min(1, (ring * (1 - recipe.gray) + sides * (1 - recipe.sideGray)) * 2.2) * coverage
      : ring * 0.22;
    const normal = sample((x + 0.5) / density, (y + 0.5) / density);
    const glint = ring * Math.max(0, -normal.ny) ** 5 * 0.2;
    const alpha = dark + glint * (1 - dark);
    pixels[index] =
      pixels[index + 1] =
      pixels[index + 2] =
        alpha ? Math.round((255 * glint) / alpha) : 0;
    pixels[index + 3] = Math.round(255 * alpha);
  };
  if (edgePixels?.indices) {
    for (const index of edgePixels.indices)
      paint(index % pixelWidth, Math.floor(index / pixelWidth));
  } else {
    for (let y = 0; y < pixelHeight; y++) for (let x = 0; x < pixelWidth; x++) paint(x, y);
  }
  context.putImageData(image, 0, 0);
}
