import { ShaderRenderer } from "./gl.ts";
import { svgGlass } from "./svg.ts";

export type Measurement = {
  frames: number;
  rafP50: number | null;
  rafP95: number | null;
  cpuP50: number | null;
  cpuP95: number | null;
  over34: number;
  errors: string[];
  uploadCount: number;
  rafIntervals: number[];
  cpuIntervals: number[];
  visibility: DocumentVisibilityState;
  hiddenDuringMeasurement: boolean;
};
export type LabStats = {
  route: string;
  source: string;
  theme: string;
  version: number;
  profile: string;
  count: number;
  dpr: number;
  caps: {
    webgl2: boolean;
    webgpu: boolean;
    drawElementImage: boolean;
    canvasContent: boolean;
    wasm: boolean;
    userAgent: string;
  };
  activations: number;
  errors: string[];
  ready: boolean;
  supported: boolean;
  uploadCount: number;
  inputValue?: string;
  linkActivations?: number;
  implementation?: string;
  mapGenerations?: number;
  gpuRenderer?: string;
  videoFrames?: number;
  coldMs?: number;
  textureBytes?: number | null;
  lastMeasurement?: Measurement;
  contextLost?: boolean;
  reason?: string;
  measure: (duration?: number, animate?: boolean) => Promise<Measurement>;
  freeze: () => Promise<void>;
  setSolid: (color: string) => Promise<void>;
  dispose: () => void;
};
declare global {
  interface Window {
    lab: LabStats;
  }
}

const query = new URLSearchParams(location.search);
const route = query.get("route") ?? "shader",
  theme = query.get("theme") ?? "dark";
const sourceType = query.get("source") ?? "canvas",
  version = Number(query.get("version") ?? 27);
const count = Number(query.get("count") ?? 1),
  profile = query.get("profile") ?? "medium";
const dpr = Number(query.get("dpr") ?? devicePixelRatio),
  width = 600,
  height = 400;
const material = new Float32Array([
  version,
  Number(theme === "dark"),
  Number(profile === "medium"),
  dpr,
]);
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const options = $<HTMLFormElement>("options");
for (const [name, value] of Object.entries({
  route,
  theme,
  source: sourceType,
  version,
  count,
  profile,
}))
  (options.elements.namedItem(name) as HTMLInputElement).value = String(value);
options.addEventListener("submit", (event) => {
  event.preventDefault();
  location.search = new URLSearchParams(
    new FormData(options) as unknown as URLSearchParams,
  ).toString();
});
const background = $<HTMLCanvasElement>("background"),
  canvas = $<HTMLCanvasElement>("glass"),
  dom = $("dom-source"),
  controls = $("controls");
