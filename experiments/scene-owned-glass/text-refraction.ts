import * as stylex from "@stylexjs/stylex";
import { createControlLens, type ControlLens } from "../../packages/glass/src/control-lens.js";
import {
  TextRefractionGPU,
  textProfile,
  gpuTextStrength,
} from "../../packages/glass/src/text-refraction.js";

const styles = stylex.create({
  body: {
    margin: 0,
    backgroundColor: "#f4f3ef",
    color: "#202622",
    fontFamily: "system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 1.6,
  },
  main: { maxWidth: 800, margin: "0 auto", padding: 24 },
  heading: { fontSize: 28, lineHeight: 1.2, letterSpacing: "-0.025em" },
  controls: { display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginBlock: 24 },
  field: { display: "grid", gap: 4, minHeight: 44 },
  grid: {
    display: "grid",
    gridTemplateColumns: { default: "1fr 1fr", "@media (max-width: 700px)": "1fr" },
    gap: 24,
    marginBlock: 24,
  },
  panel: { minWidth: 0, margin: 0 },
  frame: {
    position: "relative",
    width: 288,
    height: 72,
    overflow: "hidden",
    backgroundColor: "white",
  },
  content: {
    position: "absolute",
    inset: 0,
    color: "rgb(0, 136, 255)",
    fontFamily: "system-ui, sans-serif",
    fontSize: 10,
    lineHeight: "12px",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  word: { position: "absolute", top: 30, width: 96, textAlign: "center" },
  glass: { position: "absolute", width: 100, height: 54, borderRadius: 27, pointerEvents: "none" },
  output: { display: "block", fontVariantNumeric: "tabular-nums" },
});
document.body.className = stylex.props(styles.body).className ?? "";
const app = document.querySelector<HTMLElement>("#app")!;
app.className = stylex.props(styles.main).className ?? "";
app.replaceChildren();
const node = <K extends keyof HTMLElementTagNameMap>(tag: K, text?: string) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  return element;
};
const h = node("h1", "TabBar 文字折射局部对照");
h.className = stylex.props(styles.heading).className ?? "";
app.append(
  h,
  node(
    "p",
    "只比较文字光学，选中透镜和外层材质不在此图中。GPU 优先保证可读，降低文字位移幅度并改用连续采样；旧 SVG 保留原强度供观察，不作为正确答案。两路均不加模糊、不降采样。此实验尚未替换组件默认实现。",
  ),
);
const controls = node("div");
controls.className = stylex.props(styles.controls).className ?? "";
function field(label: string, input: HTMLElement) {
  const wrapper = node("label", label);
  wrapper.className = stylex.props(styles.field).className ?? "";
  wrapper.append(input);
  controls.append(wrapper);
}
const amountInput = node("input");
Object.assign(amountInput, { type: "range", min: "0", max: "1", step: ".01", value: "1" });
field("抬起强度", amountInput);
const positionInput = node("input");
Object.assign(positionInput, { type: "range", min: "0", max: "188", step: ".25", value: "124" });
field("透镜位置", positionInput);
const textInput = node("input");
Object.assign(textInput, { type: "text", value: "Home · Library · Collections", maxLength: 80 });
field("示例文字（以 · 分隔）", textInput);
const themeInput = node("select");
for (const [value, label] of [
  ["light", "亮色"],
  ["dark", "深色"],
]) {
  const option = node("option", label);
  option.value = value!;
  themeInput.append(option);
}
field("文字所在页面", themeInput);
app.append(controls);
const grid = node("div");
grid.className = stylex.props(styles.grid).className ?? "";
function panel(title: string, id: string) {
  const section = node("figure");
  section.className = stylex.props(styles.panel).className ?? "";
  const frame = node("div");
  frame.id = id;
  frame.className = stylex.props(styles.frame).className ?? "";
  section.append(node("figcaption", title), frame);
  grid.append(section);
  return frame;
}
const oldFrame = panel("原 SVG（原位移幅度）", "svg-output");
const gpuFrame = panel("局部 GPU（可读性优先）", "gpu-output");
const sourceFrame = panel("未折射原字形", "source-output");
app.append(grid);
const status = node("output");
status.className = stylex.props(styles.output).className ?? "";
app.append(
  status,
  node(
    "p",
    "强度为 0 用于检查字形输入；移动透镜观察彩边。帧间隔与实际光学像素另行采样，不能把页面滑块响应或 rAF 数量当作性能结论。",
  ),
);

const parameters = new URLSearchParams(location.search);
const state = {
  amount: 1,
  position: 124,
  theme: parameters.get("theme") === "dark" ? "dark" : "light",
  text: textInput.value,
};
const content = node("div");
content.className = stylex.props(styles.content).className ?? "";
const glass = node("div");
glass.className = stylex.props(styles.glass).className ?? "";
oldFrame.append(content, glass);
let lens: ControlLens | undefined;
let gpu: TextRefractionGPU | undefined;
let generation = 0;
let disposed = false;
let fixture: { html: string; fonts: string } | undefined;
const fontStyle = document.createElement("style");
document.head.append(fontStyle);

function draw(arm: "both" | "svg" | "gpu" = "both", ink = true) {
  const dark = state.theme === "dark";
  if (arm !== "gpu") {
    glass.style.transform = `translate(${state.position}px, 9px)`;
    lens?.setActive(state.amount > 0);
    lens?.update(state.amount, {
      contentWidth: 288,
      contentHeight: 72,
      x: state.position,
      y: 9,
      width: 100,
      height: 54,
    });
  }
  if (arm !== "svg" && gpu && !gpu.draw(state.amount, state.position, 9, dark, ink)) {
    gpuFrame.replaceChildren(content.cloneNode(true));
    status.textContent = "GPU 不可用，保留 SVG；本轮比较已停止。";
  }
}

