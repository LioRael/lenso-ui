import { expect, test } from "bun:test";
import { createResizableFilter } from "../../src/resizable-filter.js";
import { lensFilter, splitFilter } from "../../src/filter-split.js";
import { appendMaterialTone } from "../../src/material-tone-svg.js";

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

// A dark tone has multiple readers of the optical result; resizing must not
// collapse its materialized stages or mutate another surface's cached lens.
test.each(["face", "optical-face"])(
  "resizing retains split %s optics and retires every stage",
  (source) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.innerHTML = `<defs><filter id="cached-split" width="122" height="52" filterUnits="userSpaceOnUse"><feImage x="0" y="0" width="120" height="50" href="decoded-field" result="field"/><feDisplacementMap in="SourceGraphic" in2="field" result="${source}"/></filter></defs>`;
    const cached = svg.querySelector("filter")!;
    appendMaterialTone(cached, source, { mode: "dark", size: 1, clarity: 0 });
    const paint = splitFilter(cached, source)!;
    svg.querySelector("defs")!.append(...paint.nodes);
    document.body.append(svg);
    const original = svg.innerHTML;
    const resized = createResizableFilter(cached, "moving-split", true);
    try {
      const ids = [...resized.filter.matchAll(/#([^"')]+)/g)].map((match) => match[1]!);
      expect(ids).toEqual(["moving-split-optics", "moving-split-material"]);
      expect(lensFilter(resized.filter)).toBe(resized.node);
      resized.resize(192, 74);
      for (const id of ids) {
        const stage = document.getElementById(id)!;
        expect(stage.getAttribute("width")).toBe("194");
        expect(stage.getAttribute("height")).toBe("76");
        for (const image of stage.querySelectorAll("feImage")) {
          expect(image.getAttribute("width")).toBe("192");
          expect(image.getAttribute("height")).toBe("74");
        }
      }
      expect(document.getElementById(ids[1]!)!.querySelector("feDisplacementMap")).toBeNull();
      resized.destroy();
      expect(svg.innerHTML).toBe(original);
    } finally {
      resized.destroy();
      svg.remove();
    }
  },
);
