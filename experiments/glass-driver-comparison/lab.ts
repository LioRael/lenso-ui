import type { GlassRenderer } from "../../packages/glass/src/shared-core/webgl";
type Driver = Pick<
  GlassRenderer,
  "set_lenses" | "set_rim" | "render_canvas" | "free" | "is_context_lost"
>;
type Factory = new (canvas: HTMLCanvasElement, material: Float32Array) => Driver;
type Backend = "ts" | "wasm";
const status = document.querySelector<HTMLOutputElement>("#status")!;
const button = document.querySelector<HTMLButtonElement>("#run")!;
const source = document.createElement("canvas");
source.width = 1200;
source.height = 800;
const context = source.getContext("2d", { alpha: false })!;
function background(time: number) {
  const gradient = context.createLinearGradient(0, 0, 1200, 800);
  gradient.addColorStop(0, "#087ec4");
  gradient.addColorStop(0.5, "#243781");
  gradient.addColorStop(1, "#ef8058");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1200, 800);
  context.fillStyle = "#ffffffaa";
  for (let x = 0; x < 1200; x += 64) context.fillRect((x + time * 0.04) % 1200, 0, 6, 800);
}
function lenses(count: number) {
  return new Float32Array(
    Array.from({ length: count }, (_, i) => {
      const columns = count === 100 ? 10 : 4;
      const width = count === 1 ? 240 : count === 100 ? 48 : 120;
      const height = count === 1 ? 200 : count === 100 ? 30 : 68;
      return [
        count === 1 ? 180 : 20 + (i % columns) * (count === 100 ? 58 : 144),
        count === 1 ? 100 : 20 + Math.floor(i / columns) * (count === 100 ? 38 : 92),
        width,
        height,
        count === 1 ? 28 : Math.min(24, height / 2),
        30,
        Math.max(8, Math.min(24, height * 0.2)),
        0.7,
      ].map((value, at) => (at === 7 ? value : value * 2));
    }).flat(),
  );
}
const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
function stats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    median: sorted[Math.floor(sorted.length * 0.5)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    max: sorted.at(-1),
  };
}
function create(Factory: Factory, material: Float32Array) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 800;
  const start = performance.now(),
    renderer = new Factory(canvas, material);
  renderer.set_rim(true);
  const setupMs = performance.now() - start;
  const gl = canvas.getContext("webgl2")!;
  return {
    canvas,
    renderer,
    gl,
    setupMs,
    dispose() {
      renderer.free();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
button.onclick = async () => {
  button.disabled = true;
  const record: Record<string, unknown> = {
    date: new Date().toISOString(),
    ua: navigator.userAgent,
    viewport: [innerWidth, innerHeight],
    dpr: devicePixelRatio,
    source: [1200, 800],
    moduleMs: {},
    parity: [],
    measurements: [],
    errors: [],
  };
  try {
    const first: Backend =
      new URLSearchParams(location.search).get("first") === "wasm" ? "wasm" : "ts";
    const order: Backend[] = first === "ts" ? ["ts", "wasm"] : ["wasm", "ts"];
    const factories = {} as Record<Backend, Factory>;
    for (const backend of order) {
      status.textContent = `Loading ${backend}`;
      const start = performance.now();
      const module = backend === "ts" ? await import("/ts.js") : await import("/wasm.js");
      factories[backend] = module.GlassRenderer;
      (record["moduleMs"] as Record<string, number>)[backend] = performance.now() - start;
    }
    // Readback is confined to equivalence checks and excluded from timing samples.
    background(0);
    for (const dark of [0, 1])
      for (const medium of [0, 1])
        for (const count of [1, 16]) {
          const material = new Float32Array([27, dark, medium, 2]),
            records = lenses(count);
          const pixels: Uint8Array[] = [];
          for (const backend of order) {
            const item = create(factories[backend], material);
            try {
              item.renderer.set_lenses(records);
              item.renderer.render_canvas(source, 1);
              const output = new Uint8Array(1200 * 800 * 4);
              item.gl.readPixels(0, 0, 1200, 800, item.gl.RGBA, item.gl.UNSIGNED_BYTE, output);
              if (item.gl.getError() !== item.gl.NO_ERROR)
                throw new Error("GPU error during parity check");
              pixels.push(output);
            } finally {
              item.dispose();
            }
          }
          let maxDifference = 0,
            changed = 0,
            covered = 0;
          for (let i = 0; i < pixels[0]!.length; i++) {
            const difference = Math.abs(pixels[0]![i]! - pixels[1]![i]!);
            maxDifference = Math.max(maxDifference, difference);
            if (difference) changed++;
            if (i % 4 === 3 && pixels[0]![i]! > 0) covered++;
          }
          (record["parity"] as unknown[]).push({
            dark,
            medium,
            count,
            maxDifference,
            changed,
            covered,
          });
          if (maxDifference || covered < 100)
            throw new Error("Rendered pixels differ or output is empty");
          await nextFrame();
        }
    for (const count of [1, 16, 100])
      for (let round = 0; round < 3; round++) {
        const sequence = round % 2 ? [...order].reverse() : order;
        for (const backend of sequence) {
          status.textContent = `${backend}: ${count} panels, round ${round + 1}/3`;
          const item = create(factories[backend], new Float32Array([27, 0, 0, 2])),
            records = lenses(count);
          const cpu: number[] = [],
            frames: number[] = [],
            drained: number[] = [];
          try {
            for (let i = 0; i < 5; i++) {
              item.renderer.set_lenses(records);
              item.renderer.render_canvas(source, i);
            }
            item.gl.finish();
            // CPU + GPU completion time for a serial render, separate from real frame pacing.
            for (let i = 0; i < 12; i++) {
              background(i * 16);
              const start = performance.now();
              item.renderer.set_lenses(records);
              item.renderer.render_canvas(source, 100 + i);
              item.gl.finish();
              drained.push(performance.now() - start);
              await nextFrame();
            }
            let previous = await nextFrame();
            for (let frame = 0; frame < 90; frame++) {
              const now = await nextFrame();
              if (document.hidden) throw new Error("Hidden page invalidates frame timing");
              frames.push(now - previous);
              previous = now;
              background(frame * 16);
              const start = performance.now();
              item.renderer.set_lenses(records);
              item.renderer.render_canvas(source, 1000 + frame);
              cpu.push(performance.now() - start);
            }
            if (item.renderer.is_context_lost() || item.gl.getError() !== item.gl.NO_ERROR)
              throw new Error("GPU error during timing");
            (record["measurements"] as unknown[]).push({
              backend,
              count,
              round,
              setupMs: item.setupMs,
              cpu: stats(cpu),
              frames: stats(frames),
              drained: stats(drained),
              over50: frames.filter((v) => v > 50).length,
              cpuSamples: cpu,
              frameSamples: frames,
              drainedSamples: drained,
            });
          } finally {
            item.dispose();
          }
        }
      }
    background(0);
    for (const backend of ["ts", "wasm"] as const) {
      const canvas = document.querySelector<HTMLCanvasElement>(`#${backend}`)!;
      canvas.style.backgroundImage = `url(${source.toDataURL()})`;
      canvas.style.backgroundSize = "100% 100%";
      const renderer = new factories[backend](canvas, new Float32Array([27, 0, 1, 2]));
      renderer.set_lenses(lenses(16));
      renderer.render_canvas(source, 1);
    }
    record["pass"] = true;
    status.textContent = "Complete: 8 pixel comparisons passed; 18 timing samples recorded.";
  } catch (error) {
    record["pass"] = false;
    (record["errors"] as string[]).push(String(error));
    status.textContent = `Failed: ${String(error)}`;
  } finally {
    record["sizes"] = await (await fetch("/sizes")).json();
    document.querySelector("#results")!.textContent = JSON.stringify(record, null, 2);
    await fetch("/receipt", { method: "POST", body: JSON.stringify(record) });
    button.disabled = false;
  }
};
