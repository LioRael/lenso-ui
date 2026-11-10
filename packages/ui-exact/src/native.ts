/** Presence selectors in shared tokens must not see data-invalid="false". */
export function connectNative(node: HTMLElement | SVGElement, data: DOMStringMap) {
  const restores: Array<() => void> = [];
  for (const [key, attribute, boolean] of [
    ["lensoName", "name", false],
    ["lensoRequired", "required", true],
  ] as const) {
    const value = data[key];
    if (
      value === undefined ||
      !(node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement)
    )
      continue;
    const original = node.getAttribute(attribute);
    if (boolean) node.toggleAttribute(attribute, value === "true");
    else node.setAttribute(attribute, value);
    restores.push(() => {
      if (original === null) node.removeAttribute(attribute);
      else node.setAttribute(attribute, original);
    });
  }
  for (const [key, attribute] of [
    ["lensoInvalid", "data-invalid"],
    ["lensoDisabled", "data-disabled"],
    ["lensoChecked", "data-checked"],
    ["lensoIndeterminate", "data-indeterminate"],
    ["lensoOpen", "data-open"],
    ["lensoPanelOpen", "data-panel-open"],
  ] as const) {
    if (data[key] === undefined) continue;
    const original = node.getAttribute(attribute);
    node.toggleAttribute(attribute, data[key] === "true");
    restores.push(() => {
      if (original === null) node.removeAttribute(attribute);
      else node.setAttribute(attribute, original);
    });
  }
  if (node instanceof HTMLInputElement && data["lensoIndeterminate"] !== undefined) {
    const original = node.indeterminate;
    node.indeterminate = data["lensoIndeterminate"] === "true";
    restores.push(() => (node.indeterminate = original));
  }
  if (data["lensoKind"] === "label") {
    const focus = () => {
      const control = document.getElementById(data["lensoFor"] ?? "");
      if (control instanceof HTMLInputElement && /^(checkbox|radio)$/.test(control.type))
        control.click();
      control?.focus();
    };
    node.addEventListener("click", focus);
    restores.push(() => node.removeEventListener("click", focus));
  }
  if (data["lensoKind"] === "input-group") {
    const focus = (event: Event) => {
      if (!(event.target instanceof Element) || event.defaultPrevented) return;
      if (
        event.target.closest(
          'input, textarea, select, button, a[href], [tabindex], [contenteditable], [role="button"]',
        )
      )
        return;
      node
        .querySelector<HTMLElement>(
          'input:not(:disabled):not([type="hidden"]), textarea:not(:disabled)',
        )
        ?.focus();
    };
    node.addEventListener("pointerdown", focus);
    node.addEventListener("click", focus);
    restores.push(() => {
      node.removeEventListener("pointerdown", focus);
      node.removeEventListener("click", focus);
    });
  }
  return () => {
    for (const restore of restores) restore();
  };
}
