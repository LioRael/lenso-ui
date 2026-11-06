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
) {
  const density = 2;
  canvas.width = Math.ceil(width * density);
  canvas.height = Math.ceil(height * density);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const path = decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(
    / d="([^"]*)"/,
  )![1]!;
  context.scale(density, density);
  context.fill(new Path2D(path));
  const mask = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const image = context.createImageData(canvas.width, canvas.height);
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= canvas.width || y >= canvas.height
      ? 0
      : mask[(y * canvas.width + x) * 4 + 3]! / 255;
  const native =
    shape &&
    !shape.materialTint &&
    shape.materialVersion !== "ios26" &&
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
  for (let y = 0; y < canvas.height; y++)
    for (let x = 0; x < canvas.width; x++) {
      const coverage = at(x, y);
      if (!coverage) continue;
      const inner = Math.min(coverage, at(x - 1, y), at(x + 1, y), at(x, y - 1), at(x, y + 1));
      if (inner === 1) continue;
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
      const index = (y * canvas.width + x) * 4;
      image.data[index] =
        image.data[index + 1] =
        image.data[index + 2] =
          alpha ? Math.round((255 * glint) / alpha) : 0;
      image.data[index + 3] = Math.round(255 * alpha);
    }
  context.putImageData(image, 0, 0);
}
