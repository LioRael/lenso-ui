import { prepareGlassBackdrop, type BackdropSnapshotOptions } from "@lenso/glass";
import { captureMenuTexture } from "./vector-paint.js";

/** Register only the root popup controlled by this example. The page remains the fallback. */
export function menuBackdrop(
  example: HTMLElement,
  lens: HTMLElement,
): BackdropSnapshotOptions | undefined {
  const popup = lens.closest<HTMLElement>('[data-slot="menu-popup"]');
  const trigger = example.querySelector<HTMLElement>('[data-slot="menu-trigger"]');
  const source = example.closest<HTMLElement>("#nd-notebook-layout");
  const view = lens.ownerDocument.defaultView;
  if (
    !popup?.id ||
    !trigger ||
    !source ||
    !view ||
    source.contains(lens) ||
    !trigger.getAttribute("aria-controls")?.split(/\s+/).includes(popup.id)
  )
    return;
  const foreground = popup.querySelector<HTMLElement>('[data-slot="menu-content"]');
  if (!foreground) return;
  return {
    source,
    foreground,
    ready: () =>
      example.isConnected &&
      popup.isConnected &&
      popup.hasAttribute("data-open") &&
      !popup.hasAttribute("data-ending-style") &&
      foreground.style.opacity === "1" &&
      foreground.style.filter === "",
    async prepare(signal, checkpoint) {
      const dpr = view.devicePixelRatio;
      if (![1, 2].includes(dpr) || signal.aborted) return;
      const box = lens.getBoundingClientRect();
      // Keep the registered page paint on its original raster grid, including fractional scrolling.
      const raster = (
        source.querySelector<HTMLElement>('[data-lenso-backdrop="true"]') ?? source
      ).getBoundingClientRect();
      const tile = 254;
      const phase = (point: number, origin: number, scroll: number) =>
        ((point + scroll) * dpr - Math.round((origin + scroll) * dpr)) % tile;
      const x = phase(box.x, raster.x, view.scrollX),
        y = phase(box.y, raster.y, view.scrollY);
      if (![x, y].every((n) => Number.isInteger(n) && n >= 0)) return;
      const bounds = new DOMRect(
        box.x - x / dpr,
        box.y - y / dpr,
        (Math.ceil((box.width * dpr + x) / tile) * tile) / dpr,
        (Math.ceil((box.height * dpr + y) / tile) * tile) / dpr,
      );
      const style = view.getComputedStyle(lens);
      const radius = parseFloat(style.borderTopLeftRadius),
        reach = Number(style.getPropertyValue("--lg-source-reach")),
        blur = parseFloat(style.getPropertyValue("--lg-blur"));
      if (![radius, reach, blur].every((n) => Number.isFinite(n) && n >= 0)) return;
      const pixels = await captureMenuTexture(
        source,
        bounds,
        box,
        dpr,
        radius,
        reach,
        blur,
        checkpoint,
      );
      if (!pixels) return;
      let transferred = false;
      try {
        const prepared =
          !signal.aborted &&
          (await prepareGlassBackdrop(
            lens,
            { pixels, x: x / dpr, y: y / dpr },
            signal,
            checkpoint,
          ));
        if (!prepared) return;
        transferred = true;
        return {
          ...prepared,
          dispose() {
            try {
              prepared.dispose();
            } finally {
              pixels.width = pixels.height = 1;
            }
          },
        };
      } finally {
        if (!transferred) pixels.width = pixels.height = 1;
      }
    },
  };
}
