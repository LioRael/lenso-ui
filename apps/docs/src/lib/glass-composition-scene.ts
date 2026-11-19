import * as stylex from "@stylexjs/stylex";
import { bindDrag } from "@ui-sdk/core";
import {
  SceneRenderer,
  type CompositionLayer,
} from "../../../../experiments/scene-owned-glass/renderer.js";
import photoUrl from "../../public/assets/demo/photos/0.jpg?url";

const styles = stylex.create({
  body: {
    margin: 0,
    backgroundColor: "var(--lenso-background-primary, #f4f3ef)",
    color: "var(--lenso-label-primary, #202622)",
    fontFamily: "system-ui, sans-serif",
    fontSize: 15,
    lineHeight: 1.5,
  },
  main: { maxWidth: 880, paddingBlock: 24, margin: "0 auto" },
  heading: { fontSize: 32, letterSpacing: "-0.035em", lineHeight: 1.15, marginBottom: 12 },
  lead: { maxWidth: 740, marginBottom: 20 },
  stage: {
    height: 460,
    overflow: "hidden",
    position: "relative",
    borderRadius: 24,
    backgroundColor: "#173e49",
  },
  canvas: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" },
  handle: {
    position: "absolute",
    borderWidth: 0,
    appearance: "none",
    borderRadius: 28,
    padding: 12,
    backgroundColor: "transparent",
    color: "#101a1f",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    touchAction: "none",
    cursor: "grab",
    textShadow: "0 1px 2px white",
    outline: { default: null, ":focus-visible": "3px solid #006956" },
    outlineOffset: 3,
  },
  darkHandle: { color: "white", textShadow: "0 1px 2px black" },
  position: (x: number, y: number, width: number, height: number) => ({
    left: x,
    top: y,
    width,
    height,
  }),
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "end",
    gap: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  field: { display: "flex", flexDirection: "column", gap: 6, maxWidth: "100%", minWidth: 0 },
  control: {
    minHeight: 44,
    maxWidth: "100%",
    boxSizing: "border-box",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#747e76",
    borderRadius: 8,
    padding: "8px 12px",
    backgroundColor: "var(--lenso-background-secondary, #fffefb)",
    color: "var(--lenso-label-primary, #202622)",
    fontFamily: "inherit",
    fontSize: 14,
    outline: { default: null, ":focus-visible": "3px solid #006956" },
    outlineOffset: 2,
  },
  check: { display: "flex", alignItems: "center", minHeight: 44, gap: 8 },
  caption: {
    marginTop: 10,
    marginBottom: 0,
    color: "var(--lenso-label-secondary, #46524b)",
    fontSize: 13,
  },
  status: { display: "block", fontSize: 13, fontVariantNumeric: "tabular-nums", marginTop: 16 },
  fallback: { padding: 24, backgroundColor: "#fffefb", color: "#202622" },
  semantic: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});
