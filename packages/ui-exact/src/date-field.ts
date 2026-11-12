import { IncompleteDate } from "./date-incomplete.js";
import { dateNumber } from "./date-field-value.js";
import { segmentedModel, type EditablePart } from "./segmented-field-model.js";
const selector = '[data-slot="date-input-group"]';
const owners = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function create(root: HTMLElement) {
  const layout = root.querySelector<HTMLInputElement>('[data-slot="date-field-layout"]'),
    request = root.querySelector<HTMLInputElement>('[data-slot="date-field-change"]'),
    proxy = root.querySelector<HTMLInputElement>('[data-slot="date-field-proxy"]');
  if (!layout || !request || !proxy) return;
  const view = root.ownerDocument.defaultView!;
  let ended = false,
    frame = 0,
    key = "",
    canonical = "",
    pending: string | undefined,
    draft: IncompleteDate,
    touched = false;
  let model = segmentedModel(root.dataset, root.dataset["lensoValue"] ?? "");
  const fields = () =>
    model.segments.filter((p) => p.type !== "literal").map((p) => p.type as EditablePart);
  const attrs = new Map<Element, Map<string, string | null>>(),
    styles = new Map<HTMLElement, Map<string, [string, string]>>(),
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
  const style = (n: HTMLElement, k: string, v: string) => {
    let m = styles.get(n);
    if (!m) styles.set(n, (m = new Map()));
    if (!m.has(k)) m.set(k, [n.style.getPropertyValue(k), n.style.getPropertyPriority(k)]);
    if (n.style.getPropertyValue(k) !== v) n.style.setProperty(k, v);
  };
  const restore = (n: Element) => {
    for (const [k, v] of attrs.get(n) ?? []) {
      if (v === null) n.removeAttribute(k);
      else n.setAttribute(k, v);
    }
    attrs.delete(n);
    if (n instanceof HTMLElement) {
      for (const [k, [v, p]] of styles.get(n) ?? []) {
        if (v) n.style.setProperty(k, v, p);
        else n.style.removeProperty(k);
      }
      styles.delete(n);
      if (texts.has(n)) {
        n.textContent = texts.get(n)!;
        texts.delete(n);
      }
    }
  };
  const data = () => root.dataset,
    disabled = () => data()["lensoDisabled"] === "true",
    readonly = () => data()["lensoReadonly"] === "true";
  const inputs = () =>
    [...root.querySelectorAll<HTMLInputElement>("input[data-date-segment]")].filter(
      (n) => n.closest(selector) === root,
    );
  const ordered = () =>
    model.segments.flatMap((p) => {
      const n = inputs().find((n) => n.dataset["lensoDatePart"] === p.type);
      return n ? [n] : [];
    });
  const emit = (n: HTMLInputElement, value: string) => {
    n.value = value;
    n.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const reset = () => {
    model = segmentedModel(data(), canonical);
    draft = new IncompleteDate(
      model.date.calendar,
      model.hourCycle,
      canonical ? model.date : undefined,
    );
  };
  const focus = (index: number) => {
    const n = ordered()[index];
    if (n && !disabled()) {
      n.focus();
      n.select();
    }
  };
  const render = () => {
    if (ended) return;
    const value = data()["lensoValue"] ?? "",
      next = [
        value,
        data()["lensoLocale"],
        data()["lensoCalendar"],
        data()["lensoPlaceholder"],
        data()["lensoTime"],
        data()["lensoHourCycle"],
        data()["lensoGranularity"],
      ].join("|");
    if (next !== key) {
      const acknowledged = pending !== undefined && value === pending;
      canonical = value;
      key = next;
      if (!acknowledged || value !== "") reset();
      pending = undefined;
    }
    model.date = draft.toValue(model.date) as typeof model.date;
    const display = segmentedModel(data(), model.serialize(model.date));
    model = { ...display, date: model.date };
    const declared = [...root.querySelectorAll<HTMLElement>("[data-lenso-date-part]")]
      .map((n) => n.dataset["lensoDatePart"])
      .join("|");
    if (declared !== model.layout) {
      emit(layout, model.layout);
      return;
    }
    const malformed = draft.isComplete(fields()) && !draft.validate(model.date, fields());
    const invalid =
      data()["lensoInvalid"] === "true" ||
      model.invalid(canonical, data()["lensoMin"] ?? "", data()["lensoMax"] ?? "") ||
      malformed ||
      (touched && !readonly() && data()["lensoRequired"] === "true" && !canonical);
    attr(root, "data-date-invalid", invalid ? "" : null);
    for (const segment of model.segments) {
      const n = [...root.querySelectorAll<HTMLElement>("[data-lenso-date-part]")].find(
        (n) => n.dataset["lensoDatePart"] === segment.key,
      );
      if (!n) continue;
      if (n instanceof HTMLInputElement) {
        const type = segment.type as EditablePart;
        const limits = draft.getSegmentLimits(type)!;
        const filled = draft[type] !== null;
        const text = filled
          ? type === "era"
            ? segment.text
            : model.segmentNumber(type, limits.value!)
          : "";
        if (n.value !== text) n.value = text;
        const placeholder =
          segment.type === "year"
            ? "yyyy"
            : segment.type === "month"
              ? "mm"
              : segment.type === "day"
                ? "dd"
                : segment.type === "hour"
                  ? "hh"
                  : segment.type === "minute"
                    ? "mm"
                    : segment.type === "second"
                      ? "ss"
                      : segment.label;
        attr(n, "placeholder", placeholder);
        attr(n, "readonly", readonly() ? "" : null);
        attr(n, "inputmode", ["era", "dayPeriod"].includes(segment.type) ? "text" : "numeric");
        attr(n, "aria-label", segment.label);
        attr(n, "aria-valuemin", String(limits.minValue));
        attr(n, "aria-valuemax", String(limits.maxValue));
        attr(n, "aria-valuenow", filled ? String(limits.value) : null);
        attr(n, "aria-valuetext", filled ? text : placeholder);
        attr(n, "aria-invalid", String(invalid));
        style(n, "width", `${Math.max(segment.text.length, placeholder.length)}ch`);
      } else {
        if (!texts.has(n)) texts.set(n, n.textContent ?? "");
        if (n.textContent !== segment.text) n.textContent = segment.text;
      }
    }
    const form = data()["lensoForm"] ?? "";
    attr(proxy, "form", form || null);
    proxy.value = canonical;
    proxy.setCustomValidity(
      invalid && canonical
        ? data()["lensoTime"] === "true"
          ? "Choose a time within the allowed range."
          : "Choose a date within the allowed range."
        : "",
    );
    const visibleError = root.ownerDocument.getElementById(`${root.id.slice(0, -6)}-error`);
    const customError = data()["lensoError"] ?? "";
    if (visibleError && customError) texts.delete(visibleError);
    if (visibleError && !customError) {
      if (!texts.has(visibleError)) texts.set(visibleError, visibleError.textContent ?? "");
      const message = touched && invalid ? proxy.validationMessage : "";
      if (visibleError.textContent !== message) visibleError.textContent = message;
    }
    const status = root.querySelector<HTMLElement>('[data-slot="date-field-validation"]');
    if (status) {
      if (!texts.has(status)) texts.set(status, status.textContent ?? "");
      const message = !visibleError && touched && invalid ? proxy.validationMessage : "";
      if (status.textContent !== message) status.textContent = message;
    }
    for (const n of new Set([...attrs.keys(), ...styles.keys(), ...texts.keys()]))
      if (n !== root && n !== visibleError && !root.contains(n)) restore(n);
    attr(root, "data-date-ready", "");
  };
  const reconcile = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = 0;
      if (ended) return;
      if (pending !== undefined && (data()["lensoValue"] ?? "") !== pending) {
        canonical = data()["lensoValue"] ?? "";
        reset();
        pending = undefined;
      }
      render();
    });
  };
  const propose = () => {
    model.date = draft.toValue(model.date) as typeof model.date;
    const complete = draft.isComplete(fields());
    if (complete && !draft.validate(model.date, fields())) {
      render();
      return;
    }
    const next = complete ? model.serialize(model.date) : "";
    pending = next;
    if (next !== canonical) emit(request, next);
    else pending = undefined;
    reconcile();
    render();
  };
  const target = (event: Event) =>
    event.target instanceof HTMLInputElement && event.target.hasAttribute("data-date-segment")
      ? event.target
      : undefined;
  const edit = (event: Event) => {
    const n = target(event);
    if (!n) return;
    event.stopImmediatePropagation();
    if (disabled() || readonly()) {
      render();
      return;
    }
    const part = n.dataset["lensoDatePart"] as EditablePart;
    if (n.value === "") {
      draft = draft.clear(part);
      propose();
      return;
    }
    const number =
      part === "dayPeriod"
        ? model.periods.findIndex((period) =>
            period
              .toLocaleLowerCase(data()["lensoLocale"])
              .startsWith(n.value.toLocaleLowerCase(data()["lensoLocale"])),
          )
        : dateNumber(n.value, data()["lensoLocale"] ?? "en-US");
    if (number === undefined || number < 0) {
      render();
      return;
    }
    draft = draft.set(
      part,
      part === "era"
        ? model.date.calendar.getEras()[
            Math.max(0, Math.min(model.date.calendar.getEras().length - 1, number))
          ]!
        : number,
      model.date,
    );
    propose();
    if (part !== "dayPeriod" && number * 10 > draft.getSegmentLimits(part)!.maxValue)
      focus(ordered().indexOf(n) + 1);
  };
  const keydown = (event: KeyboardEvent) => {
    const n = target(event);
    if (!n || disabled() || event.isComposing || event.altKey || event.metaKey || event.ctrlKey)
      return;
    const part = n.dataset["lensoDatePart"] as EditablePart;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      focus(
        ordered().indexOf(n) +
          (event.key === "ArrowRight" ? 1 : -1) * (data()["lensoDirection"] === "rtl" ? -1 : 1),
      );
      return;
    }
    if (readonly()) return;
    if (["Delete", "Backspace"].includes(event.key)) {
      event.preventDefault();
      if (draft[part] === null && event.key === "Backspace") focus(ordered().indexOf(n) - 1);
      else {
        draft = draft.clear(part);
        propose();
      }
      return;
    }
    const delta = {
      ArrowUp: 1,
      ArrowDown: -1,
      PageUp: { year: 5, month: 2, day: 7, era: 1, hour: 2, minute: 15, second: 15, dayPeriod: 1 }[
        part
      ],
      PageDown: -{
        year: 5,
        month: 2,
        day: 7,
        era: 1,
        hour: 2,
        minute: 15,
        second: 15,
        dayPeriod: 1,
      }[part],
    }[event.key];
    if (delta !== undefined || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const limits = draft.getSegmentLimits(part)!;
      const placeholder = segmentedModel(data(), "").date;
      draft =
        event.key === "Home"
          ? draft.set(
              part,
              part === "era" ? model.date.calendar.getEras()[limits.minValue]! : limits.minValue,
              placeholder,
            )
          : event.key === "End"
            ? draft.set(
                part,
                part === "era" ? model.date.calendar.getEras()[limits.maxValue]! : limits.maxValue,
                placeholder,
              )
            : draft.cycle(part, delta!, placeholder, fields());
      propose();
    }
  };
  const focused = (event: FocusEvent) => {
    if (event.target === proxy) {
      focus(0);
      return;
    }
    const n = target(event);
    if (n) n.select();
  };
  const blur = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
    touched = true;
    if (
      !disabled() &&
      !readonly() &&
      draft.isComplete(fields()) &&
      !draft.validate(model.date, fields())
    ) {
      draft = new IncompleteDate(model.date.calendar, model.hourCycle, draft.toValue(model.date));
      propose();
    }
    render();
  };
  const pointer = (event: PointerEvent) => {
    if (
      !disabled() &&
      event.target instanceof Element &&
      !event.target.closest("input,button,a[href],[tabindex]")
    )
      focus(0);
  };
  const invalid = (event: Event) => {
    event.preventDefault();
    touched = true;
    render();
    focus(0);
  };
  const observer = new MutationObserver(render);
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-locale",
      "data-lenso-calendar",
      "data-lenso-placeholder",
      "data-lenso-min",
      "data-lenso-max",
      "data-lenso-readonly",
      "data-lenso-required",
      "data-lenso-invalid",
      "data-lenso-form",
      "data-lenso-disabled",
      "data-lenso-error",
      "data-lenso-direction",
      "data-lenso-time",
      "data-lenso-hour-cycle",
      "data-lenso-granularity",
    ],
  });
  root.addEventListener("input", edit, true);
  root.addEventListener("keydown", keydown);
  root.addEventListener("focusin", focused);
  root.addEventListener("focusout", blur);
  root.addEventListener("pointerdown", pointer);
  proxy.addEventListener("invalid", invalid);
  reset();
  render();
  return {
    sync: render,
    end() {
      if (ended) return;
      ended = true;
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      root.removeEventListener("input", edit, true);
      root.removeEventListener("keydown", keydown);
      root.removeEventListener("focusin", focused);
      root.removeEventListener("focusout", blur);
      root.removeEventListener("pointerdown", pointer);
      proxy.removeEventListener("invalid", invalid);
      proxy.setCustomValidity("");
      for (const n of new Set([...attrs.keys(), ...styles.keys(), ...texts.keys()])) restore(n);
      owners.delete(root);
    },
  };
}
export function updateDateField(node: HTMLElement | SVGElement) {
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
export function endDateField(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) owners.get(node)?.end();
}
