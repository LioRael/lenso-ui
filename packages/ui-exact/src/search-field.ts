const documents = new WeakMap<Document, { users: number; stop(): void }>();

// Text editors match :focus-visible after pointer focus too. Share the source
// modality rule so only keyboard navigation paints the enclosing group ring.
function observeFocus(document: Document) {
  let owner = documents.get(document);
  if (!owner) {
    const root = document.documentElement;
    const original = root.getAttribute("data-lenso-focus-method");
    const pointer = () => root.setAttribute("data-lenso-focus-method", "pointer");
    const keyboard = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const editing =
        event.target instanceof Element &&
        event.target.matches("input, textarea, [contenteditable], [role='spinbutton']");
      if (
        event.key === "Tab" ||
        (!editing && !["Shift", "Control", "Alt", "Meta"].includes(event.key))
      )
        root.setAttribute("data-lenso-focus-method", "keyboard");
    };
    document.addEventListener("pointerdown", pointer, true);
    document.addEventListener("keydown", keyboard, true);
    owner = {
      users: 0,
      stop() {
        document.removeEventListener("pointerdown", pointer, true);
        document.removeEventListener("keydown", keyboard, true);
        if (original === null) root.removeAttribute("data-lenso-focus-method");
        else root.setAttribute("data-lenso-focus-method", original);
      },
    };
    documents.set(document, owner);
  }
  owner.users++;
  return () => {
    if (--owner.users === 0) {
      owner.stop();
      documents.delete(document);
    }
  };
}

/** Clear through the native input event so Exact retains value ownership. */
function clear(input: HTMLInputElement | null) {
  if (!input || input.disabled || input.readOnly) return;
  const view = input.ownerDocument.defaultView;
  if (!view) return;
  Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")?.set?.call(input, "");
  input.dispatchEvent(new view.Event("input", { bubbles: true }));
  input.focus();
}

function editor(node: Element) {
  const group = node.closest('[data-slot="search-field-group"]');
  return (
    [...(group?.querySelectorAll<HTMLInputElement>('[data-slot="search-field-input"]') ?? [])].find(
      (input) => input.closest('[data-slot="search-field-group"]') === group,
    ) ?? null
  );
}

export function connectSearchField(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (data["lensoKind"] === "search-field-group") {
    const focus = (event: Event) => {
      if (
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        event.target.closest("input, button, a[href], [tabindex], [contenteditable]")
      )
        return;
      const input = editor(node);
      if (input && !input.disabled) {
        // Exact's decorative SVG is not focusable; retain the focus across
        // the browser's following mousedown default action.
        event.preventDefault();
        input.focus();
      }
    };
    node.addEventListener("pointerdown", focus);
    return () => {
      node.removeEventListener("pointerdown", focus);
    };
  }
  if (data["lensoKind"] === "search-field-input" && node instanceof HTMLInputElement) {
    const escape = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.isComposing ||
        event.key !== "Escape" ||
        !node.value ||
        node.disabled ||
        node.readOnly
      )
        return;
      event.preventDefault();
      clear(node);
    };
    node.addEventListener("keydown", escape);
    return () => node.removeEventListener("keydown", escape);
  }
  if (data["lensoKind"] === "search-field-clear") {
    const down = (event: Event) => event.preventDefault();
    const click = (event: Event) => {
      if (!event.defaultPrevented && !node.matches(":disabled")) clear(editor(node));
    };
    node.addEventListener("pointerdown", down);
    node.addEventListener("click", click);
    return () => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("click", click);
    };
  }
  return undefined;
}

const groups = new WeakMap<HTMLElement | SVGElement, () => void>();

export function updateSearchField(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (data["lensoKind"] === "search-field-group" && !groups.has(node))
    groups.set(node, observeFocus(node.ownerDocument));
}

export function endSearchField(node: HTMLElement | SVGElement) {
  groups.get(node)?.();
  groups.delete(node);
}
