import type { KeyboardEvent } from "react";

const roots = '[data-slot="accordion"], [data-slot="disclosure-group"]';
const triggers = '[data-slot="accordion-trigger"], [data-slot="disclosure-trigger"]';

/** Base UI 1.7 owns expansion, but does not implement disclosure-group arrow navigation. */
export function navigateDisclosureGroup(
  event: KeyboardEvent<HTMLElement>,
  orientation: "horizontal" | "vertical",
  loopFocus: boolean,
) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
    return;
  const root = event.currentTarget;
  const target = event.target;
  if (!(target instanceof Element) || target.closest(roots) !== root) return;
  const trigger = target.closest(triggers);
  if (!trigger) return;
  const items = Array.from(root.querySelectorAll<HTMLElement>(triggers)).filter(
    (item) =>
      item.closest(roots) === root &&
      !item.hasAttribute("disabled") &&
      !item.hasAttribute("data-disabled") &&
      item.getAttribute("aria-disabled") !== "true" &&
      (!item.matches('[data-slot="disclosure-trigger"]') ||
        item.closest('[data-slot="disclosure"]')?.hasAttribute("data-disclosure-group-item")),
  );
  const index = items.indexOf(trigger as HTMLElement);
  if (index === -1) return;
  const rtl = root.ownerDocument.defaultView?.getComputedStyle(root).direction === "rtl";
  const previous = orientation === "vertical" ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
  const next = orientation === "vertical" ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
  let destination: number;
  if (event.key === "Home") destination = 0;
  else if (event.key === "End") destination = items.length - 1;
  else if (event.key === previous || event.key === next) {
    destination = index + (event.key === next ? 1 : -1);
    destination = loopFocus
      ? (destination + items.length) % items.length
      : Math.max(0, Math.min(items.length - 1, destination));
  } else return;
  event.preventDefault();
  items[destination]?.focus();
}
