import { attachGlass } from "@lenso/glass";
import { presentation } from "./presentation.js";
import { connectNative } from "./native.js";
import { connectAccordion, endPanel, updatePanel } from "./disclosure.js";

/** The subset of Exact's Web element handle used by these components. */
export interface ExactElement {
  hatch: string;
  element: HTMLElement | SVGElement;
  data: DOMStringMap;
}

const owners = new WeakMap<HTMLElement | SVGElement, () => void>();

/** Decorate the existing node; Exact keeps ownership of its events and state. */
export function element(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
  const node = handle.element;
  const { lensoKind: kind, lensoVariant: variant } = handle.data;
  const compiled = presentation(handle.data, node.closest('[data-slot="input-group"]') !== null);
  const optics = kind === "glass" || (kind === "glass-button" && !node.matches(":disabled"));
  const profileKey = kind === "glass-button" ? variant : "glass-small";

  owners.get(node)?.();
  const disconnectNative = connectNative(node, handle.data);
  const disconnectAccordion = connectAccordion(node, handle.data);
  const classes =
    compiled.className?.split(" ").filter((name) => name && !node.classList.contains(name)) ?? [];
  node.classList.add(...classes);
  let stop: (() => void) | undefined;
  if (optics) {
    if (!(node instanceof HTMLElement)) throw new TypeError("Lenso Glass requires an HTML element");
    stop = attachGlass(node, { profileKey, liveBackdrop: true });
  }
  owners.set(node, () => {
    stop?.();
    disconnectNative();
    disconnectAccordion?.();
    node.classList.remove(...classes);
  });
  updatePanel(node, handle.data);
  node.setAttribute("data-lenso-ready", "");
}

/** Called before Exact removes or recycles a node. */
export function elementEnded(handle: ExactElement) {
  if (handle.hatch !== "lenso-ui") return;
  endPanel(handle.element);
  owners.get(handle.element)?.();
  owners.delete(handle.element);
  handle.element.removeAttribute("data-lenso-ready");
}
