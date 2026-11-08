import { createGeometryLens, type Shape } from "../../packages/glass/src/refraction.ts";
import { productionReference } from "./production-reference.ts";
import { probe } from "./probe.ts";

const query = new URLSearchParams(location.search);
const theme = query.get("theme") === "dark" ? "dark" : "light";
const profile = query.get("profile") === "medium" ? "medium" : "small";
const count = query.get("count") === "16" ? 16 : 1;
const referenceBackend =
  query.get("reference") === "svg" ? "svg" : navigator.gpu ? "webgpu" : "svg";
const dpr = query.get("dpr") === "1" ? 1 : 2;
const sharedBackend = query.get("driver") === "wasm" ? "wasm" : "ts";
const width = 600,
  height = 400;
const form = document.querySelector<HTMLFormElement>("#options")!;
const status = document.querySelector<HTMLElement>("#status")!;
const results = document.querySelector<HTMLElement>("#results")!;
for (const [name, value] of Object.entries({
  theme,
  profile,
  count,
  dpr,
  reference: referenceBackend,
}))
  (form.elements.namedItem(name) as HTMLSelectElement).value = String(value);
form.onsubmit = (event) => {
  event.preventDefault();
  location.search = new URLSearchParams(
    Array.from(new FormData(form), ([k, v]) => [k, String(v)]),
  ).toString();
};
const shape: Shape = {
  bezel: 30,
  thickness: 24,
  level: 0.7,
  zoom: 1,
  saturation: 1,
  dispersion: 0.2,
  faceSaturation: 1,
  lightIntensity: 0.25,
  lightAngle: 0,
  bevel: 1,
  splay: 0.2,
  appleMode: theme,
  materialProfile: profile,
  materialTint: undefined,
  sourceBlur: profile === "medium" ? 8 : 3,
};
const boxes = Array.from({ length: count }, (_, i) =>
  count === 1
    ? { x: 180, y: 100, w: 240, h: 200, r: 28 }
    : { x: 24 + (i % 4) * 144, y: 24 + Math.floor(i / 4) * 92, w: 120, h: 68, r: 24 },
);
shape.thickness = Math.max(8, Math.min(24, boxes[0]!.h * 0.2));
const material = new Float32Array([
  27,
  Number(theme === "dark"),
  Number(profile === "medium"),
  dpr,
]);
const records = new Float32Array(
  boxes.flatMap((b) =>
    [b.x, b.y, b.w, b.h, b.r, 30, shape.thickness!, 0.7].map((v, i) => (i === 7 ? v : v * dpr)),
  ),
);
const referenceScene = document.querySelector<HTMLElement>("#reference")!;
const sharedScene = document.querySelector<HTMLElement>("#shared")!;
function canvas(parent: HTMLElement, cssWidth = width, cssHeight = height) {
  const c = document.createElement("canvas");
  c.width = cssWidth * dpr;
  c.height = cssHeight * dpr;
  c.style.width = `${cssWidth}px`;
  c.style.height = `${cssHeight}px`;
  parent.append(c);
  return c;
}
const background = canvas(referenceScene),
  sharedBackground = canvas(sharedScene),
  output = canvas(sharedScene);
const context = background.getContext("2d")!;
const sharedContext = sharedBackground.getContext("2d")!;
const sourceCopies: Array<{ context: CanvasRenderingContext2D; x: number; y: number }> = [];
let gpuReference: Awaited<ReturnType<typeof productionReference>> | undefined;
let renderer: {
  set_lenses(v: Float32Array): void;
  render_canvas(c: HTMLCanvasElement, r: number): void;
  free(): void;
};
const cleanup: Array<() => void> = [];
let running = false,
  busy = false,
  frame = 0,
  revision = 0;
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

function paint(time: number, route: "both" | "reference" | "shared" = "both") {
  const c = context;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const gradient = c.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#087ec4");
  gradient.addColorStop(0.5, "#243781");
  gradient.addColorStop(1, "#ef8058");
  c.fillStyle = gradient;
  c.fillRect(0, 0, width, height);
  c.strokeStyle = "#ffffff88";
  c.lineWidth = 1;
  for (let x = 0; x < width; x += 20) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, height);
    c.stroke();
  }
  for (let y = 0; y < height; y += 20) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(width, y);
    c.stroke();
  }
  const x = 60 + (Math.sin(time / 900) + 1) * 180;
  c.fillStyle = "#ffbe65";
  c.fillRect(x, 30, 110, 310);
  c.fillStyle = "#fff";
  c.font = "bold 24px system-ui";
  c.fillText("Lenso iOS / iPadOS", 32, 65);
  c.font = "18px system-ui";
  for (let y = 130; y < 390; y += 60) c.fillText("Text · colour · refraction · inner light", 38, y);
  if (route !== "shared") gpuReference?.paint();
  if (route !== "shared")
    for (const { context: target, x, y } of sourceCopies) {
      const { width: w, height: h } = target.canvas;
      target.clearRect(0, 0, w, h);
      target.drawImage(background, x * dpr, y * dpr, w, h, 0, 0, w, h);
    }
  if (route !== "reference") {
    sharedContext.drawImage(background, 0, 0);
    renderer.render_canvas(background, ++revision);
  }
}

