import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";

const require = createRequire(new URL("../../apps/docs/package.json", import.meta.url));
const { chromium, webkit } = require("playwright");
const base = process.env.GLASS_LAB_URL ?? "http://127.0.0.1:4325";
const output = new URL("../../.amp/in/artifacts/scene-owned-glass/ceiling/", import.meta.url);
const photoPath = new URL("../../apps/docs/public/assets/demo/photos/0.jpg", import.meta.url)
  .pathname;
const frames = Number(process.env.PERF_FRAMES ?? 120);
const runs = Number(process.env.PERF_RUNS ?? 3);
const idleFrames = Number(process.env.PERF_IDLE_FRAMES ?? 30);
const timerQueries = process.env.PERF_QUERY === "1";
const foreground = process.env.PERF_FOREGROUND === "1";
const timeline = process.env.PERF_TIMELINE === "1";
const fences = process.env.PERF_FENCE === "1";
const fenceFlush = process.env.PERF_FENCE_FLUSH === "1";
const retain = process.env.PERF_RETAIN !== "0";
const motion = process.env.PERF_MOTION ?? "top";
const pipeline = process.env.PERF_PIPELINE ?? "resident";
const work = process.env.PERF_WORK ?? "bounded";
const convolution = process.env.PERF_CONVOLUTION ?? "reference";
const diagnostic = process.env.PERF_DIAGNOSTIC ?? "none";
assert.ok(["reference", "paired", "reused", "direct"].includes(convolution));
if (convolution !== "reference") {
  assert.equal(process.env.KIND, "renderer");
  assert.equal(pipeline, "resident");
}
assert.ok(
  ["none", "api-times", "cache-paint", "skip-blur", "skip-final-blur", "skip-prefix-blur"].includes(
    diagnostic,
  ),
);
if (diagnostic !== "none") {
  assert.equal(work, "dirty", "historical diagnostic probes require the uncached dirty path");
  assert.equal(process.env.KIND, "renderer");
  assert.equal(pipeline, "resident");
  assert.equal(motion, "all");
  assert.ok(Number(process.env.LAYERS) > 1);
  assert.equal(runs, 1);
}
assert.ok(["top", "all"].includes(motion));
assert.ok(["resident", "legacy"].includes(pipeline));
assert.ok(["full", "local-blur", "local", "dirty", "cached", "bounded"].includes(work));
if (work !== "bounded") assert.equal(process.env.KIND, "renderer");
if (pipeline === "legacy") {
  assert.equal(process.env.KIND, "renderer");
  assert.equal(process.env.BLUR, "15.3");
  assert.ok(Number(process.env.LAYERS) > 1);
  assert.ok(retain);
  assert.ok(!timerQueries, "a GL query cannot time the legacy Canvas2D composition");
}
if (!retain || motion !== "top") assert.equal(process.env.KIND, "renderer");
assert.ok(Number.isInteger(frames) && frames >= 30);
assert.ok(Number.isInteger(runs) && runs >= 1);
assert.ok(Number.isInteger(idleFrames) && idleFrames >= 0);
if (fences) assert.ok(timeline && !timerQueries);
if (fenceFlush) assert.ok(fences);
if (foreground) {
  assert.equal(process.platform, "darwin");
  assert.equal(process.env.ENGINE, "webkit");
}
const frontApplication = () => {
  if (process.platform !== "darwin") return null;
  const asn = execFileSync("lsappinfo", ["front"], { encoding: "utf8" }).trim();
  const info = execFileSync("lsappinfo", ["info", "-only", "bundleid", asn], {
    encoding: "utf8",
  });
  return info.match(/bundleID="([^"]+)"/)?.[1] ?? null;
};
await mkdir(output, { recursive: true });
const results = {
  date: new Date().toISOString(),
  frames,
  runs,
  idleFrames,
  timerQueries,
  foreground,
  timeline,
  fences,
  fenceFlush,
  retain,
  motion,
  pipeline,
  work,
  convolution,
  diagnostic,
  hardware: execFileSync("system_profiler", ["SPHardwareDataType", "SPDisplaysDataType"], {
    encoding: "utf8",
  }).replace(/^.*(?:Serial Number|Hardware UUID|Provisioning UDID).*\n/gm, ""),
  power: execFileSync("pmset", ["-g", "batt"], { encoding: "utf8" }),
  samples: [],
};
const summarize = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? null;
  return { count: sorted.length, p50: at(0.5), p95: at(0.95), p99: at(0.99) };
};

