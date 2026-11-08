import { createOpticsBatch, readOptics } from "../../packages/glass/src/gpu-optics.ts";

type Box = { x: number; y: number; w: number; h: number };

// The experiment owns its background; production owns capture and scheduling instead.
export async function productionReference(
  filter: string,
  boxes: Box[],
  faces: HTMLElement[],
  background: HTMLCanvasElement,
  dpr: number,
  margin: number,
  blur: number,
) {
  const optics = readOptics(filter);
  if (!optics) throw new Error("Production GPU optics did not recognize this material");
  const adapter = await navigator.gpu?.requestAdapter();
  if (!adapter) throw new Error("WebGPU is unavailable; select SVG reference explicitly");
  const device = await adapter.requestDevice();
  try {
    const { w: width, h: height } = boxes[0]!;
    const batch = await createOpticsBatch(device, optics, {
      width,
      height,
      margin,
      dpr,
      count: boxes.length,
      blur,
    });
    const columns = Math.min(10, boxes.length);
    const strideX = width + margin * 2 + 2,
      strideY = height + margin * 2 + 2;
    const atlas = document.createElement("canvas");
    atlas.width = strideX * columns * dpr;
    atlas.height = strideY * Math.ceil(boxes.length / columns) * dpr;
    const source = atlas.getContext("2d")!;
    const outputs = faces.map((face) => {
      const canvas = document.createElement("canvas");
      const w = width + batch.padding * 2,
        h = height + batch.padding * 2;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      Object.assign(canvas.style, {
        width: `${w}px`,
        height: `${h}px`,
        left: `${-batch.padding}px`,
        top: `${-batch.padding}px`,
      });
      const context = canvas.getContext("webgpu")!;
      context.configure({
        device,
        format: "rgba8unorm",
        alphaMode: "premultiplied",
        usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      face.append(canvas);
      return context;
    });
    const cells = boxes.map((_, i) => i);
    return {
      paint() {
        source.clearRect(0, 0, atlas.width, atlas.height);
        boxes.forEach((b, i) =>
          source.drawImage(
            background,
            (b.x - margin) * dpr,
            (b.y - margin) * dpr,
            (width + margin * 2) * dpr,
            (height + margin * 2) * dpr,
            (i % columns) * strideX * dpr,
            Math.floor(i / columns) * strideY * dpr,
            (width + margin * 2) * dpr,
            (height + margin * 2) * dpr,
          ),
        );
        const encoder = device.createCommandEncoder();
        batch.update(
          encoder,
          { canvas: atlas, width: atlas.width, height: atlas.height },
          cells,
          columns,
        );
        outputs.forEach((output, i) => batch.copy(encoder, i, output.getCurrentTexture()));
        device.queue.submit([encoder.finish()]);
      },
      dispose() {
        for (const output of outputs) output.unconfigure();
        batch.dispose();
        device.destroy();
      },
    };
  } catch (error) {
    device.destroy();
    throw error;
  }
}
