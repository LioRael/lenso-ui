import { press } from "@lenso/glass/motion";

/** Loading actions remain focusable while every activation path is suppressed. */
export function connectGroupAction(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLButtonElement) ||
    !["button-group-item", "glass-button-group-item"].includes(data["lensoKind"] ?? "")
  )
    return;
  const tint = data["lensoTint"] ?? "";
  if (tint && !CSS.supports("color", tint))
    throw new RangeError(`Invalid Lenso ButtonGroup tint: ${tint}`);
  const name = "--lenso-exact-action-tint",
    original = node.style.getPropertyValue(name),
    priority = node.style.getPropertyPriority(name);
  if (tint) node.style.setProperty(name, tint);
  else node.style.removeProperty(name);
  const pending = node.getAttribute("data-pending");
  node.toggleAttribute("data-pending", data["lensoLoading"] === "true");
  const guard = (event: Event) => {
    if (data["lensoLoading"] !== "true") return;
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const events = ["click", "dblclick", "keydown", "keyup", "pointerdown", "pointerup"];
  for (const event of events) node.addEventListener(event, guard, true);
  const stop =
    data["lensoKind"] === "glass-button-group-item" &&
    data["lensoDetached"] === "true" &&
    data["lensoElastic"] === "true" &&
    data["lensoLoading"] !== "true" &&
    !node.disabled
      ? press(node)
      : undefined;
  return () => {
    stop?.();
    for (const event of events) node.removeEventListener(event, guard, true);
    if (original) node.style.setProperty(name, original, priority);
    else node.style.removeProperty(name);
    if (pending === null) node.removeAttribute("data-pending");
    else node.setAttribute("data-pending", pending);
  };
}
