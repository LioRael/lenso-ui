import { readSceneLens } from "./scene-lens.js";
import { SceneOptics } from "./scene-optics.js";
import type { SharedBackdropRegistration } from "./gpu-backdrop.js";
import type { BackdropOverlay } from "./backdrop.js";
import { readLens } from "./refraction.js";
import { hasForegroundRim } from "./foreground-rim.js";
import { profile } from "./optical-fields.js";
import type { SceneLens } from "./scene-lens.js";
import { coreOptics } from "./core-optics.js";

const photoScenes = new WeakMap<HTMLImageElement, PhotoScene>();

class PhotoScene {
  private renderer?: SceneOptics;
  private photoKey = "";
  private queue = Promise.resolve();
  readonly clients = new Set<() => void>();

  private lost = () => {
    this.dispose();
    for (const fail of this.clients) fail();
  };

  dispose() {
    this.renderer?.canvas.removeEventListener("webglcontextlost", this.lost);
    this.renderer?.dispose();
    this.renderer = undefined;
    this.photoKey = "";
  }

  draw(
    source: HTMLImageElement,
    from: DOMRect,
    box: DOMRect,
    width: number,
    height: number,
    lens: SceneLens,
    margin: number,
    dpr: number,
    output: HTMLCanvasElement,
    valid: () => boolean,
  ) {
    const image = source.currentSrc;
    const job = this.queue.then(async () => {
      if (!valid() || image !== source.currentSrc) return false;
      const photo = { width: Math.ceil(from.width * dpr), height: Math.ceil(from.height * dpr) };
      const renderer = this.renderer;
      if (
        !renderer ||
        renderer.width < width ||
        renderer.height < height ||
        renderer.photo?.width !== photo.width ||
        renderer.photo.height !== photo.height
      ) {
        this.dispose();
        this.renderer = new SceneOptics(
          Math.max(renderer?.width ?? 0, width),
          Math.max(renderer?.height ?? 0, height),
          false,
          photo,
        );
        this.renderer.canvas.addEventListener("webglcontextlost", this.lost);
      }
      const workspace = this.renderer!;
      const key = [image, from.width, from.height, dpr].join("|");
      if (this.photoKey !== key) {
        const paint = document.createElement("canvas");
        paint.width = photo.width;
        paint.height = photo.height;
        try {
          const context = paint.getContext("2d", { alpha: false })!;
          const fit = Math.max(
            from.width / source.naturalWidth,
            from.height / source.naturalHeight,
          );
          const w = source.naturalWidth * fit * dpr,
            h = source.naturalHeight * fit * dpr;
          context.drawImage(source, (from.width * dpr - w) / 2, (from.height * dpr - h) / 2, w, h);
          workspace.uploadPhoto(paint);
          this.photoKey = key;
        } finally {
          paint.width = paint.height = 1;
        }
      }
      await workspace.prepare(lens, margin, dpr);
      if (!valid() || image !== source.currentSrc) return false;
      const left = Math.round((box.left - from.left) * dpr);
      const top = Math.round((box.top - from.top) * dpr);
      // Bound the RGB ray displacement, three 3×3 softness passes and rounding at the clip.
      // The separable convolution expands its own input halo beyond this output region.
      const reach =
        Math.ceil((Math.abs(lens.scale) * (1 + Math.abs(lens.shape.dispersion) * 0.1) * dpr) / 2) +
        4;
      workspace.render(undefined, "", lens, dpr, undefined, {
        x: left - margin * dpr,
        y: photo.height - workspace.height - top + margin * dpr,
        bounds: [
          Math.max(0, left - reach),
          Math.max(0, top - reach),
          Math.min(photo.width, left + Math.ceil(box.width * dpr) + reach),
          Math.min(photo.height, top + Math.ceil(box.height * dpr) + reach),
        ],
      });
      output.width = width;
      output.height = height;
      output
        .getContext("2d", { alpha: false })!
        .drawImage(workspace.canvas, 0, 0, width, height, 0, 0, width, height);
      return true;
    });
    this.queue = job.then(
      () => {},
      () => {},
    );
    return job;
  }
}

