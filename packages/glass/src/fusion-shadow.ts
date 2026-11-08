// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
// Group shadow recipe adapted from onlymoein/liquidglass 89f8b736.
import type { BackdropOverlay } from "./backdrop.js";

/** Share only the unfiltered shadow with copied inputs, never rendered glass. */
export function createFusionShadow(anchor: HTMLElement) {
  const ns = "http://www.w3.org/2000/svg";
  const source = document.createElementNS(ns, "svg");
  source.setAttribute("aria-hidden", "true");
  source.setAttribute("data-lenso-glass-source-shadow", "");
  source.setAttribute("data-lenso-glass-optics", "");
  source.style.cssText =
    "position:absolute;pointer-events:none;overflow:visible;z-index:-1;visibility:hidden";
  const path = document.createElementNS(ns, "path");
  path.style.cssText = "transform:translateY(4px);filter:blur(4px)";
  source.append(path);
  anchor.before(source);
  const copies = new Set<SVGSVGElement>();
  let previous = "";
  return {
    input(): BackdropOverlay {
      const node = source.cloneNode(true) as SVGSVGElement;
      node.removeAttribute("data-lenso-glass-source-shadow");
      node.setAttribute("data-lenso-glass-shadow-input", "");
      node.style.cssText = "position:absolute;pointer-events:none;overflow:visible";
      node.style.visibility = source.style.visibility;
      copies.add(node);
      return { node, source, destroy: () => copies.delete(node) };
    },
    update(width: number, height: number, outline: string, dark: boolean) {
      const key = `${width}:${height}:${outline}:${dark}`;
      if (key !== previous) {
        previous = key;
        const data = decodeURIComponent(outline.slice(outline.indexOf(",") + 1)).match(
          / d="([^"]*)"/,
        )![1]!;
        for (const svg of [source, ...copies]) {
          svg.setAttribute("viewBox", `-24 -24 ${width + 48} ${height + 48}`);
          const shape = svg.firstElementChild!;
          shape.setAttribute("d", data);
          shape.setAttribute("fill", dark ? "rgb(0 0 0 / .05)" : "rgb(0 0 0 / .03)");
        }
      }
      source.style.left = `${(parseFloat(anchor.style.left) || 0) - 24}px`;
      source.style.top = `${(parseFloat(anchor.style.top) || 0) - 24}px`;
      source.style.width = `${width + 48}px`;
      source.style.height = `${height + 48}px`;
    },
    visible(visible: boolean) {
      for (const svg of [source, ...copies]) svg.style.visibility = visible ? "visible" : "hidden";
    },
    destroy() {
      source.remove();
      copies.clear();
    },
  };
}
