import { createSpring } from "@lenso/glass/motion";
import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement, retainMenuChild } from "./menu-placement.js";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

export function presentCascadingSubmenu(
  element: HTMLElement,
  item: HTMLElement,
  parent: HTMLElement,
  unmount: () => void,
) {
  const surface = element.querySelector<HTMLElement>('[data-slot="menu-surface"]')!;
  const content = element.querySelector<HTMLElement>('[data-slot="menu-content"]')!;
  let release = retainMenuChild(parent);
  let retained = true;
  const feedback = presentMenuFeedback(element);
  surface.style.setProperty("--lg-menu-surface-opacity", "0");
  content.style.opacity = "0";
  let spring: ReturnType<typeof createSpring> | undefined;
  let observer: MutationObserver | undefined;
  const cancelPlacement = afterMenuPlacement(element, () => {
    const width = surface.offsetWidth,
      height = surface.offsetHeight;
    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius);
    surface.style.setProperty("--lg-map-radius", `${radius}px`);
    let leaving = false;
    spring = createSpring(0, 600, 46, (value) => {
      const t = clamp(value);
      const box = element.getBoundingClientRect(),
        anchor = item.getBoundingClientRect();
      const left = element.getAttribute("data-side") === "left";
      const startWidth = Math.min(anchor.height, width);
      const startX = left ? width - startWidth : 0;
      const startY = Math.max(0, Math.min(height - anchor.height, anchor.y - box.y));
      const w = startWidth + (width - startWidth) * t;
      const h = anchor.height + (height - anchor.height) * t;
      surface.style.transform =
        t === 1
          ? ""
          : `translate(${startX * (1 - t)}px, ${startY * (1 - t)}px) scale(${w / width}, ${h / height})`;
      const r = Math.min(radius, w / 2, h / 2);
      surface.style.borderRadius = t === 1 ? "" : `${(r * width) / w}px / ${(r * height) / h}px`;
      surface.style.setProperty("--lg-menu-surface-opacity", String(clamp(t / 0.2)));
      content.style.transformOrigin = `${left ? "right" : "left"} ${startY + anchor.height / 2}px`;
      content.style.transform = t === 1 ? "" : `scale(${0.92 + 0.08 * t})`;
      content.style.opacity = String(clamp((t - 0.15) / 0.65));
      if (leaving && value === 0) {
        release();
        retained = false;
        unmount();
      }
    });
    const sync = () => {
      const closing = !element.hasAttribute("data-open") || !parent.hasAttribute("data-open");
      if (closing && element.hasAttribute("data-menu-child-count")) return;
      leaving = closing;
      if (!closing && !retained) {
        release = retainMenuChild(parent);
        retained = true;
      }
      spring!.tune(leaving ? 900 : 600, leaving ? 57 : 46);
      spring!.set(leaving ? 0 : 1);
    };
    spring.paint();
    observer = new MutationObserver(sync);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-open", "data-menu-child-count"],
    });
    observer.observe(parent, { attributes: true, attributeFilter: ["data-open"] });
    sync();
  });
  return () => {
    cancelPlacement();
    observer?.disconnect();
    spring?.stop();
    feedback();
    release();
  };
}
