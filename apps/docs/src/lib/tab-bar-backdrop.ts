import {
  prepareGlassBackdrop,
  type BackdropSnapshotOptions,
  type GlassBackdropScene,
} from "@lenso/glass";
import { captureMenuTexture } from "./menu-backdrop/vector-paint.js";

/** Reuse the certified document painter; navigation foreground never enters its own backdrop. */
export function tabBarBackdrop(
  example: HTMLElement,
  lens: HTMLElement,
): BackdropSnapshotOptions | undefined {
  const navigation = lens.closest<HTMLElement>('[data-lenso-slot="tab-bar"]');
  const source = example.closest<HTMLElement>("#nd-notebook-layout");
  const view = lens.ownerDocument.defaultView;
  if (
    !navigation ||
    !example.contains(navigation) ||
    !source ||
    !view ||
    /Chrom(?:e|ium)\//.test(view.navigator.userAgent) ||
    !lens.parentElement?.matches('[data-material="glass-small"]')
  )
    return;
  const exclude = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    return navigation.contains(node) || !!element?.closest("[data-material-live-paints]");
  };
  return {
    source,
    liveGeometry: true,
    liveSource: true,
    exclude,
    ready: () => example.isConnected && navigation.isConnected && navigation.contains(lens),
    async prepare(signal, checkpoint) {
      const dpr = view.devicePixelRatio;
      if (![1, 2].includes(dpr) || signal.aborted) return;
      const box = lens.getBoundingClientRect();
      const nav = navigation.getBoundingClientRect();
      const container = example.getBoundingClientRect();
      // Cover both groups and elastic overshoot, including an initially collapsed group.
      const area = new DOMRect(
        container.x - 32,
        nav.y - 32,
        container.width + 64,
        Math.max(62, nav.height) + 64,
      );
      const style = view.getComputedStyle(lens);
      const radius = Math.min(parseFloat(style.borderTopLeftRadius), box.width / 2, box.height / 2);
      const reach = Number(style.getPropertyValue("--lg-source-reach"));
      const blur = parseFloat(style.getPropertyValue("--lg-blur"));
      if (![radius, reach, blur].every((n) => Number.isFinite(n) && n >= 0)) return;
      const tile = 254;
      const raster = (
        source.querySelector<HTMLElement>('[data-lenso-backdrop="true"]') ?? source
      ).getBoundingClientRect();
      const phase = (point: number, origin: number, scroll: number) => {
        const offset = (point + scroll) * dpr - Math.round((origin + scroll) * dpr);
        return ((offset % tile) + tile) % tile;
      };
      const x = phase(area.x, raster.x, view.scrollX);
      const y = phase(area.y, raster.y, view.scrollY);
      const padding = Math.ceil(((reach + 3 * blur + 4) * dpr) / tile) * tile;
      const bounds = new DOMRect(
        area.x - (x + padding) / dpr,
        area.y - (y + padding) / dpr,
        (Math.ceil((area.width * dpr + x) / tile) * tile + 2 * padding) / dpr,
        (Math.ceil((area.height * dpr + y) / tile) * tile + 2 * padding) / dpr,
      );
      const captured = await captureMenuTexture(
        source,
        bounds,
        area,
        dpr,
        radius,
        reach,
        blur,
        checkpoint,
        { exclude },
      );
      if (!captured) return;
      const scene: GlassBackdropScene = {
        renderer: "scene",
        pixels: captured.pixels,
        opaque: captured.opaque,
        revision: captured.revision,
        x: box.x - bounds.x,
        y: box.y - bounds.y,
        bounds,
      };
      let transferred = false;
      try {
        const prepared =
          !signal.aborted && (await prepareGlassBackdrop(lens, scene, signal, checkpoint));
        if (!prepared) return;
        const origin = { x: bounds.x, y: bounds.y };
        const update = () => {
          const shift = captured.relocate(lens.getBoundingClientRect());
          if (!shift) return false;
          bounds.x = origin.x + shift.x;
          bounds.y = origin.y + shift.y;
          scene.revision = captured.revision;
          return prepared.update?.() ?? false;
        };
        transferred = true;
        return {
          ...prepared,
          update,
          mutate: (records: readonly MutationRecord[]) => captured.mutate(records) && update(),
          dispose() {
            try {
              prepared.dispose();
            } finally {
              captured.dispose();
            }
          },
        };
      } finally {
        if (!transferred) captured.dispose();
      }
    },
  };
}
