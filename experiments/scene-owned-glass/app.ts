import * as stylex from "@stylexjs/stylex";
import { bindDrag } from "@ui-sdk/core";
import { SceneRenderer, type Mode } from "./renderer.js";
import { advanceSpring } from "../../packages/glass/src/motion/spring-state.js";
import photoUrl from "../../apps/docs/public/assets/demo/photos/0.jpg?url";

type Scene = "procedural" | "photo-dynamic" | "photo-static-small";
const parameters = new URLSearchParams(location.search);
const photo = new Image();
photo.src = photoUrl;
try {
  await photo.decode();
} catch (error) {
  document.querySelector("#app")!.textContent = `Photo unavailable: ${String(error)}`;
  throw error;
}

const styles = stylex.create({
  body: {
    margin: 0,
    backgroundColor: "#f4f3ef",
    color: "#202622",
    fontFamily: "system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 1.55,
  },
  main: { maxWidth: 800, padding: 24, margin: "0 auto" },
  heading: { fontSize: 32, letterSpacing: "-0.035em", lineHeight: 1.15, marginBottom: 12 },
  lead: { maxWidth: 660, marginBottom: 24 },
  row: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 },
  control: {
    minHeight: 44,
    padding: "8px 14px",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#747e76",
    borderRadius: 8,
    backgroundColor: "#fffefb",
    color: "#202622",
    font: "inherit",
    cursor: "pointer",
    outline: { default: null, ":focus-visible": "3px solid #006956" },
    outlineOffset: 2,
  },
  stage: {
    height: 480,
    overflowY: "auto",
    overflowX: "hidden",
    scrollbarWidth: "none",
    borderRadius: 24,
    position: "relative",
    backgroundColor: "#173e49",
    isolation: "isolate",
  },
  viewport: { position: "sticky", top: 0, height: 480, overflow: "hidden" },
  spacer: { height: 900, pointerEvents: "none" },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" },
  lens: {
    position: "absolute",
    borderWidth: 0,
    appearance: "none",
    borderRadius: 24,
    backgroundColor: "transparent",
    color: "#141e22",
    font: "600 14px system-ui",
    touchAction: "none",
    cursor: "grab",
    outline: { default: null, ":focus-visible": "3px solid #fff" },
    outlineOffset: 3,
    textShadow: "0 1px 2px #fff",
  },
  darkLens: { color: "#fff", textShadow: "0 1px 2px #000" },
  position: (x: number, y: number, width: number, height: number) => ({
    left: x,
    top: y,
    width,
    height,
  }),
  status: {
    whiteSpace: "pre-wrap",
    fontVariantNumeric: "tabular-nums",
    fontSize: 13,
    marginTop: 16,
  },
  note: { color: "#46524b", fontSize: 13 },
});
document.body.className = stylex.props(styles.body).className!;
const app = document.querySelector<HTMLElement>("#app")!;
app.className = stylex.props(styles.main).className!;
app.innerHTML = "";
function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}
function button(text: string, action: () => void) {
  const node = element("button", text);
  node.type = "button";
  node.className = stylex.props(styles.control).className!;
  node.onclick = action;
  return node;
}
app.append(element("p", "Lenso / Rendering research"));
const ceilingLink = element("a", "Open layered glass, text and boundary probes");
ceilingLink.href = "/ceiling.html";
app.append(ceilingLink);
const heading = element("h1", "One scene. One texture owner.");
heading.className = stylex.props(styles.heading).className!;
const lead = element(
  "p",
  "Move the glass over a live GPU background. Both paths use Lenso’s existing optical shader, full-resolution Gaussian blur, dispersion and material tone. DOM controls remain real buttons.",
);
lead.className = stylex.props(styles.lead).className!;
app.append(heading, lead);
const row = element("div");
row.className = stylex.props(styles.row).className!;
const select = element("select");
select.setAttribute("aria-label", "Rendering path");
select.className = stylex.props(styles.control).className!;
for (const [value, label] of [
  ["resident", "Scene-owned GPU texture"],
  ["upload", "Existing core + Canvas upload"],
]) {
  const option = element("option", label);
  option.value = value!;
  select.append(option);
}
row.append(select);
const sceneSelect = element("select");
sceneSelect.setAttribute("aria-label", "Scene");
sceneSelect.className = stylex.props(styles.control).className!;
for (const [value, label] of [
  ["procedural", "Dynamic test pattern / 4 lenses"],
  ["photo-dynamic", "Panning photo / 4 lenses"],
  ["photo-static-small", "Static photo / 1 small lens"],
]) {
  const option = element("option", label);
  option.value = value!;
  sceneSelect.append(option);
}
row.append(sceneSelect);
app.append(row);
const stage = element("div");
stage.id = "stage";
stage.className = stylex.props(styles.stage).className!;
stage.tabIndex = 0;
stage.setAttribute("aria-label", "Scrollable glass scene");
const viewport = element("div");
viewport.className = stylex.props(styles.viewport).className!;
const spacer = element("div");
spacer.className = stylex.props(styles.spacer).className!;
spacer.setAttribute("aria-hidden", "true");
stage.append(viewport, spacer);
app.append(stage);
const status = element("output");
status.className = stylex.props(styles.status).className!;
status.setAttribute("aria-live", "polite");
const note = element(
  "p",
  "Experimental, not a replacement for arbitrary DOM backdrops. Drag Move glass, or use Alt + arrow keys. Scroll this scene or use Background scroll. Timings end at command submission, not display scanout.",
);
note.className = stylex.props(styles.note).className!;
app.append(status, note);

