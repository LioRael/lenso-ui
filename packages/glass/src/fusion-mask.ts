// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
// Alternating in-document masks adapted from onlymoein/liquidglass 89f8b736.
let sequence = 0;
const pathData = (outline: string) =>
  decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(/ d="([^"]*)"/)![1]!;
export function createFusionMask(anchor: HTMLElement) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("data-lenso-glass-optics", "");
  svg.style.position = "absolute";
  svg.style.pointerEvents = "none";
  const defs = document.createElementNS(ns, "defs");
  const id = `lenso-fusion-mask-${++sequence}`;
  const masks = [0, 1].map((index) => {
    const mask = document.createElementNS(ns, "mask");
    mask.id = `${id}-${index}`;
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", "0");
    mask.setAttribute("y", "0");
    const path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "white");
    const group = document.createElementNS(ns, "g");
    group.append(path);
    mask.append(group);
    const clip = document.createElementNS(ns, "clipPath");
    clip.id = `${mask.id}-clip`;
    clip.setAttribute("clipPathUnits", "userSpaceOnUse");
    const retained = document.createElementNS(ns, "path");
    clip.append(retained);
    defs.append(clip, mask);
    return { mask, path, group, clip, retained };
  });
  svg.append(defs);
  anchor.after(svg);
  let showing = 0,
    previous = "";
  return {
    update(width: number, height: number, outline: string, x = 0, y = 0, retainedOutline?: string) {
      const key = `${width}:${height}:${x}:${y}:${outline}:${retainedOutline ?? ""}`;
      if (key !== previous) {
        previous = key;
        showing = 1 - showing;
        const { mask, path, group, clip, retained } = masks[showing]!;
        mask.setAttribute("width", String(width));
        mask.setAttribute("height", String(height));
        path.setAttribute("d", pathData(outline));
        path.setAttribute("transform", `translate(${x} ${y})`);
        if (retainedOutline) {
          retained.setAttribute("d", pathData(retainedOutline));
          group.setAttribute("clip-path", `url(#${clip.id})`);
        } else group.removeAttribute("clip-path");
      }
      return `url("#${masks[showing]!.mask.id}")`;
    },
    destroy() {
      svg.remove();
    },
  };
}
