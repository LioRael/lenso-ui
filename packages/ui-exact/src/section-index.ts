import { nearestSection } from "./section-index-value.js";
import { observeFocus } from "./search-field.js";
const selector = '[data-slot="section-index"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(query: string) =>
    [...root.querySelectorAll<T>(query)].filter((n) => n.closest(selector) === root);
  const request = own<HTMLInputElement>('[data-slot="section-index-request"]')[0];
  if (!request) return;
  const rows = () => own<HTMLAnchorElement>('[data-slot="section-index-item"]');
  const disabled = () => root.dataset["lensoDisabled"] === "true";
  const available = () =>
    rows().filter((n) => !disabled() && n.dataset["lensoDisabled"] !== "true" && !n.hidden);
  const key = (n: HTMLElement) => n.dataset["lensoValue"] ?? "";
  const attrs = new Map<Element, Map<string, string | null>>();
  const attr = (node: Element, name: string, value: string | null) => {
    let values = attrs.get(node);
    if (!values) attrs.set(node, (values = new Map()));
    if (!values.has(name)) values.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  let disposed = false,
    focusValue: string | undefined,
    drag: { id: number; last: string } | undefined,
    suppressClick = false,
    validationQueued = false;
  const cancel = (suppress = true) => {
    const current = drag;
    drag = undefined;
    if (current && suppress) suppressClick = true;
    if (current && root.hasPointerCapture(current.id)) root.releasePointerCapture(current.id);
  };
  const paint = () => {
    if (disposed) return;
    const all = available(),
      preferred =
        focusValue ??
        (root.dataset["lensoActive"] === "true" ? root.dataset["lensoValue"] : undefined);
    const tab = all.find((n) => key(n) === preferred) ?? all[0];
    for (const row of rows()) {
      attr(row, "tabindex", row === tab ? "0" : "-1");
      attr(row, "draggable", "false");
    }
    if (drag && (disabled() || !all.some((n) => key(n) === drag!.last))) cancel();
    for (const [node, values] of attrs)
      if (!node.isConnected && !root.contains(node)) {
        for (const [name, value] of values) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
        attrs.delete(node);
      }
    if (!validationQueued) {
      validationQueued = true;
      queueMicrotask(() => {
        validationQueued = false;
        if (disposed) return;
        const values = rows().map(key);
        if (new Set(values).size !== values.length)
          throw new RangeError("SectionIndex item values must be unique");
        for (const row of rows()) {
          const href = row.getAttribute("href");
          if (href && !href.startsWith("#"))
            throw new TypeError("SectionIndex links must be same-page fragments");
        }
        if (!Number.isFinite(Number(root.dataset["lensoOffset"])))
          throw new RangeError("SectionIndex scroll offset must be finite");
      });
    }
  };
  const rowOf = (target: EventTarget | null) =>
    target instanceof Element && target.closest(selector) === root
      ? target.closest<HTMLAnchorElement>('[data-slot="section-index-item"]')
      : null;
  const modified = (event: MouseEvent | KeyboardEvent) =>
    event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
  const navigateLocal = (row: HTMLAnchorElement, event: MouseEvent) => {
    const id = root.dataset["lensoScrollport"];
    if (!id) return;
    event.preventDefault();
    const port = doc.getElementById(id);
    if (!(port instanceof HTMLElement)) throw new Error(`Missing SectionIndex scrollport: ${id}`);
    const raw = (row.getAttribute("href") ?? "").slice(1);
    let fragment = raw;
    try {
      fragment = decodeURIComponent(raw);
    } catch {
      /* Literal percent signs remain valid authored IDs. */
    }
    const target = doc.getElementById(fragment);
    if (target && port.contains(target)) {
      const top =
        port.scrollTop +
        target.getBoundingClientRect().top -
        port.getBoundingClientRect().top -
        port.clientTop -
        Number(root.dataset["lensoOffset"] ?? 0);
      port.scrollTo({ top, behavior: "instant" });
    } else if (!fragment) port.scrollTo({ top: 0, behavior: "instant" });
  };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element) || event.target.closest(selector) !== root) return;
    if (suppressClick) {
      suppressClick = false;
      if (event.detail > 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
    }
    const row = rowOf(event.target);
    if (!row) return;
    if (disabled() || row.dataset["lensoDisabled"] === "true") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (event.defaultPrevented || modified(event)) return;
    navigateLocal(row, event);
    request.value = key(row);
    request.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const focused = (event: FocusEvent) => {
    const row = rowOf(event.target);
    if (row) {
      focusValue = key(row);
      paint();
    }
  };
  const keyboard = (event: KeyboardEvent) => {
    if (event.defaultPrevented || modified(event)) return;
    const row = rowOf(event.target),
      all = available(),
      index = row ? all.indexOf(row) : -1;
    if (index < 0) return;
    const next =
      event.key === "ArrowUp"
        ? Math.max(0, index - 1)
        : event.key === "ArrowDown"
          ? Math.min(all.length - 1, index + 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? all.length - 1
              : undefined;
    if (next === undefined) return;
    event.preventDefault();
    all[next]?.focus({ preventScroll: true });
  };
  const nearest = (y: number) => {
    const all = available(),
      value = nearestSection(
        all.map((n) => {
          const r = n.getBoundingClientRect();
          return { value: key(n), center: r.top + r.height / 2, disabled: false };
        }),
        y,
      );
    return all.find((n) => key(n) === value);
  };
  const down = (event: PointerEvent) => {
    if (!drag) suppressClick = false;
    if (
      event.defaultPrevented ||
      disabled() ||
      !event.isPrimary ||
      event.button !== 0 ||
      modified(event) ||
      drag ||
      !(event.target instanceof Element) ||
      event.target.closest(selector) !== root
    )
      return;
    const hit = rowOf(event.target);
    if (hit?.dataset["lensoDisabled"] === "true") return;
    const row = hit ?? nearest(event.clientY);
    if (!row) return;
    event.preventDefault();
    root.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, last: key(row) };
    row.click();
  };
  const move = (event: PointerEvent) => {
    if (event.defaultPrevented || !drag || drag.id !== event.pointerId || disabled()) return;
    const row = nearest(event.clientY);
    if (row && key(row) !== drag.last) {
      drag.last = key(row);
      row.click();
    }
  };
  const up = (event: PointerEvent) => {
    if (drag?.id === event.pointerId) cancel();
  };
  const lost = (event: PointerEvent) => {
    if (event.target === root && drag?.id === event.pointerId) cancel();
  };
  const preventDrag = (event: DragEvent) => {
    if (rowOf(event.target)) event.preventDefault();
  };
  view.addEventListener("click", click, true);
  root.addEventListener("focusin", focused);
  root.addEventListener("keydown", keyboard);
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", up);
  root.addEventListener("lostpointercapture", lost);
  root.addEventListener("dragstart", preventDrag);
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["data-lenso-value", "data-lenso-active", "data-lenso-disabled", "href"],
  });
  const stopFocus = observeFocus(doc);
  paint();
  return {
    sync: paint,
    end() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      cancel(false);
      stopFocus();
      view.removeEventListener("click", click, true);
      root.removeEventListener("focusin", focused);
      root.removeEventListener("keydown", keyboard);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("lostpointercapture", lost);
      root.removeEventListener("dragstart", preventDrag);
      for (const [node, values] of attrs)
        for (const [name, value] of values) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
      owners.delete(root);
    },
  };
}
export function updateSectionIndex(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!owners.has(root)) {
    const owner = create(root);
    if (owner) owners.set(root, owner);
  }
  owners.get(root)?.sync();
}
export function endSectionIndex(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement && node.matches(selector)) owners.get(node)?.end();
}
