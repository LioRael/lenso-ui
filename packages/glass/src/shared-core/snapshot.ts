import { createCoreBatch } from "./batch.js";
import type { CoreOptics } from "../core-optics.js";
import type { BackdropSnapshot } from "../backdrop-snapshot.js";
import type { GlassBackdropScene } from "../backdrop-perimeter.js";
import { SceneOptics } from "../scene-optics.js";
import { readLens } from "../refraction.js";
import { profile } from "../optical-fields.js";

/** Owned page captures already provide pixels; they do not need a second SVG optical pass. */
export async function coreSnapshot(
  element: HTMLElement,
  scene: GlassBackdropScene,
  optics: CoreOptics,
  signal: AbortSignal,
  checkpoint: () => Promise<boolean>,
): Promise<BackdropSnapshot | undefined> {
  const doc = element.ownerDocument,
    view = doc.defaultView!;
  const style = view.getComputedStyle(element),
    box = element.getBoundingClientRect();
  const { width, height } = optics,
    dpr = view.devicePixelRatio;
  const blur = parseFloat(style.getPropertyValue("--lg-blur"));
  const margin = Math.ceil(Number(style.getPropertyValue("--lg-source-reach")) + blur * 3 + 1);
  const face = Number(style.getPropertyValue("--lenso-glass-face-opacity").trim() || 1);
  if (
    box.width !== width ||
    box.height !== height ||
    face !== 1 ||
    Number(style.opacity) !== 1 ||
    !Number.isFinite(margin) ||
    scene.x < margin ||
    scene.y < margin ||
    (scene.x + width + margin + 2) * dpr > scene.pixels.width ||
    (scene.y + height + margin + 2) * dpr > scene.pixels.height
  )
    return;
  const input = doc.createElement("canvas");
  input.width = (width + margin * 2 + 2) * dpr;
  input.height = (height + margin * 2 + 2) * dpr;
  const source = scene.pixels.getContext("2d")!;
  const opaque = scene.opaque || source.getContextAttributes().alpha === false;
  const context = input.getContext("2d", { alpha: !opaque })!;
  context.drawImage(
    scene.pixels,
    (scene.x - margin) * dpr,
    (scene.y - margin) * dpr,
    input.width,
    input.height,
    0,
    0,
    input.width,
    input.height,
  );
  if (!opaque) {
    const pixels = context.getImageData(0, 0, input.width, input.height).data;
    for (let at = 3; at < pixels.length; at += 4) if (pixels[at] !== 255) return;
  }
  if (!(await checkpoint()) || signal.aborted) return;
  const canvas = doc.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.cssText = `position:absolute;inset:0;width:${width}px;height:${height}px;border-radius:${style.borderRadius}`;
  let lost = false;
  try {
    if (scene.renderer === "scene") {
      const geometry = readLens(element);
      if (!geometry) return;
      const renderer = new SceneOptics(input.width, input.height, true);
      try {
        renderer.render(
          input,
          "snapshot",
          {
            ...geometry,
            shape: { ...geometry.shape, materialForeground: true },
            filter: doc.createElementNS("http://www.w3.org/2000/svg", "filter"),
            scale: profile(optics.bezel, optics.thickness).maximum * 2 * optics.level,
          },
          dpr,
          { width, height, radius: geometry.radius, margin },
        );
        canvas
          .getContext("2d")!
          .drawImage(
            renderer.canvas,
            margin * dpr,
            margin * dpr,
            canvas.width,
            canvas.height,
            0,
            0,
            canvas.width,
            canvas.height,
          );
      } finally {
        renderer.dispose();
      }
    } else {
      const batch = await createCoreBatch(
        { width, height, margin, dpr, count: 1, blur },
        optics,
        () => {
          lost = true;
        },
      );
      try {
        if (signal.aborted || lost) return;
        batch.paint(
          {
            pixels: { canvas: input, width: input.width, height: input.height },
            indices: [0],
            columns: 1,
          },
          [canvas.getContext("2d")!],
        );
      } finally {
        batch.dispose();
      }
    }
  } catch {
    // A rejected GPU allocation keeps the existing owned SVG/native snapshot available.
    return;
  } finally {
    input.width = input.height = 1;
  }
  if (!(await checkpoint()) || signal.aborted || lost) return;
  const surface = doc.createElement("div"),
    root = surface.attachShadow({ mode: "open" });
  surface.setAttribute("data-glass-renderer", scene.renderer ?? "shared-core");
  const rim = doc.createElement("div");
  rim.style.cssText = "position:absolute;inset:0;pointer-events:none";
  for (const name of [
    "background-color",
    "background-image",
    "background-size",
    "background-position",
    "background-repeat",
    "box-shadow",
    "border-radius",
  ])
    rim.style.setProperty(name, style.getPropertyValue(name));
  root.append(canvas, rim);
  if (scene.renderer === "scene" && element.hasAttribute("data-lenso-glass-foreground-rim")) {
    const edge = doc.createElement("div"),
      ink = view.getComputedStyle(element, "::after");
    edge.style.cssText = `position:absolute;inset:${ink.inset};pointer-events:none`;
    for (const name of [
      "background-image",
      "background-size",
      "background-position",
      "background-repeat",
      "opacity",
    ])
      edge.style.setProperty(name, ink.getPropertyValue(name));
    root.append(edge);
  }
  return {
    surface,
    includesMaterial: true,
    present: () => surface.isConnected && canvas.isConnected,
    dispose() {
      surface.remove();
      canvas.width = canvas.height = 1;
      scene.pixels.remove();
    },
  };
}
