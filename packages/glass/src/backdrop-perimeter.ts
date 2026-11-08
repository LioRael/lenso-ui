import { coreOptics, readCoreOptics } from "./core-optics.js";
import { readLens, refractsBackdrop } from "./refraction.js";
import type { BackdropSnapshot } from "./backdrop-snapshot.js";

export interface GlassBackdropScene {
  /** Lens origin in source CSS pixels. */
  x: number;
  y: number;
  /** A detached, dedicated input texture; the snapshot owns it until disposal. */
  pixels: HTMLCanvasElement;
  /** The source owner painted a complete opaque page into this texture. */
  opaque?: boolean;
  /** Replay browser-owned paint only within these source regions, in lens-local CSS pixels. */
  nativePaint?: {
    element: HTMLElement;
    offset: Readonly<{ x: number; y: number }>;
    regions: readonly DOMRectReadOnly[];
  };
}

const SVG = "http://www.w3.org/2000/svg";
const opticalPaint = [
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "background-origin",
  "background-clip",
  "background-blend-mode",
  "box-shadow",
  "border-radius",
  "backdrop-filter",
  "opacity",
  "filter",
];
let localId = 0;

/** Keep foreground damage out of the source pass; only its translated output overlaps the control. */
function presentOwnedPaint(
  edge: HTMLElement,
  world: HTMLElement,
  definitions: SVGDefsElement,
  box: DOMRect,
  view: Window,
  id: string,
) {
  const gap = 4;
  const x = Math.ceil(box.width) + gap;
  const y = Math.ceil(box.height) + gap;
  // Submenus expand beside their parent. Keep the sampling pass clear of that
  // neighboring foreground whenever there is room above or below the lens.
  const dy = box.top >= y ? -y : box.bottom + y <= view.innerHeight ? y : 0;
  const dx = dy ? 0 : box.left >= x ? -x : box.right + x <= view.innerWidth ? x : 0;
  if (!dx && !dy) {
    edge.append(world);
    return;
  }
  const doc = world.ownerDocument;
  const width = box.width + Math.abs(dx);
  const height = box.height + Math.abs(dy);
  const filter = doc.createElementNS(SVG, "filter");
  filter.id = id + "-output";
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  filter.setAttribute("primitiveUnits", "userSpaceOnUse");
  filter.setAttribute("color-interpolation-filters", "sRGB");
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", String(Math.ceil(width)));
  filter.setAttribute("height", String(Math.ceil(height)));
  const offset = doc.createElementNS(SVG, "feOffset");
  offset.setAttribute("in", "SourceGraphic");
  offset.setAttribute("dx", String(-dx));
  offset.setAttribute("dy", String(-dy));
  filter.append(offset);
  definitions.append(filter);

  const transfer = doc.createElement("div");
  transfer.setAttribute("data-glass-optics-transfer", "");
  transfer.style.cssText =
    "position:absolute;pointer-events:none;isolation:isolate;overflow:visible";
  Object.assign(transfer.style, {
    left: Math.min(dx, 0) + "px",
    top: Math.min(dy, 0) + "px",
    width: width + "px",
    height: height + "px",
    filter: `url("#${filter.id}")`,
  });
  // Clip after the optics. Clipping their input here changes the blur and rounded rim.
  Object.assign(world.style, {
    inset: "auto",
    left: Math.max(dx, 0) + "px",
    top: Math.max(dy, 0) + "px",
    width: box.width + "px",
    height: box.height + "px",
    maskImage: "linear-gradient(black, black)",
  });
  transfer.append(world);
  edge.append(transfer);
}

