/** Wait for native collision/size placement before capturing a morph destination. */
export function afterMenuPlacement(element: HTMLElement, ready: () => void) {
  let frame = 0,
    previous = "",
    attempts = 0;
  const measure = () => {
    const box = element.getBoundingClientRect();
    const next = [box.x, box.y, box.width, box.height, element.getAttribute("data-side")].join();
    if ((next === previous && box.width > 0) || ++attempts >= 8) {
      ready();
      return;
    }
    previous = next;
    frame = requestAnimationFrame(measure);
  };
  frame = requestAnimationFrame(measure);
  return () => cancelAnimationFrame(frame);
}