export function mountCeilingScene(
  app: HTMLElement,
  locale: "en" | "cn" = "en",
  dark = false,
  convolution: "reference" | "direct" = "reference",
) {
  const t = (en: string, cn: string) => (locale === "cn" ? cn : en);
  app.className = stylex.props(styles.body, styles.main).className!;
  app.replaceChildren();
  function node<K extends keyof HTMLElementTagNameMap>(tag: K, text = "") {
    const value = document.createElement(tag);
    value.textContent = text;
    return value;
  }
  function apply(element: HTMLElement, ...values: stylex.StyleXStyles[]) {
    const props = stylex.props(...values);
    element.className = props.className ?? "";
    for (const [name, value] of Object.entries(props.style ?? {}))
      element.style.setProperty(name, String(value));
  }
  const title = node("h2", t("Layered glass experiment", "叠层玻璃实验"));
  apply(title, styles.heading);
  const lead = node(
    "p",
    t(
      "Move the upper glass across a photograph, supplied text and a completed lower glass layer. Compare ordered sampling with the deliberately incomplete shared-backdrop control.",
      "拖动上层玻璃，经过真实照片、文字和已经绘制的下层玻璃。切换采样方式，可对比正确的逐层折射与故意不完整的共享背景。",
    ),
  );
  apply(lead, styles.lead);
  const stage = node("div");
  stage.id = "stage";
  apply(stage, styles.stage);
  const handle = node("button", t("Move upper glass", "移动上层玻璃"));
  handle.type = "button";
  handle.setAttribute("aria-describedby", "instructions");
  const semantic = node("p");
  apply(semantic, styles.semantic);
  const fallback = node("p");
  apply(fallback, styles.fallback);
  stage.append(semantic, fallback, handle);
  const instructions = node(
    "p",
    t(
      "Drag the upper lens, or focus it and use Alt + arrow keys. Escape cancels a drag. The upper lens’s own label stays above it; the lower label participates in refraction.",
      "拖动上层玻璃，或聚焦后按 Alt + 方向键移动。Escape 取消拖动。下层标签参与折射，上层自己的操作标签保留在玻璃上方。",
    ),
  );
  instructions.id = "instructions";
  apply(instructions, styles.caption);
  app.append(title, lead, stage, instructions);
  const controls = node("div");
  apply(controls, styles.controls);
  app.append(controls);
  function field<T extends HTMLInputElement | HTMLSelectElement>(label: string, control: T): T {
    const wrapper = node("label", label);
    apply(wrapper, styles.field);
    apply(control, styles.control);
    control.setAttribute("aria-label", label);
    wrapper.append(control);
    controls.append(wrapper);
    return control;
  }
  function select(label: string, options: readonly (readonly [string, string])[]) {
    const control = node("select");
    for (const [value, text] of options) {
      const option = node("option", text);
      option.value = value;
      control.append(option);
    }
    return field(label, control);
  }
  function check(label: string) {
    const wrapper = node("label");
    apply(wrapper, styles.check);
    const input = node("input");
    input.type = "checkbox";
    input.checked = true;
    wrapper.append(input, document.createTextNode(label));
    controls.append(wrapper);
    return input;
  }
  const probe = select(t("Probe", "验证场景"), [
    ["overlap", t("Overlapping glass", "叠层玻璃")],
    ["text", t("Text under glass", "文字折射")],
    ["boundary", t("Cross photo / text boundary", "跨照片与文字区域")],
  ]);
  const sampling = select(t("Sampling", "采样方式"), [
    ["ordered", t("Ordered layers", "逐层合成")],
    ["shared", t("Shared backdrop (incomplete)", "共享背景（不完整对照）")],
  ]);
  const refract = check(t("Refraction", "折射"));
  const lower = check(t("Lower glass", "下层玻璃"));
  const text = field(t("Scene text", "场景文字"), node("input"));
  text.value = "REFRACT";
  text.maxLength = 18;
  const lowerText = field(t("Lower label", "下层标签"), node("input"));
  lowerText.value = "LOWER LAYER";
  lowerText.maxLength = 18;
  const blur = field(t("Blur σ (CSS px)", "模糊 σ（CSS px）"), node("input"));
  blur.type = "range";
  blur.min = "0.6";
  blur.max = "15.3";
  blur.step = "0.3";
  blur.value = "1.2";
  const actions = node("div");
  apply(actions, styles.controls);
  app.append(actions);
  function action(label: string, run: () => void) {
    const value = node("button", label);
    value.type = "button";
    apply(value, styles.control);
    value.onclick = run;
    actions.append(value);
    return value;
  }
  const status = node("output");
  status.setAttribute("aria-live", "polite");
  apply(status, styles.status);
  const limits = node(
    "p",
    t(
      "Experimental, not a replacement for Lenso components. Text is rasterized from an explicit content model, not captured from arbitrary DOM. Both regions share one compositor. Portals, in-scene editing and scrolling synchronization remain unverified. Low blur exposes displacement; this is not an Apple material match.",
      "实验实现，尚未替换 Lenso 组件。文字由显式内容模型绘制，不是任意 DOM 截图；两个区域属于同一合成域。跨 Portal、场景内文字编辑和滚动同步尚未验证。默认低模糊用于观察折射，不代表 Apple 材质匹配。",
    ),
  );
  apply(limits, styles.caption);
  app.append(status, limits);

  const photo = new Image();
  photo.src = photoUrl;
  const height = 460;
  const dpr = devicePixelRatio;
  let width = stage.clientWidth;
  let upper = [0, 218, 248, 124];
  let renderer: SceneRenderer | undefined;
  let state = "loading";
  let disposed = false;
  let stopDrag: (() => void) | undefined;
  const paper = document.createElement("canvas"),
    label = document.createElement("canvas");
  let paintRevision = 0;
  function describe() {
    stage.dataset["state"] = state;
    fallback.hidden = state === "ready";
    handle.hidden = state !== "ready";
    if (renderer) renderer.canvas.hidden = state !== "ready";
    semantic.textContent = `Scene text: ${text.value}. ${lower.checked ? `Lower glass label: ${lowerText.value}.` : "Lower glass hidden."}`;
    fallback.textContent = t(
      `${state}. ${semantic.textContent} Controls remain available below; restore the context or remount to retry.`,
      `${state}。${semantic.textContent} 下方控件仍可使用，可恢复上下文或重新初始化。`,
    );
    status.textContent = `${state} · ${sampling.value === "ordered" ? "ordered layers" : "incomplete shared backdrop"} · ${refract.checked ? "refraction on" : "blur only"} · σ ${blur.value} CSS px · ${width} × ${height} · DPR ${dpr}`;
  }
  function paint() {
    paintRevision++;
    for (const source of [paper, label]) {
      source.width = Math.round(width * dpr);
      source.height = Math.round(height * dpr);
    }
    const context = paper.getContext("2d")!;
    context.scale(dpr, dpr);
    const seam = Math.round(width * 0.43);
    context.fillStyle = "#f8f4e9";
    context.fillRect(seam, 0, width - seam, height);
    context.save();
    context.beginPath();
    context.rect(seam, 0, width - seam, height);
    context.clip();
    context.fillStyle = "#424d46";
    context.font = "600 12px system-ui";
    context.fillText("SUPPLIED TEXT REGION", seam + 22, 42);
    context.fillStyle = "#182d2b";
    context.font = `650 ${Math.max(24, Math.min(52, width * 0.065))}px system-ui`;
    context.fillText(text.value, seam + 20, 116, width - seam - 40);
    context.font = "500 15px system-ui";
    context.fillText("Text joins the scene.", seam + 22, 151, width - seam - 44);
    context.fillStyle = "#a43925";
    for (let index = 0; index < 9; index++) context.fillRect(seam + 22 + index * 24, 174, 3, 170);
    context.fillStyle = "#182d2b";
    context.font = "500 14px system-ui";
    context.fillText("Shared composition", seam + 22, 398, width - seam - 44);
    context.fillStyle = "#424d46";
    context.font = "13px system-ui";
    context.fillText("Photo + text + glass", seam + 22, 423, width - seam - 44);
    context.restore();
    const foreground = label.getContext("2d")!;
    foreground.scale(dpr, dpr);
    const x = Math.max(16, width * 0.17);
    foreground.fillStyle = dark ? "#ffffff" : "#152522";
    foreground.font = "650 24px system-ui";
    foreground.fillText(lowerText.value, x + 22, 244, Math.min(316, width - x - 60));
    foreground.font = "500 13px system-ui";
    foreground.fillText("Lower foreground", x + 22, 270, Math.min(316, width - x - 60));
  }
  function preset() {
    const w = Math.min(248, width - 32);
    const x =
      probe.value === "text"
        ? width * 0.57
        : width * 0.43 - (probe.value === "boundary" ? w * 0.5 : 120);
    upper = [Math.max(0, Math.min(width - w, x)), probe.value === "text" ? 73 : 218, w, 124];
  }
  function record(rect: readonly number[]) {
    return new Float32Array(
      [...rect, 28, 12.8, 12.8].map((value) => value * dpr).concat(Number(refract.checked)),
    );
  }
  function draw() {
    if (state !== "ready" || !renderer) {
      describe();
      return;
    }
    const layers: CompositionLayer[] = [{ kind: "paint", source: paper, revision: paintRevision }];
    if (lower.checked)
      layers.push(
        {
          kind: "glass",
          record: record([
            Math.max(16, width * 0.17),
            164,
            Math.min(360, width - Math.max(16, width * 0.17) - 16),
            148,
          ]),
        },
        { kind: "paint", source: label, revision: paintRevision },
      );
    layers.push({ kind: "glass", record: record(upper) });
    renderer.render(0, 400, new Float32Array(), 0, {
      layers,
      blur: Number(blur.value),
      sampling: sampling.value === "shared" ? "shared" : "ordered",
    });
    apply(
      handle,
      styles.handle,
      dark && styles.darkHandle,
      styles.position(upper[0]!, upper[1]!, upper[2]!, upper[3]!),
    );
    describe();
  }
  function mount() {
    if (disposed) return;
    stopDrag?.();
    renderer?.dispose();
    renderer = undefined;
    width = stage.clientWidth;
    upper[0] = Math.max(0, Math.min(width - upper[2]!, upper[0]!));
    paint();
    try {
      const next = new SceneRenderer(
        "resident",
        width,
        height,
        dpr,
        dark,
        photo,
        true,
        convolution,
      );
      renderer = next;
      apply(next.canvas, styles.canvas);
      next.canvas.setAttribute("aria-hidden", "true");
      stage.prepend(next.canvas);
      next.canvas.addEventListener("webglcontextlost", (event) => {
        if (renderer !== next) return;
        event.preventDefault();
        state = "lost";
        describe();
      });
      next.canvas.addEventListener(
        "webglcontextrestored",
        () => {
          if (renderer === next) mount();
        },
        { once: true },
      );
      state = "ready";
      draw();
    } catch (error) {
      renderer?.dispose();
      renderer = undefined;
      state = `unavailable: ${String(error)}`;
      describe();
    }
  }
  handle.onpointerdown = (event) => {
    if (event.button !== 0) return;
    stopDrag?.();
    const origin = [...upper],
      x = event.clientX,
      y = event.clientY;
    stopDrag = bindDrag(handle, event, {
      cancelOnEscape: true,
      onMove: (point) => {
        upper[0] = Math.max(0, Math.min(width - upper[2]!, origin[0]! + point.x - x));
        upper[1] = Math.max(0, Math.min(height - upper[3]!, origin[1]! + point.y - y));
        draw();
      },
      onEnd: (_event, canceled) => {
        if (canceled) upper = origin;
        draw();
      },
    });
  };
  handle.onkeydown = (event) => {
    if (!event.altKey || !event.key.startsWith("Arrow")) return;
    event.preventDefault();
    upper[0] = Math.max(
      0,
      Math.min(
        width - upper[2]!,
        upper[0]! + (event.key === "ArrowLeft" ? -8 : event.key === "ArrowRight" ? 8 : 0),
      ),
    );
    upper[1] = Math.max(
      0,
      Math.min(
        height - upper[3]!,
        upper[1]! + (event.key === "ArrowUp" ? -8 : event.key === "ArrowDown" ? 8 : 0),
      ),
    );
    draw();
  };
  probe.onchange = () => {
    preset();
    draw();
  };
  sampling.onchange = refract.onchange = lower.onchange = draw;
  text.oninput = lowerText.oninput = () => {
    paint();
    draw();
  };
  blur.oninput = draw;
  action(t("Switch material", "切换玻璃材质"), () => {
    dark = !dark;
    mount();
  });
  action(t("Simulate context loss", "模拟上下文丢失"), () => renderer?.lose());
  action(t("Restore context", "恢复上下文"), () => renderer?.restore());
  action(t("Remount renderer", "重新初始化"), mount);
  const resize = new ResizeObserver(() => {
    if (stage.clientWidth !== width && renderer) {
      width = stage.clientWidth;
      preset();
      mount();
    }
  });
  resize.observe(stage);
  preset();
  describe();
  Promise.all([photo.decode(), document.fonts.ready])
    .then(() => {
      mount();
    })
    .catch((error: unknown) => {
      if (disposed) return;
      state = `photo unavailable: ${String(error)}`;
      describe();
    });
  function dispose() {
    disposed = true;
    stopDrag?.();
    resize.disconnect();
    renderer?.dispose();
    app.replaceChildren();
  }
  return dispose;
}
