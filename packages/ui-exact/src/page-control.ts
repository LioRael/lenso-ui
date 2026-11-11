// Keyboard model adapted from onlymoein/liquidglass, MIT.
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified for Exact's controlled state and keyed sliding window.
const owners = new WeakMap<HTMLElement, () => void>();
const rootSelector = '[data-slot="page-control"]';
function connect(root: HTMLElement) {
  let active = true;
  let pending: number | undefined;
  let previous = Number(root.dataset["lensoPage"]);
  let previousCount = Number(root.dataset["lensoCount"]);
  let frame = 0;
  const buttons = () =>
    Array.from(root.querySelectorAll<HTMLButtonElement>('[data-slot="page-control-item"]')).filter(
      (item) => item.closest(rootSelector) === root,
    );
  const bridge = () =>
    Array.from(root.querySelectorAll<HTMLInputElement>('[data-slot="page-control-request"]')).find(
      (input) => input.closest(rootSelector) === root,
    );
  const sync = () => {
    if (!active) return;
    const page = Number(root.dataset["lensoPage"]);
    const count = Number(root.dataset["lensoCount"]);
    const input = bridge();
    if (input) input.value = String(page);
    if (pending !== undefined) {
      if (
        root.dataset["lensoDisabled"] === "true" ||
        pending >= count ||
        (count !== previousCount && page !== pending)
      )
        pending = undefined;
      else if (page === pending) {
        const target = buttons().find((item) => Number(item.dataset["lensoIndex"]) === page);
        if (target) {
          target.focus();
          pending = undefined;
        }
      } else if (page !== previous) pending = undefined;
    }
    previous = page;
    previousCount = count;
  };
  const navigate = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      root.dataset["lensoDisabled"] === "true"
    )
      return;
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !buttons().includes(target) || target.disabled)
      return;
    const index = Number(target.dataset["lensoIndex"]),
      total = Number(root.dataset["lensoCount"]),
      current = Number(root.dataset["lensoPage"]);
    const forward = getComputedStyle(root).direction === "rtl" ? -1 : 1;
    const next =
      event.key === "ArrowLeft"
        ? index - forward
        : event.key === "ArrowRight"
          ? index + forward
          : event.key === "ArrowUp"
            ? index - 1
            : event.key === "ArrowDown"
              ? index + 1
              : event.key === "Home"
                ? 0
                : event.key === "End"
                  ? total - 1
                  : undefined;
    if (next === undefined) return;
    event.preventDefault();
    const page = Math.max(0, Math.min(total - 1, next));
    if (page === current) {
      buttons()
        .find((item) => Number(item.dataset["lensoIndex"]) === page)
        ?.focus();
      return;
    }
    const input = bridge();
    if (!input) return;
    pending = page;
    input.value = String(page);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(sync);
  };
  const pointer = () => {
    pending = undefined;
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-page",
      "data-lenso-count",
      "data-lenso-disabled",
      "data-lenso-index",
    ],
  });
  root.addEventListener("keydown", navigate);
  root.addEventListener("pointerdown", pointer);
  queueMicrotask(sync);
  return () => {
    active = false;
    pending = undefined;
    cancelAnimationFrame(frame);
    observer.disconnect();
    root.removeEventListener("keydown", navigate);
    root.removeEventListener("pointerdown", pointer);
  };
}
export function updatePageControl(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (node instanceof HTMLElement && data["lensoKind"] === "page-control" && !owners.has(node))
    owners.set(node, connect(node));
}
export function endPageControl(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  owners.get(node)?.();
  owners.delete(node);
}
