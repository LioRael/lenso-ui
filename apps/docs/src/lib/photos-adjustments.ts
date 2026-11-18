import type { DemoPhoto } from "./photos-library";

export type PhotoPreset =
  | "original"
  | "vivid"
  | "vivid-warm"
  | "vivid-cool"
  | "dramatic"
  | "dramatic-warm"
  | "dramatic-cool"
  | "mono"
  | "silvertone"
  | "noir";
export type CropRect = { x: number; y: number; width: number; height: number };
export type PhotoAdjustments = {
  exposure: number;
  contrast: number;
  saturation: number;
  brightness: number;
  warmth: number;
  tint: number;
  preset: PhotoPreset;
  intensity: number;
  rotation: number;
  straighten: number;
  flipped: boolean;
  crop: CropRect;
};
export const originalAdjustments: PhotoAdjustments = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  brightness: 0,
  warmth: 0,
  tint: 0,
  preset: "original",
  intensity: 100,
  rotation: 0,
  straighten: 0,
  flipped: false,
  crop: { x: 0, y: 0, width: 1, height: 1 },
};
export type PhotoEdit = {
  src: string;
  adjustments: PhotoAdjustments;
  width: number;
  height: number;
};
export function sameAdjustments(a: PhotoAdjustments, b: PhotoAdjustments) {
  return Object.keys(originalAdjustments).every((key) => {
    const k = key as keyof PhotoAdjustments;
    if (k === "intensity" && a.preset === "original" && b.preset === "original") return true;
    if (k === "crop")
      return Object.keys(a.crop).every(
        (axis) =>
          Math.abs(a.crop[axis as keyof CropRect] - b.crop[axis as keyof CropRect]) < 0.00001,
      );
    return a[k] === b[k];
  });
}
export const hasAdjustments = (value: PhotoAdjustments) =>
  !sameAdjustments(value, originalAdjustments);

/** Web color recipes; these do not reproduce Apple's proprietary color pipeline. */
function colorAdjustments(value: PhotoAdjustments) {
  const t = value.preset === "original" ? 0 : value.intensity / 100;
  const vivid = value.preset.startsWith("vivid");
  const dramatic = value.preset.startsWith("dramatic");
  const monochrome = ["mono", "silvertone", "noir"].includes(value.preset);
  const warm =
    value.warmth / 100 +
    (value.preset.endsWith("warm") ? 0.25 * t : value.preset.endsWith("cool") ? -0.25 * t : 0);
  const contrast = Math.max(
    0,
    1 +
      value.contrast / 100 +
      (vivid
        ? 0.15
        : dramatic
          ? 0.3
          : value.preset === "noir"
            ? 0.5
            : value.preset === "silvertone"
              ? -0.12
              : 0) *
        t,
  );
  const saturation = Math.max(
    0,
    1 + value.saturation / 100 + (vivid ? 0.25 : dramatic ? -0.15 : 0) * t,
  );
  return {
    brightness: 2 ** (value.exposure / 100) * (1 + value.brightness / 200),
    contrast,
    saturation,
    grayscale: monochrome ? t : 0,
    sepia: Math.abs(warm) * 0.35,
    hue: (warm < 0 ? 175 * Math.abs(warm) : -15 * warm) + value.tint * 0.25,
  };
}
export function adjustmentFilter(value: PhotoAdjustments) {
  const { brightness, contrast, saturation, grayscale, sepia, hue } = colorAdjustments(value);
  return `brightness(${brightness}) contrast(${contrast}) saturate(${saturation}) grayscale(${grayscale}) sepia(${sepia}) hue-rotate(${hue}deg)`;
}

