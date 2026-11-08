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
  };
}

export function glassIsOpaque(element: HTMLElement): boolean {
  return preferences(element).amount === 0;
}

export function observeGlassPreferences(element: HTMLElement, update: () => void): () => void {
  const presentation =
    /^(?:transform(?:-origin)?|translate|scale|opacity|filter|clip-path|border(?:-(?:top-left|top-right|bottom-left|bottom-right))?-radius|--lg-(?:press-(?:scale|translate)|menu-(?:scale|translate|origin|(?:surface|trigger)-opacity)|light-(?:x|y|radius|label)))\s*:/;
  const inputs = (style: string) =>
    style
      .split(";")
      .map((rule) => rule.trim())
      .filter((rule) => rule && !presentation.test(rule))
      .join(";");
  const signatures = new WeakMap<HTMLElement, string>();
  const observer = new MutationObserver((records) => {
    let changed = false;
    const targets = new Set<HTMLElement>();
    for (const record of records) {
      if (record.attributeName === "style") targets.add(record.target as HTMLElement);
      else changed = true;
    }
    for (const node of targets) {
      const next = inputs(node.style.cssText);
      if (next !== signatures.get(node)) changed = true;
      signatures.set(node, next);
    }
    if (changed) update();
  });
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    signatures.set(node, inputs(node.style.cssText));
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-contrast", "data-variant"],
    });
  }
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
  const originalClarity = element.style.getPropertyValue("--lenso-glass-clarity");
  const originalFace = element.style.getPropertyValue(faceProperty);
  const facePriority = element.style.getPropertyPriority(faceProperty);
  const original = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  let originalBlur = element.style.getPropertyValue("--lg-blur");
  let blurPriority = element.style.getPropertyPriority("--lg-blur");
  const measuredBlur = parseFloat(getComputedStyle(element).getPropertyValue("--lg-blur"));
  let regularBlur = Number.isFinite(measuredBlur) ? measuredBlur : 3;
  let appliedBlur: string | undefined;
  let opticalPreference = "";
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
    const { forced, amount, tint: tintAmount } = preferences(element);
    const callerBlur = element.style.getPropertyValue("--lg-blur");
    if (appliedBlur !== undefined && callerBlur !== appliedBlur) {
      originalBlur = callerBlur;
      blurPriority = element.style.getPropertyPriority("--lg-blur");
      const changedBlur = parseFloat(getComputedStyle(element).getPropertyValue("--lg-blur"));
      if (Number.isFinite(changedBlur)) regularBlur = changedBlur;
    }
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
    const wash = (color: string, amount: number) => {
      const mixed = `color-mix(in srgb, ${color} ${amount * 100}%, transparent)`;
      return `linear-gradient(${mixed}, ${mixed})`;
    };
    const paints = [
      ...(amount < 1 ? [wash(solid, 1 - amount)] : []),
      ...(amount > 0 && tintAmount > 0.5
        ? [wash(tint ? solid : endpoint, (tintAmount - 0.5) * 2)]
        : []),
    ];
    const paint = paints.join(", ") || "none";
    // Opacity covers the selected material; it does not select a different material.
    const clear = !tint ? Math.max(0, 1 - tintAmount * 2) : 0;
    const face = "1";
    if (element.style.getPropertyValue("--lenso-glass-clarity") !== String(clear))
      element.style.setProperty("--lenso-glass-clarity", String(clear));
    const profile = getComputedStyle(element).getPropertyValue("--apple-material-profile");
    const blur = profile.includes("knob")
      ? regularBlur
      : regularBlur + (Math.min(regularBlur, 1.3) - regularBlur) * clear;
    const nextOptics = `${blur}:${clear}`;
    if (element.style.getPropertyValue("--lg-blur") !== `${blur}px`)
      element.style.setProperty("--lg-blur", `${blur}px`);
    appliedBlur = `${blur}px`;
    if (element.style.getPropertyValue(faceProperty) !== face)
      element.style.setProperty(faceProperty, face);
    if (element.style.getPropertyValue(property) !== paint)
      element.style.setProperty(property, paint);
    attribute("data-lenso-glass-preferences", amount < 1 || tintAmount !== 0.5);
    attribute("data-lenso-glass-opaque", amount === 0);
    if (amount === 0) {
      detach?.();
      detach = undefined;
    } else {
      if (nextOptics !== opticalPreference) {
        opticalPreference = nextOptics;
        detach?.();
        detach = undefined;
      }
      detach ??= attach();
    }
  };
  const stopObserving = observeGlassPreferences(element, update);
  return () => {
    stopObserving();
    detach?.();
    element.removeAttribute("data-lenso-glass-preferences");
    element.removeAttribute("data-lenso-glass-opaque");
    if (original) element.style.setProperty(property, original, priority);
    else element.style.removeProperty(property);
    if (originalClarity) element.style.setProperty("--lenso-glass-clarity", originalClarity);
    else element.style.removeProperty("--lenso-glass-clarity");
    if (originalBlur) element.style.setProperty("--lg-blur", originalBlur, blurPriority);
    else element.style.removeProperty("--lg-blur");
    if (originalFace) element.style.setProperty(faceProperty, originalFace, facePriority);
    else element.style.removeProperty(faceProperty);
  };
}
