/** Presence selectors in shared tokens must not see data-invalid="false". */
export function connectNative(node: HTMLElement | SVGElement, data: DOMStringMap) {
  const restores: Array<() => void> = [];
  if (data["lensoKind"] === "card") {
    const original = node.getAttribute("data-material");
    if (data["lensoVariant"] === "glass") node.setAttribute("data-material", "glass-medium");
    else node.removeAttribute("data-material");
    restores.push(() => {
      if (original === null) node.removeAttribute("data-material");
      else node.setAttribute("data-material", original);
    });
  }
  if (data["lensoKind"] === "switch" || data["lensoKind"] === "slider-input") {
    const original = node.getAttribute("aria-readonly");
    if (data["lensoReadonly"] === "true") node.setAttribute("aria-readonly", "true");
    else node.removeAttribute("aria-readonly");
    restores.push(() => {
      if (original === null) node.removeAttribute("aria-readonly");
      else node.setAttribute("aria-readonly", original);
    });
  }
  if (data["lensoKind"] === "slider-input" && node instanceof HTMLInputElement) {
    const original = node.defaultValue;
    node.defaultValue = data["lensoValue"] ?? node.value;
    restores.push(() => {
      node.defaultValue = original;
    });
  }
  if (data["lensoKind"] === "tabs-glass") {
    const original = node.getAttribute("data-material");
    if (data["lensoGlass"] === "true") node.setAttribute("data-material", "glass-small");
    else node.removeAttribute("data-material");
    restores.push(() => {
      if (original === null) node.removeAttribute("data-material");
      else node.setAttribute("data-material", original);
    });
  }
  if (node instanceof HTMLElement && data["lensoKind"] === "tabs-panel") {
    const hidden = node.hidden,
      inert = node.inert;
    node.hidden = data["lensoPanelOpen"] !== "true";
    node.inert = node.hidden;
    restores.push(() => {
      node.hidden = hidden;
      node.inert = inert;
    });
  }
  if (node instanceof HTMLElement && data["lensoKind"] === "tabs-list") {
    const lift = Number(data["lensoLift"]);
    if (!Number.isFinite(lift) || lift < 0)
      throw new RangeError("Tabs lift must be finite and non-negative");
    for (const [name, value] of [
      ["--lenso-exact-tabs-grow-x", `${Math.round((lift * 4) / 3)}px`],
      ["--lenso-exact-tabs-grow-y", `${lift}px`],
    ]) {
      const original = node.style.getPropertyValue(name!),
        priority = node.style.getPropertyPriority(name!);
      node.style.setProperty(name!, value!);
      restores.push(() => {
        if (original) node.style.setProperty(name!, original, priority);
        else node.style.removeProperty(name!);
      });
    }
  }
  const disconnectSwitchInput = connectSwitchInput(node, data);
  if (disconnectSwitchInput) restores.push(disconnectSwitchInput);
  const disconnectLink = connectLink(node, data);
  if (disconnectLink) restores.push(disconnectLink);
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
    ["lensoReadonly", "data-readonly"],
    ["lensoChecked", "data-checked"],
    ["lensoIndeterminate", "data-indeterminate"],
    ["lensoOpen", "data-open"],
    ["lensoActive", "data-active"],
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

/** ARIA-disabled anchors retain no href; suppress synthetic activation as well. */
export function connectLink(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (data["lensoKind"] !== "link" && data["lensoKind"] !== "breadcrumbs-link") return;
  const guard = (event: Event) => {
    if (node.getAttribute("aria-disabled") !== "true") return;
    if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  node.addEventListener("click", guard, true);
  node.addEventListener("auxclick", guard, true);
  node.addEventListener("keydown", guard, true);
  return () => {
    node.removeEventListener("click", guard, true);
    node.removeEventListener("auxclick", guard, true);
    node.removeEventListener("keydown", guard, true);
  };
}

function connectSwitchInput(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLInputElement) || data["lensoKind"] !== "switch-input") return;
  const root = () => document.getElementById(data["lensoFor"] ?? "");
  const guard = (event: Event) => {
    if (data["lensoReadonly"] !== "true") return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const invalid = (event: Event) => {
    event.preventDefault();
    root()?.focus();
  };
  node.addEventListener("click", guard, true);
  node.addEventListener("invalid", invalid);
  return () => {
    node.removeEventListener("click", guard, true);
    node.removeEventListener("invalid", invalid);
  };
}
