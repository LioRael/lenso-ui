import { colorValue, equalColors } from "./color-value.js";
const roots = new WeakMap<HTMLElement, () => void>();
export function updateColor(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[data-slot="color-swatch"],[data-slot="color-swatch-picker"]')
    ? node
    : node.closest<HTMLElement>('[data-slot="color-swatch"],[data-slot="color-swatch-picker"]');
  if (!root || roots.has(root)) return;
  const original = new Map<HTMLElement, string>();
  const paint = () => {
    const swatches = root.matches('[data-slot="color-swatch"]')
      ? [root]
      : [...root.querySelectorAll<HTMLElement>('[data-slot="color-swatch-picker-item"]')].filter(
          (n) => n.closest('[data-slot="color-swatch-picker"]') === root,
        );
    for (const swatch of swatches) {
      const value = swatch.dataset["lensoValue"] ?? "";
      const parsed = colorValue(value);
      const fill = swatch.querySelector<HTMLElement>('[data-slot="color-swatch-fill"]');
      if (fill) {
        if (!original.has(fill)) original.set(fill, fill.style.backgroundColor);
        fill.style.backgroundColor = parsed?.toString("css") ?? "transparent";
      }
      const radio = swatch.querySelector<HTMLInputElement>('input[type="radio"]');
      if (radio) {
        radio.checked = equalColors(root.dataset["lensoValue"] ?? "", value);
        swatch.dataset["lensoActive"] = String(radio.checked);
      }
    }
  };
  const key = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !(event.target instanceof HTMLInputElement) ||
      event.target.type !== "radio" ||
      event.target.closest('[data-slot="color-swatch-picker"]') !== root
    )
      return;
    const items = [...root.querySelectorAll<HTMLInputElement>('input[type="radio"]')].filter(
      (n) => !n.disabled && n.closest('[data-slot="color-swatch-picker"]') === root,
    );
    const current = items.indexOf(event.target);
    if (current < 0) return;
    const rtl = getComputedStyle(root).direction === "rtl";
    const forward = event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const backward = event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft");
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : forward
            ? (current + 1) % items.length
            : backward
              ? (current - 1 + items.length) % items.length
              : -1;
    if (next < 0) return;
    event.preventDefault();
    items[next]!.focus();
    items[next]!.click();
  };
  root.addEventListener("keydown", key);
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-lenso-value"],
  });
  roots.set(root, () => {
    observer.disconnect();
    root.removeEventListener("keydown", key);
    for (const [fill, value] of original) fill.style.backgroundColor = value;
    roots.delete(root);
  });
  paint();
}
export function endColor(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) roots.get(node)?.();
}
