// Clear/tinted endpoint colors adapted from Glisse ios27, MIT, Copyright (c) 2026 Kelvin Zhang.
/** Shared surface preferences; input, focus and keyboard behavior stay with the control. */
function preferences(element: HTMLElement) {
  const explicit = element.closest("[data-contrast]")?.getAttribute("data-contrast");
  const forced = matchMedia("(forced-colors: active)").matches;
  const opaque =
    forced ||
    matchMedia("(prefers-reduced-transparency: reduce)").matches ||
    explicit === "increased" ||
    matchMedia("(prefers-contrast: more)").matches;
  const value = parseFloat(
    getComputedStyle(element).getPropertyValue("--lenso-glass-transparency"),
  );
  const tint = parseFloat(getComputedStyle(element).getPropertyValue("--lenso-glass-tint-amount"));
  return {
    forced,
    amount: opaque ? 0 : Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 1,
    tint: Number.isFinite(tint) ? Math.max(0, Math.min(1, tint)) : 0.5,
    legacy: Number.isFinite(value),
  };
}

export function glassIsOpaque(element: HTMLElement): boolean {
  return preferences(element).amount === 0;
}

export function observeGlassPreferences(element: HTMLElement, update: () => void): () => void {
  const observer = new MutationObserver(update);
  for (let node: HTMLElement | null = element; node; node = node.parentElement)
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-contrast", "data-variant"],
    });
  const media = [
    "(prefers-reduced-transparency: reduce)",
    "(prefers-contrast: more)",
    "(forced-colors: active)",
  ].map((query) => matchMedia(query));
  for (const query of media) query.addEventListener("change", update);
  update();
  return () => {
    observer.disconnect();
    for (const query of media) query.removeEventListener("change", update);
  };
}

export function watchGlassPreferences(element: HTMLElement, attach: () => () => void): () => void {
  const property = "--lenso-glass-preference-paint";
  const faceProperty = "--lenso-glass-face-opacity";
  const originalFace = element.style.getPropertyValue(faceProperty);
  const facePriority = element.style.getPropertyPriority(faceProperty);
  const original = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  let detach: (() => void) | undefined;
  const attribute = (name: string, enabled: boolean) => {
    if (element.hasAttribute(name) !== enabled) element.toggleAttribute(name, enabled);
  };
  const update = () => {
    if (!element.isConnected) {
      detach?.();
      detach = undefined;
      return;
    }
    const { forced, amount, tint: tintAmount, legacy } = preferences(element);
    const tint =
      element.getAttribute("data-variant") === "prominent" ||
      element.getAttribute("data-variant") === "filled";
    const solid = forced
      ? "Canvas"
      : tint
        ? "var(--lenso-control-tint, var(--lenso-tint))"
        : "var(--lenso-material-solid, var(--lenso-background-primary))";
    const dark =
      getComputedStyle(element).getPropertyValue("--lenso-material-action-mode").trim() === "dark";
    const endpoint = dark ? "rgb(30 30 32 / .95)" : "rgb(247 247 249 / .96)";
    const wash = amount < 1 ? 1 - amount : legacy ? 0 : Math.max(0, (tintAmount - 0.5) * 2);
    const color = `color-mix(in srgb, ${amount === 0 || legacy || tint ? solid : endpoint} ${wash * 100}%, transparent)`;
    const paint = wash > 0 ? `linear-gradient(${color}, ${color})` : "none";
    // Fade only the sampled face toward the real backdrop; keep text and the rim intact.
    const face = !legacy && !tint ? String(Math.min(1, 0.2 + tintAmount * 1.6)) : "1";
    if (element.style.getPropertyValue(faceProperty) !== face)
      element.style.setProperty(faceProperty, face);
    if (element.style.getPropertyValue(property) !== paint)
      element.style.setProperty(property, paint);
    attribute("data-lenso-glass-preferences", amount < 1 || (!legacy && tintAmount !== 0.5));
    attribute("data-lenso-glass-opaque", amount === 0);
    if (amount === 0) {
      detach?.();
      detach = undefined;
    } else detach ??= attach();
  };
  const stopObserving = observeGlassPreferences(element, update);
  return () => {
    stopObserving();
    detach?.();
    element.removeAttribute("data-lenso-glass-preferences");
    element.removeAttribute("data-lenso-glass-opaque");
    if (original) element.style.setProperty(property, original, priority);
    else element.style.removeProperty(property);
    if (originalFace) element.style.setProperty(faceProperty, originalFace, facePriority);
    else element.style.removeProperty(faceProperty);
  };
}
