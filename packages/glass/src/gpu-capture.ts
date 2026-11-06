import type { BackdropReads, BackdropChange } from "./backdrop-scheduler.js";

export interface CaptureTile {
  x: number;
  y: number;
  scaleX?: number;
  scaleY?: number;
}
export interface CaptureShape {
  width: number;
  height: number;
  margin: number;
  dpr: number;
  count: number;
  blur?: number;
}
interface Paint {
  root: HTMLElement;
  originals: HTMLElement[];
  copies: HTMLElement[];
  moving?: HTMLElement;
  movingIndex?: number;
  opaque: boolean;
  width: number;
  height: number;
}
const paintProperties = [
  "display",
  "position",
  "top",
  "left",
  "width",
  "height",
  "overflow",
  "overflow-x",
  "overflow-y",
  "border-radius",
  "background",
  "transform",
  "transform-origin",
  "translate",
  "rotate",
  "scale",
  "opacity",
  "visibility",
  "z-index",
  "isolation",
];
const movingProperties = ["transform", "translate", "rotate", "scale", "opacity"];
const initialPaint = new Map([
  ["display", "block"],
  ["overflow", "visible"],
  ["overflow-x", "visible"],
  ["overflow-y", "visible"],
  ["border-radius", "0px"],
  ["transform", "none"],
  ["translate", "none"],
  ["rotate", "none"],
  ["scale", "none"],
  ["opacity", "1"],
  ["z-index", "auto"],
  ["isolation", "auto"],
]);
const SVG = "http://www.w3.org/2000/svg";
const HTML = "http://www.w3.org/1999/xhtml";

