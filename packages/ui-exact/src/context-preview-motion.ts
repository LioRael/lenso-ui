// Adapted from Lenso's context-preview.ts; source spring, corner interpolation and opacity handoff retained.
import { createSpring } from "@lenso/glass/motion";
export function presentContextPreview(
  preview: HTMLElement,
  source: HTMLElement,
  popup: HTMLElement,
  onReturn: () => void,
  onState: (state: string) => void,
) {
  const layout = preview.parentElement!,
    root = popup.closest<HTMLElement>('[popover][role="menu"]')!,
    view = preview.ownerDocument.defaultView!;
  const sourceOpacity = Number(getComputedStyle(source).opacity),
    surface = popup.querySelector<HTMLElement>('[data-slot="menu-surface"]'),
    content = popup.querySelector<HTMLElement>('[data-slot="menu-content"]');
  const saved = [
    { node: layout, keys: ["transform", "transform-origin"] },
    {
      node: preview,
      keys: ["opacity", "transform", "transform-origin", "border-radius", "visibility"],
    },
    { node: source, keys: ["opacity"] },
    ...(surface ? [{ node: surface, keys: ["--lg-menu-surface-opacity"] }] : []),
    ...(content ? [{ node: content, keys: ["opacity"] }] : []),
  ].map(({ node, keys }) => ({
    node,
    values: keys.map((key) => ({
      key,
      value: node.style.getPropertyValue(key),
      priority: node.style.getPropertyPriority(key),
    })),
  }));
  const priorLayoutTransform = layout.style.transform,
    priorLayoutOrigin = layout.style.transformOrigin,
    priorPreviewOpacity = preview.style.opacity;
  let leaving = false,
    settled = false,
    ready = false,
    disposed = false,
    finished = false,
    frame = 0,
    attempts = 0,
    previousBox = "",
    destination = preview.getBoundingClientRect();
  const radius = parseFloat(getComputedStyle(preview).borderRadius) || 0,
    sourceRadius = parseFloat(getComputedStyle(source).borderRadius) || 0;
  const finish = () => {
    if (finished || disposed) return;
    finished = true;
    preview.style.visibility = "hidden";
    source.style.opacity = saved.find((s) => s.node === source)!.values[0]!.value;
    onReturn();
  };
  preview.style.transformOrigin = "0 0";
  preview.style.visibility = "hidden";
  popup.setAttribute("data-context-preview-motion", "");
  const spring = createSpring(0, 600, 46, (value) => {
    if (disposed) return;
    const t = Math.max(0, Math.min(1, value)),
      from = source.getBoundingClientRect();
    if (
      !source.isConnected ||
      !from.width ||
      !from.height ||
      !destination.width ||
      !destination.height
    ) {
      finish();
      return;
    }
    settled = value === 1;
    const sx = (from.width + (destination.width - from.width) * t) / destination.width,
      sy = (from.height + (destination.height - from.height) * t) / destination.height;
    const transform = `translate(${(from.x - destination.x) * (1 - t)}px, ${(from.y - destination.y) * (1 - t)}px) scale(${sx}, ${sy})`;
    if (leaving) {
      layout.style.transform = transform;
      preview.style.transform = "";
      const handoff = Math.min(1, t / 0.18);
      preview.style.opacity = String(handoff);
      source.style.opacity = String(sourceOpacity * (1 - handoff));
      surface?.style.setProperty("--lg-menu-surface-opacity", String(t));
      if (content) content.style.opacity = String(t);
    } else preview.style.transform = transform;
    const corner = sourceRadius + (radius - sourceRadius) * t;
    preview.style.borderRadius = `${corner / sx}px / ${corner / sy}px`;
    if (leaving && value === 0) finish();
    else if (value === 1) onState("open");
  });
  const change = () => {
    if (disposed) return;
    if (settled) {
      preview.style.transform = "";
      destination = preview.getBoundingClientRect();
    }
    leaving = !popup.hasAttribute("data-open");
    finished = false;
    onState(leaving ? "returning" : "opening");
    if (leaving) {
      const parent = layout.getBoundingClientRect();
      layout.style.transformOrigin = `${destination.x - parent.x}px ${destination.y - parent.y}px`;
    } else {
      layout.style.transform = priorLayoutTransform;
      layout.style.transformOrigin = priorLayoutOrigin;
      preview.style.opacity = priorPreviewOpacity;
      preview.style.visibility = ready ? "" : "hidden";
      source.style.opacity = ready ? "0" : source.style.opacity;
      if (content) content.style.opacity = "";
      surface?.style.removeProperty("--lg-menu-surface-opacity");
    }
    if (ready) spring.set(leaving ? 0 : 1);
  };
  const measure = () => {
    if (disposed) return;
    const box = preview.getBoundingClientRect(),
      next = [box.x, box.y, box.width, box.height].join();
    if (
      (next === previousBox &&
        box.width > 0 &&
        !root.hasAttribute("data-lenso-position-pending")) ||
      ++attempts >= 8
    ) {
      frame = 0;
      destination = box;
      if (!box.width || !box.height) {
        finish();
        return;
      }
      ready = true;
      source.style.opacity = "0";
      preview.style.visibility = "";
      spring.paint();
      spring.set(leaving ? 0 : 1);
      return;
    }
    previousBox = next;
    frame = view.requestAnimationFrame(measure);
  };
  frame = view.requestAnimationFrame(measure);
  const reduced = view.matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => {
    if (reduced.matches && ready && !disposed) spring.set(leaving ? 0 : 1, true);
  };
  reduced.addEventListener("change", reduce);
  const observer = new MutationObserver(change);
  observer.observe(popup, { attributes: true, attributeFilter: ["data-open"] });
  return () => {
    if (disposed) return;
    disposed = true;
    observer.disconnect();
    reduced.removeEventListener("change", reduce);
    view.cancelAnimationFrame(frame);
    spring.stop();
    popup.removeAttribute("data-context-preview-motion");
    for (const { node, values } of saved)
      for (const { key, value, priority } of values) {
        if (value) node.style.setProperty(key, value, priority);
        else node.style.removeProperty(key);
      }
  };
}
