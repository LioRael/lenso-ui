import { attachGlass } from "@lenso/glass";

const materials = new WeakMap<HTMLElement, () => void>();

/** The Contract owns the lens node; this controller owns only its decorative optics. */
export function updateAlertMaterial(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLElement) ||
    data["lensoKind"] !== "alert-dialog-lens" ||
    materials.has(node)
  )
    return;
  const popup = node.parentElement;
  const dialog = node.closest("dialog");
  if (!popup || !dialog) return;
  const original = popup.getAttribute("data-material-opaque");
  const reduced = matchMedia("(prefers-reduced-transparency: reduce), (forced-colors: active)");
  const contrast = matchMedia("(prefers-contrast: more)");
  let stop: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const detach = () => {
    stop?.();
    stop = undefined;
  };
  const sync = () => {
    clearTimeout(timer);
    const explicit = popup.closest("[data-contrast]")?.getAttribute("data-contrast");
    const opaque = reduced.matches || contrast.matches || explicit === "increased";
    popup.toggleAttribute("data-material-opaque", opaque);
    if (opaque) detach();
    else if (dialog.open)
      stop ??= attachGlass(node, { profileKey: "glass-medium", liveGeometry: true });
    else if (stop) {
      const duration =
        CSS.supports("overlay", "auto") && !matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 280
          : 0;
      if (duration) timer = setTimeout(detach, duration);
      else detach();
    }
  };
  const observer = new MutationObserver(sync);
  observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  for (let ancestor: HTMLElement | null = popup; ancestor; ancestor = ancestor.parentElement)
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter: ancestor === dialog ? ["open", "data-contrast"] : ["data-contrast"],
    });
  reduced.addEventListener("change", sync);
  contrast.addEventListener("change", sync);
  sync();
  materials.set(node, () => {
    clearTimeout(timer);
    observer.disconnect();
    reduced.removeEventListener("change", sync);
    contrast.removeEventListener("change", sync);
    detach();
    if (original === null) popup.removeAttribute("data-material-opaque");
    else popup.setAttribute("data-material-opaque", original);
  });
}

export function endAlertMaterial(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  materials.get(node)?.();
  materials.delete(node);
}
