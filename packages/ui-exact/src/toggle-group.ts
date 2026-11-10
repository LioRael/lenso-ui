interface ToggleGroup {
  sync(): void;
  destroy(): void;
}
const groups = new WeakMap<HTMLElement, ToggleGroup>();
const groupSelector = '[data-slot="toggle-button-group"]';
const itemSelector = '[data-slot="toggle-button"]';

function createGroup(node: HTMLElement): ToggleGroup {
  const originals = new Map<HTMLButtonElement, string | null>();
  let current: HTMLButtonElement | undefined;
  let disposed = false;
  const items = () =>
    [...node.querySelectorAll<HTMLButtonElement>(itemSelector)].filter(
      (item) => item.closest(groupSelector) === node && item instanceof HTMLButtonElement,
    );
  const sync = () => {
    if (disposed) return;
    const all = items();
    for (const [item, original] of originals)
      if (!all.includes(item)) {
        if (original === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", original);
        originals.delete(item);
      }
    const enabled = all.filter((item) => !item.disabled);
    const active = document.activeElement;
    current =
      enabled.find((item) => item === active) ??
      (current && enabled.includes(current) ? current : undefined) ??
      enabled.find((item) => item.getAttribute("aria-pressed") === "true") ??
      enabled[0];
    for (const item of all) {
      if (!originals.has(item)) originals.set(item, item.getAttribute("tabindex"));
      item.tabIndex = item === current ? 0 : -1;
    }
  };
  const focused = (event: FocusEvent) => {
    if (
      !(event.target instanceof HTMLButtonElement) ||
      event.target.closest(groupSelector) !== node
    )
      return;
    current = event.target;
    sync();
  };
  const navigate = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const target = event.target;
    if (
      !(target instanceof HTMLButtonElement) ||
      target.closest(groupSelector) !== node ||
      !target.matches(itemSelector)
    )
      return;
    const enabled = items().filter((item) => !item.disabled);
    const index = enabled.indexOf(target);
    if (index < 0) return;
    const vertical = node.dataset["orientation"] === "vertical";
    const rtl = getComputedStyle(node).direction === "rtl";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    let destination: number;
    if (event.key === "Home") destination = 0;
    else if (event.key === "End") destination = enabled.length - 1;
    else if (event.key === next || event.key === previous) {
      destination = index + (event.key === next ? 1 : -1);
      destination =
        node.dataset["lensoLoopFocus"] === "true"
          ? (destination + enabled.length) % enabled.length
          : Math.max(0, Math.min(enabled.length - 1, destination));
    } else return;
    event.preventDefault();
    enabled[destination]?.focus();
  };
  const observer = new MutationObserver(sync);
  observer.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-pressed"],
  });
  node.addEventListener("focusin", focused);
  node.addEventListener("keydown", navigate);
  sync();
  return {
    sync,
    destroy() {
      disposed = true;
      observer.disconnect();
      node.removeEventListener("focusin", focused);
      node.removeEventListener("keydown", navigate);
      for (const [item, original] of originals)
        if (original === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", original);
      originals.clear();
    },
  };
}

export function updateToggleGroup(element: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(element instanceof HTMLElement)) return;
  if (data["lensoKind"] === "toggle-button-group") {
    const controller = groups.get(element);
    if (controller) controller.sync();
    else groups.set(element, createGroup(element));
  } else if (data["lensoKind"] === "toggle-button-group-item") {
    const parent = element.closest<HTMLElement>(groupSelector);
    if (parent) groups.get(parent)?.sync();
  }
}

export function endToggleGroup(element: HTMLElement | SVGElement) {
  if (!(element instanceof HTMLElement)) return;
  groups.get(element)?.destroy();
  groups.delete(element);
}
