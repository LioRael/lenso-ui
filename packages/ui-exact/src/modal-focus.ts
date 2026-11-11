/**
 * Copyright (c) 2019 Material-UI SAS. MIT License; see NOTICES.md.
 * Adapted from Base UI 1.9.0 focus traversal for Exact's native dialog boundary.
 */
const candidates =
  'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
type FocusElement = HTMLElement | SVGElement;

function parent(element: Element): Element | null {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

export function modalOwner(element: Element | null): HTMLDialogElement | null {
  for (let current = element; current; current = parent(current))
    if (current instanceof HTMLDialogElement && current.matches(":modal")) return current;
  return null;
}

function summary(details: Element) {
  return [...details.children].find((child) => child.tagName.toLowerCase() === "summary");
}

function eligible(element: Element): element is FocusElement {
  if (
    !(element instanceof HTMLElement || element instanceof SVGElement) ||
    !element.matches(candidates) ||
    !element.isConnected ||
    element.matches(":disabled")
  )
    return false;
  const tag = element.tagName.toLowerCase();
  if (tag === "input" && element instanceof HTMLInputElement && element.type === "hidden")
    return false;
  if (
    tag === "summary" &&
    (element.parentElement?.tagName.toLowerCase() !== "details" ||
      summary(element.parentElement) !== element)
  )
    return false;
  if (tag === "details" && summary(element)) return false;
  const style = getComputedStyle(element);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  if (
    typeof element.checkVisibility === "function"
      ? !element.checkVisibility()
      : style.display === "none" || style.display === "contents"
  )
    return false;
  for (let current: Element | null = element; current; current = parent(current)) {
    if (current.hasAttribute("inert") || current.hasAttribute("hidden")) return false;
    if (current !== element && current instanceof HTMLDetailsElement && !current.open) {
      const first = summary(current);
      if (!first || (first !== element && !first.contains(element))) return false;
    }
    if (
      current !== element &&
      current.tagName.toLowerCase() !== "slot" &&
      getComputedStyle(current).display === "none"
    )
      return false;
  }
  return true;
}

function index(element: FocusElement) {
  if (element.tabIndex >= 0 || element.hasAttribute("tabindex")) return element.tabIndex;
  const tag = element.tagName.toLowerCase();
  return tag === "details" ||
    tag === "audio" ||
    tag === "video" ||
    (element instanceof HTMLElement && element.isContentEditable)
    ? 0
    : element.tabIndex;
}

function tabbablesIn(container: HTMLElement, owner: HTMLDialogElement | null): FocusElement[] {
  const found: Element[] = [];
  const visit = (container: Element) => {
    const assigned =
      container instanceof HTMLSlotElement ? container.assignedElements({ flatten: true }) : [];
    const children = assigned.length
      ? assigned
      : container.shadowRoot
        ? [...container.shadowRoot.children]
        : [...container.children];
    for (const child of children) {
      if (child.matches(candidates)) found.push(child);
      visit(child);
    }
  };
  visit(container);
  const enabled = found
    .filter(eligible)
    .filter((element) => modalOwner(element) === owner && index(element) >= 0);
  return enabled
    .filter((element) => {
      if (!(element instanceof HTMLInputElement) || element.type !== "radio" || !element.name)
        return true;
      const radios = enabled.filter(
        (other): other is HTMLInputElement =>
          other instanceof HTMLInputElement &&
          other.type === "radio" &&
          other.name === element.name &&
          other.form === element.form,
      );
      return (radios.find((other) => other.checked) ?? radios[0]) === element;
    })
    .sort((a, b) => (index(a) > 0 ? index(a) : Infinity) - (index(b) > 0 ? index(b) : Infinity));
}

export function activeElement(document: Document): Element | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
  return active;
}

export function modalTabbables(dialog: HTMLDialogElement): FocusElement[] {
  return tabbablesIn(dialog, dialog);
}

export function popoverTabbables(popup: HTMLElement): FocusElement[] {
  return tabbablesIn(popup, modalOwner(popup));
}
