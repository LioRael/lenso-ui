import {
  prepareGlassBackdrop,
  type GlassBackdropScene,
  type GlassBackdropSource,
} from "@lenso/glass";

export const headerGlassBackdrop: GlassBackdropSource = (lens) => {
  const header = lens.closest<HTMLElement>("header");
  const source = header?.closest<HTMLElement>("#nd-notebook-layout, #nd-home-layout");
  const view = lens.ownerDocument.defaultView;
  if (
    !header ||
    !source ||
    !view ||
    !header.matches("#nd-subnav, #nd-home-layout > div > header") ||
    !lens.querySelector(':scope > [data-lenso-slot="glass-press-highlight"]')
  )
    return;
  const chrome = source.id === "nd-home-layout" ? header.parentElement! : header;
  const exclude = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    return chrome.contains(node) || !!element?.closest('[data-lenso-slot="menu-popup"]');
  };
  return {
    source,
    exclude,
    liveGeometry: true,
    ready: () => lens.isConnected && header.contains(lens) && lens.offsetWidth > 0,
    async prepare(signal, checkpoint) {
      const dpr = view.devicePixelRatio;
      if (![1, 2].includes(dpr) || signal.aborted) return;
      const box = lens.getBoundingClientRect();
      const style = view.getComputedStyle(lens);
      const radius = Math.min(parseFloat(style.borderTopLeftRadius), box.width / 2, box.height / 2);
      const reach = Number(style.getPropertyValue("--lg-source-reach"));
      const blur = parseFloat(style.getPropertyValue("--lg-blur"));
      if (![radius, reach, blur].every((n) => Number.isFinite(n) && n >= 0)) return;
      const padding = Math.ceil(reach + 3 * blur + 16);
      const left = Math.floor(box.left) - padding;
      const top = Math.floor(box.top) - padding;
      const bounds = new DOMRect(
        left,
        top,
        Math.ceil(box.right) + padding - left,
        Math.ceil(box.bottom) + padding - top,
      );
      const { captureMenuTexture } = await import("./menu-backdrop/vector-paint.js");
      if (signal.aborted) return;
      const captured = await captureMenuTexture(
        source,
        bounds,
        box,
        dpr,
        radius,
        reach,
        blur,
        checkpoint,
        { exclude },
      );
      if (!captured) return;
      let transferred = false;
      try {
        const scene: GlassBackdropScene = {
          renderer: "scene",
          insideControl: true,
          bounds,
          x: box.x - left,
          y: box.y - top,
          pixels: captured.pixels,
          opaque: captured.opaque,
          revision: captured.revision,
        };
        const snapshot = await prepareGlassBackdrop(lens, scene, signal, checkpoint);
        if (!snapshot) return;
        transferred = true;
        return {
          ...snapshot,
          dispose() {
            try {
              snapshot.dispose();
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
};
