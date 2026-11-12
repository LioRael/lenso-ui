import { calendarYears } from "./calendar-years.js";
import type { CalendarOptions } from "./calendar-value.js";
interface CalendarYearHost {
  options(): CalendarOptions;
  move(date: string, focusDay: boolean): void;
  schedule(): void;
}
export function createCalendarYearPicker(root: HTMLElement, host: CalendarYearHost) {
  const view = root.ownerDocument.defaultView!;
  let focusFrame = 0;
  let cache: { key: string; model: ReturnType<typeof calendarYears> } | undefined;
  let ended = false,
    wasOpen = false,
    active = "",
    returnFocus = false;
  const attrs = new Map<Element, Map<string, string | null>>(),
    texts = new Map<HTMLElement, string>(),
    styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const attr = (n: Element, k: string, v: string | null) => {
    let m = attrs.get(n);
    if (!m) attrs.set(n, (m = new Map()));
    if (!m.has(k)) m.set(k, n.getAttribute(k));
    if (n.getAttribute(k) !== v) {
      if (v === null) n.removeAttribute(k);
      else n.setAttribute(k, v);
    }
  };
  const text = (n: HTMLElement, v: string) => {
    if (!texts.has(n)) texts.set(n, n.textContent ?? "");
    if (n.textContent !== v) n.textContent = v;
  };
  const style = (n: HTMLElement, k: string, v: string) => {
    let m = styles.get(n);
    if (!m) styles.set(n, (m = new Map()));
    if (!m.has(k)) m.set(k, [n.style.getPropertyValue(k), n.style.getPropertyPriority(k)]);
    if (n.style.getPropertyValue(k) !== v) n.style.setProperty(k, v);
  };
  const releaseAttr = (n: Element, k: string) => {
    const m = attrs.get(n);
    if (!m?.has(k)) return;
    const v = m.get(k)!;
    if (v === null) n.removeAttribute(k);
    else n.setAttribute(k, v);
    m.delete(k);
    if (!m.size) attrs.delete(n);
  };
  const releaseStyle = (n: HTMLElement, k: string) => {
    const m = styles.get(n),
      v = m?.get(k);
    if (!v) return;
    if (v[0]) n.style.setProperty(k, ...v);
    else n.style.removeProperty(k);
    m!.delete(k);
    if (!m!.size) styles.delete(n);
  };
  const restore = (n: Element) => {
    for (const k of [...(attrs.get(n)?.keys() ?? [])]) releaseAttr(n, k);
    if (n instanceof HTMLElement) {
      for (const k of [...(styles.get(n)?.keys() ?? [])]) releaseStyle(n, k);
      if (texts.has(n)) {
        n.textContent = texts.get(n)!;
        texts.delete(n);
      }
    }
  };
  const find = () => ({
    grid: root.querySelector<HTMLElement>('[data-slot="calendar-year-picker-grid"]'),
    trigger: root.querySelector<HTMLButtonElement>('[data-slot="calendar-year-picker-trigger"]'),
    request: root.querySelector<HTMLInputElement>('[data-slot="calendar-year-layout"]'),
    openRequest: root.querySelector<HTMLInputElement>('[data-slot="calendar-year-open-request"]'),
    days: root.querySelector<HTMLElement>('[data-slot="calendar-grid"]'),
  });
  const disabled = () => root.dataset["lensoDisabled"] === "true";
  const rows = () => [...root.querySelectorAll<HTMLButtonElement>("button[data-lenso-year-date]")];
  const focus = (id: string) => {
    const n = rows().find((n) => n.dataset["lensoYearDate"] === id && !n.disabled);
    if (n) {
      n.focus();
      n.scrollIntoView({ block: "nearest" });
    }
  };
  const close = () => {
    const { openRequest } = find();
    if (!openRequest) return;
    returnFocus = true;
    openRequest.value = "false";
    openRequest.dispatchEvent(new view.Event("input", { bubbles: true }));
    host.schedule();
  };
  const sync = () => {
    if (ended) return;
    const { grid, trigger, request, days } = find();
    for (const n of new Set([...attrs.keys(), ...styles.keys(), ...texts.keys()]))
      if (!root.contains(n)) restore(n);
    if (!grid || !trigger || !request || !days) {
      for (const n of new Set([...attrs.keys(), ...styles.keys(), ...texts.keys()])) restore(n);
      wasOpen = false;
      return;
    }
    const open = grid.dataset["lensoOpen"] === "true";
    const opts = host.options(),
      count = Number(grid.dataset["lensoVisibleYears"] ?? 0),
      key = JSON.stringify([opts, count]);
    if (!cache || cache.key !== key) cache = { key, model: calendarYears(opts, count) };
    const model = cache.model;
    attr(grid, "aria-label", model.label);
    attr(grid, "inert", !open || disabled() ? "" : null);
    attr(
      trigger,
      "aria-label",
      `${root.querySelector('[data-slot="calendar-heading"]')?.textContent ?? ""}, ${model.label}`,
    );
    attr(trigger, "disabled", disabled() ? "" : null);
    style(grid, "top", `${days.offsetTop}px`);
    style(grid, "height", `${days.offsetHeight}px`);
    for (const node of root.querySelectorAll<HTMLElement>('[data-slot="calendar-nav-button"]')) {
      if (open) {
        style(node, "visibility", "hidden");
        style(node, "pointer-events", "none");
        attr(node, "aria-hidden", "true");
        attr(node, "tabindex", "-1");
      } else {
        releaseStyle(node, "visibility");
        releaseStyle(node, "pointer-events");
        releaseAttr(node, "aria-hidden");
        releaseAttr(node, "tabindex");
      }
    }
    if (open) {
      style(days, "visibility", "hidden");
      style(days, "pointer-events", "none");
      style(days, "opacity", "0");
      attr(days, "inert", "");
      attr(days, "aria-hidden", "true");
    } else {
      releaseStyle(days, "visibility");
      releaseStyle(days, "pointer-events");
      releaseStyle(days, "opacity");
      releaseAttr(days, "inert");
      releaseAttr(days, "aria-hidden");
    }
    const justOpened = open && !wasOpen;
    wasOpen = open;
    if (justOpened || !model.items.some((i) => i.id === active))
      active = model.items[model.selected]?.id ?? "";
    const cells = rows();
    if (cells.map((n) => n.dataset["lensoYearDate"]).join("|") !== model.layout) {
      request.value = model.layout;
      request.dispatchEvent(new view.Event("input", { bubbles: true }));
      if (justOpened) wasOpen = false;
      return;
    }
    for (const node of cells) {
      const item = model.items.find((i) => i.id === node.dataset["lensoYearDate"]);
      if (!item) continue;
      attr(node, "disabled", !open || disabled() ? "" : null);
      attr(node, "aria-label", item.label);
      attr(node, "aria-pressed", String(item.selected));
      attr(node, "data-lenso-selected", String(item.selected));
      attr(node, "aria-current", item.current ? "true" : null);
      attr(node, "tabindex", open && !disabled() && item.id === active ? "0" : "-1");
      const label = node.querySelector<HTMLElement>('[data-slot="calendar-year-label"]');
      if (label) text(label, item.label);
    }
    if (justOpened && !disabled()) {
      view.cancelAnimationFrame(focusFrame);
      focusFrame = view.requestAnimationFrame(() => {
        focusFrame = 0;
        const { grid } = find();
        if (grid?.dataset["lensoOpen"] === "true" && !disabled()) focus(active);
      });
    }
    if (!open && returnFocus) {
      returnFocus = false;
      view.cancelAnimationFrame(focusFrame);
      focusFrame = view.requestAnimationFrame(() => {
        focusFrame = 0;
        const { grid, trigger } = find();
        if (grid?.dataset["lensoOpen"] !== "true" && !disabled()) trigger?.focus();
      });
    }
  };
  const click = (event: MouseEvent) => {
    if (!(event.target instanceof Element)) return;
    const n = event.target.closest<HTMLButtonElement>("button[data-lenso-year-date]");
    if (!n || n.closest('[data-slot="calendar"]') !== root) return;
    const { grid } = find();
    if (!grid || grid.dataset["lensoOpen"] !== "true" || disabled() || n.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    active = n.dataset["lensoYearDate"]!;
    host.move(active, false);
    close();
  };
  const focused = (event: FocusEvent) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.matches("button[data-lenso-year-date]") &&
      event.target.closest('[data-slot="calendar"]') === root
    ) {
      active = event.target.dataset["lensoYearDate"]!;
      host.schedule();
    }
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      !(event.target instanceof Element) ||
      event.target.closest('[data-slot="calendar"]') !== root
    )
      return;
    const { grid, trigger } = find();
    if (!grid || grid.dataset["lensoOpen"] !== "true" || disabled()) return;
    if (
      event.key === "Escape" &&
      (grid.contains(event.target) || trigger?.contains(event.target))
    ) {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (!grid.contains(event.target) || event.altKey || event.metaKey || event.ctrlKey) return;
    const cells = rows(),
      index = cells.findIndex((n) => n.dataset["lensoYearDate"] === active),
      direction = getComputedStyle(root).direction;
    const step = {
      ArrowRight: direction === "rtl" ? -1 : 1,
      ArrowLeft: direction === "rtl" ? 1 : -1,
      ArrowDown: 3,
      ArrowUp: -3,
    }[event.key];
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? cells.length - 1
          : step !== undefined
            ? Math.max(0, Math.min(cells.length - 1, index + step))
            : undefined;
    if (next === undefined) return;
    event.preventDefault();
    active = cells[next]?.dataset["lensoYearDate"] ?? active;
    focus(active);
    host.schedule();
  };
  root.addEventListener("click", click, true);
  root.addEventListener("focusin", focused);
  root.addEventListener("keydown", keydown);
  return {
    sync,
    end() {
      if (ended) return;
      ended = true;
      view.cancelAnimationFrame(focusFrame);
      root.removeEventListener("click", click, true);
      root.removeEventListener("focusin", focused);
      root.removeEventListener("keydown", keydown);
      for (const n of new Set([...attrs.keys(), ...styles.keys(), ...texts.keys()])) restore(n);
    },
  };
}