function filterPhotoPixels(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  value: PhotoAdjustments,
) {
  const { brightness, contrast, saturation, grayscale, sepia, hue } = colorAdjustments(value);
  if (
    brightness === 1 &&
    contrast === 1 &&
    saturation === 1 &&
    grayscale === 0 &&
    sepia === 0 &&
    hue === 0
  )
    return;
  const pixels = context.getImageData(0, 0, width, height);
  const data = pixels.data;
  const clamp = (channel: number) => Math.max(0, Math.min(255, channel));
  const offset = 127.5 * (1 - contrast);
  const angle = (hue * Math.PI) / 180;
  const cos = Math.cos(angle),
    sin = Math.sin(angle);
  const rr = 0.213 + 0.787 * cos - 0.213 * sin;
  const rg = 0.715 - 0.715 * cos - 0.715 * sin;
  const rb = 0.072 - 0.072 * cos + 0.928 * sin;
  const gr = 0.213 - 0.213 * cos + 0.143 * sin;
  const gg = 0.715 + 0.285 * cos + 0.14 * sin;
  const gb = 0.072 - 0.072 * cos - 0.283 * sin;
  const br = 0.213 - 0.213 * cos - 0.787 * sin;
  const bg = 0.715 - 0.715 * cos + 0.715 * sin;
  const bb = 0.072 + 0.928 * cos + 0.072 * sin;
  // CSS filters operate in sRGB and clamp after each stage, not just at the end.
  // Matrices: https://www.w3.org/TR/filter-effects-1/#ShorthandEquivalents
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;
    let r = clamp(clamp(data[i]! * brightness) * contrast + offset);
    let g = clamp(clamp(data[i + 1]! * brightness) * contrast + offset);
    let b = clamp(clamp(data[i + 2]! * brightness) * contrast + offset);
    if (saturation !== 1) {
      const luminance = 0.213 * r + 0.715 * g + 0.072 * b;
      r = clamp(luminance + (r - luminance) * saturation);
      g = clamp(luminance + (g - luminance) * saturation);
      b = clamp(luminance + (b - luminance) * saturation);
    }
    if (grayscale !== 0) {
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = clamp(r + (luminance - r) * grayscale);
      g = clamp(g + (luminance - g) * grayscale);
      b = clamp(b + (luminance - b) * grayscale);
    }
    if (sepia !== 0) {
      const red = clamp(r + (0.393 * r + 0.769 * g + 0.189 * b - r) * sepia);
      const green = clamp(g + (0.349 * r + 0.686 * g + 0.168 * b - g) * sepia);
      b = clamp(b + (0.272 * r + 0.534 * g + 0.131 * b - b) * sepia);
      r = red;
      g = green;
    }
    if (hue !== 0) {
      const red = clamp(rr * r + rg * g + rb * b);
      const green = clamp(gr * r + gg * g + gb * b);
      b = clamp(br * r + bg * g + bb * b);
      r = red;
      g = green;
    }
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
  context.putImageData(pixels, 0, 0);
}
export function orientedSize(width: number, height: number, rotation: number) {
  return Math.abs(rotation % 180) === 90 ? { width: height, height: width } : { width, height };
}
export function centeredCrop(width: number, height: number, ratio: number): CropRect {
  if (!ratio) return { ...originalAdjustments.crop };
  const aspect = width / height;
  const w = Math.min(1, ratio / aspect),
    h = Math.min(1, aspect / ratio);
  return { x: (1 - w) / 2, y: (1 - h) / 2, width: w, height: h };
}
export function rotateCropLeft(crop: CropRect): CropRect {
  return { x: crop.y, y: 1 - crop.x - crop.width, width: crop.height, height: crop.width };
}
export function constrainCrop(rect: CropRect): CropRect {
  const width = Math.max(0.1, Math.min(1, rect.width)),
    height = Math.max(0.1, Math.min(1, rect.height));
  return {
    width,
    height,
    x: Math.max(0, Math.min(1 - width, rect.x)),
    y: Math.max(0, Math.min(1 - height, rect.y)),
  };
}
export function drawPhotoEdit(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  value: PhotoAdjustments,
  maximum = Infinity,
  uncropped = false,
) {
  const size = orientedSize(image.naturalWidth, image.naturalHeight, value.rotation);
  const scale = Math.min(1, maximum / Math.max(size.width, size.height));
  const width = Math.max(1, Math.round(size.width * scale)),
    height = Math.max(1, Math.round(size.height * scale));
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const ctx = source.getContext("2d");
  if (!ctx) throw new Error("Image adjustments are unavailable");
  const nativeFilter = "filter" in ctx;
  const angle = (value.straighten * Math.PI) / 180;
  const cover = Math.max(
    (width * Math.abs(Math.cos(angle)) + height * Math.abs(Math.sin(angle))) / width,
    (width * Math.abs(Math.sin(angle)) + height * Math.abs(Math.cos(angle))) / height,
  );
  ctx.translate(width / 2, height / 2);
  ctx.scale(value.flipped ? -1 : 1, 1);
  ctx.rotate(((value.rotation + value.straighten) * Math.PI) / 180);
  ctx.scale(cover, cover);
  if (nativeFilter) ctx.filter = adjustmentFilter(value);
  ctx.drawImage(
    image,
    (-image.naturalWidth * scale) / 2,
    (-image.naturalHeight * scale) / 2,
    image.naturalWidth * scale,
    image.naturalHeight * scale,
  );
  if (!nativeFilter) filterPhotoPixels(ctx, width, height, value);
  const crop = uncropped ? originalAdjustments.crop : constrainCrop(value.crop);
  canvas.width = Math.max(1, Math.round(width * crop.width));
  canvas.height = Math.max(1, Math.round(height * crop.height));
  const output = canvas.getContext("2d");
  if (!output) throw new Error("Image rendering is unavailable");
  output.drawImage(
    source,
    width * crop.x,
    height * crop.y,
    width * crop.width,
    height * crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
}
export async function loadPhoto(src: string) {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = src;
  await image.decode();
  return image;
}
export async function renderPhotoEdit(photo: DemoPhoto, adjustments: PhotoAdjustments) {
  const image = await loadPhoto(photo.src);
  const canvas = document.createElement("canvas");
  drawPhotoEdit(canvas, image, adjustments);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image export failed"))),
      "image/jpeg",
      0.92,
    ),
  );
}

export type EditHistory = {
  past: PhotoAdjustments[];
  present: PhotoAdjustments;
  future: PhotoAdjustments[];
};
export function commitEdit(history: EditHistory, next: PhotoAdjustments): EditHistory {
  if (sameAdjustments(history.present, next)) return history;
  return { past: [...history.past.slice(-49), history.present], present: next, future: [] };
}
export function undoEdit(history: EditHistory): EditHistory {
  const previous = history.past.at(-1);
  return previous
    ? {
        past: history.past.slice(0, -1),
        present: previous,
        future: [history.present, ...history.future],
      }
    : history;
}
export function redoEdit(history: EditHistory): EditHistory {
  const next = history.future[0];
  return next
    ? { past: [...history.past, history.present], present: next, future: history.future.slice(1) }
    : history;
}
