import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createServer } from "vite";
import { webkit } from "playwright";

const cacheDir = await mkdtemp(path.join(tmpdir(), "lenso-canvas-navigation-"));
let replacement;
const server = await createServer({
  configFile: false,
  root: new URL("../../../", import.meta.url).pathname,
  cacheDir,
  optimizeDeps: { noDiscovery: true },
  server: { host: "127.0.0.1", port: 0 },
  plugins: [
    {
      name: "canvas-navigation-fixture",
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          if (!request.url.startsWith("/__canvas/")) return next();
          const send = () => {
            response.setHeader("content-type", "text/html");
            response.end("<!doctype html><title>Canvas navigation</title>");
          };
          if (request.url === "/__canvas/replacement") replacement(send);
          else send();
        });
      },
    },
  ],
});
try {
  await server.listen();
  const base = server.resolvedUrls.local[0];
  const browser = await webkit.launch();
  let release;
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${base}__canvas/initial`);
    await page.evaluate(async () => {
      const { encodeCanvas, encodeOpticalMap } = await import("/packages/glass/src/canvas.ts");
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 20;
      canvas.getContext("2d").fillStyle = "rgb(12, 34, 56)";
      canvas.getContext("2d").fillRect(0, 0, 20, 20);
      window.opticalInput = canvas.getContext("2d").getImageData(0, 0, 20, 20);
      window.encodeOpticalMap = encodeOpticalMap;
      window.control = await encodeCanvas(canvas);
      // Hold the scheduled encoding frame until document replacement starts.
      const frame = requestAnimationFrame;
      window.requestAnimationFrame = (callback) => {
        window.finishEncoding = () => {
          window.requestAnimationFrame = frame;
          callback(performance.now());
        };
        return 0;
      };
      window.encoding = encodeCanvas(canvas);
    });
    const entered = new Promise((resolve) => {
      replacement = (send) => {
        release = send;
        resolve();
      };
    });
    const navigation = page.goto(`${base}__canvas/replacement`);
    await entered;
    const encoded = await page.evaluate(async () => {
      window.finishEncoding();
      const [result, optical] = await Promise.all([
        window.encoding,
        window.encodeOpticalMap(window.opticalInput),
      ]);
      return { result, optical, control: window.control };
    });
    release();
    release = undefined;
    await navigation;
    assert.deepEqual(
      errors,
      [],
      "WebKit: canvas encoding during navigation reported a resource error",
    );
    assert.match(encoded.result, /^data:image\/png;base64,/);
    assert.deepEqual(
      await page.evaluate(async ({ result, optical, control }) => {
        const pixels = async (source) => {
          const image = new Image();
          image.src = source;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = canvas.height = 20;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          return [...context.getImageData(0, 0, 1, 1).data];
        };
        return [await pixels(control), await pixels(result), await pixels(optical)];
      }, encoded),
      [
        [12, 34, 56, 255],
        [12, 34, 56, 255],
        [12, 34, 56, 255],
      ],
    );
    console.log(
      "WebKit: pending canvas encoding survived navigation with exact pixels and no resource errors.",
    );
  } finally {
    release?.();
    await browser.close();
  }
} finally {
  await server.close();
  await rm(cacheDir, { recursive: true, force: true });
}
