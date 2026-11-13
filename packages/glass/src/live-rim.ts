import * as stylex from "@stylexjs/stylex";
import { materialStyles } from "@lenso/tokens/materials";
import { foregroundRimShadow, foregroundRimTiles, hasForegroundRim } from "./foreground-rim.js";
import { paintLiveRim, releaseLiveRim } from "./live-rim-gpu.js";
import type { Shape } from "./optical-fields.js";

/** The foreground does not wait for optical-map encoding or image decoding. */
export function createLiveRim(element: HTMLElement, output: HTMLElement = element) {
  const owner = {};
  let canvas: HTMLCanvasElement | undefined;
  let tiles: ReturnType<typeof foregroundRimTiles> | undefined;
  let recipe = "";
  let geometry = "";
  const shadow = element.style.getPropertyValue("--lg-foreground-shadow");
  const clear = () => {
    // Deferred optics may share the host with a contour owned by its animation.
    if (!canvas) return;
    releaseLiveRim(owner);
    canvas?.remove();
    canvas = undefined;
    tiles = undefined;
    recipe = geometry = "";
    element.removeAttribute("data-material-live-rim");
    if (!element.hasAttribute("data-lenso-glass-foreground-rim")) {
      if (shadow) element.style.setProperty("--lg-foreground-shadow", shadow);
      else element.style.removeProperty("--lg-foreground-shadow");
    }
  };
  return {
    paint(
      width: number,
      height: number,
      radius: number,
      shape: Shape,
      layout?: { width: number; height: number },
    ) {
      if (!hasForegroundRim(shape)) {
        clear();
        return;
      }
      const box = layout ?? { width, height };
      const next = JSON.stringify([
        radius,
        shape.lightIntensity,
        shape.lightAngle,
        shape.materialProfile,
        shape.materialClarity,
        shape.appleMode,
      ]);
      if (next !== recipe) {
        tiles = undefined;
        recipe = next;
        geometry = "";
      }
      const shadow = foregroundRimShadow(shape.materialSize);
      if (element.style.getPropertyValue("--lg-foreground-shadow") !== shadow)
        element.style.setProperty("--lg-foreground-shadow", shadow);
      if (`${width}:${height}:${box.width}:${box.height}` === geometry) return;
      const gpu = layout ? paintLiveRim(width, height, radius, shape, layout, owner) : undefined;
      if (!gpu) tiles ??= foregroundRimTiles(radius, shape);
      const image = gpu ?? tiles!(width, height);
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.className = stylex.props(materialStyles.liveRim).className!;
        canvas.setAttribute("data-lenso-live-rim", "");
        canvas.setAttribute("aria-hidden", "true");
        output.append(canvas);
      }
      // Pixels describe the visible contour; CSS counter-scales the fixed optical input.
      const scaleX = box.width / width,
        scaleY = box.height / height;
      canvas.style.left = `${-scaleX}px`;
      canvas.style.top = `${-scaleY}px`;
      canvas.style.width = `${(width + 2) * scaleX}px`;
      canvas.style.height = `${(height + 2) * scaleY}px`;
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d")!;
      // WebGL's viewport is bottom-left; canvas image coordinates start at the top.
      if (gpu)
        context.drawImage(
          gpu.canvas,
          0,
          gpu.canvas.height - gpu.height,
          gpu.width,
          gpu.height,
          0,
          0,
          gpu.width,
          gpu.height,
        );
      else {
        const pixels = image as ReturnType<ReturnType<typeof foregroundRimTiles>>;
        context.putImageData(new ImageData(pixels.data, pixels.width, pixels.height), 0, 0);
      }
      geometry = `${width}:${height}:${box.width}:${box.height}`;
      element.setAttribute("data-material-live-rim", "");
    },
    destroy: clear,
  };
}
