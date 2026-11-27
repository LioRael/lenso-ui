import { useLayoutEffect, useState } from "react";

export { afterMenuPlacement } from "@lenso/glass/motion";

/** Parent motion waits until all portalled child surfaces have returned. */
export function retainMenuChild(parent: HTMLElement) {
  const name = "data-menu-child-count";
  parent.setAttribute(name, String(Number(parent.getAttribute(name) ?? 0) + 1));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    const count = Number(parent.getAttribute(name) ?? 0) - 1;
    if (count > 0) parent.setAttribute(name, String(count));
    else parent.removeAttribute(name);
  };
}

export function useMenuStackOffset(
  element: HTMLElement | null,
  parent: HTMLElement | null | undefined,
  enabled: boolean,
) {
  const [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    if (!enabled || !parent || !element) return;
    const measure = () =>
      setOffset(-Math.min(parent.offsetHeight * 0.62, element.offsetHeight + 8));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, parent, enabled]);
  return offset;
}
