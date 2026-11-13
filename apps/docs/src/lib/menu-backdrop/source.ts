import { prepareGlassBackdrop, type BackdropSnapshotOptions } from "@lenso/glass";
import { captureMenuTexture } from "./vector-paint.js";

function ownsMenu(example: HTMLElement, popup: HTMLElement) {
  const roots = [...example.querySelectorAll<HTMLElement>('[data-lenso-slot="menu-trigger"]')];
  const scopes = new Set<ParentNode>([
    example.getRootNode() as ParentNode,
    popup.getRootNode() as ParentNode,
    popup.ownerDocument,
  ]);
  const children = [...scopes].flatMap((scope) => [
    ...scope.querySelectorAll<HTMLElement>('[data-lenso-slot="menu-submenu-trigger"]'),
  ]);
  const controls = (trigger: HTMLElement, menu: HTMLElement) =>
    !!menu.id && !!trigger.getAttribute("aria-controls")?.split(/\s+/).includes(menu.id);
  const seen = new Set<HTMLElement>();
  for (let menu: HTMLElement | null = popup; menu && !seen.has(menu);) {
    if (roots.some((trigger) => controls(trigger, menu!))) return true;
    seen.add(menu);
    menu =
      children
        .find((trigger) => controls(trigger, menu!))
        ?.closest<HTMLElement>('[data-lenso-slot="menu-popup"]') ?? null;
  }
  return false;
}

/** Register this example's root menus and their native submenu ownership chains. */
export function menuBackdrop(
  example: HTMLElement,
  lens: HTMLElement,
): BackdropSnapshotOptions | undefined {
  const popup = lens.closest<HTMLElement>('[data-lenso-slot="menu-popup"]');
  const source = example.closest<HTMLElement>("#nd-notebook-layout");
  const view = lens.ownerDocument.defaultView;
  if (!popup || !source || !view || source.contains(lens)) return;
  const foreground = popup.querySelector<HTMLElement>('[data-lenso-slot="menu-content"]');
  if (!foreground) return;
  // Base UI may commit the trigger link after the lens ref, especially in WebKit.
  let owned = false;
  const owns = () => owned || (owned = ownsMenu(example, popup));
  return {
    source,
    foreground,
    ready: () =>
      example.isConnected &&
      popup.isConnected &&
      popup.hasAttribute("data-open") &&
      owns() &&
      !popup.hasAttribute("data-ending-style") &&
      foreground.style.opacity === "1" &&
      foreground.style.filter === "",
    async prepare(signal, checkpoint) {
      if (!owns()) return;
      const dpr = view.devicePixelRatio;
      if (![1, 2].includes(dpr) || signal.aborted) return;
      const box = lens.getBoundingClientRect();
      // Keep the registered page paint on its original raster grid, including fractional scrolling.
      const raster = (
        source.querySelector<HTMLElement>('[data-lenso-backdrop="true"]') ?? source
      ).getBoundingClientRect();
      const tile = 254;
      const phase = (point: number, origin: number, scroll: number) => {
        const offset = (point + scroll) * dpr - Math.round((origin + scroll) * dpr);
        return ((offset % tile) + tile) % tile;
      };
      const x = phase(box.x, raster.x, view.scrollX),
        y = phase(box.y, raster.y, view.scrollY);
      if (![x, y].every((n) => Number.isInteger(n) && n >= 0)) return;
      const style = view.getComputedStyle(lens);
      const radius = parseFloat(style.borderTopLeftRadius),
        reach = Number(style.getPropertyValue("--lg-source-reach")),
        blur = parseFloat(style.getPropertyValue("--lg-blur"));
      if (![radius, reach, blur].every((n) => Number.isFinite(n) && n >= 0)) return;
      // Preserve the page raster phase while including the whole optical neighbourhood.
      const padding = Math.ceil(((reach + 3 * blur + 4) * dpr) / tile) * tile;
      const bounds = new DOMRect(
        box.x - (x + padding) / dpr,
        box.y - (y + padding) / dpr,
        (Math.ceil((box.width * dpr + x) / tile) * tile + 2 * padding) / dpr,
        (Math.ceil((box.height * dpr + y) / tile) * tile + 2 * padding) / dpr,
      );
      const captured = await captureMenuTexture(
        source,
        bounds,
        box,
        dpr,
        radius,
        reach,
        blur,
        checkpoint,
      );
      if (!captured) return;
      const { pixels, opaque } = captured;
      let transferred = false;
      try {
        const prepared =
          !signal.aborted &&
          (await prepareGlassBackdrop(
            lens,
            { pixels, opaque, x: (x + padding) / dpr, y: (y + padding) / dpr },
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
