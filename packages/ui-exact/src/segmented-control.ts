const groups = new WeakMap<HTMLElement, () => void>();
const groupSelector = '[data-slot="segmented-control"]';
const itemSelector = '[data-slot="segmented-control-item"]';
function connect(group: HTMLElement) {
  const originals = new Map<HTMLButtonElement, string | null>();
  let current: HTMLButtonElement | undefined;
  let active = true;
  let frame = 0;
  const items = () =>
    Array.from(group.querySelectorAll<HTMLButtonElement>(itemSelector)).filter(
      (item) => item.closest(groupSelector) === group,
    );
  const enabled = (item: HTMLButtonElement) =>
    !item.matches(':disabled, [aria-disabled="true"], [data-disabled]');
  const readonly = () => group.dataset["lensoReadonly"] === "true";
  const sync = () => {
    if (!active) return;
    const all = items();
    const available = all.filter(enabled);
    const old = current;
    for (const [item, original] of originals)
      if (!all.includes(item)) {
        if (original === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", original);
        originals.delete(item);
      }
    current =
      available.find((item) => item === document.activeElement) ??
      available.find((item) => item.getAttribute("aria-checked") === "true") ??
      available[0];
    for (const item of all) {
      if (!originals.has(item)) originals.set(item, item.getAttribute("tabindex"));
      item.tabIndex = item === current ? 0 : -1;
    }
    if (old && !old.isConnected && document.activeElement === document.body && group.isConnected)
      current?.focus();
  };
  const focus = () => sync();
  const navigate = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      !(event.target instanceof HTMLButtonElement) ||
      !items().includes(event.target)
    )
      return;
    if (event.key === "Enter") {
      event.preventDefault();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const all = items();
    const choices = all.filter(enabled);
    if (!choices.length) return;
    const rtl = getComputedStyle(group).direction === "rtl";
    let target: HTMLButtonElement | undefined;
    if (event.key === "Home") target = choices[0];
    else if (event.key === "End") target = choices.at(-1);
    else {
      const direction =
        event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")
          ? 1
          : event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft")
            ? -1
            : 0;
      if (!direction) return;
      for (let step = 1; step <= all.length; step++) {
        const index = (all.indexOf(event.target) + step * direction + all.length) % all.length;
        if (enabled(all[index]!)) {
          target = all[index];
          break;
        }
      }
    }
    event.preventDefault();
    event.stopPropagation();
    target?.focus();
    if (!readonly()) target?.click();
  };
  const reconcile = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!active) return;
      for (const input of group.querySelectorAll<HTMLInputElement>(
        '[data-lenso-kind="segmented-control-input"]',
      ))
        input.checked = input.dataset["lensoChecked"] === "true";
    });
  };
  const reset = (event: Event) => {
    if (Array.from(group.querySelectorAll("input")).some((input) => input.form === event.target))
      queueMicrotask(reconcile);
  };
  const observer = new MutationObserver(sync);
  observer.observe(group, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-checked", "aria-disabled", "disabled"],
  });
  group.addEventListener("focusin", focus);
  group.addEventListener("keydown", navigate);
  group.addEventListener("change", reconcile);
  group.ownerDocument.addEventListener("reset", reset, true);
  sync();
  queueMicrotask(sync);
  return () => {
    active = false;
    cancelAnimationFrame(frame);
    observer.disconnect();
    group.removeEventListener("focusin", focus);
    group.removeEventListener("keydown", navigate);
    group.removeEventListener("change", reconcile);
    group.ownerDocument.removeEventListener("reset", reset, true);
    for (const [item, original] of originals) {
      if (original === null) item.removeAttribute("tabindex");
      else item.setAttribute("tabindex", original);
    }
    originals.clear();
  };
}
export function updateSegmented(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  if (data["lensoKind"] === "segmented-control" && !groups.has(node))
    groups.set(node, connect(node));
}
export function endSegmented(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  groups.get(node)?.();
  groups.delete(node);
}
