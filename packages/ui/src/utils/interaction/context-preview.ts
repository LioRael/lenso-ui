import { createSpring } from "@lenso/glass/motion";
import { afterMenuPlacement } from "./menu-placement.js";

/** Move the inert preview between its live source and native placed destination. */
export function presentContextPreview(
  preview: HTMLElement,
  source: HTMLElement,
  popup: HTMLElement,
  onReturn: () => void,
) {
  const positioner = preview.parentElement!;
  const sourceOpacity = Number(getComputedStyle(source).opacity);
  const previous = {
    positionerTransform: positioner.style.transform,
    positionerOrigin: positioner.style.transformOrigin,
    previewOpacity: preview.style.opacity,
    opacity: source.style.opacity,
    transform: preview.style.transform,
    origin: preview.style.transformOrigin,
    radius: preview.style.borderRadius,
  };
  let leaving = false;
  let settled = false;
  let destination = preview.getBoundingClientRect();
  const radius = parseFloat(getComputedStyle(preview).borderRadius);
  const sourceRadius = parseFloat(getComputedStyle(source).borderRadius) || 0;
  preview.style.transformOrigin = "0 0";
  const spring = createSpring(0, 600, 46, (value) => {
    const t = Math.max(0, Math.min(1, value));
    settled = value === 1;
    const from = source.getBoundingClientRect();
    const sx = (from.width + (destination.width - from.width) * t) / destination.width;
    const sy = (from.height + (destination.height - from.height) * t) / destination.height;
    const transform = `translate(${(from.x - destination.x) * (1 - t)}px, ${(from.y - destination.y) * (1 - t)}px) scale(${sx}, ${sy})`;
    if (leaving) {
      positioner.style.transform = transform;
      preview.style.transform = "";
      const handoff = Math.min(1, t / 0.18);
      preview.style.opacity = String(handoff);
      source.style.opacity = String(sourceOpacity * (1 - handoff));
      const surface = popup.querySelector<HTMLElement>('[data-slot="menu-surface"]');
      const content = popup.querySelector<HTMLElement>('[data-slot="menu-content"]');
      surface?.style.setProperty("--lg-menu-surface-opacity", String(t));
      if (content) content.style.opacity = String(t);
    } else {
      preview.style.transform = transform;
    }
    const corner = sourceRadius + (radius - sourceRadius) * t;
    preview.style.borderRadius = `${corner / sx}px / ${corner / sy}px`;
    if (leaving && value === 0) {
      preview.style.visibility = "hidden";
      source.style.opacity = previous.opacity;
      onReturn();
    }
  });
  popup.setAttribute("data-context-preview-motion", "");
  preview.style.visibility = "hidden";
  const cancelPlacement = afterMenuPlacement(preview.parentElement!, () => {
    destination = preview.getBoundingClientRect();
    source.style.opacity = "0";
    preview.style.visibility = "";
    spring.paint();
    spring.set(leaving ? 0 : 1);
  });
  const observer = new MutationObserver(() => {
    if (settled) destination = preview.getBoundingClientRect();
    leaving = !popup.hasAttribute("data-open");
    if (leaving) {
      const parent = positioner.getBoundingClientRect();
      positioner.style.transformOrigin = `${destination.x - parent.x}px ${destination.y - parent.y}px`;
    } else {
      positioner.style.transform = previous.positionerTransform;
      positioner.style.transformOrigin = previous.positionerOrigin;
      preview.style.opacity = previous.previewOpacity;
      preview.style.visibility = "";
      source.style.opacity = "0";
    }
    spring.set(leaving ? 0 : 1);
  });
  observer.observe(popup, { attributes: true, attributeFilter: ["data-open"] });
  return () => {
    cancelPlacement();
    observer.disconnect();
    spring.stop();
    popup.removeAttribute("data-context-preview-motion");
    positioner.style.transform = previous.positionerTransform;
    positioner.style.transformOrigin = previous.positionerOrigin;
    preview.style.opacity = previous.previewOpacity;
    source.style.opacity = previous.opacity;
    preview.style.transform = previous.transform;
    preview.style.transformOrigin = previous.origin;
    preview.style.borderRadius = previous.radius;
    preview.style.visibility = "";
  };
}