for (const el of [background, canvas]) {
  el.width = width * dpr;
  el.height = height * dpr;
}
const ctx = background.getContext("2d")!;
ctx.scale(dpr, dpr);
const lenses = new Float32Array(count * 8);
for (let i = 0; i < count; i++) {
  const cols = count === 1 ? 1 : Math.ceil(Math.sqrt(count)),
    w = count === 1 ? 240 : Math.floor(560 / cols) - 8,
    h = count === 1 ? 224 : Math.floor(340 / cols) - 8;
  const x = count === 1 ? 180 : 24 + (i % cols) * (w + 8),
    y = count === 1 ? 88 : 36 + Math.floor(i / cols) * (h + 8);
  lenses.set(
    [
      x,
      y,
      w,
      h,
      Math.min(28, h / 2),
      version === 26 ? 16 : 30,
      Math.max(8, Math.min(24, h * 0.2)),
      version === 26 ? 1 : 0.7,
    ].map((n, j) => (j === 7 ? n : n * dpr)),
    i * 8,
  );
  const button = document.createElement("button");
  button.textContent = count === 1 ? "复制链接" : `${i + 1}`;
  button.id = `lens-${i}`;
  button.setAttribute("aria-pressed", "false");
  button.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;border-radius:${Math.min(28, h / 2)}px`;
  button.onclick = () => {
    button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
    window.lab.activations++;
  };
  controls.append(button);
}
controls.className = theme;
const errors: string[] = [];
window.addEventListener("error", (e) => errors.push(String(e.message)));
window.addEventListener("unhandledrejection", (e) => errors.push(String(e.reason)));
const caps = {
  webgl2: !!document.createElement("canvas").getContext("webgl2"),
  webgpu: !!navigator.gpu,
  drawElementImage: typeof CanvasRenderingContext2D.prototype.drawElementImage === "function",
  canvasContent: "content" in HTMLCanvasElement.prototype,
  wasm: typeof WebAssembly !== "undefined",
  userAgent: navigator.userAgent,
};
const stats = {
  route,
  source: sourceType,
  theme,
  version,
  profile,
  count,
  dpr,
  caps,
  activations: 0,
  errors,
  ready: false,
  supported: true,
  uploadCount: 0,
} as LabStats;
window.lab = stats;
let renderer:
  | Pick<ShaderRenderer, "set_lenses" | "render_canvas" | "render_video" | "free">
  | undefined;
let filter: ReturnType<typeof svgGlass> | undefined;
let video: HTMLVideoElement | undefined;
let capture: HTMLCanvasElement | undefined;
let captureContext: CanvasRenderingContext2D | null | undefined;
let moving = false,
  revision = 0,
  time = 0,
  dirty = true,
  lastRenderedRevision = -1;
let frameTask = 0,
  previous = 0,
  recording = false,
  hiddenDuringMeasurement = false;
let frames: number[] = [];
let cpu: number[] = [];
document.addEventListener("visibilitychange", () => {
  if (recording && document.hidden) hiddenDuringMeasurement = true;
});
const solid = query.get("solid");
function paint(t: number) {
  if (solid) {
    ctx.fillStyle = solid;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  const gradient = ctx.createLinearGradient(0, 0, 600, 400);
  gradient.addColorStop(0, "#183968");
  gradient.addColorStop(0.42, "#315f9f");
  gradient.addColorStop(0.425, "#a9c9ee");
  gradient.addColorStop(0.45, "#365e91");
  gradient.addColorStop(1, "#142e51");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#e9f2ff33";
  ctx.lineWidth = 1;
  for (let x = 0; x < 600; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  for (let y = 0; y < 400; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#efb46b";
  ctx.fillRect(270 + Math.sin(t * 0.001) * 170, 150, 90, 180);
  ctx.fillStyle = "#fff";
  ctx.font = "18px system-ui";
  ctx.fillText("A shared scene · 同一张背景", 24, 44);
  ctx.font = "13px system-ui";
  ctx.fillText("Text, edges, motion and blue light", 24, 68);
}
paint(0);
function setupDom() {
  dom.style.background =
    solid ?? "linear-gradient(138deg,#183968,#315f9f 42%,#a9c9ee 42.5%,#365e91 45%,#142e51)";
  if (!solid) {
    const input = document.createElement("input");
    input.value = "实时可编辑的背景文字";
    input.setAttribute("aria-label", "背景文字");
    input.addEventListener("input", () => {
      dirty = true;
      stats.inputValue = input.value;
    });
    const link = document.createElement("a");
    link.href = "#background-link";
    link.textContent = "背景链接仍可操作";
    link.onclick = () => {
      stats.linkActivations = (stats.linkActivations ?? 0) + 1;
    };
    const bar = document.createElement("div");
    bar.className = "moving";
    bar.style.left = "270px";
    dom.append(input, link, bar);
  }
}
async function initialize() {
  const start = performance.now();
  if (![1, 2].includes(dpr))
    throw new Error("此实验只验证 DPR 1 和 2；请在 URL 指定 dpr=1 或 dpr=2。");
  if (route === "aave" && sourceType === "video") {
    stats.implementation = "Aave-inspired shared WebGL video fallback";
  } else if (route === "aave") {
    stats.implementation = "Live owned DOM + SVG displacement filter";
    canvas.hidden = true;
    if (sourceType === "dom") {
      setupDom();
      background.hidden = true;
    } else dom.hidden = true;
    filter = svgGlass(sourceType === "dom" ? dom : background, lenses, material);
    stats.mapGenerations = filter.maps;
  } else if (sourceType === "dom" && route !== "html") {
    throw new Error("此路线需要显式的背景纹理；不能直接采样任意 DOM。请选择受控画布或视频。");
  }
  if (route === "html") {
    if (!caps.drawElementImage)
      throw new Error("当前浏览器没有可用的 HTML-in-Canvas；本路线不启用，不会静默截图替代。");
    if (sourceType === "video")
      throw new Error("此原型的 HTML-in-Canvas 路线只测试 DOM；视频使用共享 WebGL 路线。");
    setupDom();
    background.hidden = true;
    capture = document.createElement("canvas");
    capture.width = width * dpr;
    capture.height = height * dpr;
    capture.setAttribute("content", "drawable");
    capture.style.cssText = "position:absolute;inset:0;width:600px;height:400px";
    dom.setAttribute("drawable", "");
    capture.append(dom);
    $("scene").prepend(capture);
    captureContext = capture.getContext("2d");
    capture.addEventListener("paint", () => {
      captureContext!.clearRect(0, 0, capture!.width, capture!.height);
      captureContext!.drawElementImage(dom, 0, 0, capture!.width, capture!.height);
      capture!.updateElementGeometry?.(dom, { canvasTransform: new DOMMatrix() });
      revision++;
    });
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    captureContext!.drawElementImage(dom, 0, 0, capture.width, capture.height);
    stats.implementation = "Drawable DOM → 2D canvas → shared WebGL shader";
  }
  if (!filter) {
    if (route === "rust") {
      const module = await import("/wasm/glass.js");
      await module.default();
      renderer = new module.GlassRenderer(canvas, material);
      stats.implementation =
        "Rust/Wasm owns WebGL programs, resources, blur cache and instanced rendering";
    } else {
      const codes = await Promise.all(
        ["quad.vert", "blur.frag", "glass.frag"].map((file) =>
          fetch(`/shaders/${file}`).then((r) => r.text()),
        ),
      );
      renderer = new ShaderRenderer(canvas, codes, material);
    }
    renderer!.set_lenses(lenses);
    const gl = canvas.getContext("webgl2")!;
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    stats.gpuRenderer = debug
      ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
  }
  if (sourceType === "video") {
    video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.src = `/scene-${dpr}.mp4`;
    video.style.cssText = "position:absolute;inset:0;width:600px;height:400px";
    $("scene").insertBefore(video, canvas);
    const firstFrame = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Video did not produce a frame")), 5000);
      video!.requestVideoFrameCallback(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
    await Promise.all([video.play(), firstFrame]);
    stats.videoFrames = 0;
    const tick = () => {
      stats.videoFrames = (stats.videoFrames ?? 0) + 1;
      revision++;
      video!.requestVideoFrameCallback(tick);
    };
    video!.requestVideoFrameCallback(tick);
    moving = true;
  }
  stats.coldMs = performance.now() - start;
  stats.textureBytes = filter ? null : width * height * dpr * dpr * 12;
  stats.ready = true;
  $("status").textContent = "已就绪";
  $("capability").textContent =
    `${stats.implementation ?? "JavaScript + shared WebGL shader"} · DPR ${dpr} · ${count} 个玻璃`;
  frameTask = requestAnimationFrame(tick);
}
function draw() {
  if (moving || dirty) {
    if (!video) paint(time);
    const bar = dom.querySelector<HTMLElement>(".moving");
    if (bar) bar.style.left = `${270 + Math.sin(time * 0.001) * 170}px`;
    if (!video && !captureContext) revision++;
    dirty = false;
  }
  if (renderer && revision !== lastRenderedRevision) {
    if (video) renderer.render_video(video, revision);
    else renderer.render_canvas(capture ?? background, revision);
    stats.uploadCount++;
    lastRenderedRevision = revision;
  }
}
function tick(now: number) {
  const before = performance.now();
  if (moving) time += previous ? now - previous : 0;
  draw();
  if (recording && previous) {
    frames.push(now - previous);
    cpu.push(performance.now() - before);
  }
  previous = now;
  frameTask = requestAnimationFrame(tick);
}
const quantile = (values: number[], q: number) =>
  [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * q))] ??
  null;
stats.measure = async (duration = 3000, animate = true) => {
  moving = animate;
  if (video && animate) await video.play();
  frames = [];
  cpu = [];
  recording = false;
  hiddenDuringMeasurement = document.hidden;
  await new Promise((resolve) => setTimeout(resolve, 300));
  recording = true;
  await new Promise((resolve) => setTimeout(resolve, duration));
  recording = false;
  const report = {
    frames: frames.length,
    rafP50: quantile(frames, 0.5),
    rafP95: quantile(frames, 0.95),
    cpuP50: quantile(cpu, 0.5),
    cpuP95: quantile(cpu, 0.95),
    over34: frames.filter((n) => n > 34).length,
    errors: [...errors],
    uploadCount: stats.uploadCount,
    rafIntervals: frames,
    cpuIntervals: cpu,
    visibility: document.visibilityState,
    hiddenDuringMeasurement,
  };
  stats.lastMeasurement = report;
  $("metrics").textContent = JSON.stringify(
    {
      frames: report.frames,
      rafP50: report.rafP50,
      rafP95: report.rafP95,
      cpuP95: report.cpuP95,
      over34: report.over34,
      errors: report.errors,
    },
    null,
    2,
  );
  return report;
};
stats.freeze = async () => {
  moving = false;
  video?.pause();
  time = 0;
  dirty = true;
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
};
stats.setSolid = async (color) => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  moving = false;
  revision++;
  if (renderer) renderer.render_canvas(background, revision);
};
stats.dispose = () => {
  cancelAnimationFrame(frameTask);
  renderer?.free();
  filter?.dispose();
  video?.pause();
};
$("motion").onclick = () => {
  moving = !moving;
  if (video) {
    if (moving) void video.play();
    else video.pause();
  }
  $("motion").textContent = moving ? "暂停背景" : "播放背景";
};
$("measure").onclick = () => stats.measure();
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault();
  stats.contextLost = true;
  $("status").textContent = "GPU 上下文丢失；重新载入可恢复";
});
window.addEventListener("pagehide", () => stats.dispose());
try {
  await initialize();
} catch (error) {
  stats.supported = false;
  stats.reason = String(error);
  stats.ready = true;
  $("status").textContent = "此组合不可用";
  $("capability").textContent = String(error);
  $<HTMLButtonElement>("measure").disabled = true;
  $<HTMLButtonElement>("motion").disabled = true;
  controls.hidden = true;
}
if (query.has("native") || query.has("probe")) {
  const index = Number(query.get("case") ?? 0);
  if (stats.supported && (query.has("native") || query.has("measure"))) {
    if (document.hidden)
      await new Promise<void>((resolve) =>
        document.addEventListener(
          "visibilitychange",
          () => {
            if (!document.hidden) resolve();
          },
          { once: true },
        ),
      );
    await stats.measure(2000, true);
    await stats.freeze();
  }
  await fetch("/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: `${query.has("native") ? "safari" : "probe"}-${index}`,
      data: stats,
    }),
  });
  $("status").textContent = `已保存第 ${index + 1} 个结果`;
  if (query.has("native") && !query.has("single")) {
    const next = await fetch(`/native-case?index=${index + 1}`).then((r) => r.json());
    if (next.query) location.search = next.query;
    else $("status").textContent = "Safari 全部场景已完成";
  }
}
