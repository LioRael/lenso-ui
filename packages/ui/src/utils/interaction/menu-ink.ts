import { createControlLens } from "@lenso/glass";

/** Moving menu ink crosses the same refracting rim as a lifted control label. */
export function createMenuInk(surface: HTMLElement, content: HTMLElement) {
  const contentWidth = content.offsetWidth,
    contentHeight = content.offsetHeight;
  const lens = createControlLens(surface, content, {
    strength: 0.16,
    dispersion: 0,
    depth: 0.12,
    dome: 0.05,
    splay: 0.7,
    relative: true,
    ink: true,
    paintsLight: true,
  });
  // Fit against the resting panel, before its first composited circular pose
  // counter-scales the CSS radius. Otherwise the whole menu gets a pill map.
  lens.update(0);
  lens.setActive(true);
  return {
    paint(
      amount: number,
      blur: number,
      box: { x: number; y: number; width: number; height: number },
      visible = true,
    ) {
      if (visible) {
        if (amount <= 0) lens.setActive(false);
        lens.update(amount, { ...box, contentWidth, contentHeight });
        if (amount > 0) lens.setActive(true);
      } else {
        lens.setActive(false);
        blur = 0;
      }
      const filter = content.style.filter.replace(/\s*blur\([^)]*\)/g, "");
      const next = `${filter}${blur > 0 ? ` blur(${blur}px)` : ""}`.trim();
      if (content.style.filter !== next) content.style.filter = next;
    },
    destroy: () => lens.destroy(),
  };
}
