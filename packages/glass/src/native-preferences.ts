// Clear/tinted endpoint colors adapted from Glisse ios27, MIT, Copyright (c) 2026 Kelvin Zhang.
import * as stylex from "@stylexjs/stylex";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
/** Read preferences with native geometry, then apply them in the shared paint commit. */
export function createNativePreferences(element: HTMLElement) {
  const property = "--lenso-glass-preference-paint";
  const original = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  const forced = matchMedia("(forced-colors: active)");
  const reduced = matchMedia("(prefers-reduced-transparency: reduce)");
  const contrast = matchMedia("(prefers-contrast: more)");
  let previous = "",
    applied = false;
  let cached: { paint: string; clarity: number; blur: string; opaque: boolean } | undefined;
  let ownedClasses: string[] | undefined;
  const clear = () => {
    if (!applied) return;
    applied = false;
    for (const name of ownedClasses ?? []) element.classList.remove(name);
    if (original) element.style.setProperty(property, original, priority);
    else element.style.removeProperty(property);
    element.removeAttribute("data-lenso-glass-preferences");
    element.removeAttribute("data-lenso-glass-opaque");
  };
  return {
    read(style: CSSStyleDeclaration) {
      const input = parseFloat(style.getPropertyValue("--lenso-glass-transparency"));
      const tintInput = parseFloat(style.getPropertyValue("--lenso-glass-tint-amount"));
      const solid =
        forced.matches ||
        reduced.matches ||
        contrast.matches ||
        element.closest("[data-contrast]")?.getAttribute("data-contrast") === "increased";
      const amount = solid ? 0 : Number.isFinite(input) ? Math.max(0, Math.min(1, input)) : 1;
      const tint = Number.isFinite(tintInput) ? Math.max(0, Math.min(1, tintInput)) : 0.5;
      if (amount === 1 && tint === 0.5) return undefined;
      const variant = element.getAttribute("data-variant");
      const colored = variant === "prominent" || variant === "filled";
      const dark = style.getPropertyValue("--lenso-material-action-mode").trim() === "dark";
      const profile = style.getPropertyValue("--apple-material-profile");
      const regularBlur = style.getPropertyValue("--lg-blur").trim() || "3px";
      const key = `${amount}:${tint}:${colored}:${dark}:${forced.matches}:${profile}:${regularBlur}`;
      if (key === previous) return cached;
      previous = key;
      const color = forced.matches
        ? "Canvas"
        : colored
          ? "var(--lenso-control-tint, var(--lenso-tint))"
          : "var(--lenso-material-solid, var(--lenso-background-primary))";
      const endpoint = dark ? "rgb(30 30 32 / .95)" : "rgb(247 247 249 / .96)";
      const wash = (color: string, amount: number) => {
        const mixed = `color-mix(in srgb, ${color} ${amount * 100}%, transparent)`;
        return `linear-gradient(${mixed}, ${mixed})`;
      };
      const paint =
        [
          ...(amount < 1 ? [wash(color, 1 - amount)] : []),
          ...(amount > 0 && tint > 0.5 ? [wash(colored ? color : endpoint, (tint - 0.5) * 2)] : []),
        ].join(", ") || "none";
      const clarity = colored ? 0 : Math.max(0, 1 - tint * 2);
      const size = parseFloat(regularBlur);
      const blur =
        profile.includes("knob") || clarity === 0
          ? regularBlur
          : Number.isFinite(size)
            ? `${size + (Math.min(size, 1.3) - size) * clarity}px`
            : `calc(${regularBlur} * ${1 - clarity} + min(${regularBlur}, 1.3px) * ${clarity})`;
      return (cached = { paint, clarity, blur, opaque: amount === 0 });
    },
    apply(value: typeof cached) {
      if (!value) {
        clear();
        return;
      }
      if (element.style.getPropertyValue(property) !== value.paint)
        element.style.setProperty(property, value.paint);
      if (!element.hasAttribute("data-lenso-glass-preferences"))
        element.setAttribute("data-lenso-glass-preferences", "");
      if (element.hasAttribute("data-lenso-glass-opaque") !== value.opaque)
        element.toggleAttribute("data-lenso-glass-opaque", value.opaque);
      ownedClasses ??= (stylex.props(liquidMaterialStyles.movingPreferences).className ?? "")
        .split(/\s+/)
        .filter((name) => name && !element.classList.contains(name));
      for (const name of ownedClasses)
        if (!element.classList.contains(name)) element.classList.add(name);
      applied = true;
    },
    destroy: clear,
  };
}
