import * as stylex from "@stylexjs/stylex";
import { TextRefractionGPU } from "@lenso/glass";
import { fontFaceForImage } from "./menu-backdrop/paint-fonts.js";

const styles = stylex.create({
  gpuOptics: { filter: "none" },
  hidden: { visibility: "hidden" },
  canvas: { position: "absolute", top: 0, left: 0, transformOrigin: "0 0", pointerEvents: "none" },
});
function glyphRow(row: HTMLElement, width: number, height: number) {
  if (row.querySelector("img, image, canvas, video, input, textarea"))
    throw Error("Text comparison only supports labels and inline SVG icons");
  const clone = row.cloneNode(true) as HTMLElement;
  const originals = [row, ...row.querySelectorAll<HTMLElement | SVGElement>("*")];
  const copies = [clone, ...clone.querySelectorAll<HTMLElement | SVGElement>("*")];
  for (let i = 0; i < originals.length; i++) {
    const computed = getComputedStyle(originals[i]!);
    const copy = copies[i]!;
    // This image has no component stylesheet. Keep resolved paint, not selection metadata
    // or inherited custom properties (including the animated mask coordinates).
    copy.removeAttribute("data-current");
    copy.removeAttribute("aria-current");
    let css = "";
    for (const key of computed) {
      if (key.startsWith("--")) continue;
      const value = computed.getPropertyValue(key);
      if (value) css += `${key}:${value};`;
    }
    copy.style.cssText = `${css}transition:none;animation:none;`;
  }
  Object.assign(clone.style, { width: `${width}px`, height: `${height}px`, transform: "none" });
  return clone;
}

function glyphStrip(row: HTMLElement, index: number, density: number, rowWidth: number) {
  const children = Array.from(row.children) as HTMLElement[];
  const bounds = children.map(({ style }) => {
    // The motion layer clips each absolute destination to its placement box.
    if (
      style.position !== "absolute" ||
      style.boxSizing !== "border-box" ||
      style.marginLeft !== "0px" ||
      style.transform !== "none" ||
      !/^inset\((?:\d+(?:\.\d+)?px ?){1,4}\)$/.test(style.clipPath)
    )
      return;
    const left = parseFloat(style.left);
    const right = left + parseFloat(style.width);
    if (right > left) return { left: left * density, right: right * density };
  });
  const edited = bounds[index];
  if (!edited || bounds.some((box) => !box)) return;
  const x = Math.max(0, Math.floor(edited.left));
  const right = Math.min(rowWidth, Math.ceil(edited.right));
  if (right <= x || right - x >= rowWidth) return;
  // Rounding outward covers fractional edges; keep any neighbor sharing those pixels.
  for (const [i, child] of children.entries()) {
    const box = bounds[i]!;
    if (box.right <= x || box.left >= right) child.remove();
  }
  return { x, width: right - x };
}

