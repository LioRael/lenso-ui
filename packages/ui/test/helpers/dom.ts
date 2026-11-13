export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function settleLayout(): Promise<void> {
  await document.fonts.ready;
  await nextFrame();
  await nextFrame();
}

export function useDocumentTheme(theme: string): () => void {
  const previous = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);
  return () => {
    if (previous === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", previous);
  };
}

export function mockSwipeGeometry(): () => void {
  const prototype = HTMLElement.prototype;
  const original = prototype.getBoundingClientRect;
  const descriptors = new Map(
    ["offsetWidth", "clientWidth", "scrollWidth"].map((name) => [
      name,
      Object.getOwnPropertyDescriptor(prototype, name),
    ]),
  );
  const width = (element: HTMLElement) =>
    element.hasAttribute("data-swipe-actions-side")
      ? 146
      : element.hasAttribute("data-swipe-body")
        ? 232
        : element.getAttribute("data-lenso-slot") === "swipe-actions"
          ? 320
          : undefined;
  prototype.getBoundingClientRect = function () {
    const size = width(this);
    return size === undefined
      ? original.call(this)
      : {
          width: size,
          height: 52,
          top: 0,
          bottom: 52,
          left: 0,
          right: size,
          x: 0,
          y: 0,
          toJSON() {},
        };
  };
  for (const [name, descriptor] of descriptors)
    Object.defineProperty(prototype, name, {
      configurable: true,
      get() {
        return width(this) ?? descriptor?.get?.call(this) ?? 0;
      },
    });
  return () => {
    prototype.getBoundingClientRect = original;
    for (const [name, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(prototype, name, descriptor);
      else Reflect.deleteProperty(prototype, name);
    }
  };
}