/** CSS paint boxes have a self-contained SVG snapshot. Other content keeps its native copy. */
function paintTree(source: HTMLElement, reads: BackdropReads): Paint | undefined {
  const originals = [source, ...source.querySelectorAll<HTMLElement>("*")];
  for (const [index, node] of originals.entries()) {
    if (!["DIV", "SPAN"].includes(node.tagName)) return;
    if ([...node.childNodes].some((child) => child.nodeType === 3 && child.textContent?.trim()))
      return;
    const style = reads.style(node);
    if (
      (index > 0 && style.position !== "absolute") ||
      style.filter !== "none" ||
      style.backdropFilter !== "none" ||
      style.mixBlendMode !== "normal" ||
      style.boxShadow !== "none" ||
      style.maskImage !== "none" ||
      style.clipPath !== "none" ||
      style.outlineStyle !== "none" ||
      style.backgroundBlendMode.split(",").some((value) => value.trim() !== "normal") ||
      style.backgroundAttachment.split(",").some((value) => value.trim() !== "scroll") ||
      !["1", "normal"].includes(style.zoom) ||
      style.perspective !== "none" ||
      style.offsetPath !== "none" ||
      (style.contentVisibility && style.contentVisibility !== "visible") ||
      /url\(/i.test(style.backgroundImage) ||
      [
        style.borderTopWidth,
        style.borderRightWidth,
        style.borderBottomWidth,
        style.borderLeftWidth,
      ].some((value) => parseFloat(value) !== 0) ||
      [
        style.paddingTop,
        style.paddingRight,
        style.paddingBottom,
        style.paddingLeft,
        style.marginTop,
        style.marginRight,
        style.marginBottom,
        style.marginLeft,
      ].some((value) => parseFloat(value) !== 0) ||
      !["none", "normal"].includes(getComputedStyle(node, "::before").content) ||
      !["none", "normal"].includes(getComputedStyle(node, "::after").content)
    )
      return;
  }
  const root = source.cloneNode(true) as HTMLElement;
  const copies = [root, ...root.querySelectorAll<HTMLElement>("*")];
  for (const [index, original] of originals.entries()) {
    const copy = copies[index]!;
    // No page stylesheet, URL resource, event attribute or active content enters the image.
    for (const name of copy.getAttributeNames()) copy.removeAttribute(name);
    const style = reads.style(original);
    for (const name of paintProperties) {
      const value = style.getPropertyValue(name);
      if (
        name === "visibility" &&
        value === "visible" &&
        (index === 0 || reads.style(original.parentElement!).visibility === "visible")
      )
        continue;
      if (
        name === "transform-origin" &&
        value === `${parseFloat(style.width) / 2}px ${parseFloat(style.height) / 2}px`
      )
        continue;
      if (initialPaint.get(name) !== value) copy.style.setProperty(name, value);
    }
  }
  const size = reads.size(source);
  const sourceStyle = reads.style(source);
  const gradient = sourceStyle.backgroundImage.replaceAll(/rgb\([\d.,\s]+\)/g, "opaque");
  const opaqueGradient =
    /^(?:repeating-)?linear-gradient\([^()]*\)$/.test(gradient) &&
    (gradient.match(/\bopaque\b/g)?.length ?? 0) >= 2 &&
    !gradient.includes("transparent") &&
    ["auto", "auto auto"].includes(sourceStyle.backgroundSize) &&
    ["repeat", "repeat repeat"].includes(sourceStyle.backgroundRepeat);
  const opaque =
    sourceStyle.opacity === "1" &&
    sourceStyle.visibility === "visible" &&
    sourceStyle.borderRadius === "0px" &&
    (/^rgb\([\d.,\s]+\)$/.test(sourceStyle.backgroundColor) || opaqueGradient);
  root.style.position = "absolute";
  root.style.top = root.style.left = "0px";
  root.style.right = root.style.bottom = "auto";
  root.style.width = `${size.width}px`;
  root.style.height = `${size.height}px`;
  root.style.transform = root.style.translate = root.style.rotate = root.style.scale = "none";
  // A single, independently transformed child can be composited over a cached base
  // without changing paint order or multiplying ancestor opacity.
  const targets = source
    .getAnimations({ subtree: true })
    .map((animation) => animation.effect)
    .filter((effect): effect is KeyframeEffect => effect instanceof KeyframeEffect);
  const child = source.children.length === 1 ? source.firstElementChild : null;
  const separable =
    child instanceof HTMLElement &&
    child.children.length === 0 &&
    reads.style(source).opacity === "1" &&
    targets.length > 0 &&
    targets.every(
      (effect) =>
        effect.target === child &&
        !effect.pseudoElement &&
        effect
          .getKeyframes()
          .every((frame) =>
            Object.keys(frame).every((name) =>
              ["offset", "computedOffset", "easing", "composite", ...movingProperties].includes(
                name,
              ),
            ),
          ),
    );
  if (targets.length && !separable) return;
  return {
    root,
    originals,
    copies,
    moving: separable ? child : undefined,
    movingIndex: separable ? originals.indexOf(child) : undefined,
    opaque,
    ...size,
  };
}

export class BackdropPaint {
  private paint?: Paint;
  private checked = false;
  private previousReads?: BackdropReads;
  private currentBounds?: DOMRect;
  private changed = true;
  revision = 0;

  constructor(readonly source: HTMLElement) {}

  read(change: BackdropChange, reads: BackdropReads): Paint | undefined {
    if (this.previousReads === reads) return this.paint;
    this.previousReads = reads;
    if (
      !this.checked ||
      change.content ||
      change.styles ||
      (change.animated.size &&
        (!this.paint?.moving ||
          [...change.animated.keys()].some((target) => target !== this.paint?.moving)))
    ) {
      this.checked = true;
      const next = paintTree(this.source, reads);
      const unchanged =
        this.paint &&
        next &&
        this.paint.movingIndex === next.movingIndex &&
        this.paint.root.isEqualNode(next.root);
      this.paint = next;
      // Ancestor/control style changes can invalidate the source without changing its paint.
      if (!unchanged) {
        this.revision++;
        this.changed = true;
        this.currentBounds = undefined;
      }
    } else if (this.paint) {
      for (const [original, names] of change.animated) {
        const index = this.paint.originals.indexOf(original as HTMLElement);
        if (index < 0) continue;
        const copy = this.paint.copies[index]!;
        for (const name of names) {
          if (!paintProperties.includes(name)) {
            this.paint = undefined;
            this.revision++;
            return;
          }
          const value = reads.style(original).getPropertyValue(name);
          if (copy.style.getPropertyValue(name) !== value) {
            copy.style.setProperty(name, value);
            this.changed = true;
          }
        }
      }
    }
    if (this.paint?.moving) {
      const origin = reads.box(this.source),
        box = reads.box(this.paint.moving);
      this.currentBounds = new DOMRect(box.x - origin.x, box.y - origin.y, box.width, box.height);
    }
    return this.paint;
  }

  snapshot() {
    const value = {
      paint: this.paint,
      changed: this.changed,
      current: this.currentBounds,
      revision: this.revision,
    };
    this.changed = false;
    return value;
  }
}

function capture(root: HTMLElement, width: number, height: number, dpr: number) {
  const svg = document.createElementNS(SVG, "svg");
  const foreign = document.createElementNS(SVG, "foreignObject");
  const wrapper = document.createElementNS(HTML, "div");
  wrapper.style.cssText = `width:${width}px;height:${height}px;overflow:hidden;zoom:${dpr};transform-origin:0 0`;
  wrapper.append(root);
  foreign.setAttribute("width", String(width * dpr));
  foreign.setAttribute("height", String(height * dpr));
  foreign.append(wrapper);
  svg.append(foreign);
  svg.setAttribute("height", String(height * dpr));
  const image = new Image();
  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  return {
    canvas,
    context,
    async update(activeWidth: number, underlay?: () => void) {
      const pixelWidth = activeWidth * dpr;
      svg.setAttribute("width", String(pixelWidth));
      svg.setAttribute("viewBox", `0 0 ${pixelWidth} ${height * dpr}`);
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
      await image.decode();
      context.clearRect(0, 0, pixelWidth, canvas.height);
      underlay?.();
      context.drawImage(image, 0, 0, pixelWidth, canvas.height);
      return canvas;
    },
    dispose() {
      canvas.width = canvas.height = 1;
      image.src = "";
    },
  };
}

export function createBackdropAtlas(shape: CaptureShape) {
  const { width, height, margin, dpr, count } = shape;
  const strideX = width + 2 * margin + 2,
    strideY = height + 2 * margin + 2;
  const columns = Math.min(10, count),
    rows = Math.ceil(count / columns);
  type Pack = ReturnType<typeof makePack>;
  const packs = new Map<number, Pack>();
  let base: Pack | undefined,
    revision = -1,
    placement = "",
    previousTime = "";
  let captures = 0;
  let previousBounds: DOMRect | undefined;
  function makePack(capacityColumns: number, paint: Paint, staticOnly: boolean, overlay: boolean) {
    const root = document.createElement("div");
    root.style.cssText = `position:relative;width:${capacityColumns * strideX}px;height:${rows * strideY}px`;
    const cells = Array.from({ length: capacityColumns * rows }, (_, index) => {
      const viewport = document.createElement("div");
      viewport.style.cssText = `position:absolute;left:${(index % capacityColumns) * strideX}px;top:${Math.floor(index / capacityColumns) * strideY}px;width:${width + 2 * margin}px;height:${height + 2 * margin}px;overflow:hidden;contain:paint`;
      const frame = document.createElement("div");
      frame.style.cssText = "position:absolute;left:0;top:0";
      const copy = paint.root.cloneNode(true) as HTMLElement;
      const moving =
        paint.movingIndex === undefined
          ? undefined
          : [copy, ...copy.querySelectorAll<HTMLElement>("*")][paint.movingIndex];
      if (staticOnly) moving?.remove();
      if (overlay) copy.style.background = "transparent";
      frame.append(copy);
      viewport.append(frame);
      root.append(viewport);
      return {
        frame,
        moving,
        viewport,
        visible: true,
        x: Number.NaN,
        y: Number.NaN,
        scaleX: Number.NaN,
        scaleY: Number.NaN,
        pose: [] as string[],
      };
    });
    return {
      capture: capture(root, capacityColumns * strideX, rows * strideY, dpr),
      cells,
      columns: capacityColumns,
    };
  }
  const position = (
    pack: Pack,
    indices: number[],
    tiles: CaptureTile[],
    paint: Paint,
    activeColumns = pack.columns,
  ) => {
    const moving = paint.movingIndex === undefined ? undefined : paint.copies[paint.movingIndex];
    const pose = moving ? movingProperties.map((name) => moving.style.getPropertyValue(name)) : [];
    for (const [at, cell] of pack.cells.entries()) {
      const column = at % pack.columns;
      const index =
        column < activeColumns
          ? indices[Math.floor(at / pack.columns) * activeColumns + column]
          : undefined;
      const visible = index !== undefined;
      if (cell.visible !== visible) {
        cell.visible = visible;
        cell.viewport.style.display = visible ? "block" : "none";
      }
      if (index === undefined) continue;
      const tile = tiles[index]!;
      const scaleX = tile.scaleX ?? 1,
        scaleY = tile.scaleY ?? 1;
      if (
        cell.x !== tile.x ||
        cell.y !== tile.y ||
        cell.scaleX !== scaleX ||
        cell.scaleY !== scaleY
      ) {
        cell.x = tile.x;
        cell.y = tile.y;
        cell.scaleX = scaleX;
        cell.scaleY = scaleY;
        // CSSOM serialization rounds transform numbers to six decimal places.
        // Preserve the input's precision when it becomes SVG source text.
        cell.frame.setAttribute(
          "style",
          `position:absolute;left:0;top:0;transform-origin:0 0;transform:translate(${margin - tile.x}px,${margin - tile.y}px) scale(${scaleX},${scaleY})`,
        );
      }
      if (cell.moving && paint.movingIndex !== undefined)
        for (const [property, name] of movingProperties.entries())
          if (cell.pose[property] !== pose[property]) {
            cell.pose[property] = pose[property]!;
            cell.moving.style.setProperty(name, pose[property]!);
          }
    }
  };
  function clear() {
    for (const pack of packs.values()) pack.capture.dispose();
    packs.clear();
    base?.capture.dispose();
    base = undefined;
  }
  return {
    columns,
    rows,
    strideX,
    strideY,
    get captures() {
      return captures;
    },
    async update(state: ReturnType<BackdropPaint["snapshot"]>, tiles: CaptureTile[]) {
      const { paint } = state;
      if (!paint) throw new Error("Backdrop is no longer self-contained paint");
      const nextPlacement = tiles
        .map((tile) => `${tile.x},${tile.y},${tile.scaleX ?? 1},${tile.scaleY ?? 1}`)
        .join(";");
      const full = revision !== state.revision || placement !== nextPlacement;
      if (full) {
        if (revision !== state.revision) clear();
        else {
          base?.capture.dispose();
          base = undefined;
        }
        revision = state.revision;
        placement = nextPlacement;
      }
      const time = paint.copies
        .map((copy) => movingProperties.map((name) => copy.style.getPropertyValue(name)).join(";"))
        .join("|");
      if (!full && !state.changed && previousTime === time) return;
      previousTime = time;
      const all = tiles.map((_, index) => index);
      let indices = all;
      if (!full && paint.moving && state.current && previousBounds) {
        const left = Math.min(state.current.left, previousBounds.left),
          right = Math.max(state.current.right, previousBounds.right);
        const top = Math.min(state.current.top, previousBounds.top),
          bottom = Math.max(state.current.bottom, previousBounds.bottom);
        indices = all.filter((index) => {
          const tile = tiles[index]!;
          return (
            tile.x - margin < right &&
            tile.x + width + margin > left &&
            tile.y - margin < bottom &&
            tile.y + height + margin > top
          );
        });
      }
      previousBounds = state.current;
      if (!indices.length) return;
      const half = Math.max(1, Math.ceil(columns / 2));
      const activeColumns = Math.ceil(indices.length / rows);
      const capacity = activeColumns <= half ? half : columns;
      let pack = packs.get(capacity);
      if (!pack) {
        pack = makePack(capacity, paint, false, !!paint.moving);
        packs.set(capacity, pack);
      }
      position(pack, indices, tiles, paint, activeColumns);
      if (paint.moving && !base) {
        base = makePack(columns, paint, true, false);
        position(base, all, tiles, paint);
        await base.capture.update(columns * strideX);
      }
      const current = pack;
      await pack.capture.update(
        activeColumns * strideX,
        base
          ? () => {
              const first = indices[0]!;
              // A rectangular dirty region can retain the native canvas's single blit.
              const rectangle =
                indices.length % activeColumns === 0 &&
                indices.every(
                  (index, at) =>
                    index ===
                    first + Math.floor(at / activeColumns) * columns + (at % activeColumns),
                );
              if (rectangle) {
                current.capture.context.drawImage(
                  base!.capture.canvas,
                  (first % columns) * strideX * dpr,
                  Math.floor(first / columns) * strideY * dpr,
                  activeColumns * strideX * dpr,
                  (indices.length / activeColumns) * strideY * dpr,
                  0,
                  0,
                  activeColumns * strideX * dpr,
                  (indices.length / activeColumns) * strideY * dpr,
                );
                return;
              }
              for (const [at, index] of indices.entries())
                current.capture.context.drawImage(
                  base!.capture.canvas,
                  (index % columns) * strideX * dpr,
                  Math.floor(index / columns) * strideY * dpr,
                  strideX * dpr,
                  strideY * dpr,
                  (at % activeColumns) * strideX * dpr,
                  Math.floor(at / activeColumns) * strideY * dpr,
                  strideX * dpr,
                  strideY * dpr,
                );
            }
          : undefined,
      );
      captures++;
      return {
        indices,
        columns: activeColumns,
        pixels:
          paint.opaque &&
          tiles.every(
            (tile) =>
              tile.x >= margin &&
              tile.y >= margin &&
              tile.x + width + margin <= paint.width * (tile.scaleX ?? 1) &&
              tile.y + height + margin <= paint.height * (tile.scaleY ?? 1),
          )
            ? {
                canvas: pack.capture.canvas,
                width: activeColumns * strideX * dpr,
                height: rows * strideY * dpr,
              }
            : pack.capture.context.getImageData(
                0,
                0,
                activeColumns * strideX * dpr,
                rows * strideY * dpr,
              ),
      };
    },
    dispose: clear,
  };
}