for (const [engine, launcher] of Object.entries({ chromium, webkit })) {
  if (process.env.ENGINE && process.env.ENGINE !== engine) continue;
  const browser = await launcher.launch({
    headless: false,
    ...(engine === "chromium" ? { args: ["--use-angle=metal"] } : {}),
  });
  try {
    for (const dpr of (process.env.DPRS ?? "1,2").split(",").map(Number)) {
      const page = await browser.newPage({
        viewport: { width: 1000, height: 1000 },
        deviceScaleFactor: dpr,
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.addInitScript(
        ({ diagnostic, layerCount }) => {
          const p = WebGL2RenderingContext.prototype;
          const diagnosticState = {
            active: false,
            blurPass: 0,
            skipped: 0,
            cachedUploads: 0,
            api: {},
          };
          const cachedPaint = new Map();
          const diagnosticPrograms = new WeakMap();
          let diagnosticProgram;
          for (const method of diagnostic === "none"
            ? []
            : [
                "useProgram",
                "drawArrays",
                "texSubImage2D",
                "getUniformLocation",
                "uniform1f",
                "uniform2f",
                "bindFramebuffer",
                "bindTexture",
                "bufferSubData",
                "drawArraysInstanced",
                "flush",
              ]) {
            const original = p[method];
            p[method] = function (...args) {
              if (!diagnosticState.active) return original.apply(this, args);
              if (method === "useProgram") {
                const program = args[0];
                if (program && !diagnosticPrograms.has(program))
                  diagnosticPrograms.set(
                    program,
                    Boolean(this.getUniformLocation(program, "sigma")),
                  );
                diagnosticProgram = program && diagnosticPrograms.get(program);
              }
              if (method === "drawArrays" && diagnosticProgram) {
                const final = diagnosticState.blurPass++ % (layerCount * 2) >= (layerCount - 1) * 2;
                if (
                  diagnostic === "skip-blur" ||
                  (diagnostic === "skip-final-blur" && final) ||
                  (diagnostic === "skip-prefix-blur" && !final)
                ) {
                  diagnosticState.skipped++;
                  return;
                }
              }
              if (method === "texSubImage2D" && diagnostic === "cache-paint") {
                const source = args[6];
                let texture = cachedPaint.get(source);
                if (!texture) {
                  texture = this.createTexture();
                  cachedPaint.set(source, texture);
                  this.bindTexture(this.TEXTURE_2D, texture);
                  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR);
                  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);
                  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);
                  this.texParameteri(this.TEXTURE_2D, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);
                  this.texImage2D(
                    this.TEXTURE_2D,
                    0,
                    this.RGBA,
                    this.RGBA,
                    this.UNSIGNED_BYTE,
                    source,
                  );
                } else diagnosticState.cachedUploads++;
                this.bindTexture(this.TEXTURE_2D, texture);
                return;
              }
              if (diagnostic !== "api-times") return original.apply(this, args);
              const start = performance.now();
              const value = original.apply(this, args);
              const entry = (diagnosticState.api[method] ??= { calls: 0, ms: 0 });
              entry.calls++;
              entry.ms += performance.now() - start;
              return value;
            };
          }
          const counts = {
            draws: 0,
            uploads: 0,
            uploadBytes: 0,
            readbacks: 0,
            blurPixels: 0,
            copyPixels: 0,
            repackPixels: 0,
          };
          const textures = new Map();
          const resources = {};
          const paintSources = [];
          const state = new WeakMap();
          const programs = new WeakMap();
          const current = (gl) => {
            if (!state.has(gl))
              state.set(gl, {
                clipped: false,
                box: [0, 0, 0, 0],
                viewport: [0, 0, gl.canvas.width, gl.canvas.height],
                program: null,
              });
            return state.get(gl);
          };
          for (const method of ["enable", "disable", "scissor", "useProgram", "viewport"]) {
            const original = p[method];
            p[method] = function (...args) {
              const s = current(this);
              if ((method === "enable" || method === "disable") && args[0] === this.SCISSOR_TEST)
                s.clipped = method === "enable";
              if (method === "scissor") s.box = args;
              if (method === "viewport") s.viewport = args;
              if (method === "useProgram") {
                const program = args[0];
                if (program && !programs.has(program))
                  programs.set(
                    program,
                    this.getUniformLocation(program, "sigma")
                      ? "blur"
                      : this.getUniformLocation(program, "chunk0")
                        ? "unpack"
                        : this.getUniformLocation(program, "material") ||
                            this.getUniformLocation(program, "time")
                          ? "other"
                          : "copy",
                  );
                s.program = program && programs.get(program);
              }
              return original.apply(this, args);
            };
          }
          for (const kind of ["Texture", "Framebuffer", "Program", "Buffer", "VertexArray"]) {
            const live = new Set();
            resources[kind] = live;
            const create = p[`create${kind}`],
              destroy = p[`delete${kind}`];
            p[`create${kind}`] = function (...args) {
              const object = create.apply(this, args);
              if (object) live.add(object);
              return object;
            };
            p[`delete${kind}`] = function (object) {
              live.delete(object);
              if (kind === "Texture") textures.delete(object);
              return destroy.call(this, object);
            };
          }
          const allocate = p.texImage2D;
          p.texImage2D = function (...args) {
            const source = args[5];
            const width = args.length === 9 ? args[3] : source.naturalWidth || source.width;
            const height = args.length === 9 ? args[4] : source.naturalHeight || source.height;
            textures.set(this.getParameter(this.TEXTURE_BINDING_2D), {
              width,
              height,
              bytes: width * height * 4,
            });
            return allocate.apply(this, args);
          };
          const allocate3D = p.texImage3D;
          p.texImage3D = function (...args) {
            const [, , , width, height, depth] = args;
            textures.set(this.getParameter(this.TEXTURE_BINDING_2D_ARRAY), {
              width,
              height,
              depth,
              bytes: width * height * depth * 4,
            });
            return allocate3D.apply(this, args);
          };
          for (const method of [
            "drawArrays",
            "drawArraysInstanced",
            "texSubImage2D",
            "readPixels",
          ]) {
            const original = p[method];
            p[method] = function (...args) {
              if (method === "texSubImage2D") {
                const source = args[6];
                counts.uploads++;
                counts.uploadBytes += source.width * source.height * 4;
                if (paintSources.length < 2 && !paintSources.includes(source))
                  paintSources.push(source);
              } else if (method === "readPixels") counts.readbacks++;
              else {
                counts.draws++;
                const s = current(this);
                const v = s.viewport;
                const pixels = s.clipped
                  ? Math.max(
                      0,
                      Math.min(v[0] + v[2], s.box[0] + s.box[2]) - Math.max(v[0], s.box[0]),
                    ) *
                    Math.max(
                      0,
                      Math.min(v[1] + v[3], s.box[1] + s.box[3]) - Math.max(v[1], s.box[1]),
                    )
                  : v[2] * v[3];
                if (s.program === "blur") counts.blurPixels += pixels;
                if (s.program === "copy" || s.program === "unpack") counts.copyPixels += pixels;
                if (s.program === "unpack") counts.repackPixels += pixels;
              }
              return original.apply(this, args);
            };
          }
          window.perfProbe = {
            diagnosticState,
            diagnostic,
            releaseDiagnostic(gl) {
              for (const texture of cachedPaint.values()) gl.deleteTexture(texture);
              cachedPaint.clear();
            },
            counts,
            textures,
            resources,
            paintSources,
            reset() {
              for (const key of Object.keys(counts)) counts[key] = 0;
            },
            live() {
              return Object.fromEntries(
                Object.entries(resources).map(([key, set]) => [key, set.size]),
              );
            },
          };
        },
        { diagnostic, layerCount: Number(process.env.LAYERS ?? 8) },
      );
      await page.goto(`${base}/ceiling.html`);
      await page.waitForFunction(() => document.querySelector("#stage")?.dataset.state === "ready");
      await page.evaluate(async () => {
        const moduleUrl = performance
          .getEntriesByType("resource")
          .find((entry) => new URL(entry.name).pathname === "/renderer.ts").name;
        const { SceneRenderer } = await import(moduleUrl);
        const original = SceneRenderer.prototype.render;
        window.perfProbe.Renderer = SceneRenderer;
        window.perfProbe.submissions = [];
        SceneRenderer.prototype.render = function (...args) {
          const start = performance.now();
          const value = original.apply(this, args);
          window.perfProbe.submissions.push(performance.now() - start);
          return value;
        };
      });
      const cdp = engine === "chromium" ? await page.context().newCDPSession(page) : null;
      if (cdp) await cdp.send("Performance.enable");
      const configs = [
        { kind: "ui", layers: 2, blur: 1.2 },
        { kind: "ui", layers: 2, blur: 15.3 },
        ...[1, 2, 4, 8].flatMap((layers) =>
          [1.2, 15.3].map((blur) => ({ kind: "renderer", layers, blur })),
        ),
      ];
      if (process.env.KIND)
        configs.splice(0, configs.length, ...configs.filter((c) => c.kind === process.env.KIND));
      if (process.env.LAYERS)
        configs.splice(
          0,
          configs.length,
          ...configs.filter((c) => c.layers === Number(process.env.LAYERS)),
        );
      if (process.env.BLUR)
        configs.splice(
          0,
          configs.length,
          ...configs.filter((c) => c.blur === Number(process.env.BLUR)),
        );
      for (let run = 0; run < runs; run++) {
        // Reverse each sweep to expose simple warm-up / thermal ordering bias.
        for (const config of run % 2 ? [...configs].reverse() : configs) {
          if (config.kind === "ui" && !(await page.locator("#stage button").count())) {
            await page.reload();
            await page.waitForFunction(
              () => document.querySelector("#stage")?.dataset.state === "ready",
            );
            await page.evaluate(async () => {
              const moduleUrl = performance
                .getEntriesByType("resource")
                .find((entry) => new URL(entry.name).pathname === "/renderer.ts").name;
              const { SceneRenderer } = await import(moduleUrl);
              const original = SceneRenderer.prototype.render;
              window.perfProbe.Renderer = SceneRenderer;
              window.perfProbe.submissions = [];
              SceneRenderer.prototype.render = function (...args) {
                const start = performance.now();
                const value = original.apply(this, args);
                window.perfProbe.submissions.push(performance.now() - start);
                return value;
              };
            });
          }
          if (foreground) {
            await page.bringToFront();
            execFileSync("open", [
              "-a",
              join(dirname(launcher.executablePath()), "Playwright.app"),
            ]);
          }
          const nativeFrontBefore = frontApplication();
          if (foreground) assert.equal(nativeFrontBefore, "org.webkit.Playwright");
          const before = cdp ? (await cdp.send("Performance.getMetrics")).metrics : [];
          const nativeTimeline = [];
          const recordNative = () => {
            const started = Date.now();
            const app = frontApplication();
            nativeTimeline.push({ started, ended: Date.now(), app });
          };
          if (timeline) recordNative();
          const nativeMonitor = timeline ? setInterval(recordNative, 1000) : null;
          const sample = await page
            .evaluate(
              async ({
                config,
                frames,
                idleFrames,
                photoPath,
                timerQueries,
                retain,
                motion,
                pipeline,
                work,
                convolution,
                timeline,
                fences,
                fenceFlush,
                root,
              }) => {
                const probe = window.perfProbe;
                let renderer;
                let canvas = document.querySelector("#stage canvas");
                const width = 880,
                  height = 460,
                  dpr = devicePixelRatio;
                let render;
                let opticalCanvas;
                let readOutput;
                if (config.kind === "ui") {
                  const input = document.querySelector('input[type="range"]');
                  input.value = String(config.blur);
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                  const button = document.querySelector("#stage button");
                  render = (index) =>
                    button.dispatchEvent(
                      new KeyboardEvent("keydown", {
                        key: index % 2 ? "ArrowLeft" : "ArrowRight",
                        altKey: true,
                        bubbles: true,
                      }),
                    );
                } else {
                  if (document.querySelector("#stage button")) {
                    window.dispatchEvent(new Event("pagehide"));
                    document.querySelector("#stage").replaceChildren();
                  }
                  const photo = new Image();
                  photo.src = `/@fs${photoPath}`;
                  await photo.decode();
                  renderer = new probe.Renderer(
                    "resident",
                    width,
                    height,
                    dpr,
                    false,
                    photo,
                    true,
                    convolution,
                  );
                  canvas = renderer.canvas;
                  canvas.style.cssText = "width:100%;height:100%;display:block";
                  document.querySelector("#stage").append(canvas);
                  const records = Array.from(
                    { length: config.layers },
                    (_, index) =>
                      new Float32Array(
                        [
                          index === 0 ? 149.6 : 258.4 + (index - 1) * 13,
                          index === 0 ? 164 : 218 - (index - 1) * 9,
                          index === 0 ? 360 : 248,
                          index === 0 ? 148 : 124,
                          28,
                          12.8,
                          12.8,
                        ]
                          .map((value) => value * dpr)
                          .concat(1),
                      ),
                  );
                  const layers = [
                    {
                      kind: "paint",
                      source: probe.paintSources[0],
                      ...(retain ? { revision: 0 } : {}),
                    },
                  ];
                  records.forEach((record, index) => {
                    layers.push({ kind: "glass", record });
                    if (index === 0)
                      layers.push({
                        kind: "paint",
                        source: probe.paintSources[1],
                        ...(retain ? { revision: 0 } : {}),
                      });
                  });
                  const initialX = records.map((record, index) =>
                    index === records.length - 1 ? 258.4 * dpr : record[0],
                  );
                  let legacyDraw;
                  if (pipeline === "legacy") {
                    const { GlassRenderer } = await import(
                      `${root}/packages/glass/src/shared-core/webgl.ts`
                    );
                    const makeCanvas = () => {
                      const value = document.createElement("canvas");
                      value.width = canvas.width;
                      value.height = canvas.height;
                      return value;
                    };
                    const background = makeCanvas(),
                      prefix = makeCanvas(),
                      output = makeCanvas();
                    const baseContext = background.getContext("2d"),
                      prefixContext = prefix.getContext("2d"),
                      outputContext = output.getContext("2d");
                    readOutput = () => outputContext.getImageData(0, 0, 1, 1).data;
                    renderer.render(0, 400, new Float32Array(), 0, {
                      layers: [],
                      blur: config.blur,
                      sampling: "ordered",
                    });
                    baseContext.drawImage(canvas, 0, 0);
                    const surface = makeCanvas();
                    surface.getContext("webgl2", { antialias: false });
                    const core = new GlassRenderer(surface, new Float32Array([27, 0, 0, dpr]));
                    let sourceRevision = 0;
                    const preparePrefix = () => {
                      prefixContext.globalCompositeOperation = "copy";
                      prefixContext.drawImage(background, 0, 0);
                      prefixContext.globalCompositeOperation = "source-over";
                      for (const layer of layers.slice(0, -1)) {
                        if (layer.kind === "paint") prefixContext.drawImage(layer.source, 0, 0);
                        else {
                          core.set_lenses(layer.record);
                          core.render_canvas(prefix, ++sourceRevision);
                          prefixContext.drawImage(surface, 0, 0);
                        }
                      }
                      sourceRevision++;
                    };
                    preparePrefix();
                    legacyDraw = () => {
                      const start = performance.now();
                      if (motion === "all") preparePrefix();
                      core.set_lenses(records.at(-1));
                      core.render_canvas(prefix, sourceRevision);
                      outputContext.globalCompositeOperation = "copy";
                      outputContext.drawImage(prefix, 0, 0);
                      outputContext.globalCompositeOperation = "source-over";
                      outputContext.drawImage(surface, 0, 0);
                      probe.submissions.push(performance.now() - start);
                    };
                    // The old core gets the same retained-prefix opportunity, not forced uploads.
                    legacyDraw();
                    renderer.render(0, 400, new Float32Array(), 0, {
                      layers,
                      blur: config.blur,
                      sampling: "ordered",
                      work,
                    });
                    const reference = makeCanvas().getContext("2d");
                    reference.drawImage(canvas, 0, 0);
                    const want = reference.getImageData(0, 0, canvas.width, canvas.height).data;
                    const got = outputContext.getImageData(0, 0, canvas.width, canvas.height).data;
                    let maximum = 0,
                      sum = 0;
                    for (let i = 0; i < want.length; i++) {
                      const delta = Math.abs(want[i] - got[i]);
                      maximum = Math.max(maximum, delta);
                      sum += delta;
                    }
                    if (maximum > 2 || sum / want.length >= 0.02)
                      throw new Error(
                        `Legacy comparison pixel mismatch: ${maximum}, ${sum / want.length}`,
                      );
                    probe.parity = { maximum, mean: sum / want.length };
                    reference.canvas.width = reference.canvas.height = 1;
                    renderer.dispose();
                    canvas = output;
                    canvas.style.cssText = "width:100%;height:100%;display:block";
                    document.querySelector("#stage").append(canvas);
                    opticalCanvas = surface;
                    renderer = {
                      dispose() {
                        core.free();
                        surface
                          .getContext("webgl2")
                          .getExtension("WEBGL_lose_context")
                          ?.loseContext();
                        output.remove();
                      },
                    };
                  }
                  render = (index) => {
                    records.forEach((record, layer) => {
                      if (motion === "all" || layer === records.length - 1)
                        record[0] = initialX[layer] + (index % 2) * 8 * dpr;
                    });
                    if (legacyDraw) return legacyDraw();
                    renderer.render(0, 400, new Float32Array(), 0, {
                      layers,
                      blur: config.blur,
                      sampling: "ordered",
                      work,
                    });
                  };
                  if (pipeline === "resident") {
                    const reference = new probe.Renderer(
                      "resident",
                      width,
                      height,
                      dpr,
                      false,
                      photo,
                      true,
                      convolution === "reused" || convolution === "direct"
                        ? "reference"
                        : convolution,
                    );
                    let maximum = 0;
                    try {
                      // Packed candidates cross kernels; paired retains only its region/cache check.
                      for (let step = 0; step < 6; step++) {
                        render(step);
                        reference.render(0, 400, new Float32Array(), 0, {
                          layers,
                          blur: config.blur,
                          sampling: "ordered",
                          work: "full",
                        });
                        const pixels = [renderer, reference].map((instance) => {
                          const gl = instance.canvas.getContext("webgl2");
                          const value = new Uint8Array(canvas.width * canvas.height * 4);
                          gl.readPixels(
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                            gl.RGBA,
                            gl.UNSIGNED_BYTE,
                            value,
                          );
                          return value;
                        });
                        for (let i = 0; i < pixels[0].length; i++)
                          maximum = Math.max(maximum, Math.abs(pixels[0][i] - pixels[1][i]));
                      }
                      if (maximum !== 0)
                        throw new Error(`Moving ${work} fixture differs from full: ${maximum}`);
                      probe.parity = {
                        maximum,
                        frames: 6,
                        referenceConvolution:
                          convolution === "reused" || convolution === "direct"
                            ? "reference"
                            : convolution,
                      };
                    } finally {
                      reference.dispose();
                    }
                  }
                }
                const gl = (opticalCanvas ?? canvas).getContext("webgl2");
                const debug = gl.getExtension("WEBGL_debug_renderer_info");
                const rendererInfo = gl.getParameter(
                  debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER,
                );
                const supportedTimer = gl.getExtension("EXT_disjoint_timer_query_webgl2");
                const ext = timerQueries ? supportedTimer : null;
                const next = () => new Promise(requestAnimationFrame);
                probe.diagnosticState.active = true;
                for (let i = 0; i < 24; i++) {
                  await next();
                  render(i);
                }
                let diagnosticPixelParity = null;
                if (probe.diagnostic === "cache-paint") {
                  diagnosticPixelParity = 0;
                  for (let step = 0; step < 6; step++) {
                    const pixels = [];
                    for (const active of [false, true]) {
                      // Force prefix invalidation before both paths; otherwise the second
                      // render could bypass paint entirely and give a vacuous parity result.
                      probe.diagnosticState.active = false;
                      render(step + 1);
                      probe.diagnosticState.active = active;
                      render(step);
                      const value = new Uint8Array(canvas.width * canvas.height * 4);
                      gl.readPixels(
                        0,
                        0,
                        canvas.width,
                        canvas.height,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        value,
                      );
                      pixels.push(value);
                    }
                    for (let i = 0; i < pixels[0].length; i++)
                      diagnosticPixelParity = Math.max(
                        diagnosticPixelParity,
                        Math.abs(pixels[0][i] - pixels[1][i]),
                      );
                  }
                  if (diagnosticPixelParity !== 0)
                    throw new Error(`Cached paint differs: ${diagnosticPixelParity}`);
                  // Leave the same odd-frame state as warm-up, so timed frame zero invalidates.
                  render(1);
                }
                const allocations = [...probe.textures.values()];
                const live = probe.live();
                const idleStart = { ...probe.counts };
                const idleIntervals = [];
                let idleLast = await next();
                for (let i = 0; i < idleFrames; i++) {
                  const now = await next();
                  idleIntervals.push(now - idleLast);
                  idleLast = now;
                }
                const idle = Object.fromEntries(
                  Object.entries(probe.counts).map(([key, value]) => [key, value - idleStart[key]]),
                );
                probe.reset();
                probe.submissions.length = 0;
                probe.diagnosticState.blurPass = 0;
                probe.diagnosticState.skipped = 0;
                probe.diagnosticState.cachedUploads = 0;
                probe.diagnosticState.api = {};
                const intervals = [],
                  wall = [],
                  gpu = [],
                  pending = [];
                const frameTimeline = [],
                  heartbeat = [],
                  resourceTimeline = [];
                let heartbeatLast = performance.now();
                const heartbeatTimer = timeline
                  ? setInterval(() => {
                      const now = performance.now();
                      heartbeat.push({ now, interval: now - heartbeatLast });
                      heartbeatLast = now;
                    }, 50)
                  : null;
                let disjoint = false,
                  last = await next();
                let previousFence = null;
                const collect = () => {
                  if (!ext) return;
                  if (gl.getParameter(ext.GPU_DISJOINT_EXT)) disjoint = true;
                  for (let i = pending.length - 1; i >= 0; i--) {
                    const query = pending[i];
                    if (gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) {
                      gpu.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
                      gl.deleteQuery(query);
                      pending.splice(i, 1);
                    }
                  }
                };
                const started = performance.now();
                for (let i = 0; i < frames; i++) {
                  const now = await next();
                  const arrival = timeline ? performance.now() : 0;
                  intervals.push(now - last);
                  last = now;
                  let previousFenceStatus = null;
                  if (previousFence) {
                    previousFenceStatus = gl.clientWaitSync(previousFence, 0, 0);
                    gl.deleteSync(previousFence);
                    previousFence = null;
                    if (previousFenceStatus === gl.WAIT_FAILED)
                      throw new Error("Nonblocking GPU fence probe failed");
                  }
                  collect();
                  const query = ext ? gl.createQuery() : null;
                  if (query) gl.beginQuery(ext.TIME_ELAPSED_EXT, query);
                  const start = performance.now();
                  const countsBefore = timeline ? { ...probe.counts } : null;
                  render(i);
                  wall.push(performance.now() - start);
                  if (fences) {
                    previousFence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
                    if (!previousFence) throw new Error("GPU fence creation failed");
                    if (fenceFlush) gl.flush();
                  }
                  if (timeline) {
                    frameTimeline.push({
                      raf: now,
                      arrival,
                      end: performance.now(),
                      previousFenceStatus,
                      visibility: document.visibilityState,
                      focus: document.hasFocus(),
                      calls: Object.fromEntries(
                        Object.entries(probe.counts).map(([key, value]) => [
                          key,
                          value - countsBefore[key],
                        ]),
                      ),
                    });
                    if (i % 300 === 0 || i === frames - 1)
                      resourceTimeline.push({
                        frame: i,
                        now: performance.now(),
                        bytes: [...probe.textures.values()].reduce((sum, t) => sum + t.bytes, 0),
                        live: probe.live(),
                        contextLost: gl.isContextLost(),
                      });
                  }
                  if (query) {
                    gl.endQuery(ext.TIME_ELAPSED_EXT);
                    gl.flush();
                    pending.push(query);
                  }
                }
                const elapsed = performance.now() - started;
                if (previousFence) gl.deleteSync(previousFence);
                if (heartbeatTimer !== null) clearInterval(heartbeatTimer);
                const calls = { ...probe.counts },
                  submissions = [...probe.submissions];
                const diagnosticResult = structuredClone(probe.diagnosticState);
                for (let i = 0; i < 120 && pending.length; i++) {
                  await next();
                  collect();
                }
                const incomplete = pending.length;
                for (const query of pending) gl.deleteQuery(query);
                // Separate, deliberately synchronous diagnostic; never mix this with live timing.
                const completion = [],
                  pixel = new Uint8Array(4);
                for (let i = 0; i < 20; i++) {
                  await next();
                  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
                  readOutput?.();
                  const start = performance.now();
                  render(i);
                  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
                  if (readOutput) pixel.set(readOutput());
                  completion.push(performance.now() - start);
                }
                const glError = gl.getError(),
                  attributes = gl.getContextAttributes();
                let released = null;
                if (renderer) {
                  probe.releaseDiagnostic(gl);
                  renderer.dispose();
                  released = probe.live();
                }
                return {
                  width,
                  height,
                  dpr,
                  rendererInfo,
                  attributes,
                  gpuTimerAvailable: Boolean(supportedTimer),
                  timerQueries,
                  allocations,
                  live,
                  idle,
                  idleIntervals,
                  visibility: document.visibilityState,
                  focus: document.hasFocus(),
                  calls,
                  submissions,
                  wall,
                  intervals,
                  timeOrigin: performance.timeOrigin,
                  frameTimeline,
                  heartbeat,
                  resourceTimeline,
                  gpu: ext && !disjoint ? gpu : null,
                  disjoint,
                  incomplete,
                  completion,
                  completionPixel: [...pixel],
                  elapsed,
                  glError,
                  released,
                  parity: config.kind === "renderer" ? probe.parity : null,
                  diagnosticResult,
                  diagnosticPixelParity,
                };
              },
              {
                config,
                frames,
                idleFrames,
                photoPath,
                timerQueries,
                retain,
                motion,
                pipeline,
                work,
                convolution,
                timeline,
                fences,
                fenceFlush,
                root: `/@fs${process.cwd()}`,
              },
            )
            .finally(() => {
              if (nativeMonitor !== null) clearInterval(nativeMonitor);
            });
          if (timeline) recordNative();
          const after = cdp ? (await cdp.send("Performance.getMetrics")).metrics : [];
          const nativeFrontAfter = frontApplication();
          if (foreground) {
            assert.equal(nativeFrontBefore, "org.webkit.Playwright");
            if (!timeline) assert.equal(nativeFrontAfter, "org.webkit.Playwright");
          }
          assert.doesNotMatch(sample.rendererInfo, /swiftshader|llvmpipe|software/i);
          assert.equal(sample.glError, 0);
          const paintCache = pipeline === "resident" && ["cached", "bounded"].includes(work);
          assert.equal(
            sample.live.Texture,
            (pipeline === "legacy" ? 3 : diagnostic === "cache-paint" ? 10 : paintCache ? 9 : 8) +
              (convolution === "reused" ? 4 : 0),
          );
          assert.equal(
            sample.allocations.reduce((sum, item) => sum + item.bytes, 0),
            (pipeline === "legacy" ? 3 : diagnostic === "cache-paint" ? 9 : paintCache ? 8 : 7) *
              880 *
              460 *
              dpr ** 2 *
              4 +
              (pipeline === "legacy" ? 0 : 1600 * 1067 * 4) +
              (convolution === "reused" ? 880 * 460 * dpr ** 2 * 4 : 0),
          );
          assert.ok(Object.values(sample.idle).every((count) => count === 0));
          // The one-glass fixture ends with paint, so it deliberately has no retained final lens.
          const cached = config.layers > 1 && retain && motion === "top";
          assert.equal(
            sample.calls.uploads,
            cached || (paintCache && retain)
              ? 0
              : frames * (pipeline === "legacy" ? config.layers : 2),
          );
          assert.equal(
            sample.calls.uploadBytes,
            cached || (paintCache && retain)
              ? 0
              : frames * (pipeline === "legacy" ? config.layers : 2) * 880 * 460 * dpr ** 2 * 4,
          );
          assert.equal(
            sample.calls.draws,
            frames *
              (pipeline === "legacy"
                ? cached
                  ? 1
                  : 3 * config.layers
                : cached
                  ? 3
                  : (work === "full" || work === "local-blur"
                      ? 4 * config.layers + 5
                      : 3 * config.layers + 4) +
                    Number(retain && config.layers > 1) +
                    (convolution === "reused" ? 2 * config.layers : 0)),
          );
          assert.equal(sample.calls.readbacks, 0);
          assert.equal(
            sample.diagnosticResult.cachedUploads,
            diagnostic === "cache-paint" ? frames * 2 : 0,
          );
          assert.equal(
            sample.diagnosticResult.skipped,
            diagnostic === "skip-blur"
              ? frames * config.layers * 2
              : diagnostic === "skip-final-blur"
                ? frames * 2
                : diagnostic === "skip-prefix-blur"
                  ? frames * (config.layers - 1) * 2
                  : 0,
          );
          assert.equal(sample.submissions.length, frames);
          assert.equal(sample.incomplete, 0);
          assert.equal(sample.completionPixel[3], 255);
          if (sample.gpu) assert.equal(sample.gpu.length, frames);
          if (sample.released)
            assert.ok(Object.values(sample.released).every((count) => count === 0));
          assert.deepEqual(errors, []);
          const task = (metrics) => metrics.find((m) => m.name === "TaskDuration")?.value;
          const row = {
            engine,
            version: browser.version(),
            dpr,
            run,
            ...config,
            nativeFrontBefore,
            nativeFrontAfter,
            nativeTimeline,
            submissionMs: summarize(sample.submissions),
            handlerMs: summarize(sample.wall),
            callbackMs: summarize(sample.intervals),
            gpuMs: sample.gpu && summarize(sample.gpu),
            idleCallbackMs: summarize(sample.idleIntervals),
            renderAndReadbackMs: summarize(sample.completion),
            // This includes warm-up, idle and query draining, not just the measured frame window.
            wholeEvaluationTaskMs: cdp ? (task(after) - task(before)) * 1000 : null,
            raw: sample,
          };
          results.samples.push(row);
          await writeFile(
            new URL(
              process.env.PERF_OUTPUT ??
                (timerQueries ? "performance-layered-query.json" : "performance-layered.json"),
              output,
            ),
            JSON.stringify(results, null, 2),
          );
          console.log(
            JSON.stringify(row, (key, value) =>
              key === "raw" || key === "nativeTimeline" ? undefined : value,
            ),
          );
        }
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}
