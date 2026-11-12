import { selectCollection, selectionMode } from "./collection-selection.js";
const selector = '[data-slot="list-box"],[data-slot="tag-group"]';
const controllers = new WeakMap<
  HTMLElement,
  { sync(): void; end(): void; propose(next: readonly string[]): void }
>();
export function updateListBox(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  const current = controllers.get(root);
  if (current) {
    current.sync();
    return;
  }
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(query: string) =>
    [...root.querySelectorAll<T>(query)].filter((n) => n.closest(selector) === root);
  const changes = own<HTMLInputElement>('[data-slot="list-box-change"]')[0];
  const actions = own<HTMLInputElement>('[data-slot="list-box-action"]')[0];
  if (!changes || !actions) return;
  const attrs = new Map<Element, Map<string, string | null>>();
  const attr = (n: Element, key: string, value: string | null) => {
    let saved = attrs.get(n);
    if (!saved) attrs.set(n, (saved = new Map()));
    if (!saved.has(key)) saved.set(key, n.getAttribute(key));
    if (n.getAttribute(key) === value) return;
    if (value === null) n.removeAttribute(key);
    else n.setAttribute(key, value);
  };
  const tags = root.dataset["lensoKind"] === "tag-group";
  const itemSelector = '[data-slot="list-box-item"],[data-slot="tag"]';
  const all = () => own<HTMLElement>(itemSelector);
  const disabled = () => root.dataset["lensoDisabled"] === "true";
  const blocked = () => disabled() || root.dataset["lensoReadonly"] === "true";
  const enabled = () =>
    all().filter((n) => !disabled() && n.dataset["lensoDisabled"] !== "true" && !n.hidden);
  const keyOf = (n: HTMLElement) => n.dataset["lensoValue"] ?? "";
  const value = () => own<HTMLInputElement>('[data-slot="list-box-selected"]').map((n) => n.value);
  let active: HTMLElement | undefined,
    anchor: string | undefined,
    range: string[] = [],
    hadFocus = false,
    ended = false;
  let pendingRemoval:
    | { key: string; row: HTMLElement; next?: HTMLElement; previous?: HTMLElement }
    | undefined;
  let validationQueued = false;
  let term = "",
    timer = 0;
  const emit = (input: HTMLInputElement, payload: string) => {
    if (ended) return;
    input.value = payload;
    input.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const propose = (next: readonly string[]) => {
    if (blocked()) return;
    const mode = selectionMode(root.dataset["lensoMode"] ?? "");
    if (mode === "none") return;
    const keys = own<HTMLInputElement>('[data-slot="list-box-key"]').map((n) => n.value);
    const selected = new Set(next);
    const mask = keys.map((key) => (selected.has(key) ? "1" : "0")).join("");
    emit(changes, mask);
  };
  const choose = (target: HTMLElement, extend = false) => {
    if (blocked() || !enabled().includes(target)) return;
    const key = keyOf(target),
      mode = selectionMode(root.dataset["lensoMode"] ?? "");
    const result = selectCollection(
      enabled().map(keyOf),
      value(),
      key,
      mode,
      extend ? anchor : undefined,
      range,
    );
    if (!extend) anchor = key;
    range = result.range;
    propose(result.value);
  };
  const remove = (row: HTMLElement) => {
    if (!tags || blocked() || root.dataset["lensoRemovable"] !== "true") return;
    const options = enabled(),
      index = options.indexOf(row);
    if (index < 0) return;
    pendingRemoval = {
      key: keyOf(row),
      row,
      next: options[index + 1],
      previous: options[index - 1],
    };
    const request = own<HTMLInputElement>('[data-slot="tag-group-remove"]')[0];
    if (request) emit(request, keyOf(row));
  };
  const removeClick = (event: MouseEvent) => {
    if (
      !tags ||
      event.defaultPrevented ||
      !(event.target instanceof Element) ||
      event.target.closest(selector) !== root
    )
      return;
    const button = event.target.closest<HTMLButtonElement>('[data-slot="tag-remove-button"]');
    const row = button?.closest<HTMLElement>(itemSelector);
    if (!button || !row) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!button.disabled) remove(row);
  };
  const tabs = () => {
    const options = enabled();
    attr(root, "tabindex", options.length || disabled() ? "-1" : "0");
    for (const row of all())
      attr(row, "tabindex", options.includes(row) && row === active ? "0" : "-1");
  };
  const focus = (target: HTMLElement, select = true) => {
    if (!enabled().includes(target)) return;
    const moved = active !== target;
    active = target;
    tabs();
    if (
      select &&
      moved &&
      root.dataset["lensoFollowFocus"] === "true" &&
      selectionMode(root.dataset["lensoMode"] ?? "") === "single"
    )
      choose(target);
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  const sync = () => {
    if (ended) return;
    const mode = selectionMode(root.dataset["lensoMode"] ?? "");
    attr(root, "aria-multiselectable", String(mode === "multiple"));
    attr(root, "aria-readonly", String(root.dataset["lensoReadonly"] === "true"));
    const rows = all(),
      keys = rows.map(keyOf);
    if (!validationQueued) {
      validationQueued = true;
      queueMicrotask(() => {
        validationQueued = false;
        if (ended) return;
        const rendered = all().map(keyOf),
          declared = own<HTMLInputElement>('[data-slot="list-box-key"]').map((n) => n.value);
        if (
          new Set(rendered).size !== rendered.length ||
          new Set(declared).size !== declared.length
        )
          throw new Error("ListBox keys must be unique");
        if (rendered.some((k) => !declared.includes(k)))
          throw new Error("ListBox item key is missing from state.keys");
      });
    }
    for (const [node, values] of attrs)
      if (node !== root && !rows.includes(node as HTMLElement)) {
        for (const [key, value] of values) {
          if (value === null) node.removeAttribute(key);
          else node.setAttribute(key, value);
        }
        attrs.delete(node);
      }
    const options = enabled();
    const restore =
      !!active &&
      hadFocus &&
      (!active.isConnected || !options.includes(active)) &&
      (doc.activeElement === doc.body || doc.activeElement === active);
    if (!active || !options.includes(active)) active = options[0];
    for (const [i, row] of rows.entries()) {
      attr(row, "aria-disabled", String(disabled() || row.dataset["lensoDisabled"] === "true"));
      attr(row, tags ? "aria-rowindex" : "aria-posinset", String(i + 1));
      if (!tags) attr(row, "aria-setsize", String(rows.length));
      else if (mode === "none") attr(row, "aria-selected", null);
    }
    if (tags) {
      attr(root, "aria-rowcount", String(rows.length));
      attr(root, "aria-colcount", root.dataset["lensoRemovable"] === "true" ? "2" : "1");
    }
    const confirmed =
      pendingRemoval && !pendingRemoval.row.isConnected ? pendingRemoval : undefined;
    if (confirmed) {
      pendingRemoval = undefined;
      active =
        confirmed.next && options.includes(confirmed.next)
          ? confirmed.next
          : confirmed.previous && options.includes(confirmed.previous)
            ? confirmed.previous
            : undefined;
      if (value().includes(confirmed.key)) {
        const request = own<HTMLInputElement>('[data-slot="tag-group-deselect"]')[0];
        if (request) emit(request, confirmed.key);
      }
    }
    if (root.dataset["lensoKind"] === "wheel-picker-viewport" && !root.contains(doc.activeElement))
      active = options.find((row) => value().includes(keyOf(row))) ?? active;
    tabs();
    if (anchor !== undefined && !keys.includes(anchor)) {
      anchor = undefined;
      range = [];
    }
    if (restore || confirmed) (active ?? root).focus({ preventScroll: true });
  };
  const rowFor = (target: EventTarget | null) =>
    target instanceof Element && target.closest(selector) === root
      ? target.closest<HTMLElement>(itemSelector)
      : null;
  const interactive = (target: EventTarget | null) =>
    target instanceof Element &&
    !!target.closest("button,input,textarea,select,a[href],[contenteditable]");
  const click = (event: MouseEvent) => {
    const row = rowFor(event.target);
    if (!row || event.defaultPrevented || interactive(event.target) || !enabled().includes(row))
      return;
    focus(row, false);
    choose(row, event.shiftKey);
    emit(actions, keyOf(row));
  };
  const focusin = (event: FocusEvent) => {
    if (!(event.target instanceof Element) || event.target.closest(selector) !== root) return;
    hadFocus = true;
    const row = rowFor(event.target);
    if (row && enabled().includes(row) && active !== row) {
      active = row;
      tabs();
      if (
        root.dataset["lensoFollowFocus"] === "true" &&
        selectionMode(root.dataset["lensoMode"] ?? "") === "single"
      )
        choose(row);
    }
  };
  const focusout = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget))
      hadFocus = false;
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      disabled() ||
      interactive(event.target) ||
      !(event.target instanceof Element) ||
      event.target.closest(selector) !== root
    )
      return;
    const row = rowFor(event.target),
      options = enabled();
    if (
      tags &&
      row &&
      ["Delete", "Backspace"].includes(event.key) &&
      !blocked() &&
      root.dataset["lensoRemovable"] === "true"
    ) {
      event.preventDefault();
      remove(row);
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      if (selectionMode(root.dataset["lensoMode"] ?? "") === "multiple" && !blocked()) {
        event.preventDefault();
        propose(options.map(keyOf));
      }
      return;
    }
    if (event.ctrlKey || event.metaKey) return;
    if (event.key === "Escape") {
      if (value().length && !blocked()) {
        event.preventDefault();
        propose([]);
      }
      return;
    }
    if (row && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      if (options.includes(row)) {
        choose(row);
        emit(actions, keyOf(row));
      }
      return;
    }
    const index = options.indexOf(row ?? active!),
      rtl = root.dataset["lensoDirection"] === "rtl";
    let target: HTMLElement | undefined;
    if (event.key === "Home") target = options[0];
    else if (event.key === "End") target = options.at(-1);
    else if (event.key === "ArrowDown" || event.key === (rtl ? "ArrowLeft" : "ArrowRight"))
      target =
        options[
          root.dataset["lensoLoop"] === "true"
            ? (index + 1) % options.length
            : Math.min(index + 1, options.length - 1)
        ];
    else if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowRight" : "ArrowLeft"))
      target =
        options[
          root.dataset["lensoLoop"] === "true"
            ? (index - 1 + options.length) % options.length
            : Math.max(0, index - 1)
        ];
    else if ([...event.key].length === 1 && event.key !== " ") {
      view.clearTimeout(timer);
      term += event.key.toLocaleLowerCase();
      const search = [...term].every((c) => c === term[0]) ? event.key.toLocaleLowerCase() : term;
      target = [...options.slice(index + 1), ...options.slice(0, index + 1)].find((n) =>
        (n.getAttribute("aria-label") ?? n.textContent ?? "")
          .toLocaleLowerCase()
          .startsWith(search),
      );
      timer = view.setTimeout(() => {
        term = "";
      }, 500);
    }
    if (target) {
      event.preventDefault();
      if (event.shiftKey && selectionMode(root.dataset["lensoMode"] ?? "") === "multiple") {
        anchor ??= row ? keyOf(row) : keyOf(target);
        choose(target, true);
      }
      focus(target);
    }
  };
  root.addEventListener("click", removeClick, true);
  root.addEventListener("click", click);
  root.addEventListener("keydown", keydown);
  root.addEventListener("focusin", focusin);
  root.addEventListener("focusout", focusout);
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "aria-selected",
      "data-lenso-disabled",
      "data-lenso-mode",
      "data-lenso-readonly",
      "data-lenso-direction",
      "data-lenso-loop",
      "data-lenso-follow-focus",
      "data-lenso-removable",
    ],
  });
  const controller = {
    sync,
    propose,
    end() {
      ended = true;
      observer.disconnect();
      view.clearTimeout(timer);
      pendingRemoval = undefined;
      root.removeEventListener("click", removeClick, true);
      root.removeEventListener("click", click);
      root.removeEventListener("keydown", keydown);
      root.removeEventListener("focusin", focusin);
      root.removeEventListener("focusout", focusout);
      for (const [node, values] of attrs)
        for (const [key, value] of values) {
          if (value === null) node.removeAttribute(key);
          else node.setAttribute(key, value);
        }
    },
  };
  controllers.set(root, controller);
  sync();
}
export function endListBox(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  controllers.get(node)?.end();
  controllers.delete(node);
}

export function requestListBoxSelection(root: HTMLElement, values: readonly string[]) {
  controllers.get(root)?.propose(values);
}
