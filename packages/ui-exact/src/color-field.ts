import {
  colorFieldModel,
  colorFieldFormValue,
  formatColorField,
  parseColorField,
  stepColorField,
} from "./color-field-value.js";
import { observeFocus } from "./search-field.js";
const controllers = new WeakMap<HTMLElement, { paint(): void; end(): void }>();
export function updateColorField(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[data-slot="color-field"]')
    ? node
    : node.closest<HTMLElement>('[data-slot="color-field"]');
  if (!root) return;
  const existing = controllers.get(root);
  if (existing) {
    existing.paint();
    return;
  }
  const input = root.querySelector<HTMLInputElement>('[data-lenso-kind="color-field-input"]');
  const bridge = (kind: string) =>
    root.querySelector<HTMLInputElement>(`[data-slot="color-field-${kind}"]`);
  if (!input || !bridge("change") || !bridge("commit") || !bridge("form")) return;
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const attributes = new Map<string, string | null>();
  const set = (name: string, value: string | null) => {
    if (!attributes.has(name)) attributes.set(name, input.getAttribute(name));
    if (value === null) input.removeAttribute(name);
    else input.setAttribute(name, value);
  };
  const originalValue = input.value,
    originalValidity = input.validity.customError ? input.validationMessage : "";
  let channel = "",
    space = "",
    locale = "",
    previous = root.dataset["lensoValue"] ?? "",
    dirty = false,
    composing = false,
    draft = input.value,
    frame = 0,
    epoch = 0,
    disposed = false;
  let pending: { from: string; target: string } | undefined;
  let lastCommit = previous;
  let configuration = "";
  let selection:
    | {
        start: number | null;
        end: number | null;
        direction: "forward" | "backward" | "none" | null;
      }
    | undefined;
  const canonical = () => root.dataset["lensoValue"] ?? "";
  const value = () => pending?.target ?? canonical();
  const stopped = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const text = (v: string) => formatColorField(v, channel, space, locale);
  const send = (kind: string, next: string) => {
    const target = bridge(kind);
    if (!target || disposed) return;
    target.value = next;
    target.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const paint = () => {
    if (disposed) return;
    channel = root.dataset["lensoChannel"] ?? "hex";
    space = root.dataset["lensoColorSpace"] ?? "rgb";
    locale = root.dataset["lensoLocale"] || "en-US";
    const nextConfiguration = JSON.stringify([channel, space, locale]);
    if (configuration && configuration !== nextConfiguration) {
      dirty = false;
      pending = undefined;
      selection = undefined;
      epoch++;
      view.cancelAnimationFrame(frame);
    }
    configuration = nextConfiguration;
    const model = colorFieldModel(value(), channel, space);
    set("readonly", root.dataset["lensoReadonly"] === "true" ? "" : null);
    set("inputmode", model ? "decimal" : "text");
    set("role", model ? "spinbutton" : null);
    set("aria-valuemin", model ? String(model.range.minValue / model.multiplier) : null);
    set("aria-valuemax", model ? String(model.range.maxValue / model.multiplier) : null);
    set(
      "aria-valuenow",
      model && value() ? String(model.color.getChannelValue(model.key) / model.multiplier) : null,
    );
    set("aria-valuetext", model && value() ? text(value()) : null);
    const previousDraft = draft;
    if (!dirty || stopped()) {
      draft = text(value());
      dirty = false;
    }
    if (input.value !== draft) {
      input.value = draft;
      if (selection && draft === previousDraft && doc.activeElement === input)
        input.setSelectionRange(selection.start, selection.end, selection.direction ?? undefined);
    }
    input.setCustomValidity(
      dirty && parseColorField(draft, value(), channel, space, locale) === undefined
        ? "Enter a valid color value."
        : "",
    );
    bridge("form")!.value = colorFieldFormValue(value(), channel, space, locale);
  };
  const propose = (next: string) => {
    if (stopped() || next === value()) return;
    pending = { from: canonical(), target: next };
    const current = ++epoch;
    send("change", next);
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(() => {
        if (!disposed && current === epoch) {
          if (canonical() !== next) dirty = false;
          pending = undefined;
          paint();
        }
      });
    });
  };
  const saveSelection = () => {
    selection = {
      start: input.selectionStart,
      end: input.selectionEnd,
      direction: input.selectionDirection,
    };
  };
  const selectionChanged = () => {
    if (input.value === draft) saveSelection();
  };
  const edited = (event: Event) => {
    if (event.target !== input) return;
    event.stopImmediatePropagation();
    if (stopped()) {
      dirty = false;
      paint();
      return;
    }
    if (event instanceof view.InputEvent && event.isComposing) {
      draft = input.value;
      dirty = true;
      saveSelection();
      return;
    }
    readInput();
  };
  const readInput = () => {
    draft = input.value;
    dirty = true;
    saveSelection();
    if (composing) return;
    const next = parseColorField(draft, value(), channel, space, locale);
    if (next !== undefined) propose(next);
    paint();
  };
  const commit = () => {
    if (stopped() || composing) return;
    if (!dirty) {
      paint();
      return;
    }
    const next = parseColorField(draft, value(), channel, space, locale);
    const wasDirty = dirty;
    dirty = false;
    if (next !== undefined) {
      propose(next);
      if (next !== lastCommit || wasDirty) {
        send("commit", next);
        lastCommit = next;
      }
    }
    paint();
  };
  const changed = (event: Event) => {
    if (event.target === input) {
      event.stopImmediatePropagation();
      commit();
    }
  };
  const key = (event: KeyboardEvent) => {
    if (
      event.defaultPrevented ||
      event.isComposing ||
      composing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      stopped()
    )
      return;
    if (event.key === "Escape" && dirty) {
      event.preventDefault();
      event.stopImmediatePropagation();
      dirty = false;
      paint();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      event.stopImmediatePropagation();
      commit();
      return;
    }
    if (!["ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const parsed = dirty ? parseColorField(draft, value(), channel, space, locale) : value();
    const next = stepColorField(parsed ?? value(), channel, space, event.key);
    dirty = false;
    if (next !== value()) {
      propose(next);
      send("commit", next);
      lastCommit = next;
    }
    paint();
  };
  const start = () => {
    composing = true;
  };
  const end = () => {
    composing = false;
    queueMicrotask(() => {
      if (!disposed) readInput();
    });
  };
  const focus = (event: Event) => {
    if (
      event.defaultPrevented ||
      !(event.target instanceof Element) ||
      event.target.closest("input,button,a[href],[tabindex],[contenteditable]")
    )
      return;
    if (!input.disabled) input.focus();
  };
  const initial = previous;
  const form = input.form;
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      dirty = false;
      pending = undefined;
      epoch++;
      view.cancelAnimationFrame(frame);
      if (!stopped()) propose(initial);
      paint();
      lastCommit = value();
    });
  form?.addEventListener("reset", reset);
  const observe = new MutationObserver(() => {
    if (canonical() !== previous) {
      if (!pending || canonical() !== pending.target) dirty = false;
      previous = canonical();
      if (pending?.target === previous) pending = undefined;
    }
    paint();
  });
  observe.observe(root, {
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-channel",
      "data-lenso-color-space",
      "data-lenso-locale",
      "data-lenso-disabled",
      "data-lenso-readonly",
    ],
  });
  const stopFocus = observeFocus(doc);
  input.addEventListener("select", selectionChanged);
  input.addEventListener("selectionchange", selectionChanged);
  input.addEventListener("input", edited, true);
  input.addEventListener("change", changed, true);
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", key, true);
  input.addEventListener("compositionstart", start);
  input.addEventListener("compositionend", end);
  root.addEventListener("pointerdown", focus);
  controllers.set(root, {
    paint,
    end() {
      disposed = true;
      observe.disconnect();
      form?.removeEventListener("reset", reset);
      view.cancelAnimationFrame(frame);
      stopFocus();
      input.removeEventListener("select", selectionChanged);
      input.removeEventListener("selectionchange", selectionChanged);
      input.removeEventListener("input", edited, true);
      input.removeEventListener("change", changed, true);
      input.removeEventListener("blur", commit);
      input.removeEventListener("keydown", key, true);
      input.removeEventListener("compositionstart", start);
      input.removeEventListener("compositionend", end);
      root.removeEventListener("pointerdown", focus);
      input.value = originalValue;
      input.setCustomValidity(originalValidity);
      for (const [name, original] of attributes) {
        if (original === null) input.removeAttribute(name);
        else input.setAttribute(name, original);
      }
      controllers.delete(root);
    },
  });
  paint();
}
export function endColorField(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) controllers.get(node)?.end();
}
