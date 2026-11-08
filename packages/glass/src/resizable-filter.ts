/** Own a mutable view of decoded optics; cached filters remain immutable. */
export function createResizableFilter(template: SVGElement, id: string) {
  const node = template.cloneNode(true) as SVGElement;
  node.id = id;
  // A baked circle contour would stretch into an ellipse during expansion.
  // The material's CSS contour follows its current rounded layout instead.
  const contour = node.querySelector('[result="contour-backdrop"]');
  if (contour) {
    const input = contour.getAttribute("in")!;
    for (const consumer of node.querySelectorAll('[in="contour-backdrop"]'))
      consumer.setAttribute("in", input);
    for (const consumer of node.querySelectorAll('[in2="contour-backdrop"]'))
      consumer.setAttribute("in2", input);
    contour.remove();
    node.querySelector('[result="contour-paint"]')?.remove();
  }
  const fields = [...node.querySelectorAll("feImage")].map((image) => ({
    image,
    x: Number(image.getAttribute("x") ?? 0),
    y: Number(image.getAttribute("y") ?? 0),
    width: Number(image.getAttribute("width")),
    height: Number(image.getAttribute("height")),
  }));
  const base = fields[0]!;
  const extraWidth = Number(node.getAttribute("width")) - base.width;
  const extraHeight = Number(node.getAttribute("height")) - base.height;
  template.parentNode!.appendChild(node);
  return {
    node,
    filter: `url("#${id}")`,
    resize(width: number, height: number) {
      node.setAttribute("width", String(width + extraWidth));
      node.setAttribute("height", String(height + extraHeight));
      for (const field of fields) {
        field.image.setAttribute("x", String((field.x * width) / base.width));
        field.image.setAttribute("y", String((field.y * height) / base.height));
        field.image.setAttribute("width", String((field.width * width) / base.width));
        field.image.setAttribute("height", String((field.height * height) / base.height));
      }
    },
    destroy: () => node.remove(),
  };
}