let mode: Mode = parameters.get("mode") === "upload" ? "upload" : "resident",
  dark = false,
  time = 0,
  revision = 0;
select.value = mode;
let scene: Scene =
  parameters.get("scene") === "photo-dynamic"
    ? "photo-dynamic"
    : parameters.get("scene") === "photo-static-small"
      ? "photo-static-small"
      : "procedural";
sceneSelect.value = scene;
let backgroundTime = NaN,
  backgroundScroll = NaN;
let running = !matchMedia("(prefers-reduced-motion: reduce)").matches;
let renderer: SceneRenderer | undefined;
let state = "unmounted";
let width = stage.clientWidth;
const height = 480;
const dpr = Number(parameters.get("dpr")) || devicePixelRatio;
const spring = { value: 1, target: 1, velocity: 0, stiffness: 380, damping: 28 };
const buttons: HTMLButtonElement[] = [];
const positions = [
  [28, 44, 172, 64],
  [48, 156, 224, 80],
  [28, 286, 128, 64],
  [180, 380, 132, 60],
];
let stopDrag: (() => void) | undefined;
let animation = 0,
  previous = performance.now();
const intervals: number[] = [],
  submissions: number[] = [],
  inputs: number[] = [];
let inputAt: number | undefined;
function draw() {
  if (state !== "ready" || !renderer) return;
  const start = performance.now();
  const records = (scene === "photo-static-small" ? positions.slice(0, 1) : positions).flatMap(
    ([x = 0, y = 0, w = 0, h = 0], index) => {
      const scale = index === 0 ? spring.value : 1;
      const dx = x + (w * (1 - scale)) / 2,
        dy = y + (h * (1 - scale)) / 2;
      const props = stylex.props(
        styles.lens,
        dark && styles.darkLens,
        styles.position(dx, dy, w * scale, h * scale),
      );
      Object.assign(buttons[index]!, { className: props.className });
      for (const [name, value] of Object.entries(props.style ?? {}))
        buttons[index]!.style.setProperty(name, String(value));
      return [dx, dy, w * scale, h * scale, 24, 7.68, 12.8].map((n) => n * dpr).concat(1);
    },
  );
  const sourceTime = scene === "photo-static-small" ? 0 : time;
  if (sourceTime !== backgroundTime || stage.scrollTop !== backgroundScroll) {
    backgroundTime = sourceTime;
    backgroundScroll = stage.scrollTop;
    revision++;
  }
  renderer.render(sourceTime, stage.scrollTop, new Float32Array(records), revision);
  submissions.push(performance.now() - start);
  if (submissions.length > 1000) submissions.shift();
  if (inputAt !== undefined) {
    inputs.push(performance.now() - inputAt);
    inputAt = undefined;
  }
}
function describe() {
  status.textContent = `${state} · ${mode === "resident" ? "one context / GPU-resident" : "two contexts / Canvas upload"} · ${width} × ${height} CSS px · DPR ${dpr}\n${scene === "photo-static-small" ? "1 lens / 172 × 64 CSS px / retained backdrop" : "4 lenses"} · σ 15.3 CSS px · Snell IOR 1.5 · RGB displacement 1.02 / 1 / 0.98`;
  stage.dataset["state"] = state;
}
function mount() {
  renderer?.dispose();
  renderer = undefined;
  try {
    width = stage.clientWidth;
    for (const position of positions)
      position[0] = Math.max(0, Math.min(position[0]!, width - position[2]!));
    for (const [index, button] of buttons.entries())
      button.hidden = scene === "photo-static-small" && index > 0;
    renderer = new SceneRenderer(
      mode,
      width,
      height,
      dpr,
      dark,
      scene === "procedural" ? undefined : photo,
    );
    for (const canvas of mode === "upload"
      ? [renderer.source, renderer.canvas]
      : [renderer.canvas]) {
      canvas.className = stylex.props(styles.canvas).className!;
      canvas.setAttribute("aria-hidden", "true");
      viewport.prepend(canvas);
      canvas.addEventListener("webglcontextlost", (event) => {
        if (!renderer || (renderer.canvas !== canvas && renderer.source !== canvas)) return;
        event.preventDefault();
        state = "lost";
        describe();
      });
      canvas.addEventListener("webglcontextrestored", mount, { once: true });
    }
    // The optical canvas must be above the source in the upload arm.
    if (mode === "upload") viewport.insertBefore(renderer.source, renderer.canvas);
    state = "ready";
    draw();
  } catch (error) {
    state = `unavailable: ${String(error)}`;
  }
  describe();
}
for (const [index, label] of [
  "Move glass",
  "Shared optical model",
  "Pause scene",
  "Press spring",
].entries()) {
  const node = button(label, () => {
    if (index === 2) toggleAnimation();
    if (index === 3) {
      spring.target = spring.target === 1 ? 0.9 : 1;
      if (!running) spring.value = spring.target;
      draw();
    }
  });
  if (index === 1)
    node.onclick = () => {
      dark = !dark;
      mount();
    };
  if (index === 0) {
    node.onpointerdown = (event) => {
      if (event.button !== 0) return;
      stopDrag?.();
      const origin = positions[0]!.slice(),
        x = event.clientX,
        y = event.clientY;
      stopDrag = bindDrag(node, event, {
        cancelOnEscape: true,
        onMove: (point) => {
          inputAt = performance.now();
          positions[0]![0] = Math.max(0, Math.min(width - 172, origin[0]! + point.x - x));
          positions[0]![1] = Math.max(0, Math.min(height - 64, origin[1]! + point.y - y));
          draw();
        },
        onEnd: (_event, canceled) => {
          if (canceled) positions[0] = origin;
          draw();
        },
      });
    };
    node.onkeydown = (event) => {
      if (!event.altKey || !event.key.startsWith("Arrow")) return;
      event.preventDefault();
      inputAt = performance.now();
      positions[0]![0] = Math.max(
        0,
        Math.min(
          width - 172,
          positions[0]![0]! + (event.key === "ArrowRight" ? 4 : event.key === "ArrowLeft" ? -4 : 0),
        ),
      );
      positions[0]![1] = Math.max(
        0,
        Math.min(
          height - 64,
          positions[0]![1]! + (event.key === "ArrowDown" ? 4 : event.key === "ArrowUp" ? -4 : 0),
        ),
      );
      draw();
    };
  }
  buttons.push(node);
  viewport.append(node);
}
function toggleAnimation() {
  running = !running;
  pause.textContent = running ? "Pause animation" : "Resume animation";
}
const pause = button(running ? "Pause animation" : "Resume animation", toggleAnimation);
row.append(
  pause,
  button("Switch material", () => {
    dark = !dark;
    mount();
  }),
);
const controls = element("div");
controls.className = stylex.props(styles.row).className!;
const rangeLabel = element("label", "Background scroll ");
const range = element("input");
range.type = "range";
range.min = "0";
range.max = "700";
range.value = "0";
range.setAttribute("aria-label", "Background scroll");
range.oninput = () => {
  inputAt = performance.now();
  stage.scrollTop = Number(range.value);
  draw();
};
rangeLabel.append(range);
controls.append(
  rangeLabel,
  button("Simulate context loss", () => renderer?.lose()),
  button("Restore context", () => renderer?.restore()),
);
const remount = button("Unmount renderer", () => {
  if (state === "unmounted") {
    mount();
    remount.textContent = "Unmount renderer";
  } else {
    renderer?.dispose();
    renderer = undefined;
    state = "unmounted";
    describe();
    remount.textContent = "Mount renderer";
  }
});
controls.append(remount);
app.insertBefore(controls, status);
select.onchange = () => {
  mode = select.value as Mode;
  mount();
};
sceneSelect.onchange = () => {
  scene = sceneSelect.value as Scene;
  backgroundTime = NaN;
  mount();
};
stage.onscroll = () => {
  range.value = String(stage.scrollTop);
  draw();
};
function tick(now: number) {
  const dt = Math.min(0.1, (now - previous) / 1000);
  if (running && !document.hidden) {
    intervals.push(now - previous);
    if (intervals.length > 1000) intervals.shift();
    time += dt;
    const previousScale = spring.value;
    advanceSpring(spring, dt);
    if (scene !== "photo-static-small" || spring.value !== previousScale) draw();
  }
  previous = now;
  animation = requestAnimationFrame(tick);
}
const resize = new ResizeObserver(() => {
  if (stage.clientWidth !== width && renderer) mount();
});
resize.observe(stage);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
reduced.onchange = () => {
  if (reduced.matches && running) toggleAnimation();
};
mount();
animation = requestAnimationFrame(tick);
const lab = {
  get ready() {
    return state === "ready";
  },
  get state() {
    return state;
  },
  configure(options: {
    mode?: Mode;
    dark?: boolean;
    time?: number;
    scroll?: number;
    running?: boolean;
  }) {
    const rebuild =
      (options.mode !== undefined && options.mode !== mode) ||
      (options.dark !== undefined && options.dark !== dark);
    mode = options.mode ?? mode;
    dark = options.dark ?? dark;
    time = options.time ?? time;
    if (options.running !== undefined && options.running !== running) toggleAnimation();
    if (options.scroll !== undefined) stage.scrollTop = options.scroll;
    select.value = mode;
    if (rebuild) mount();
    else draw();
  },
  metrics(reset = false) {
    const result = {
      intervals: [...intervals],
      submissions: [...submissions],
      inputs: [...inputs],
      width,
      height,
      dpr,
      mode,
      scene,
      lensCount: scene === "photo-static-small" ? 1 : 4,
      state,
      rendererInfo: renderer?.rendererInfo,
    };
    if (reset) {
      intervals.length = submissions.length = inputs.length = 0;
    }
    return result;
  },
};
Object.assign(window, { lab });
function dispose() {
  cancelAnimationFrame(animation);
  stopDrag?.();
  resize.disconnect();
  renderer?.dispose();
}
window.addEventListener("pagehide", dispose, { once: true });
if (import.meta.hot) import.meta.hot.dispose(dispose);
