// Bound snapshot work and yield between batches instead of blocking a morph.
const queue: (() => void)[] = [];
export function opticalCanvas(): HTMLCanvasElement | OffscreenCanvas {
  return typeof document === "undefined"
    ? new OffscreenCanvas(1, 1)
    : document.createElement("canvas");
}
let scheduled = false;
function enqueue(work: () => void) {
  queue.push(work);
  if (scheduled) return;
  scheduled = true;
  const drain = () => {
    const start = performance.now();
    do {
      queue.shift()?.();
    } while (queue.length && performance.now() - start < 4);
    if (queue.length) {
      if (document.hidden) setTimeout(drain, 0);
      else requestAnimationFrame(drain);
    } else scheduled = false;
  };
  if (document.hidden) setTimeout(drain, 0);
  else requestAnimationFrame(drain);
}

// Encode private canvas snapshots outside the morph task. Reading a Blob after
// navigation starts makes WebKit report an access-control error, even if caught.
export function encodeCanvas(canvas: HTMLCanvasElement | OffscreenCanvas): Promise<string> {
  if (!("toBlob" in canvas))
    return canvas.convertToBlob({ type: "image/png" }).then(async (blob) => {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000)
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return `data:image/png;base64,${btoa(binary)}`;
    });
  return new Promise((resolve, reject) => {
    enqueue(() => {
      try {
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    });
  });
}
export function encodeImageData(image: ImageData): Promise<string> {
  const canvas = opticalCanvas();
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d")!.putImageData(image, 0, 0);
  return encodeCanvas(canvas);
}

// Canvas encoding can synchronize WebKit's pending glass paints. Compress the
// known RGBA bytes directly, without reading back another canvas.
const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  return crc >>> 0;
});
export async function encodeOpticalMap(
  image: Pick<ImageData, "width" | "height" | "data">,
): Promise<string> {
  if (typeof CompressionStream === "undefined")
    return encodeImageData(
      new ImageData(new Uint8ClampedArray(image.data), image.width, image.height),
    );
  const row = image.width * 4 + 1;
  const pixels = new Uint8Array(row * image.height);
  for (let y = 0; y < image.height; y++)
    pixels.set(image.data.subarray(y * image.width * 4, (y + 1) * image.width * 4), y * row + 1);
  const stream = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(pixels);
      controller.close();
    },
  }).pipeThrough(new CompressionStream("deflate"));
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  const header = new Uint8Array(13);
  const dimensions = new DataView(header.buffer);
  dimensions.setUint32(0, image.width);
  dimensions.setUint32(4, image.height);
  header.set([8, 6, 0, 0, 0], 8);
  const result = new Uint8Array(8 + 12 * 3 + header.length + compressed.length);
  result.set([137, 80, 78, 71, 13, 10, 26, 10]);
  let position = 8;
  for (const [name, data] of [
    ["IHDR", header],
    ["IDAT", compressed],
    ["IEND", new Uint8Array()],
  ] as const) {
    const view = new DataView(result.buffer);
    view.setUint32(position, data.length);
    position += 4;
    const start = position;
    for (const letter of name) result[position++] = letter.charCodeAt(0);
    result.set(data, position);
    position += data.length;
    let crc = 0xffffffff;
    for (let i = start; i < position; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ result[i]!) & 255]!;
    }
    view.setUint32(position, (crc ^ 0xffffffff) >>> 0);
    position += 4;
  }
  let binary = "";
  for (let i = 0; i < result.length; i += 0x8000)
    binary += String.fromCharCode(...result.subarray(i, i + 0x8000));
  return `data:image/png;base64,${btoa(binary)}`;
}
