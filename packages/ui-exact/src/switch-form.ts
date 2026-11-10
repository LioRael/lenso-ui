const owners = new WeakMap<HTMLInputElement, () => void>();

/** Native reset proposes the initial value through the same Exact activation. */
export function updateSwitchForm(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (
    !(node instanceof HTMLInputElement) ||
    data["lensoKind"] !== "switch-input" ||
    owners.has(node)
  )
    return;
  const initial = node.checked;
  const root = () => document.getElementById(node.dataset["lensoFor"] ?? "");
  const checked = () => root()?.getAttribute("aria-checked") === "true";
  let active = true;
  let frame = 0;
  const reconcile = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (active) node.checked = checked();
    });
  };
  const reset = (event: Event) => {
    if (event.target !== node.form) return;
    queueMicrotask(() => {
      if (!active || event.defaultPrevented) return;
      if (initial !== checked()) root()?.click();
      reconcile();
    });
  };
  node.addEventListener("change", reconcile);
  node.ownerDocument.addEventListener("reset", reset, true);
  owners.set(node, () => {
    active = false;
    cancelAnimationFrame(frame);
    node.removeEventListener("change", reconcile);
    node.ownerDocument.removeEventListener("reset", reset, true);
  });
}
export function endSwitchForm(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLInputElement)) return;
  owners.get(node)?.();
  owners.delete(node);
}