async function prepare() {
  const own = ++generation;
  const started = performance.now();
  window.textProbe.ready = false;
  lens?.destroy();
  lens = undefined;
  gpu?.dispose();
  gpu = undefined;
  content.replaceChildren();
  if (fixture) {
    const holder = node("div");
    holder.style.cssText = "position:absolute;left:103px;top:9px;width:82px;height:54px";
    holder.innerHTML = fixture.html;
    holder.inert = true;
    content.append(holder);
    state.text = holder.textContent?.trim() ?? "";
    textInput.value = state.text;
  } else
    state.text
      .split("·")
      .slice(0, 3)
      .forEach((word, i) => {
        const span = node("span", word.trim());
        span.className = stylex.props(styles.word).className ?? "";
        span.style.left = `${i * 96}px`;
        content.append(span);
      });
  await document.fonts.ready;
  if (disposed || own !== generation) return;
  const dark = state.theme === "dark";
  for (const frame of [oldFrame, gpuFrame, sourceFrame]) {
    frame.style.backgroundColor = dark ? "#161616" : "white";
    // Isolate the optics from the SVG image's page-space rasterization phase.
    frame.style.top = "0";
    frame.style.left = "0";
    const rect = frame.getBoundingClientRect();
    frame.style.top = `${Math.round(rect.y * devicePixelRatio) / devicePixelRatio - rect.y}px`;
    frame.style.left = `${Math.round(rect.x * devicePixelRatio) / devicePixelRatio - rect.x}px`;
  }
  content.style.setProperty("--lg-lens-shine", dark ? "1" : "-1.5");
  glass.style.setProperty("--lg-lens-shine", dark ? "1" : "-1.5");
  const clone = content.cloneNode(true) as HTMLElement;
  const originals = [content, ...content.querySelectorAll<HTMLElement>("*")];
  const copies = [clone, ...clone.querySelectorAll<HTMLElement>("*")];
  for (let i = 0; i < originals.length; i++) {
    const style = getComputedStyle(originals[i]!);
    for (const key of style) copies[i]!.style.setProperty(key, style.getPropertyValue(key));
  }
  sourceFrame.replaceChildren(clone.cloneNode(true));
  const density = devicePixelRatio;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${288 * density}" height="${72 * density}"><style>${fixture?.fonts ?? ""}</style><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:288px;height:72px;transform:scale(${density});transform-origin:0 0">${new XMLSerializer().serializeToString(clone)}</div></foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await image.decode();
  if (disposed || own !== generation) return;
  lens = createControlLens(glass, content, textProfile);
  try {
    gpu = new TextRefractionGPU(image, 288, 72, density, 100, 54);
    const canvas = gpu.canvas;
    canvas.setAttribute("aria-hidden", "true");
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      if (gpu?.canvas !== canvas || disposed) return;
      gpuFrame.replaceChildren(content.cloneNode(true));
      status.textContent = "上下文丢失；已显示 SVG 回退，停止 GPU 对照。";
      window.textProbe.ready = false;
    });
    canvas.addEventListener("webglcontextrestored", () => {
      if (gpu?.canvas === canvas && !disposed) void prepare();
    });
    gpuFrame.replaceChildren(gpu.canvas);
    status.textContent = `DPR ${density}；两张 RGBA8 纹理共 ${(gpu.bytes / 1024).toFixed(1)} KiB，另有 Canvas 呈现存储；不是物理显存总量。`;
    draw();
    window.textProbe.preparation = { milliseconds: performance.now() - started, bytes: gpu.bytes };
    window.textProbe.ready = true;
  } catch (error) {
    status.textContent = String(error);
    draw("svg");
    gpuFrame.replaceChildren(content.cloneNode(true));
  }
}

async function set(next: Partial<typeof state>) {
  const rebuild =
    (next.theme !== undefined && next.theme !== state.theme) ||
    (next.text !== undefined && next.text !== state.text);
  if (next.text !== undefined && next.text !== state.text) {
    fixture = undefined;
    fontStyle.textContent = "";
  }
  Object.assign(state, next);
  amountInput.value = String(state.amount);
  positionInput.value = String(state.position);
  textInput.value = state.text;
  themeInput.value = state.theme;
  if (rebuild) await prepare();
  else draw();
}

/** Receives an inlined, owned DOM fixture from the real TabBar browser probe. */
async function loadSource(source: NonNullable<typeof fixture>) {
  fixture = source;
  fontStyle.textContent = source.fonts;
  await prepare();
}

declare global {
  interface Window {
    textProbe: {
      ready: boolean;
      set: typeof set;
      draw: typeof draw;
      state: typeof state;
      loadSource: typeof loadSource;
      strengths: { svg: number; gpu: number };
      preparation?: { milliseconds: number; bytes: number };
      dispose(): void;
    };
  }
}
function dispose() {
  disposed = true;
  generation++;
  window.textProbe.ready = false;
  lens?.destroy();
  gpu?.dispose();
  fontStyle.remove();
}
window.textProbe = {
  ready: false,
  set,
  draw,
  state,
  loadSource,
  dispose,
  strengths: { svg: textProfile.strength, gpu: gpuTextStrength },
};
amountInput.addEventListener("input", () => {
  void set({ amount: Number(amountInput.value) });
});
positionInput.addEventListener("input", () => {
  void set({ position: Number(positionInput.value) });
});
textInput.addEventListener("change", () => {
  void set({ text: textInput.value });
});
themeInput.addEventListener("change", () => {
  void set({ theme: themeInput.value });
});
await set(state);
await prepare();
window.addEventListener("pagehide", dispose, { once: true });
if (import.meta.hot) import.meta.hot.dispose(dispose);
