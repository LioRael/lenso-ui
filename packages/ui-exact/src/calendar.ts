import { createCalendarYearPicker } from "./calendar-year-picker.js";
import {
  calendarMonth,
  calendarTarget,
  calendarDate,
  type CalendarOptions,
} from "./calendar-value.js";
const selector = '[data-slot="calendar"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const request = root.querySelector<HTMLInputElement>('[data-slot="calendar-layout"]');
  if (!request) return;
  const view = root.ownerDocument.defaultView!;
  let ended = false,
    frame = 0,
    focused = "",
    key = "",
    selection = "",
    focusAfter = false;
  let yearPicker: ReturnType<typeof createCalendarYearPicker> | undefined;
  const attrs = new Map<Element, Map<string, string | null>>(),
    texts = new Map<HTMLElement, string>();
  const attr = (n: Element, k: string, v: string | null) => {
    let m = attrs.get(n);
    if (!m) attrs.set(n, (m = new Map()));
    if (!m.has(k)) m.set(k, n.getAttribute(k));
    if (n.getAttribute(k) !== v) {
      if (v === null) n.removeAttribute(k);
      else n.setAttribute(k, v);
    }
  };
  const text = (n: HTMLElement, value: string) => {
    if (!texts.has(n)) texts.set(n, n.textContent ?? "");
    if (n.textContent !== value) n.textContent = value;
  };
  const restore = (n: Element) => {
    for (const [k, v] of attrs.get(n) ?? []) {
      if (v === null) n.removeAttribute(k);
      else n.setAttribute(k, v);
    }
    attrs.delete(n);
    if (n instanceof HTMLElement && texts.has(n)) {
      n.textContent = texts.get(n)!;
      texts.delete(n);
    }
  };
  const data = () => root.dataset;
  const options = (): CalendarOptions => ({
    value: (data()["lensoValue"] ?? "").split("|").filter(Boolean),
    focused,
    placeholder: data()["lensoPlaceholder"] ?? "2000-01-01",
    today: data()["lensoToday"] ?? "",
    locale: data()["lensoLocale"] ?? "en-US",
    calendar: data()["lensoCalendar"] ?? "",
    firstDay: data()["lensoFirstDay"] ?? "",
    weekdayStyle: (data()["lensoWeekdayStyle"] ?? "short") as CalendarOptions["weekdayStyle"],
    min: data()["lensoMin"] ?? "",
    max: data()["lensoMax"] ?? "",
    unavailable: (data()["lensoUnavailable"] ?? "").split("|").filter(Boolean),
  });
  const disabled = () => data()["lensoDisabled"] === "true";
  const buttons = () =>
    [...root.querySelectorAll<HTMLButtonElement>("button[data-calendar-date]")].filter(
      (n) => n.closest(selector) === root,
    );
  const schedule = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  };
  const render = () => {
    if (ended) return;
    if (!["single", "multiple", "none"].includes(data()["lensoSelectionMode"] ?? "single"))
      throw new RangeError("Unknown calendar selection mode");
    const nextKey = [data()["lensoFocused"], data()["lensoLocale"], data()["lensoCalendar"]].join(
      "|",
    );
    const values = data()["lensoValue"] ?? "";
    if (
      nextKey !== key ||
      (!root.contains(root.ownerDocument.activeElement) && selection !== values)
    ) {
      const old = focused;
      focused =
        data()["lensoFocused"] ||
        values.split("|")[0] ||
        data()["lensoPlaceholder"] ||
        "2000-01-01";
      if (nextKey === key && old && data()["lensoFocused"]) focused = old;
      key = nextKey;
    }
    selection = values;
    let model = calendarMonth(options());
    if (model.date.compare(model.min) < 0 || model.date.compare(model.max) > 0) {
      focused = (model.date.compare(model.min) < 0 ? model.min : model.max).toString();
      model = calendarMonth(options());
    }
    const heading = root.querySelector<HTMLElement>('[data-slot="calendar-heading"]');
    if (heading) text(heading, model.heading);
    for (const node of root.querySelectorAll<HTMLElement>('[data-slot="calendar-header-cell"]')) {
      const day = model.weekdays[Number(node.dataset["lensoIndex"])];
      if (day) {
        text(node, day.text);
        attr(node, "aria-label", day.label);
      }
    }
    for (const node of root.querySelectorAll<HTMLButtonElement>(
      '[data-slot="calendar-nav-button"]',
    )) {
      const next = node.dataset["lensoNext"] === "true";
      attr(node, "disabled", disabled() || !(next ? model.next : model.previous) ? "" : null);
    }
    const layout = buttons()
      .map((n) => n.dataset["calendarDate"])
      .join("|");
    if (layout !== model.cells.map((c) => c.iso).join("|")) {
      request.value = model.layout;
      request.dispatchEvent(new view.Event("input", { bubbles: true }));
      return;
    }
    const cells = buttons();
    let tab =
      model.cells.find((c) => c.iso === focused && !c.outside && !c.disabled && !c.unavailable) ??
      model.cells.find((c) => !c.outside && !c.disabled && !c.unavailable);
    for (const node of cells) {
      const cell = model.cells.find((c) => c.iso === node.dataset["calendarDate"]);
      if (!cell) continue;
      attr(node, "aria-label", `${cell.label}${cell.selected ? " selected" : ""}`);
      attr(node, "aria-current", cell.today ? "date" : null);
      attr(node, "disabled", disabled() || cell.disabled || cell.unavailable ? "" : null);
      attr(node, "tabindex", !disabled() && cell === tab ? "0" : "-1");
      attr(node, "data-calendar-focused", cell === tab ? "true" : null);
      attr(node, "data-lenso-selected", String(cell.selected));
      attr(node, "data-lenso-today", String(cell.today));
      attr(node, "data-lenso-outside", String(cell.outside));
      attr(node, "data-outside-month", cell.outside ? "" : null);
      attr(node, "data-lenso-unavailable", String(cell.unavailable));
      attr(node, "data-lenso-disabled", String(disabled() || cell.disabled));
      const label = node.querySelector<HTMLElement>('[data-slot="calendar-day-label"]');
      if (label) text(label, cell.text);
    }
    const grid = root.querySelector<HTMLElement>('[role="grid"]');
    if (grid) {
      attr(grid, "tabindex", !disabled() && !tab ? "0" : null);
      attr(grid, "aria-readonly", String(data()["lensoReadonly"] === "true"));
      attr(grid, "aria-multiselectable", String(data()["lensoSelectionMode"] === "multiple"));
    }
    for (const n of new Set([...attrs.keys(), ...texts.keys()])) if (!root.contains(n)) restore(n);
    yearPicker ??= createCalendarYearPicker(root, {
      options,
      move: (date, focusDay) => move(date, focusDay),
      schedule,
    });
    yearPicker.sync();
    attr(root, "data-calendar-ready", "");
    if (focusAfter) {
      focusAfter = false;
      cells.find((n) => n.dataset["calendarDate"] === focused && !n.disabled)?.focus();
    }
  };
  const move = (next: string, focusDay = true) => {
    focused = next;
    focusAfter = focusDay;
    render();
    schedule();
  };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const nav = event.target.closest<HTMLElement>('[data-slot="calendar-nav-button"]');
    if (nav && nav.closest(selector) === root) {
      if (disabled() || nav.hasAttribute("disabled")) return;
      const date = calendarDate(focused, options());
      move(date.add({ months: nav.dataset["lensoNext"] === "true" ? 1 : -1 }).toString(), false);
      return;
    }
    const day = event.target.closest<HTMLButtonElement>("button[data-calendar-date]");
    if (!day || day.closest(selector) !== root) return;
    if (day.disabled || disabled() || data()["lensoReadonly"] === "true") {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    focused = day.dataset["calendarDate"]!;
    // Reconcile rejected controlled activation on the next frame, without optimistic selection.
    schedule();
  };
  const focus = (event: FocusEvent) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.matches("button[data-calendar-date]") &&
      event.target.closest(selector) === root
    ) {
      focused = event.target.dataset["calendarDate"]!;
      schedule();
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      disabled() ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey ||
      !(event.target instanceof HTMLElement) ||
      !event.target.matches("button[data-calendar-date]") ||
      event.target.closest(selector) !== root
    )
      return;
    const opts = options(),
      date = calendarDate(event.target.dataset["calendarDate"]!, opts);
    let target = calendarTarget(
      date,
      event.key,
      event.shiftKey,
      opts,
      data()["lensoDirection"] ?? getComputedStyle(root).direction,
    );
    if (!target) return;
    event.preventDefault();
    const model = calendarMonth(opts);
    if (target.compare(model.min) < 0) target = model.min;
    if (target.compare(model.max) > 0) target = model.max;
    const step = target.compare(date) < 0 ? -1 : 1;
    for (let count = 0; count < 366 && opts.unavailable.includes(target.toString()); count++) {
      const next = target.add({ days: step });
      if (next.compare(model.min) < 0 || next.compare(model.max) > 0) return;
      target = next;
    }
    move(target.toString());
  };
  const observer = new MutationObserver(render);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-focused",
      "data-lenso-placeholder",
      "data-lenso-today",
      "data-lenso-locale",
      "data-lenso-calendar",
      "data-lenso-first-day",
      "data-lenso-weekday-style",
      "data-lenso-selection-mode",
      "data-lenso-min",
      "data-lenso-max",
      "data-lenso-unavailable",
      "data-lenso-disabled",
      "data-lenso-readonly",
      "data-lenso-open",
      "data-lenso-visible-years",
    ],
  });
  root.addEventListener("click", click, true);
  root.addEventListener("focusin", focus);
  root.addEventListener("keydown", keydown);
  render();
  return {
    sync: render,
    end() {
      if (ended) return;
      ended = true;
      observer.disconnect();
      yearPicker?.end();
      view.cancelAnimationFrame(frame);
      root.removeEventListener("click", click, true);
      root.removeEventListener("focusin", focus);
      root.removeEventListener("keydown", keydown);
      for (const n of new Set([...attrs.keys(), ...texts.keys()])) restore(n);
      if (root.hasAttribute("data-calendar-ready")) root.removeAttribute("data-calendar-ready");
      owners.delete(root);
    },
  };
}
export function updateCalendar(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.closest<HTMLElement>(selector);
  if (!root) return;
  const old = owners.get(root);
  if (old) old.sync();
  else {
    const owner = create(root);
    if (owner) owners.set(root, owner);
  }
}
export function endCalendar(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
