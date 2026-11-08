import { expect, test } from "bun:test";
import { createResizableFilter } from "../../src/resizable-filter.js";

test.each([false, true])(
  "resizing optics preserves the cached lens and defers baked contours (%s)",
  (contour) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = `<defs><filter id="shared-lens" x="-1" y="-1" width="50" height="50" filterUnits="userSpaceOnUse"><feImage x="0" y="0" width="48" height="48" href="decoded-field" result="field"/><feDisplacementMap scale="24" in2="field" result="bent"/>${contour ? '<feImage x="0" y="0" width="48" height="48" href="decoded-contour" result="contour-paint"/><feComposite in="bent" in2="contour-paint" result="contour-backdrop"/>' : ""}<feColorMatrix in="${contour ? "contour-backdrop" : "bent"}" type="saturate" values="1"/></filter></defs>`;
    document.body.append(svg);
    const cached = svg.querySelector("filter")!;
    const original = cached.outerHTML;
    const first = createResizableFilter(cached, "first-surface");
    const second = createResizableFilter(cached, "second-surface");
    try {
      for (const [width, height] of [
        [52, 52],
        [87, 55],
        [192, 62],
        [71, 53],
        [48, 48],
      ] as const) {
        first.resize(width, height);
        expect(Number(first.node.getAttribute("width"))).toBe(width + 2);
        expect(Number(first.node.getAttribute("height"))).toBe(height + 2);
        expect(first.node.querySelector("feImage")!.getAttribute("width")).toBe(String(width));
        expect(first.node.querySelector("feImage")!.getAttribute("height")).toBe(String(height));
        expect(first.node.querySelector("feDisplacementMap")!.getAttribute("scale")).toBe("24");
        expect(first.node.querySelector('[result="contour-paint"]')).toBeNull();
        expect(first.node.querySelector('[result="contour-backdrop"]')).toBeNull();
        expect(first.node.querySelector("feColorMatrix")!.getAttribute("in")).toBe("bent");
        expect(cached.outerHTML).toBe(original);
        expect(second.node.getAttribute("width")).toBe("50");
      }
      first.destroy();
      expect(first.node.isConnected).toBe(false);
      expect(cached.isConnected).toBe(true);
      expect(second.node.isConnected).toBe(true);
    } finally {
      first.destroy();
      second.destroy();
      svg.remove();
    }
  },
);