/** The scene owner supplies a complete paint. Unsupported optics continue to use the native lens. */
export async function prepareGlassBackdrop(
  element: HTMLElement,
  scene: GlassBackdropScene,
  signal: AbortSignal,
  checkpoint: () => Promise<boolean>,
): Promise<BackdropSnapshot | undefined> {
  const doc = element.ownerDocument,
    view = doc.defaultView;
  if (
    !view ||
    signal.aborted ||
    scene.pixels.parentNode !== null ||
    scene.pixels.ownerDocument !== doc ||
    (scene.nativePaint &&
      (scene.nativePaint.element.parentNode || scene.nativePaint.element.ownerDocument !== doc))
  )
    return;
  const style = view.getComputedStyle(element),
    box = element.getBoundingClientRect(),
    w = box.width,
    h = box.height,
    dpr = view.devicePixelRatio;
  const radius = parseFloat(style.borderTopLeftRadius),
    blur = parseFloat(style.getPropertyValue("--lg-blur")),
    reach = Number(style.getPropertyValue("--lg-source-reach"));
  if (
    ![w, h].every((v) => Number.isFinite(v) && v > 0) ||
    ![1, 2].includes(dpr) ||
    ![radius, blur, reach].every((v) => Number.isFinite(v) && v >= 0)
  )
    return;
  if (
    ![scene.x * dpr, scene.y * dpr].every(Number.isInteger) ||
    scene.x < 0 ||
    scene.y < 0 ||
    (scene.x + w) * dpr > scene.pixels.width ||
    (scene.y + h) * dpr > scene.pixels.height ||
    !(await checkpoint()) ||
    signal.aborted
  )
    return;
  // Owned pixels can use analytic optics even where the browser cannot filter a live backdrop.
  const geometry = !scene.nativePaint && readLens(element);
  const optics =
    !scene.nativePaint &&
    (readCoreOptics(style.getPropertyValue("--lg-filter")) ||
      (geometry &&
        coreOptics(geometry.width, geometry.height, geometry.radius, {
          ...geometry.shape,
          materialForeground: element.hasAttribute("data-lenso-glass-foreground-rim"),
        })));
  if (optics) {
    const { coreSnapshot } = await import("./shared-core/snapshot.js");
    const prepared = await coreSnapshot(element, scene, optics, signal, checkpoint);
    if (prepared) return prepared;
    if (signal.aborted) return;
  }
  const idList = style
    .getPropertyValue("--lg-filter")
    .trim()
    .match(/^url\(["']?#([^)"'\s]+)["']?\)$/);
  if (!idList) return;
  const original = doc.getElementById(idList[1]!);
  if (!original || original.localName !== "filter" || original.namespaceURI !== SVG) return;
  const filter = original as unknown as SVGFilterElement;
  if (!["userSpaceOnUse", "objectBoundingBox"].includes(original.getAttribute("filterUnits") ?? ""))
    return;
  const surface = doc.createElement("div"),
    root = surface.attachShadow({ mode: "open" });
  const paints = Object.fromEntries(opticalPaint.map((k) => [k, style.getPropertyValue(k)]));
  const glass = doc.createElement("div");
  glass.style.cssText = "position:absolute;inset:0;pointer-events:none";
  for (const [k, v] of Object.entries(paints)) glass.style.setProperty(k, v);
  const dispose = () => {
    surface.remove();
    scene.pixels.remove();
  };
  try {
    const defs = doc.createElementNS(SVG, "svg"),
      local = doc.createElementNS(SVG, "defs"),
      copy = doc.importNode(filter, true);
    copy.id = "lenso-glass-perimeter-" + localId++;
    local.append(copy);
    defs.append(local);
    defs.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
    root.prepend(defs);
    const edge = doc.createElement("div"),
      world = doc.createElement("div"),
      raw = scene.pixels;
    edge.style.cssText =
      "position:absolute;inset:0;overflow:clip;isolation:isolate;pointer-events:none";
    world.style.cssText =
      "position:absolute;inset:0;transform:translateZ(0);overflow:clip;isolation:isolate";
    Object.assign(raw.style, {
      position: "absolute",
      pointerEvents: "none",
      maxWidth: "none",
      maxHeight: "none",
      left: -scene.x + "px",
      top: -scene.y + "px",
      width: raw.width / dpr + "px",
      height: raw.height / dpr + "px",
    });
    glass.style.backgroundSize = w + "px " + h + "px";
    glass.style.backgroundPosition = "0 0";
    glass.style.backdropFilter = paints["backdrop-filter"]!.replace(
      /#([^)'"\s]+)/g,
      () => "#" + copy.id,
    );
    glass.setAttribute("data-glass-local-optics", "");
    if (!refractsBackdrop() && !scene.nativePaint) {
      // Owned pixels are SourceGraphic. WebKit can filter them even though it
      // cannot apply the same SVG graph directly to the browser's backdrop.
      const input = doc.createElement("div");
      input.style.cssText = `position:absolute;inset:0;overflow:visible;filter:blur(${blur}px) url("#${copy.id}")`;
      input.append(raw);
      glass.style.backdropFilter = "none";
      world.append(input);
    } else world.append(raw);
    if (scene.nativePaint) {
      const { element: replay, offset, regions } = scene.nativePaint;
      if (
        !regions.every(
          (r) =>
            [r.x, r.y, r.width, r.height].every(Number.isFinite) && r.width > 0 && r.height > 0,
        )
      ) {
        dispose();
        return;
      }
      if (regions.length) {
        const patch = doc.createElement("div");
        const path = regions
          .map((r) => `M ${r.x} ${r.y} h ${r.width} v ${r.height} h ${-r.width} Z`)
          .join(" ");
        patch.style.cssText = "position:absolute;inset:0;pointer-events:none";
        patch.style.clipPath = `path("${path}")`;
        if (!patch.style.clipPath) {
          dispose();
          return;
        }
        Object.assign(replay.style, {
          position: "absolute",
          left: raw.style.left,
          top: raw.style.top,
          width: raw.style.width,
          height: raw.style.height,
          translate: `${offset.x}px ${offset.y}px`,
        });
        patch.append(replay);
        world.append(patch);
      }
    }
    world.append(glass);
    if (!refractsBackdrop() && !scene.nativePaint) edge.append(world);
    else presentOwnedPaint(edge, world, local, box, view, copy.id);
    root.append(edge);
    return {
      surface,
      includesMaterial: true,
      present: () => surface.isConnected && raw.isConnected && glass.isConnected,
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
