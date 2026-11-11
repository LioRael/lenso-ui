interface Controller {
  sync(): void;
  destroy(): void;
}
const owners = new WeakMap<HTMLElement, Controller>();
const listSelector = '[data-slot="tabs-list"]';
const itemSelector = '[data-slot="tabs-tab"]';
function connect(list: HTMLElement): Controller {
  const original = new Map<HTMLElement, { tabIndex: string | null; controls: string | null }>();
  const root = list.closest('[data-slot="tabs"]') ?? list;
  let current: HTMLElement | undefined;
  let pointerButton = -1;
  let disposed = false;
  const items = () =>
    Array.from(list.querySelectorAll<HTMLElement>(itemSelector)).filter(
      (item) =>
        item.closest(listSelector) === list &&
        !item.hidden &&
        !item.hasAttribute("data-tabs-overflow"),
    );
  const enabled = (item: HTMLElement) =>
    !item.matches(':disabled, [aria-disabled="true"], [data-disabled]');
  const sync = () => {
    if (disposed) return;
    const all = items();
    const available = all.filter(enabled);
    const active = list.ownerDocument.activeElement;
    const removedFocus = current && !current.isConnected && active === list.ownerDocument.body;
    for (const [item, value] of original)
      if (!all.includes(item)) {
        if (value.tabIndex === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", value.tabIndex);
        if (value.controls === null) item.removeAttribute("aria-controls");
        else item.setAttribute("aria-controls", value.controls);
        original.delete(item);
      }
    current =
      available.find((item) => item === active) ??
      available.find((item) => item.getAttribute("aria-selected") === "true") ??
      available[0];
    for (const item of all) {
      if (!original.has(item))
        original.set(item, {
          tabIndex: item.getAttribute("tabindex"),
          controls: item.getAttribute("aria-controls"),
        });
      item.tabIndex = item === current ? 0 : -1;
      const panel = list.ownerDocument.getElementById(item.dataset["lensoPanelId"] ?? "");
      if (panel?.closest('[data-slot="tabs"]') === root)
        item.setAttribute("aria-controls", panel.id);
      else item.removeAttribute("aria-controls");
    }
    if (removedFocus && list.isConnected) current?.focus();
  };
  const focus = (event: FocusEvent) => {
    const item = event.target;
    if (!(item instanceof HTMLElement) || !items().includes(item) || !enabled(item)) return;
    current = item;
    sync();
    if (
      list.dataset["lensoActivateOnFocus"] === "true" &&
      pointerButton <= 0 &&
      item.getAttribute("aria-selected") !== "true"
    )
      item.click();
  };
  const down = (event: PointerEvent) => {
    pointerButton = event.button;
  };
  const up = () => {
    pointerButton = -1;
  };
  const navigate = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const target = event.target;
    const all = items();
    if (!(target instanceof HTMLElement) || !all.includes(target)) return;
    const available = all.filter(enabled);
    if (!available.length) return;
    const vertical = list.getAttribute("data-orientation") === "vertical";
    const rtl = getComputedStyle(list).direction === "rtl";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const previous = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    let destination: HTMLElement | undefined;
    if (event.key === "Home") destination = available[0];
    else if (event.key === "End") destination = available.at(-1);
    else if (event.key === next || event.key === previous) {
      const direction = event.key === next ? 1 : -1;
      for (let step = 1; step <= all.length; step++) {
        let index = all.indexOf(target) + step * direction;
        if (list.dataset["lensoLoopFocus"] === "true") index = (index + all.length) % all.length;
        else if (index < 0 || index >= all.length) break;
        if (enabled(all[index]!)) {
          destination = all[index];
          break;
        }
      }
    } else return;
    event.preventDefault();
    event.stopPropagation();
    destination?.focus();
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "aria-disabled", "aria-selected", "hidden", "data-tabs-overflow"],
  });
  list.addEventListener("focusin", focus);
  list.addEventListener("keydown", navigate);
  list.addEventListener("pointerdown", down, true);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  sync();
  queueMicrotask(sync);
  return {
    sync,
    destroy() {
      disposed = true;
      observer.disconnect();
      list.removeEventListener("focusin", focus);
      list.removeEventListener("keydown", navigate);
      list.removeEventListener("pointerdown", down, true);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      for (const [item, value] of original) {
        if (value.tabIndex === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", value.tabIndex);
        if (value.controls === null) item.removeAttribute("aria-controls");
        else item.setAttribute("aria-controls", value.controls);
      }
      original.clear();
    },
  };
}
export function updateTabs(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "tabs-list") {
    if (!owners.has(node)) owners.set(node, connect(node));
    else owners.get(node)!.sync();
  } else if (data["lensoKind"] === "tabs-tab") {
    const list = node.closest<HTMLElement>(listSelector);
    if (list) owners.get(list)?.sync();
  }
}
export function endTabs(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  owners.get(node)?.destroy();
  owners.delete(node);
}