/** Opt-in complete photo input. Unsupported paint retains its SVG or native fallback. */
export function registerSceneBackdrop(
  element: HTMLElement,
  source: HTMLElement,
  layer: HTMLElement,
  optics: HTMLElement,
  invalidate: () => void,
  overlay?: BackdropOverlay,
  nativeFallback = false,
  onActive?: (active: boolean) => void,
): SharedBackdropRegistration | undefined {
  const mode = source.getAttribute("data-lenso-backdrop-renderer");
  if (!(source instanceof HTMLImageElement) || (mode !== "scene" && mode !== "scene-shared"))
    return;
  let renderer: SceneOptics | undefined;
  const motion = element.parentElement?.matches('[data-lenso-slot="menu-surface"]');
  if (mode === "scene-shared" && (motion || overlay)) return;
  const shared =
    mode === "scene-shared" ? (photoScenes.get(source) ?? new PhotoScene()) : undefined;
  if (shared) photoScenes.set(source, shared);
  const output = shared && document.createElement("canvas");
  output?.setAttribute("aria-hidden", "true");
  const motionFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
  let requested = "",
    prepared = "",
    pending = false,
    stopped = false,
    failed = false;
  const paint = document.createElement("canvas");
  const restore = () => {
    const wasActive = layer.hasAttribute("data-glass-renderer");
    output?.remove();
    renderer?.canvas.remove();
    layer.removeAttribute("data-glass-renderer");
    optics.style.display = nativeFallback ? "none" : "";
    if (nativeFallback) element.removeAttribute("data-copy");
    if (wasActive) onActive?.(false);
  };
  const fail = () => {
    if (stopped) return;
    failed = true;
    restore();
    renderer?.canvas.removeEventListener("webglcontextlost", fail);
    renderer?.dispose();
    renderer = undefined;
    if (output) output.width = output.height = 1;
    invalidate();
  };
  shared?.clients.add(fail);
  return {
    updateSource() {
      return;
    },
    read(_change, reads, margin) {
      const style = reads.style(element),
        sourceStyle = reads.style(source);
      const filter =
        style.getPropertyValue("--lenso-fusion-filter").trim() ||
        style.getPropertyValue("--lg-filter").trim();
      const size = reads.size(element),
        box = reads.box(element),
        from = reads.box(source);
      const geometry = motion ? readLens(element, style, box) : undefined;
      const dynamic =
        geometry &&
        !overlay &&
        hasForegroundRim(geometry.shape) &&
        coreOptics(geometry.width, geometry.height, geometry.radius, geometry.shape);
      const lens: (SceneLens & { revision: number }) | undefined = dynamic
        ? {
            ...geometry,
            shape: { ...geometry.shape, materialForeground: true },
            filter: motionFilter,
            scale: profile(dynamic.bezel, dynamic.thickness).maximum * 2 * dynamic.level,
            revision: 0,
          }
        : motion
          ? undefined
          : readSceneLens(filter);
      const dpr = devicePixelRatio,
        sx = box.width / size.width,
        sy = box.height / size.height;
      const radius = geometry
        ? Math.min(
            box.width / 2,
            box.height / 2,
            style.borderTopLeftRadius.endsWith("%")
              ? (Math.min(box.width, box.height) * parseFloat(style.borderTopLeftRadius)) / 100
              : parseFloat(style.borderTopLeftRadius) * sx,
          )
        : 0;
      if (dynamic && lens)
        margin = Math.ceil(
          (Math.abs(lens.scale) * (1 + lens.shape.dispersion * 0.1)) / 2 +
            (lens.shape.sourceBlur ?? 0) * 3 +
            1,
        );
      const inputScaleX = dynamic ? 1 : sx,
        inputScaleY = dynamic ? 1 : sy;
      const sigma = (lens?.shape.sourceBlur ?? 0) * dpr;
      let axisAligned = true;
      for (const start of [element, source])
        for (let node: HTMLElement | null = start; node; node = node.parentElement) {
          const nodeStyle = reads.style(node);
          if (nodeStyle.rotate !== "none" || nodeStyle.perspective !== "none") axisAligned = false;
          const transform = nodeStyle.transform;
          if (transform === "none") continue;
          const matrix = new DOMMatrixReadOnly(transform);
          if (!matrix.is2D || matrix.b !== 0 || matrix.c !== 0 || matrix.a <= 0 || matrix.d <= 0)
            axisAligned = false;
        }
      const qualified =
        !failed &&
        axisAligned &&
        lens &&
        source.complete &&
        source.naturalWidth > 0 &&
        [1, 2].includes(dpr) &&
        sigma > 0 &&
        Math.ceil(sigma * 3) <= 96 &&
        (!shared || (sx === 1 && sy === 1)) &&
        (dynamic || (lens.width === size.width && lens.height === size.height)) &&
        sx > 0 &&
        sy > 0 &&
        sourceStyle.objectFit === "cover" &&
        sourceStyle.objectPosition === "50% 50%" &&
        sourceStyle.opacity === "1" &&
        sourceStyle.filter === "none" &&
        style.filter === "none" &&
        from.left <= box.left - margin * inputScaleX &&
        from.top <= box.top - margin * inputScaleY &&
        from.right >= box.right + margin * inputScaleX &&
        from.bottom >= box.bottom + margin * inputScaleY;
      const shadow = overlay ? reads.box(overlay.source) : undefined;
      const shadowPaint = overlay?.source.outerHTML ?? "";
      const shadowVisible = overlay && reads.style(overlay.source).visibility !== "hidden";
      const borderRadius = style.borderRadius;
      const key = qualified
        ? [
            filter,
            lens.revision,
            source.currentSrc,
            shared ? Math.round((box.x - from.x) * dpr) : box.x,
            shared ? Math.round((box.y - from.y) * dpr) : box.y,
            box.width,
            box.height,
            shared ? 0 : from.x,
            shared ? 0 : from.y,
            from.width,
            from.height,
            margin,
            dpr,
            shadowVisible,
            borderRadius,
            shadowPaint,
            dynamic ? JSON.stringify(lens.shape) : "",
          ].join("|")
        : "";
      const current = !!key && prepared === key;
      return {
        native: !current,
        write() {
          if (stopped) return;
          requested = key;
          if (!current && (!dynamic || !qualified)) restore();
          if (!qualified || !key || pending) return;
          const show = () => {
            const canvas = output ?? renderer?.canvas;
            if (!canvas) return;
            if (canvas.parentNode !== layer) layer.append(canvas);
            optics.style.display = "none";
            if (nativeFallback) element.toggleAttribute("data-copy", true);
            if (!layer.hasAttribute("data-glass-renderer")) {
              layer.setAttribute("data-glass-renderer", mode);
              onActive?.(true);
            }
          };
          if (current) {
            show();
            return;
          }
          pending = true;
          void (async () => {
            // A screen-space allocation survives the spring. CSS cancels only the
            // ancestor scale; blur and refraction stay in displayed pixel units.
            let width = Math.ceil(
                ((dynamic ? Math.max(size.width, box.width) : size.width) + margin * 2) * dpr,
              ),
              height = Math.ceil(
                ((dynamic ? Math.max(size.height, box.height) : size.height) + margin * 2) * dpr,
              );
            if (dynamic) {
              width = Math.max(renderer?.width ?? 0, Math.ceil(width / 64) * 64);
              height = Math.max(renderer?.height ?? 0, Math.ceil(height / 64) * 64);
            }
            if (shared && output) {
              if (
                !(await shared.draw(
                  source,
                  from,
                  box,
                  width,
                  height,
                  lens,
                  margin,
                  dpr,
                  output,
                  () => !stopped && !failed && requested === key,
                ))
              )
                return;
              output.style.cssText = `position:absolute;pointer-events:none;left:${-margin}px;top:${-margin}px;width:${width / dpr}px;height:${height / dpr}px;clip-path:inset(${margin}px round ${borderRadius})`;
              prepared = key;
              show();
              return;
            }
            if (!renderer || renderer.width !== width || renderer.height !== height) {
              renderer?.canvas.removeEventListener("webglcontextlost", fail);
              renderer?.dispose();
              renderer = new SceneOptics(width, height, !!dynamic);
              renderer.canvas.setAttribute("aria-hidden", "true");
              renderer.canvas.addEventListener("webglcontextlost", fail);
            }
            if (!dynamic) await renderer.prepare(lens, margin, dpr);
            if (stopped || requested !== key) return;
            const rx = dynamic ? inputScaleX / sx : 1,
              ry = dynamic ? inputScaleY / sy : 1;
            const clip = dynamic ? "none" : `inset(${margin}px round ${borderRadius})`;
            renderer.canvas.style.cssText = `position:absolute;pointer-events:none;left:${-margin * rx}px;top:${-margin * ry}px;width:${(width / dpr) * rx}px;height:${(height / dpr) * ry}px;clip-path:${clip}`;
            paint.width = width;
            paint.height = height;
            const context = paint.getContext("2d", { alpha: false })!;
            context.scale(dpr, dpr);
            const fit = Math.max(
              from.width / source.naturalWidth,
              from.height / source.naturalHeight,
            );
            context.drawImage(
              source,
              (from.x + (from.width - source.naturalWidth * fit) / 2 - box.x) / inputScaleX +
                margin,
              (from.y + (from.height - source.naturalHeight * fit) / 2 - box.y) / inputScaleY +
                margin,
              (source.naturalWidth * fit) / inputScaleX,
              (source.naturalHeight * fit) / inputScaleY,
            );
            if (shadow && shadowVisible) {
              const svg = new DOMParser()
                .parseFromString(shadowPaint, "text/html")
                .querySelector("svg")!;
              svg.style.cssText = "overflow:visible";
              svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
              svg.setAttribute("width", String(shadow.width));
              svg.setAttribute("height", String(shadow.height));
              const image = new Image();
              image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
              await image.decode();
              if (stopped || requested !== key) return;
              context.drawImage(
                image,
                (shadow.x - box.x) / sx + margin,
                (shadow.y - box.y) / sy + margin,
                shadow.width / sx,
                shadow.height / sy,
              );
            }
            renderer.render(
              paint,
              key,
              lens,
              dpr,
              dynamic
                ? {
                    width: box.width,
                    height: box.height,
                    radius,
                    margin,
                  }
                : undefined,
            );
            prepared = key;
            if (!stopped && requested === key) show();
          })()
            .catch(fail)
            .finally(() => {
              pending = false;
              paint.width = paint.height = 1;
              if (!stopped) invalidate();
            });
        },
      };
    },
    visible(value) {
      if (!value) restore();
    },
    stop() {
      stopped = true;
      restore();
      renderer?.canvas.removeEventListener("webglcontextlost", fail);
      renderer?.dispose();
      renderer = undefined;
      if (output) output.width = output.height = 1;
      if (shared) {
        shared.clients.delete(fail);
        if (!shared.clients.size) {
          shared.dispose();
          photoScenes.delete(source);
        }
      }
      paint.width = paint.height = 1;
    },
  };
}
