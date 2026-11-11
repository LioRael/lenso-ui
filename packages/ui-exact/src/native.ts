import { connectListReorder } from "./list-reorder.js";
import { connectFusionItem } from "./glass-container.js";
import { connectToolbar } from "./toolbar.js";
import { connectSearchField } from "./search-field.js";
import { connectGroupAction } from "./button-group.js";
/** Presence selectors in shared tokens must not see data-invalid="false". */
export function connectNative(node: HTMLElement | SVGElement, data: DOMStringMap) {
  const restores: Array<() => void> = [];
  const endReorder = connectListReorder(node, data);
  if (endReorder) restores.push(endReorder);
  if (node instanceof HTMLElement && data["lensoKind"] === "list-root") {
    const selectAll = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        (!event.ctrlKey && !event.metaKey) ||
        event.key.toLowerCase() !== "a" ||
        node.dataset["lensoActive"] !== "true" ||
        node.dataset["lensoDisabled"] === "true"
      )
        return;
      const target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest("[data-lenso-active]") !== node ||
        target.closest('input:not([type="checkbox"]), textarea, select, [contenteditable]')
      )
        return;
      const bridge = node.querySelector<HTMLButtonElement>('[data-slot="list-select-all"]');
      if (!bridge || bridge.disabled) return;
      event.preventDefault();
      bridge.click();
    };
    node.addEventListener("keydown", selectAll);
    restores.push(() => node.removeEventListener("keydown", selectAll));
  }

  if (
    node instanceof HTMLInputElement &&
    ["page-control-request", "scroll-shadow-report"].includes(data["lensoKind"] ?? "")
  ) {
    const form = node.getAttribute("form");
    node.setAttribute("form", "");
    restores.push(() => {
      if (form === null) node.removeAttribute("form");
      else node.setAttribute("form", form);
    });
  }
  if (node instanceof HTMLElement && data["lensoKind"] === "scroll-shadow") {
    for (const [key, name] of [
      ["lensoSize", "--lenso-exact-scroll-size"],
      ["lensoOffset", "--lenso-exact-scroll-offset"],
    ]) {
      const value = Number(data[key!]);
      if (!Number.isFinite(value)) throw new RangeError(`ScrollShadow ${key} must be finite`);
      const original = node.style.getPropertyValue(name!),
        priority = node.style.getPropertyPriority(name!);
      node.style.setProperty(name!, `${value}px`);
      restores.push(() => {
        if (original) node.style.setProperty(name!, original, priority);
        else node.style.removeProperty(name!);
      });
    }
  }
  if (node instanceof HTMLElement && data["lensoKind"] === "glass-container-surface") {
    const hidden = node.hidden;
    node.hidden = true;
    restores.push(() => {
      node.hidden = hidden;
    });
  }
  if (node instanceof HTMLElement && data["lensoKind"] === "toolbar-fusion-group") {
    for (const [name, enabled] of [
      ["data-toolbar-detachable", true],
      ["data-lenso-glass-group", true],
      [
        "data-toolbar-elastic-surface",
        data["lensoSurface"] !== "true" && data["lensoDetached"] !== "true",
      ],
    ] as const) {
      const original = node.getAttribute(name);
      node.toggleAttribute(name, enabled);
      restores.push(() => {
        if (original === null) node.removeAttribute(name);
        else node.setAttribute(name, original);
      });
    }
  }
  const disconnectFusionItem = connectFusionItem(node, data);
  if (disconnectFusionItem) restores.push(disconnectFusionItem);
  const disconnectToolbar = connectToolbar(node, data);
  if (disconnectToolbar) restores.push(disconnectToolbar);
  const disconnectSearch = connectSearchField(node, data);
  if (disconnectSearch) restores.push(disconnectSearch);
  const disconnectGroupAction = connectGroupAction(node, data);
  if (disconnectGroupAction) restores.push(disconnectGroupAction);
  if (data["lensoKind"] === "card") {
    const original = node.getAttribute("data-material");
    if (data["lensoVariant"] === "glass") node.setAttribute("data-material", "glass-medium");
    else node.removeAttribute("data-material");
    restores.push(() => {
      if (original === null) node.removeAttribute("data-material");
      else node.setAttribute("data-material", original);
    });
  }
  if (
    data["lensoKind"] === "switch" ||
    data["lensoKind"] === "slider-input" ||
    data["lensoKind"] === "segmented-control"
  ) {
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
  if (data["lensoKind"] === "tabs-glass" || data["lensoKind"] === "page-control-track") {
    const original = node.getAttribute("data-material");
    if (data["lensoGlass"] === "true" || data["lensoVariant"] === "prominent")
      node.setAttribute("data-material", "glass-small");
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
  if (
    node instanceof HTMLElement &&
    ["tabs-list", "segmented-control"].includes(data["lensoKind"] ?? "")
  ) {
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
  if (node instanceof HTMLInputElement && data["lensoKind"] === "segmented-control-input") {
    const originalChecked = node.defaultChecked,
      originalForm = node.getAttribute("form");
    node.defaultChecked = data["lensoChecked"] === "true";
    if (data["lensoForm"]) node.setAttribute("form", data["lensoForm"]);
    else node.removeAttribute("form");
    const guard = (event: Event) => {
      if (data["lensoReadonly"] === "true") {
        event.preventDefault();
        event.stopImmediatePropagation();
      } else event.stopPropagation();
    };
    const focus = () => document.getElementById(data["lensoFor"] ?? "")?.focus();
    const invalid = (event: Event) => {
      event.preventDefault();
      const group = node.closest('[data-slot="segmented-control"]');
      const choices = Array.from(
        group?.querySelectorAll<HTMLElement>('[role="radio"]') ?? [],
      ).filter(
        (item) =>
          item.closest('[data-slot="segmented-control"]') === group &&
          !item.matches(':disabled, [data-disabled], [aria-disabled="true"]'),
      );
      (
        choices.find((item) => item.getAttribute("aria-checked") === "true") ??
        choices[0] ??
        document.getElementById(data["lensoFor"] ?? "")
      )?.focus();
    };
    node.addEventListener("click", guard, true);
    node.addEventListener("focus", focus);
    node.addEventListener("invalid", invalid);
    restores.push(() => {
      node.removeEventListener("click", guard, true);
      node.removeEventListener("focus", focus);
      node.removeEventListener("invalid", invalid);
      node.defaultChecked = originalChecked;
      if (originalForm === null) node.removeAttribute("form");
      else node.setAttribute("form", originalForm);
    });
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
    ["lensoAttached", "data-attached"],
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
  if (data["lensoKind"] === "label" || data["lensoKind"] === "select-label") {
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
  if (
    ![
      "link",
      "breadcrumbs-link",
      "pagination-link",
      "pagination-previous",
      "pagination-next",
      "toolbar-link",
    ].includes(data["lensoKind"] ?? "")
  )
    return;
  // Exact omits the redundant role on native anchors, including href-less
  // disabled links. Restore their link semantics while this hatch owns them.
  const originalRole = node.getAttribute("role");
  if (originalRole === null && node.getAttribute("aria-disabled") === "true")
    node.setAttribute("role", "link");
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
    if (originalRole === null) node.removeAttribute("role");
    else node.setAttribute("role", originalRole);
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
