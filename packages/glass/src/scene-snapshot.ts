import type { BackdropSnapshot } from "./backdrop-snapshot.js";
import type { GlassBackdropScene } from "./backdrop-perimeter.js";
import { coreOptics } from "./core-optics.js";
import { profile } from "./optical-fields.js";
import { readLens } from "./refraction.js";
import { SceneOptics } from "./scene-optics.js";

/** Retain certified document pixels, not a transformed image of a finished lens. */
export function movingSceneSnapshot(
  element: HTMLElement,
  scene: GlassBackdropScene,
  bounds: DOMRectReadOnly,
  signal: AbortSignal,
): BackdropSnapshot | undefined {
  if (!scene.opaque) return;
  const doc = element.ownerDocument,
    view = doc.defaultView!,
    dpr = view.devicePixelRatio,
    insideControl = scene.insideControl;
  const surface = doc.createElement("div"),
    root = surface.attachShadow({ mode: "open" }),
    canvas = doc.createElement("canvas"),
    input = doc.createElement("canvas"),
    rim = doc.createElement("div"),
    edge = doc.createElement("div");
  surface.setAttribute("data-glass-renderer", "scene");
  surface.setAttribute("data-glass-live-geometry", "");
  canvas.style.cssText = rim.style.cssText = "position:absolute;inset:0;pointer-events:none";
  edge.style.cssText = "position:absolute;inset:-1px;pointer-events:none";
  root.append(canvas);
  if (!insideControl) root.append(rim, edge);
  let renderer: SceneOptics | undefined,
    revision = 0,
    previous = "",
    paint = "",
    lost = false;
  const context = input.getContext("2d", { alpha: false })!,
    output = canvas.getContext("2d")!;
  const onLost = () => {
    lost = true;
  };
  const update = () => {
    if (lost || signal.aborted || view.devicePixelRatio !== dpr) return false;
    const style = view.getComputedStyle(element),
      box = element.getBoundingClientRect(),
      size = { width: element.offsetWidth, height: element.offsetHeight };
    for (let node: HTMLElement | null = element; node; node = node.parentElement) {
      const css = view.getComputedStyle(node);
      if (css.rotate !== "none" || css.perspective !== "none") return false;
      if (css.transform !== "none") {
        const matrix = new DOMMatrixReadOnly(css.transform);
        if (!matrix.is2D || matrix.b || matrix.c || matrix.a <= 0 || matrix.d <= 0) return false;
      }
    }
    if (!size.width || !size.height || !box.width || !box.height || style.filter !== "none")
      return false;
    if (Number(style.getPropertyValue("--lenso-glass-face-opacity").trim() || 1) !== 1)
      return false;
    const geometry = readLens(element, style, box);
    if (!geometry) return false;
    const optics = coreOptics(geometry.width, geometry.height, geometry.radius, geometry.shape);
    if (!optics) return false;
    const sx = box.width / size.width,
      radius = Math.min(
        box.width / 2,
        box.height / 2,
        style.borderTopLeftRadius.endsWith("%")
          ? (Math.min(box.width, box.height) * parseFloat(style.borderTopLeftRadius)) / 100
          : parseFloat(style.borderTopLeftRadius) * sx,
      ),
      margin = Math.ceil(
        Number(style.getPropertyValue("--lg-source-reach")) +
          (geometry.shape.sourceBlur ?? 0) * 3 +
          1,
      );
    if (
      !Number.isFinite(margin) ||
      !Number.isFinite(radius) ||
      box.left - margin < bounds.left ||
      box.top - margin < bounds.top ||
      box.right + margin + 2 > bounds.right ||
      box.bottom + margin + 2 > bounds.bottom
    )
      return false;
    const ink = insideControl ? undefined : view.getComputedStyle(element, "::after");
    const key = [
      scene.revision,
      box.x - bounds.x,
      box.y - bounds.y,
      box.width,
      box.height,
      radius,
      margin,
      JSON.stringify(geometry.shape),
      ...(ink
        ? [
            style.opacity,
            style.backgroundImage,
            style.backgroundColor,
            style.boxShadow,
            ink.backgroundImage,
            ink.opacity,
          ]
        : []),
    ].join("|");
    if (key === previous) return true;
    const width = Math.max(
        renderer?.width ?? 0,
        Math.ceil(((Math.max(size.width, box.width) + margin * 2 + 2) * dpr) / 64) * 64,
      ),
      height = Math.max(
        renderer?.height ?? 0,
        Math.ceil(((Math.max(size.height, box.height) + margin * 2 + 2) * dpr) / 64) * 64,
      );
    if (!renderer || renderer.width !== width || renderer.height !== height) {
      renderer?.canvas.removeEventListener("webglcontextlost", onLost);
      renderer?.dispose();
      renderer = new SceneOptics(width, height, true);
      renderer.canvas.addEventListener("webglcontextlost", onLost);
      input.width = width;
      input.height = height;
      canvas.width = width;
      canvas.height = height;
      paint = "";
    }
    const inputKey = [
      scene.revision,
      box.x - bounds.x,
      box.y - bounds.y,
      geometry.shape.sourceBlur,
    ].join("|");
    if (inputKey !== paint) {
      context.clearRect(0, 0, width, height);
      context.drawImage(
        scene.pixels,
        (bounds.x - box.x + margin) * dpr,
        (bounds.y - box.y + margin) * dpr,
      );
      paint = inputKey;
    }
    renderer.render(
      input,
      paint,
      {
        ...geometry,
        shape: { ...geometry.shape, materialForeground: !insideControl },
        filter: doc.createElementNS("http://www.w3.org/2000/svg", "filter"),
        scale: profile(optics.bezel, optics.thickness).maximum * 2 * optics.level,
      },
      dpr,
      { width: box.width, height: box.height, radius, margin },
    );
    const visibleWidth = Math.ceil(box.width * dpr),
      visibleHeight = Math.ceil(box.height * dpr);
    output.clearRect(0, 0, canvas.width, canvas.height);
    output.drawImage(
      renderer.canvas,
      margin * dpr,
      margin * dpr,
      box.width * dpr,
      box.height * dpr,
      0,
      0,
      visibleWidth,
      visibleHeight,
    );
    canvas.setAttribute("data-glass-frame", String(++revision));
    surface.style.width = `${size.width}px`;
    surface.style.height = `${size.height}px`;
    // Keep the same pixel pitch and rounded crop without reallocating at every spring step.
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.style.transformOrigin = "0 0";
    canvas.style.transform = `scale(${size.width / visibleWidth},${size.height / visibleHeight})`;
    surface.style.borderRadius = style.borderRadius;
    if (ink) {
      surface.style.opacity = style.opacity;
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
      for (const name of [
        "background-image",
        "background-size",
        "background-position",
        "background-repeat",
        "opacity",
      ])
        edge.style.setProperty(name, ink.getPropertyValue(name));
    }
    previous = key;
    return true;
  };
  return {
    surface,
    includesMaterial: true,
    insideControl,
    update,
    dispose() {
      renderer?.canvas.removeEventListener("webglcontextlost", onLost);
      renderer?.dispose();
      surface.remove();
      input.width = input.height = canvas.width = canvas.height = 1;
    },
  };
}
