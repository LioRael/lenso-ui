import { presentMenuFeedback } from "./menu-feedback.js";
import { afterMenuPlacement, retainMenuChild } from "./menu-placement.js";
import { menuDurations, sampleMenu } from "./menu-shape.js";
import { createMenuTimeline } from "./menu-timeline.js";

// iPad cascade captures settle sooner than a root Menu. Keep its shape and ink
// channels on the shared timeline, with no source-button rebound in the parent.
const cascadeRate = 2;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const cascadeDurations = {
  opening: menuDurations.opening / cascadeRate,
  closing: 299 / cascadeRate,
};

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
  element.setAttribute("data-menu-motion", "cascade");
  let timeline: ReturnType<typeof createMenuTimeline> | undefined;
  let observer: MutationObserver | undefined;
  const cancelPlacement = afterMenuPlacement(element, () => {
    const width = surface.offsetWidth,
      height = surface.offsetHeight;
    const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius);
    surface.style.setProperty("--lg-map-radius", `${radius}px`);
    const initialBox = element.getBoundingClientRect(),
      initialAnchor = item.getBoundingClientRect();
    const left = element.getAttribute("data-side") === "left";
    const origin = {
      x: left ? width : 0,
      y: initialAnchor.y - initialBox.y + initialAnchor.height / 2,
    };
    content.style.transformOrigin = `${origin.x}px ${origin.y}px`;
    timeline = createMenuTimeline(
      (time, open) => {
        const box = element.getBoundingClientRect(),
          anchor = item.getBoundingClientRect();
        const scaleY = box.height / element.offsetHeight || 1;
        const startWidth = Math.min(anchor.height / scaleY, width);
        const left = element.getAttribute("data-side") === "left";
        const source = {
          x: left ? width - startWidth : 0,
          y: Math.max(0, Math.min(height - startWidth, (anchor.y - box.y) / scaleY)),
          width: startWidth,
          height: startWidth,
        };
        const pose = sampleMenu(time * cascadeRate, open, source, { width, height }, radius, true);
        // A cascade emerges beside its row; a root's travelling circular source
        // would detach it from the parent and magnify the middle rows instead.
        const u = (pose.width - startWidth) / Math.max(0.01, width - startWidth);
        const t = clamp(pose.progress);
        const panelWidth = width * (0.65 + 0.35 * u);
        return {
          ...pose,
          width: panelWidth,
          left: left ? width - panelWidth : 0,
          top: source.y * (1 - t),
          corner: Math.min(radius, startWidth / 2) * (1 - t) + radius * t,
          zoom: 0.8 + 0.2 * t,
          opacity: clamp(t / 0.2),
        };
      },
      (pose, finished, open) => {
        const settled = finished && open;
        const w = Math.max(0.01, pose.width),
          h = Math.max(0.01, pose.height),
          scale = Math.max(0.01, pose.zoom);
        const corner = Math.max(0, Math.min(pose.corner, w / 2, h / 2));
        const local = (edge: number, centre: number) => centre + (edge - centre) / scale;
        surface.style.transform = settled
          ? ""
          : `translate(${pose.left}px, ${pose.top}px) scale(${w / width}, ${h / height})`;
        surface.style.borderRadius = settled
          ? ""
          : `${(corner * width) / w}px / ${(corner * height) / h}px`;
        surface.style.setProperty("--lg-menu-surface-opacity", String(pose.opacity));
        content.style.transform = settled ? "" : `scale(${scale})`;
        content.style.opacity = String(pose.items);
        const clip = {
          x: local(pose.left, origin.x),
          y: local(pose.top, origin.y),
          width: w / scale,
          height: h / scale,
        };
        content.style.filter = finished || pose.items <= 0 ? "" : `blur(${pose.blur}px)`;
        surface.toggleAttribute("data-material-hidden", !open && pose.opacity === 0);
        surface.toggleAttribute("data-material-resting", settled);
        content.style.clipPath = settled
          ? ""
          : `inset(${clip.y}px ${width - clip.x - clip.width}px ${height - clip.y - clip.height}px ${clip.x}px round ${corner / scale}px)`;
        element.toggleAttribute("data-menu-morphing", !finished);
        if (finished && !open && retained) {
          release();
          retained = false;
          unmount();
        }
      },
      cascadeDurations,
    );
    let opened: boolean | undefined;
    const sync = () => {
      const next =
        element.hasAttribute("data-open") &&
        !element.hasAttribute("data-ending-style") &&
        parent.hasAttribute("data-open");
      if (!next && element.hasAttribute("data-menu-child-count")) return;
      if (next === opened) return;
      opened = next;
      if (next && !retained) {
        release = retainMenuChild(parent);
        retained = true;
      }
      timeline!.set(next ? 1 : 0);
    };
    observer = new MutationObserver(sync);
    observer.observe(element, {
      attributes: true,
      attributeFilter: ["data-open", "data-ending-style", "data-menu-child-count"],
    });
    observer.observe(parent, { attributes: true, attributeFilter: ["data-open"] });
    sync();
  });
  return () => {
    cancelPlacement();
    observer?.disconnect();
    timeline?.stop();
    surface.setAttribute("data-material-hidden", "");
    surface.removeAttribute("data-material-resting");
    element.removeAttribute("data-menu-morphing");
    element.removeAttribute("data-menu-motion");
    feedback();
    release();
  };
}
