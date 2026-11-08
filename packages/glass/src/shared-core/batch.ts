import { GlassRenderer } from "./webgl.js";
import type { CoreOptics } from "../core-optics.js";
import type { CaptureShape } from "../gpu-capture.js";

export async function createCoreBatch(shape: CaptureShape, optics: CoreOptics, lost: () => void) {
  const { width, height, margin, dpr, count } = shape;
  const columns = Math.min(10, count),
    rows = Math.ceil(count / columns);
  const strideX = width + margin * 2 + 2,
    strideY = height + margin * 2 + 2;
  const canvas = document.createElement("canvas");
  canvas.width = columns * strideX * dpr;
  canvas.height = rows * strideY * dpr;
  const bytes = canvas.width * canvas.height * 16;
  if (bytes > 128 * 1024 * 1024) throw new Error("Shared core exceeds its resource budget");
  const renderer = new GlassRenderer(
    canvas,
    new Float32Array([
      27,
      Number(optics.mode === "dark"),
      Number(optics.profile === "medium") + (optics.foreground ? 2 : 0),
      dpr,
    ]),
  );
  renderer.set_rim(false);
  canvas.addEventListener("webglcontextlost", lost);
  let revision = 0;
  return {
    paint(
      change: {
        pixels: ImageData | { canvas: HTMLCanvasElement; width: number; height: number };
        indices: number[];
        columns: number;
      },
      targets: Array<CanvasRenderingContext2D | undefined>,
    ) {
      if (renderer.is_context_lost()) throw new Error("Shared core context lost");
      if (!("canvas" in change.pixels))
        throw new Error("Analytic core requires opaque captured input");
      const records = change.indices.flatMap((_, at) =>
        [
          (at % change.columns) * strideX + margin,
          Math.floor(at / change.columns) * strideY + margin,
          width,
          height,
          optics.radius,
          optics.bezel,
          optics.thickness,
        ]
          .map((value) => value * dpr)
          .concat(optics.level),
      );
      renderer.set_lenses(new Float32Array(records));
      renderer.render_canvas(change.pixels.canvas, ++revision);
      change.indices.forEach((index, at) => {
        const target = targets[index];
        if (!target) return;
        target.clearRect(0, 0, width * dpr, height * dpr);
        target.drawImage(
          canvas,
          ((at % change.columns) * strideX + margin) * dpr,
          (Math.floor(at / change.columns) * strideY + margin) * dpr,
          width * dpr,
          height * dpr,
          0,
          0,
          width * dpr,
          height * dpr,
        );
      });
    },
    dispose() {
      canvas.removeEventListener("webglcontextlost", lost);
      renderer.free();
      canvas.width = canvas.height = 1;
    },
  };
}