async function prepare() {
  const started = performance.now();
  // Geometry and material are production inputs; only the owned-canvas adapter is local.
  const b = boxes[0]!;
  const geometry = (x: number, y: number) => {
    const px = x - b.w / 2,
      py = y - b.h / 2,
      qx = Math.abs(px) - (b.w / 2 - b.r),
      qy = Math.abs(py) - (b.h / 2 - b.r);
    const ox = Math.max(qx, 0),
      oy = Math.max(qy, 0),
      length = Math.hypot(ox, oy);
    return {
      distance: b.r - (length + Math.min(Math.max(qx, qy), 0)),
      nx: length ? (ox / length) * Math.sign(px) : qx > qy ? Math.sign(px) : 0,
      ny: length ? (oy / length) * Math.sign(py) : qx > qy ? 0 : Math.sign(py),
    };
  };
  geometry.signedDistance = (x: number, y: number) => -geometry(x, y).distance;
  const lens = await createGeometryLens(b.w, b.h, shape, geometry);
  cleanup.push(lens.destroy);
  const faces: HTMLElement[] = [];
  for (const b of boxes) {
    const clip = document.createElement("div");
    clip.className = "clip";
    Object.assign(clip.style, {
      left: `${b.x}px`,
      top: `${b.y}px`,
      width: `${b.w}px`,
      height: `${b.h}px`,
      borderRadius: `${b.r}px`,
    });
    const face = document.createElement("div");
    face.className = "reference";
    face.style.transform = "translateZ(0)";
    faces.push(face);
    if (referenceBackend === "svg") {
      face.style.filter = `blur(${shape.sourceBlur}px) ${lens.filter}`;
      const padding = Math.ceil(lens.sourceReach + (shape.sourceBlur ?? 3) * 3 + 2);
      const copy = canvas(face, b.w + 2 * padding, b.h + 2 * padding);
      copy.style.left = copy.style.top = `${-padding}px`;
      sourceCopies.push({ context: copy.getContext("2d")!, x: b.x - padding, y: b.y - padding });
    }
    const rim = document.createElement("div");
    rim.className = "rim";
    rim.style.backgroundImage = lens.rim;
    clip.append(face, rim);
    referenceScene.append(clip);
  }
  if (referenceBackend === "webgpu") {
    gpuReference = await productionReference(
      lens.filter,
      boxes,
      faces,
      background,
      dpr,
      Math.ceil(lens.sourceReach + (shape.sourceBlur ?? 3) * 3 + 2),
      shape.sourceBlur ?? 3,
    );
    cleanup.push(() => gpuReference!.dispose());
  }
  const refReady = performance.now() - started;
  const sharedStart = performance.now();
  if (sharedBackend === "wasm") {
    const wasm = await import("/wasm/glass.js");
    await wasm.default();
    renderer = wasm.create_renderer(output, material);
  } else {
    const { GlassRenderer } = await import("../../packages/glass/src/shared-core/webgl.ts");
    renderer = new GlassRenderer(output, material);
  }
  renderer.set_lenses(records);
  const sharedReady = performance.now() - sharedStart;
  cleanup.push(() => renderer.free());
  paint(0);
  await nextFrame();
  await nextFrame();
  document.querySelector("#reference-time")!.textContent =
    `Preparation ${refReady.toFixed(1)} ms (${referenceBackend}, maps and setup)`;
  document.querySelector("#shared-time")!.textContent =
    `Preparation ${sharedReady.toFixed(1)} ms (${sharedBackend}, GPU setup)`;
  status.textContent =
    "Ready. Compare the inner shade and opposing highlights over the same background.";
  return { reference: refReady, shared: sharedReady };
}
const preparations = prepare();
const probeRoute = query.get("probe");
if (probeRoute === "both" || probeRoute === "reference" || probeRoute === "shared")
  preparations
    .then(() => probe(probeRoute, paint, referenceBackend, sharedBackend))
    .catch((error) => {
      status.textContent = String(error);
    });
