import { attachGlass } from "@lenso/glass";

const materials = new WeakMap<HTMLElement, () => void>();

/** The Contract owns the lens node; this controller owns only its decorative optics. */
export function updateMaterial(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLElement) ||
    ![
      "alert-dialog-lens",
      "alert-lens",
      "badge-lens",
      "card-lens",
      "tag-lens",
      "color-picker-lens",
      "tabs-track-lens",
      "tab-bar-lens",
      "menu-bar-lens",
    ].includes(data["lensoKind"] ?? "") ||
    materials.has(node)
  )
    return;
  const popup = node.parentElement;
  const dialog = node.closest("dialog");
  const picker =
    data["lensoKind"] === "color-picker-lens" ? node.closest<HTMLElement>("[popover]") : null;
  if (!popup) return;
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
    if (
      opaque ||
      (data["lensoKind"] === "tab-bar-lens" && !popup.hasAttribute("data-material-resting"))
    )
      detach();
    else if (picker && !picker.matches(":popover-open")) detach();
    else if (!dialog || dialog.open)
      stop ??= attachGlass(node, {
        profileKey: [
          "badge-lens",
          "tabs-track-lens",
          "menu-bar-lens",
          "tag-lens",
          "tab-bar-lens",
        ].includes(data["lensoKind"] ?? "")
          ? "glass-small"
          : "glass-medium",
        liveGeometry: ["alert-dialog-lens", "tab-bar-lens"].includes(data["lensoKind"] ?? ""),
        liveBackdrop: data["lensoKind"] === "color-picker-lens",
      });
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

  for (let ancestor: HTMLElement | null = popup; ancestor; ancestor = ancestor.parentElement)
    observer.observe(ancestor, {
      attributes: true,
      attributeFilter:
        ancestor === dialog
          ? ["open", "data-contrast"]
          : ancestor === popup && data["lensoKind"] === "tab-bar-lens"
            ? ["data-contrast", "data-material-resting"]
            : ["data-contrast"],
    });
  reduced.addEventListener("change", sync);
  contrast.addEventListener("change", sync);
  picker?.addEventListener("toggle", sync);
  sync();
  materials.set(node, () => {
    clearTimeout(timer);
    observer.disconnect();
    picker?.removeEventListener("toggle", sync);
    reduced.removeEventListener("change", sync);
    contrast.removeEventListener("change", sync);
    detach();
    if (original === null) popup.removeAttribute("data-material-opaque");
    else popup.setAttribute("data-material-opaque", original);
  });
}

export function endMaterial(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  materials.get(node)?.();
  materials.delete(node);
}