function documentFontFaces() {
  const faces: CSSFontFaceRule[] = [];
  const visit = (list: CSSRuleList) => {
    for (const rule of list) {
      if (rule instanceof CSSFontFaceRule) faces.push(rule);
      else if ("cssRules" in rule) visit((rule as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of document.styleSheets) visit(sheet.cssRules);
  return faces;
}

async function decodeGlyphs(
  faces: CSSFontFaceRule[],
  markup: string,
  width: number,
  height: number,
  density: number,
  strip?: { x: number; width: number },
) {
  const embedded = await Promise.all(faces.map((rule) => fontFaceForImage(document, rule)));
  const rowWidth = Math.ceil(width * density);
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" width="${strip?.width ?? rowWidth}" height="${Math.ceil(height * density)}"><style>${embedded.join("\n")}</style><foreignObject x="${-(strip?.x ?? 0)}" width="${rowWidth}" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="position:relative;width:${width}px;height:${height}px;transform:scale(${density});transform-origin:0 0">${markup}</div></foreignObject></svg>`;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  await image.decode();
  return image;
}

// A single decoded source per live preview survives SVG mode; GPU resources do not.
const glyphs = new WeakMap<HTMLElement, { key: string; image: Promise<HTMLImageElement> }>();

/** Docs-only A/B adapter: native TabBar still owns geometry, clipping, input and springs. */
export function compareTabBarText(group: HTMLElement, report: (message: string) => void) {
  const highlight = group.querySelector<HTMLElement>('[data-lenso-slot="tab-bar-highlight"]')!;
  const optics = group.querySelector<HTMLElement>('[data-lenso-slot="tab-bar-highlight-optics"]')!;
  const row = group.querySelector<HTMLElement>('[data-lenso-slot="tab-bar-highlight-row"]')!;
  const centre = group.querySelector<HTMLElement>(
    '[data-lenso-slot="tab-bar-highlight-centre-row"]',
  )!;
  const list = group.querySelector<HTMLElement>("[data-tab-bar-list]")!;
  const opticsClass = optics.className;
  const rowClass = row.className;
  let gpu: TextRefractionGPU | undefined;
  let requested: ReturnType<typeof glyphs.get>;
  let painted: { key: string; layout: string; labels: (string | undefined)[] } | undefined;
  let disposed = false;
  let failed = false;
  let queued = false;
  const fallback = () => {
    delete optics.dataset["tabBarTextGpu"];
    optics.className = opticsClass;
    row.className = rowClass;
    gpu?.canvas.remove();
  };
  const release = () => {
    fallback();
    gpu?.dispose();
    gpu = undefined;
    painted = undefined;
  };
  const draw = () => {
    if (!gpu || !gpu.canvas.isConnected) return;
    const width = parseFloat(highlight.style.width);
    const height = parseFloat(highlight.style.height);
    if (!(width > 0 && height > 0)) return;
    const transform = new DOMMatrixReadOnly(highlight.style.transform);
    const geometry = { width: width * transform.a, height: height * transform.d };
    const x = transform.e + (width - geometry.width) / 2;
    const y = transform.f + (height - geometry.height) / 2;
    gpu.canvas.style.transform = row.style.transform;
    // No guessed page color behind translucent glass: keep coverage and color together.
    if (
      !gpu.draw(
        Number(optics.style.getPropertyValue("--tab-bar-text-lift")),
        x,
        y,
        false,
        false,
        geometry,
        false,
      )
    ) {
      failed = true;
      release();
      report("GPU unavailable · SVG fallback");
    }
  };
  const prepare = async () => {
    if (disposed || failed) return;
    if (group.hasAttribute("data-minimized") || group.hasAttribute("data-tab-bar-resizing")) {
      requested = undefined;
      fallback();
      return;
    }
    const started = performance.now();
    let source: ReturnType<typeof glyphs.get>;
    try {
      const computed = getComputedStyle(group);
      const width = parseFloat(computed.width),
        height = parseFloat(computed.height);
      const lensWidth = parseFloat(highlight.style.width),
        lensHeight = parseFloat(highlight.style.height);
      if (!(width > 0 && height > 0 && lensWidth > 0 && lensHeight > 0)) {
        requested = undefined;
        fallback();
        return;
      }
      const density = devicePixelRatio;
      const clone = glyphRow(centre, width, height);
      const plainLabels = Array.from(clone.children, (item) => {
        const label = Array.from(item.children).find((child) =>
          child.matches("[data-tab-bar-content]:not([aria-hidden])"),
        );
        return label && !label.children.length ? label : undefined;
      });
      const labels = plainLabels.map((label) => {
        if (!label) return;
        const text = label.textContent;
        label.textContent = "";
        return text;
      });
      const serializer = new XMLSerializer();
      const faces = documentFontFaces();
      const layout = `${density}:${serializer.serializeToString(clone)}\n${faces.map((rule) => `${rule.parentStyleSheet?.href ?? ""}:${rule.cssText}`).join("\n")}`;
      const key = `${layout}\n${JSON.stringify(labels)}`;
      if (key === requested?.key) return;
      const changed = labels.flatMap((label, i) => (label !== painted?.labels[i] ? [i] : []));
      const strip =
        gpu?.canvas.isConnected && layout === painted?.layout && changed.length === 1
          ? glyphStrip(clone, changed[0]!, density, gpu.canvas.width)
          : undefined;
      source = glyphs.get(group);
      if (strip || source?.key !== key) {
        plainLabels.forEach((label, i) => {
          if (label) label.textContent = labels[i]!;
        });
        const image = decodeGlyphs(
          faces,
          serializer.serializeToString(clone),
          width,
          height,
          density,
          strip,
        );
        source = { key, image };
        // A strip is not a complete source when GPU mode is re-enabled later.
        if (!strip) glyphs.set(group, source);
        report("Preparing GPU glyphs · SVG active");
      }
      requested = source;
      fallback();
      const image = await source.image;
      if (disposed || failed || requested !== source) return;
      if (gpu && (gpu.width !== width || gpu.height !== height || gpu.density !== density))
        release();
      if (!gpu) {
        gpu = new TextRefractionGPU(image, width, height, density, lensWidth, lensHeight);
        const canvas = gpu.canvas;
        canvas.className = stylex.props(styles.canvas).className ?? "";
        canvas.setAttribute("aria-hidden", "true");
        canvas.dataset["tabBarTextCanvas"] = "";
        canvas.dataset["textureBytes"] = String(gpu.bytes);
        canvas.addEventListener("webglcontextlost", (event) => {
          if (canvas !== gpu?.canvas) return;
          event.preventDefault();
          failed = true;
          release();
          report("Context lost · SVG fallback");
        });
      } else if (
        key !== painted?.key &&
        !(strip ? gpu.updateGlyphStrip(image, strip.x) : gpu.updateGlyphs(image))
      ) {
        throw Error("Glyph upload failed");
      }
      painted = { key, layout, labels };
      const canvas = gpu.canvas;
      canvas.dataset["preparationMs"] = String(performance.now() - started);
      optics.className = `${opticsClass} ${stylex.props(styles.gpuOptics).className}`;
      row.className = `${rowClass} ${stylex.props(styles.hidden).className}`;
      optics.dataset["tabBarTextGpu"] = "";
      optics.append(canvas);
      const bytes = gpu.bytes;
      draw();
      if (!failed)
        report(
          `GPU · ${strip ? "label strip" : "full glyph row"} · ${(bytes / 1024).toFixed(0)} KiB textures`,
        );
    } catch (error) {
      if (source && glyphs.get(group) === source) glyphs.delete(group);
      if (disposed || (source && requested !== source)) return;
      failed = true;
      release();
      report(`SVG fallback · ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  const schedule = () => {
    if (queued || failed || disposed) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      void prepare();
    });
  };
  const motion = new MutationObserver(() => draw());
  motion.observe(highlight, { attributes: true, attributeFilter: ["style"] });
  motion.observe(row, { attributes: true, attributeFilter: ["style"] });
  motion.observe(optics, { attributes: true, attributeFilter: ["style"] });
  const inputs = new MutationObserver(schedule);
  inputs.observe(list, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-current",
      "class",
      "style",
      "disabled",
      "aria-disabled",
      "hidden",
      "src",
      "href",
      "xlink:href",
      "d",
      "fill",
      "stroke",
    ],
  });
  const appearance = new MutationObserver(schedule);
  for (let node = group.parentElement; node; node = node.parentElement)
    appearance.observe(node, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
  const minimize = new MutationObserver(schedule);
  minimize.observe(group, {
    attributes: true,
    attributeFilter: ["data-minimized", "data-tab-bar-resizing"],
  });
  const resize = new ResizeObserver(schedule);
  resize.observe(group);
  resize.observe(list);
  window.addEventListener("resize", schedule);
  list.addEventListener("scroll", schedule, { passive: true });
  document.fonts.addEventListener("loadingdone", schedule);
  schedule();
  return () => {
    disposed = true;
    for (const observer of [motion, inputs, appearance, minimize, resize]) observer.disconnect();
    window.removeEventListener("resize", schedule);
    list.removeEventListener("scroll", schedule);
    document.fonts.removeEventListener("loadingdone", schedule);
    release();
    optics.style.removeProperty("--tab-bar-text-lift");
  };
}
