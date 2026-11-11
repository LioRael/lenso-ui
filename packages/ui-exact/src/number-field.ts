// Native-element adaptation of Base UI 1.9.0 NumberField interaction contracts.
// Copyright (c) 2019 Material-UI SAS; Floating UI contributors. MIT; see NOTICES.md.
import {
  parseNumber,
  getFormatParts,
  isNumeralChar,
  BASE_NON_NUMERIC_SYMBOLS,
  PLUS_SIGNS_WITH_ASCII,
  MINUS_SIGNS_WITH_ASCII,
  FORMAT_CONTROL_DETECT_RE,
} from "./number-parse.js";
import { toValidatedNumber } from "./number-value.js";
import { getFormatter } from "./number-format.js";
import { observeFocus } from "./search-field.js";

const roots = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
const rootSelector = '[data-slot="number-field"],[data-slot="stepper"]';
function createNumberField(root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>('[data-slot="number-input"]');
  if (!input) return;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-slot="number-button"]')];
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const initial = root.dataset["lensoValue"] ?? "";
  const originalType = input.type;
  const originalValidity = input.validationMessage;
  const attributes = new Map<string, string | null>();
  const set = (name: string, value: string | null) => {
    if (!attributes.has(name)) attributes.set(name, input.getAttribute(name));
    if (value === null) input.removeAttribute(name);
    else input.setAttribute(name, value);
  };
  let disposed = false,
    dirty = false,
    composing = false,
    draft = input.value;
  let frame = 0,
    epoch = 0;
  let pending: { from: string; target: string } | undefined;
  let holding:
    | {
        id: number;
        button: HTMLButtonElement;
        x: number;
        y: number;
        touch: boolean;
        held: boolean;
        next: number | null;
      }
    | undefined;
  let holdTimer = 0,
    repeatTimer = 0,
    skipClick = false;
  let locale: string | undefined, options: Intl.NumberFormatOptions | undefined;
  const number = (name: string, fallback: number) => {
    const value = Number(root.dataset[name] ?? fallback);
    if (!Number.isFinite(value)) throw new RangeError(`NumberField ${name} must be finite`);
    return value;
  };
  const config = () => {
    locale = root.dataset["lensoLocale"] || undefined;
    const raw = root.dataset["lensoFormat"];
    options = raw ? JSON.parse(raw) : undefined;
    if (
      options !== undefined &&
      (!options || typeof options !== "object" || Array.isArray(options))
    )
      throw new TypeError("NumberField format must encode an Intl.NumberFormat options object");
    getFormatter(locale, options);
    if (number("lensoMin", Number.MIN_SAFE_INTEGER) > number("lensoMax", Number.MAX_SAFE_INTEGER))
      throw new RangeError("NumberField min must not exceed max");
  };
  config();
  const stopped = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const canonical = () => root.dataset["lensoValue"] ?? "";
  const decode = (text: string) => (text === "" ? null : Number(text));
  const value = () => decode(pending?.target ?? canonical());
  const format = (n: number | null) => (n === null ? "" : getFormatter(locale, options).format(n));
  const validate = (n: number | null, amount?: number, small = false, clamp = true) =>
    toValidatedNumber(
      n,
      amount,
      number("lensoMin", Number.MIN_SAFE_INTEGER),
      number("lensoMax", Number.MAX_SAFE_INTEGER),
      Math.max(0, number("lensoMin", Number.MIN_SAFE_INTEGER)),
      options,
      root.dataset["lensoSnap"] === "true",
      small,
      clamp,
    );
  const send = (slot: string, n: number | null) => {
    const bridge = root.querySelector<HTMLInputElement>(`[data-slot="${slot}"]`);
    if (!bridge || disposed || stopped()) return;
    Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")!.set!.call(
      bridge,
      n === null ? "" : String(n),
    );
    bridge.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const paint = () => {
    const n = decode(canonical());
    if (n !== null && !Number.isFinite(n))
      throw new RangeError("NumberField value must be finite or empty");
    if (input.type !== "text") input.type = "text";
    set("role", "spinbutton");
    set("aria-valuemin", String(number("lensoMin", Number.MIN_SAFE_INTEGER)));
    set("aria-valuemax", String(number("lensoMax", Number.MAX_SAFE_INTEGER)));
    set("aria-valuenow", n === null ? null : String(n));
    set("aria-valuetext", n === null ? null : format(n));
    set("aria-readonly", root.dataset["lensoReadonly"] === "true" ? "true" : null);
    const text = dirty ? draft : format(n);
    if (input.value !== text) input.value = text;
    input.setCustomValidity(
      dirty && draft.trim() !== "" && parseNumber(draft, locale, options) === null
        ? "Enter a number."
        : n !== null &&
            (n < number("lensoMin", Number.MIN_SAFE_INTEGER) ||
              n > number("lensoMax", Number.MAX_SAFE_INTEGER))
          ? "Enter a value within the allowed range."
          : "",
    );
  };
  const propose = (n: number | null) => {
    const next = n === null ? "" : String(n);
    pending = { from: canonical(), target: next };
    const at = ++epoch;
    send("number-change", n);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        if (!disposed && epoch === at) {
          pending = undefined;
          paint();
        }
      });
    });
  };
  const commit = (n: number | null) => send("number-commit", n);
  const allowed = (text: string) => {
    const symbols = new Set([
      ...BASE_NON_NUMERIC_SYMBOLS,
      ...PLUS_SIGNS_WITH_ASCII,
      ...MINUS_SIGNS_WITH_ASCII,
      "e",
      "E",
    ]);
    for (const part of getFormatParts(locale, options))
      if (part.type !== "integer" && part.type !== "fraction")
        for (const char of part.value) symbols.add(char);
    return [...text].every(
      (char) => isNumeralChar(char) || symbols.has(char) || FORMAT_CONTROL_DETECT_RE.test(char),
    );
  };
  const edited = (event: Event) => {
    if (event.target !== input) return;
    event.stopImmediatePropagation();
    if (stopped()) {
      paint();
      return;
    }
    const text = input.value;
    if (composing || (event instanceof InputEvent && event.isComposing)) {
      dirty = true;
      draft = text;
      return;
    }
    if (!allowed(text)) {
      input.value = draft;
      return;
    }
    dirty = true;
    draft = text;
    if (text.trim() === "") propose(null);
    else {
      const parsed = parseNumber(text, locale, options);
      if (parsed !== null)
        propose(validate(parsed, undefined, false, root.dataset["lensoOutOfRange"] !== "true"));
    }
    paint();
  };
  const finish = () => {
    if (!dirty || composing || stopped()) return;
    const parsed = draft.trim() === "" ? null : parseNumber(draft, locale, options);
    const next =
      parsed === null && draft.trim() !== ""
        ? decode(canonical())
        : validate(parsed, undefined, false, root.dataset["lensoOutOfRange"] !== "true");
    dirty = false;
    if (next !== value()) propose(next);
    commit(next);
    paint();
  };
  const step = (
    direction: number,
    event: { altKey?: boolean; shiftKey?: boolean },
    boundary?: number,
  ) => {
    if (stopped()) return null;
    const amount = number(
      event.altKey ? "lensoSmallStep" : event.shiftKey ? "lensoLargeStep" : "lensoStep",
      event.altKey ? 0.1 : event.shiftKey ? 10 : 1,
    );
    const current = dirty ? parseNumber(draft, locale, options) : value();
    const next =
      boundary ??
      validate(
        current === null ? 0 : current + direction * amount,
        current === null ? undefined : direction * amount,
        !!event.altKey,
      );
    dirty = false;
    if (next === value()) {
      paint();
      return null;
    }
    propose(next);
    paint();
    return { next };
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      event.target !== input ||
      event.isComposing ||
      event.keyCode === 229 ||
      event.ctrlKey ||
      event.metaKey ||
      stopped()
    )
      return;
    if (["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const boundary =
        event.key === "Home"
          ? number("lensoMin", Number.MIN_SAFE_INTEGER)
          : event.key === "End"
            ? number("lensoMax", Number.MAX_SAFE_INTEGER)
            : undefined;
      const changed = step(event.key === "ArrowDown" ? -1 : 1, event, boundary);
      if (changed) commit(changed.next);
    } else if (event.key === "Enter") {
      event.stopImmediatePropagation();
      finish();
    } else if (!event.altKey && event.key.length === 1 && !allowed(event.key))
      event.preventDefault();
  };
  const wheel = (event: WheelEvent) => {
    if (
      event.target !== input ||
      doc.activeElement !== input ||
      root.dataset["lensoWheel"] !== "true" ||
      stopped() ||
      event.deltaY === 0
    )
      return;
    event.preventDefault();
    const changed = step(event.deltaY < 0 ? 1 : -1, event);
    if (changed) commit(changed.next);
  };
  const buttonFor = (event: Event) =>
    event.target instanceof Element
      ? event.target.closest<HTMLButtonElement>('[data-slot="number-button"]')
      : null;
  const unavailable = (button: HTMLButtonElement) =>
    stopped() || button.disabled || button.getAttribute("aria-disabled") === "true";
  const clearHold = () => {
    clearTimeout(holdTimer);
    clearInterval(repeatTimer);
    holding = undefined;
  };
  const down = (event: PointerEvent) => {
    const button = buttonFor(event);
    if (!button || !buttons.includes(button) || event.button !== 0 || unavailable(button)) return;
    clearHold();
    skipClick = false;
    if (event.pointerType !== "touch") {
      event.preventDefault();
      input.focus({ preventScroll: true });
    }
    holding = {
      id: event.pointerId,
      button,
      x: event.clientX,
      y: event.clientY,
      touch: event.pointerType === "touch",
      held: false,
      next: null,
    };
    const tick = () => {
      if (!holding || unavailable(button)) return;
      holding.held = true;
      skipClick = true;
      const changed = step(Number(button.dataset["lensoDirection"]), event);
      if (changed) holding.next = changed.next;
    };
    holdTimer = view.setTimeout(() => {
      tick();
      repeatTimer = view.setInterval(tick, 60);
    }, 400);
  };
  const release = (event: PointerEvent) => {
    if (!holding || event.pointerId !== holding.id) return;
    const { held, next } = holding;
    clearHold();
    if (held && next !== null) commit(next);
  };
  const moved = (event: PointerEvent) => {
    if (
      holding?.touch &&
      event.pointerId === holding.id &&
      Math.hypot(event.clientX - holding.x, event.clientY - holding.y) > 8
    ) {
      clearHold();
      skipClick = true;
    }
  };
  const click = (event: MouseEvent) => {
    const button = buttonFor(event);
    if (!button || !buttons.includes(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (skipClick) {
      skipClick = false;
      return;
    }
    if (unavailable(button)) return;
    const changed = step(Number(button.dataset["lensoDirection"]), event);
    if (changed) commit(changed.next);
  };
  const blur = (event: FocusEvent) => {
    if (event.target === input) finish();
  };
  const change = (event: Event) => {
    if (event.target === input) {
      event.stopImmediatePropagation();
      finish();
    }
  };
  const compositionStart = () => {
    composing = true;
  };
  const compositionEnd = () => {
    composing = false;
    edited(new Event("input"));
  };
  const form = input.form;
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!event.defaultPrevented && !disposed && !stopped()) {
        dirty = false;
        propose(decode(initial));
        paint();
      }
    });
  const stopFocus = observeFocus(doc);
  input.addEventListener("input", edited, true);
  input.addEventListener("change", change, true);
  input.addEventListener("blur", blur);
  input.addEventListener("keydown", keydown, true);
  input.addEventListener("wheel", wheel, { passive: false });
  input.addEventListener("compositionstart", compositionStart);
  input.addEventListener("compositionend", compositionEnd);
  root.addEventListener("pointerdown", down, true);
  root.addEventListener("click", click, true);
  doc.addEventListener("pointerup", release, true);
  doc.addEventListener("pointercancel", release, true);
  doc.addEventListener("pointermove", moved, true);
  form?.addEventListener("reset", reset);
  return {
    sync() {
      config();
      if (pending && canonical() !== pending.from) pending = undefined;
      if (stopped()) clearHold();
      paint();
    },
    end() {
      disposed = true;
      cancelAnimationFrame(frame);
      clearHold();
      stopFocus();
      form?.removeEventListener("reset", reset);
      input.removeEventListener("input", edited, true);
      input.removeEventListener("change", change, true);
      input.removeEventListener("blur", blur);
      input.removeEventListener("keydown", keydown, true);
      input.removeEventListener("wheel", wheel);
      input.removeEventListener("compositionstart", compositionStart);
      input.removeEventListener("compositionend", compositionEnd);
      root.removeEventListener("pointerdown", down, true);
      root.removeEventListener("click", click, true);
      doc.removeEventListener("pointerup", release, true);
      doc.removeEventListener("pointercancel", release, true);
      doc.removeEventListener("pointermove", moved, true);
      input.type = originalType;
      input.setCustomValidity(originalValidity);
      for (const [name, value] of attributes) {
        if (value === null) input.removeAttribute(name);
        else input.setAttribute(name, value);
      }
    },
  };
}
export function updateNumberField(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(rootSelector) ? node : node.closest<HTMLElement>(rootSelector);
  if (
    !root ||
    !["number-field", "stepper", "number-field-input", "stepper-input"].includes(
      data["lensoKind"] ?? "",
    )
  )
    return;
  let controller = roots.get(root);
  if (!controller) {
    controller = createNumberField(root);
    if (controller) roots.set(root, controller);
  }
  controller?.sync();
}
export function endNumberField(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) {
    roots.get(node)?.end();
    roots.delete(node);
  }
}
