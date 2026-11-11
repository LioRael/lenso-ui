import { press } from "@lenso/glass/motion";

const bars = new WeakMap<HTMLElement, () => void>();
export function updateMenuBar(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "menu-bar" || bars.has(node)) return;
  const stop = press(node, (event) => {
    const target = event.target instanceof Element ? event.target.closest("button") : null;
    return (
      node.dataset["lensoElastic"] === "true" &&
      node.dataset["lensoDisabled"] !== "true" &&
      target?.closest('[data-slot="menu-bar"]') === node &&
      !target.matches(":disabled")
    );
  });
  bars.set(node, stop);
}
export function endMenuBar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  bars.get(node)?.();
  bars.delete(node);
}
