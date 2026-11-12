// Magnifier adaptation, Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Exact owns the node; existing glassMotion owns pointer capture and spring behavior.
import { glassMotion, press } from "@lenso/glass/motion";
const owners = new WeakMap<HTMLElement, { key: string; end(): void }>();
export function updateMagnifier(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "glass-magnifier") return;
  const key = [data["lensoDraggable"], data["lensoAnimated"], data["lensoElastic"]].join("|");
  if (owners.get(node)?.key === key) return;
  owners.get(node)?.end();
  const motion = data["lensoDraggable"] === "true" || data["lensoAnimated"] === "true";
  const elastic = data["lensoElastic"] === "true";
  const saved = [
    ...(motion ? ["translate", "scale", "box-shadow"] : []),
    ...(elastic ? ["--lg-press-scale", "--lg-press-translate", "--lg-x", "--lg-y"] : []),
  ].map(
    (name) =>
      [name, node.style.getPropertyValue(name), node.style.getPropertyPriority(name)] as const,
  );
  const marker = node.getAttribute("data-glass-dragging");
  const stopPress = data["lensoElastic"] === "true" ? press(node) : undefined;
  const stop = glassMotion(
    node,
    data["lensoDraggable"] === "true",
    data["lensoAnimated"] === "true",
  );
  let ended = false;
  owners.set(node, {
    key,
    end() {
      if (ended) return;
      ended = true;
      stop();
      stopPress?.();
      for (const [name, value, priority] of saved) {
        if (value) node.style.setProperty(name, value, priority);
        else node.style.removeProperty(name);
      }
      if (motion) {
        if (marker === null) node.removeAttribute("data-glass-dragging");
        else node.setAttribute("data-glass-dragging", marker);
      }
      owners.delete(node);
    },
  });
}
export function endMagnifier(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