function tick(time: number) {
  if (!running) return;
  paint(time, animationRoute.value as "both" | "reference" | "shared");
  frame = requestAnimationFrame(tick);
}
const animate = document.querySelector<HTMLButtonElement>("#animate")!;
const animationRoute = document.querySelector<HTMLSelectElement>("#animation-route")!;
animate.onclick = async () => {
  await preparations;
  if (busy) return;
  running = !running;
  animate.textContent = running ? "Pause background" : "Animate background";
  if (running) frame = requestAnimationFrame(tick);
  else cancelAnimationFrame(frame);
};
function percentile(values: number[], p: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? null;
}
type Sample = {
  route: string;
  round: number;
  frames: number;
  rafP50: number | null;
  rafP95: number | null;
  callbackP50: number | null;
  callbackP95: number | null;
  over34: number;
  intervals: number[];
  callbacks: number[];
};
let report: unknown;
const benchmark = document.querySelector<HTMLButtonElement>("#benchmark")!;
benchmark.onclick = async () => {
  if (busy) return;
  busy = true;
  benchmark.disabled = true;
  running = false;
  cancelAnimationFrame(frame);
  animate.disabled = true;
  try {
    const cold = await preparations;
    const samples: Sample[] = [];
    for (let round = 0; round < 3; round++)
      for (const route of (round % 2 ? ["shared", "reference"] : ["reference", "shared"]) as Array<
        "reference" | "shared"
      >) {
        document.querySelector<HTMLElement>("#baseline")!.hidden = route !== "reference";
        document.querySelector<HTMLElement>("#candidate")!.hidden = route !== "shared";
        status.textContent = `Measuring ${route}, round ${round + 1} / 3. Keep this page visible.`;
        for (let i = 0; i < 12; i++) paint(await nextFrame(), route);
        const intervals: number[] = [],
          callbacks: number[] = [];
        let previous = await nextFrame();
        const start = previous;
        while (previous - start < 2000) {
          const now = await nextFrame();
          if (document.visibilityState !== "visible")
            throw new Error("Measurement interrupted: page became hidden");
          intervals.push(now - previous);
          previous = now;
          const cpu = performance.now();
          paint(now - start, route);
          callbacks.push(performance.now() - cpu);
        }
        samples.push({
          route,
          round,
          frames: intervals.length,
          rafP50: percentile(intervals, 0.5),
          rafP95: percentile(intervals, 0.95),
          callbackP50: percentile(callbacks, 0.5),
          callbackP95: percentile(callbacks, 0.95),
          over34: intervals.filter((v) => v > 34).length,
          intervals,
          callbacks,
        });
      }
    const record = {
      implementation: "ios27-analytic-v4-ts-default-production-gpu-reference",
      date: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referenceBackend,
      sharedBackend,
      theme,
      profile,
      count,
      dpr,
      width,
      height,
      preparationMs: cold,
      samples,
      scope:
        "Owned canvas, production optical functions vs analytic shared kernel. Callback excludes asynchronous GPU/compositor work; RAF is not presentation.",
    };
    report = record;
    results.textContent = JSON.stringify(
      {
        ...record,
        samples: samples.map((s) => ({ ...s, intervals: undefined, callbacks: undefined })),
      },
      null,
      2,
    );
    const saved = await fetch("/receipt", { method: "POST", body: JSON.stringify(report) });
    if (!saved.ok) throw new Error("Could not save measurements");
    document.querySelector<HTMLButtonElement>("#download")!.disabled = false;
    status.textContent =
      "Comparison saved. Frame timing and callback timing describe different parts of the work.";
  } catch (error) {
    status.textContent = String(error);
  } finally {
    busy = false;
    benchmark.disabled = false;
    animate.disabled = false;
    animate.textContent = "Animate background";
    document.querySelector<HTMLElement>("#baseline")!.hidden = false;
    document.querySelector<HTMLElement>("#candidate")!.hidden = false;
    if (renderer) paint(0);
  }
};
document.querySelector<HTMLButtonElement>("#download")!.onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "glass-core-comparison.json";
  link.click();
  URL.revokeObjectURL(url);
};
window.addEventListener(
  "pagehide",
  () => {
    running = false;
    cancelAnimationFrame(frame);
    for (const stop of cleanup) stop();
  },
  { once: true },
);
preparations.catch((error) => {
  status.textContent = String(error);
  benchmark.disabled = true;
  animate.disabled = true;
});
