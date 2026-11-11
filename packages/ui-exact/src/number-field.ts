import { registerNumberScrub } from "./number-scrub.js";
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
  const owned = <T extends HTMLElement>(selector: string) =>
    [...root.querySelectorAll<T>(selector)].filter((node) => node.closest(rootSelector) === root);
  const input = owned<HTMLInputElement>('[data-slot="number-input"]')[0];
  if (!input) return;
  const buttons = () => owned<HTMLButtonElement>('[data-slot="number-button"]');
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const initial = root.dataset["lensoValue"] ?? "";
  const originalType = input.type;
  const originalValidity = input.validity.customError ? input.validationMessage : "";
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
    epoch = 0,
    compositionTimer = 0;
  let caret: { start: number; end: number; direction: "forward" | "backward" | "none" } | undefined;
  let pending: { from: string; target: string } | undefined;
  let previous = root.dataset["lensoValue"] ?? "";
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
    const raw = root.dataset[name];
    const value = raw === undefined || raw === "" ? fallback : Number(raw);
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
      number("lensoMin", Number.MIN_SAFE_INTEGER) === Number.MIN_SAFE_INTEGER
        ? 0
        : number("lensoMin", Number.MIN_SAFE_INTEGER),
      options,
      root.dataset["lensoSnap"] === "true",
      small,
      clamp,
    );
  const send = (slot: string, n: number | null) => {
    const bridge = owned<HTMLInputElement>(`[data-slot="${slot}"]`)[0];
    if (!bridge || disposed || stopped()) return;
    Object.getOwnPropertyDescriptor(view.HTMLInputElement.prototype, "value")!.set!.call(
      bridge,
      n === null ? "" : String(n),
    );
    bridge.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const paint = () => {
    if (disposed) return;
    const n = decode(canonical());
    if (n !== null && !Number.isFinite(n))
      throw new RangeError("NumberField value must be finite or empty");
    if (input.type !== "text") input.type = "text";
    set("role", "spinbutton");
    set("aria-valuemin", root.dataset["lensoMin"] || null);
    set("aria-valuemax", root.dataset["lensoMax"] || null);
    set("aria-valuenow", n === null ? null : String(n));
    set("aria-valuetext", n === null ? null : format(n));
    set("aria-readonly", root.dataset["lensoReadonly"] === "true" ? "true" : null);
    const text = dirty ? draft : format(n);
    if (!composing && input.value !== text) {
      const selection = caret;
      input.value = text;
      if (dirty && selection && doc.activeElement === input)
        input.setSelectionRange(selection.start, selection.end, selection.direction);
    }
    input.setCustomValidity(
      n === null && root.dataset["lensoRequired"] === "true" && input.value !== ""
        ? "Enter a value."
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
    if (disposed) return;
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
  const selectionChanged = () => {
    if (input.value === draft && input.selectionStart !== null && input.selectionEnd !== null)
      caret = {
        start: input.selectionStart,
        end: input.selectionEnd,
        direction: input.selectionDirection ?? "none",
      };
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
      selectionChanged();
      return;
    }
    if (!allowed(text)) {
      input.value = draft;
      return;
    }
    dirty = true;
    draft = text;
    selectionChanged();
    if (text.trim() === "") propose(null);
    else {
      const parsed = parseNumber(text, locale, options);
      if (parsed !== null)
        propose(validate(parsed, undefined, false, root.dataset["lensoOutOfRange"] !== "true"));
    }
    paint();
  };
  const pasted = (event: ClipboardEvent) => {
    if (stopped()) return;
    let text: string;
    try {
      text = event.clipboardData?.getData("text/plain") ?? "";
    } catch {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    const start = input.selectionStart ?? input.value.length,
      end = input.selectionEnd ?? start;
    const next = input.value.slice(0, start) + text + input.value.slice(end);
    const parsed = parseNumber(next, locale, options);
    if (parsed === null) return;
    dirty = true;
    draft = next;
    caret = { start: start + text.length, end: start + text.length, direction: "none" };
    input.value = next;
    input.setSelectionRange(caret.start, caret.end);
    propose(validate(parsed, undefined, false, root.dataset["lensoOutOfRange"] !== "true"));
    paint();
  };
  const finish = () => {
    if (!dirty || composing || stopped()) return;
    const parsed = draft.trim() === "" ? null : parseNumber(draft, locale, options);
    if (parsed === null && draft.trim() !== "") return;
    const next = validate(parsed, undefined, false, root.dataset["lensoOutOfRange"] !== "true");
    dirty = false;
    if (next !== value()) propose(next);
    commit(next);
    paint();
  };
  const stepAmount = (event: { altKey?: boolean; shiftKey?: boolean }) =>
    number(
      event.altKey ? "lensoSmallStep" : event.shiftKey ? "lensoLargeStep" : "lensoStep",
      event.altKey ? 0.1 : event.shiftKey ? 10 : 1,
    );
  const step = (
    direction: number,
    event: { altKey?: boolean; shiftKey?: boolean },
    boundary?: number,
    scrubAmount?: number,
  ) => {
    if (stopped()) return null;
    const amount = stepAmount(event);
    const current = dirty
      ? validate(
          parseNumber(draft, locale, options) ?? value(),
          undefined,
          false,
          root.dataset["lensoOutOfRange"] !== "true",
        )
      : value();
    const next =
      boundary ??
      validate(
        current === null ? 0 : current + (scrubAmount ?? direction * amount),
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
    if (
      (event.key === "Home" && !root.dataset["lensoMin"]) ||
      (event.key === "End" && !root.dataset["lensoMax"])
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
    if (!button || !buttons().includes(button) || event.button !== 0 || unavailable(button)) return;
    clearHold();
    skipClick = false;
    if (event.pointerType !== "touch" && event.pointerType !== "pen") {
      event.preventDefault();
      input.focus({ preventScroll: true });
    }
    holding = {
      id: event.pointerId,
      button,
      x: event.clientX,
      y: event.clientY,
      touch: event.pointerType === "touch" || event.pointerType === "pen",
      held: false,
      next: null,
    };
    const tick = () => {
      if (!holding || unavailable(button)) return;
      holding.held = true;
      skipClick = true;
      const changed = step(Number(button.dataset["lensoDirection"]), event);
      if (changed && holding) holding.next = changed.next;
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
    if (!button || !buttons().includes(button)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (skipClick && event.detail !== 0) {
      skipClick = false;
      return;
    }
    skipClick = false;
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
    clearTimeout(compositionTimer);
    composing = true;
  };
  const compositionEnd = (event: CompositionEvent) => {
    composing = false;
    edited(event);
    // Exact flushes held binding values in its composition-end task.
    compositionTimer = view.setTimeout(() => {
      if (!disposed && dirty && !composing) paint();
    }, 0);
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
  const scrub = registerNumberScrub(root, {
    blocked: () => disposed || stopped(),
    focus: () => input.focus({ preventScroll: true }),
    value,
    commit,
    increment(delta, event) {
      dirty = false;
      const raw = delta * stepAmount(event);
      return raw === 0 ? null : step(raw >= 0 ? 1 : -1, event, undefined, raw);
    },
  });
  const stopFocus = observeFocus(doc);
  input.addEventListener("paste", pasted, true);
  input.addEventListener("select", selectionChanged);
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
      if (canonical() !== previous) {
        if (!pending || canonical() !== pending.target) dirty = false;
        pending = undefined;
      }
      previous = canonical();
      if (stopped()) clearHold();
      scrub.sync();
      paint();
    },
    end() {
      disposed = true;
      scrub.end();
      cancelAnimationFrame(frame);
      clearTimeout(compositionTimer);
      clearHold();
      stopFocus();
      form?.removeEventListener("reset", reset);
      input.removeEventListener("paste", pasted, true);
      input.removeEventListener("select", selectionChanged);
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
  if (roots.has(node) && !["number-field", "stepper"].includes(data["lensoKind"] ?? ""))
    endNumberField(node);
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
  if (!(node instanceof HTMLElement)) return;
  const root = roots.has(node)
    ? node
    : node.matches('[data-slot="number-input"]')
      ? node.closest<HTMLElement>(rootSelector)
      : null;
  if (root) {
    roots.get(root)?.end();
    roots.delete(root);
  }
}
