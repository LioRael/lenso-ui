import { press } from "@lenso/glass/motion";
export function connectGlassToggle(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLButtonElement) ||
    !["glass-toggle-button", "glass-toggle-button-group-item"].includes(data["lensoKind"] ?? "")
  )
    return;
  const tint = data["lensoTint"] ?? "";
  if (tint && !CSS.supports("color", tint))
    throw new RangeError(`Invalid GlassToggleButton tint: ${tint}`);
  const key = "--lenso-control-tint",
    original = node.style.getPropertyValue(key),
    priority = node.style.getPropertyPriority(key);
  if (tint) node.style.setProperty(key, tint);
  const joined =
    data["lensoKind"] === "glass-toggle-button-group-item" && data["lensoDetached"] !== "true";
  const stop =
    !joined && !node.disabled && data["lensoElastic"] === "true" ? press(node) : undefined;
  return () => {
    stop?.();
    if (original) node.style.setProperty(key, original, priority);
    else node.style.removeProperty(key);
  };
}
