import { expect, test } from "bun:test";
import { readOptics } from "../../src/gpu-optics.js";

// Existing filter resize tests check geometry, not the GPU parser cache. A
// scrolling consumer must not serialize embedded images just to check a hit,
// and a same-task mutation must invalidate before observer delivery.
test("optics cache avoids SVG serialization and observes synchronous and delivered edits", async () => {
  const constructor = Object.getOwnPropertyDescriptor(globalThis, "SVGFilterElement");
  // Happy DOM exposes generic SVG elements for filter primitives.
  Object.defineProperty(globalThis, "SVGFilterElement", {
    configurable: true,
    value: SVGElement,
  });
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.innerHTML = `<filter id="cache-lens" data-lenso-tone="light" data-lenso-material-foreground="">
    <feImage href="data:image/png;base64,large-field"/>
    <feDisplacementMap scale="1"/><feColorMatrix/>
    <feDisplacementMap scale="2"/><feColorMatrix/>
    <feDisplacementMap scale="3"/>
    <feGaussianBlur result="displaced" stdDeviation="0.4"/>
    <feComposite result="material-face"/>
  </filter>`;
  document.body.append(svg);
  const filter = svg.querySelector("filter")!;
  Object.defineProperty(filter, "innerHTML", {
    get() {
      throw new Error("Cache lookup serialized embedded optical images");
    },
  });
  const value = 'url("#cache-lens")';
  try {
    const first = readOptics(value);
    expect(first?.scales).toEqual([1, 2, 3]);
    for (let i = 0; i < 100; i++) expect(readOptics(value)).toBe(first);
    filter.querySelector("feDisplacementMap")!.setAttribute("scale", "4");
    const resized = readOptics(value);
    expect(resized?.scales).toEqual([4, 2, 3]);
    expect(resized?.key).not.toBe(first?.key);
    filter.setAttribute("data-lenso-tone", "dark");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(readOptics(value)?.tone?.mode).toBe("dark");
    filter.setAttribute("data-lenso-tone-transfer", "linear");
    expect(readOptics(value) === undefined).toBe(true);
    filter.removeAttribute("data-lenso-tone-transfer");
    expect(readOptics(value)?.tone?.mode).toBe("dark");
    filter.querySelector("feImage")!.remove();
    expect(readOptics(value) === undefined).toBe(true);
  } finally {
    svg.remove();
    if (constructor) Object.defineProperty(globalThis, "SVGFilterElement", constructor);
    else Reflect.deleteProperty(globalThis, "SVGFilterElement");
  }
});
