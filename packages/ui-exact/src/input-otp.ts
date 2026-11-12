import { otpConfiguration, otpNormalize, otpReplace, otpRemove } from "./input-otp-value.js";
import { observeFocus } from "./search-field.js";
const selector = '[data-slot="input-otp"]';
const controllers = new WeakMap<HTMLElement, { sync(): void; end(): void }>();
function createOTP(root: HTMLElement) {
  const doc = root.ownerDocument,
    view = doc.defaultView!;
  const own = <T extends HTMLElement>(part: string) =>
    [...root.querySelectorAll<T>(`[data-slot="input-otp-${part}"]`)].filter(
      (n) => n.closest(selector) === root,
    );
  const slots = () =>
    own<HTMLInputElement>("slot").sort(
      (a, b) => Number(a.dataset["lensoIndex"]) - Number(b.dataset["lensoIndex"]),
    );
  const length = () => Number(root.dataset["lensoCount"]),
    validation = () => root.dataset["lensoMode"] ?? "numeric";
  otpConfiguration(length(), validation());
  if (slots().length !== length()) return;
  const indices = slots().map((n) => Number(n.dataset["lensoIndex"]));
  if (indices.some((n, i) => n !== i))
    throw new RangeError("InputOTP slots must have unique consecutive indices matching length");
  const canonical = () => root.dataset["lensoValue"] ?? "";
  const blocked = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const attrs = new Map<Element, Map<string, string | null>>();
  const attr = (node: Element, key: string, value: string | null) => {
    let values = attrs.get(node);
    if (!values) attrs.set(node, (values = new Map()));
    if (!values.has(key)) values.set(key, node.getAttribute(key));
    if (node.getAttribute(key) === value) return;
    if (value === null) node.removeAttribute(key);
    else node.setAttribute(key, value);
  };
  let disposed = false,
    active = 0,
    frame = 0,
    composing: HTMLInputElement | undefined,
    draft = "",
    beforeComposition = "",
    ignoreComposition = false,
    duplicate: string | undefined,
    timer = 0;
  let form: HTMLFormElement | null = null;
  let pending: { value: string; focus: number; complete: boolean } | undefined;
  const initialValidity = new Map<HTMLInputElement, string>();
  const emit = (part: string, value: string) => {
    const node = own<HTMLInputElement>(part)[0];
    if (!node || disposed) return;
    node.value = value;
    node.dispatchEvent(new view.Event("input", { bubbles: true }));
  };
  const focus = (index: number) => {
    const current = slots(),
      target = current[Math.max(0, Math.min(current.length - 1, index))];
    if (!target || target.disabled) return;
    active = Number(target.dataset["lensoIndex"]);
    paint();
    target.focus({ preventScroll: true });
    target.select();
  };
  const paint = () => {
    if (disposed) return;
    otpConfiguration(length(), validation());
    const value = canonical(),
      chars = [...value];
    if (composing && (blocked() || beforeComposition !== value)) {
      composing = undefined;
      ignoreComposition = true;
    }
    const current = slots();
    if (!root.contains(doc.activeElement) && !pending)
      active = Math.min(chars.length, length() - 1);
    active = Math.min(active, current.length - 1);
    for (const [i, node] of current.entries()) {
      if (node === composing && node.value !== draft) node.value = draft;
      else if (node !== composing && node.value !== (chars[i] ?? "")) node.value = chars[i] ?? "";
      attr(node, "tabindex", i === active ? "0" : "-1");
      attr(node, "inputmode", validation() === "numeric" ? "numeric" : "text");
      attr(node, "autocorrect", "off");
      attr(node, "spellcheck", "false");
      attr(node, "enterkeyhint", i === length() - 1 ? "done" : "next");
      attr(node, "maxlength", i === 0 ? String(length()) : null);
      attr(
        node,
        "aria-label",
        (root.dataset["lensoLabel"] ?? "{index} of {count}")
          .replaceAll("{index}", String(i + 1))
          .replaceAll("{count}", String(length())),
      );
      attr(node, "data-filled", chars[i] ? "" : null);
      attr(node, "form", root.dataset["lensoForm"] || null);
    }
    for (const node of own<HTMLInputElement>("form")) {
      attr(node, "name", node.dataset["lensoName"] || null);
      attr(node, "form", node.dataset["lensoForm"] || null);
    }
    const proxy = own<HTMLInputElement>("validity")[0];
    if (proxy) {
      attr(proxy, "form", root.dataset["lensoForm"] || null);
      attr(proxy, "required", root.dataset["lensoRequired"] === "true" ? "" : null);
      attr(proxy, "readonly", root.dataset["lensoReadonly"] === "true" ? "" : null);
      if (!initialValidity.has(proxy))
        initialValidity.set(proxy, proxy.validity.customError ? proxy.validationMessage : "");
      const valid =
        value === "" ||
        (value === otpNormalize(value, length(), validation()) && chars.length === length());
      const message = valid ? "" : (proxy.dataset["lensoLabel"] ?? "");
      if (!valid && !message)
        throw new Error("InputOTP requires a localized validationMessage for incomplete codes");
      if (proxy.validationMessage !== message) proxy.setCustomValidity(message);
      if (form !== proxy.form) {
        form?.removeEventListener("reset", reset);
        form = proxy.form;
        form?.addEventListener("reset", reset);
      }
    }
    for (const [node, values] of attrs)
      if (!node.isConnected && !root.contains(node)) {
        for (const [key, value] of values) {
          if (value === null) node.removeAttribute(key);
          else node.setAttribute(key, value);
        }
        attrs.delete(node);
      }
    acknowledge();
  };
  const acknowledge = () => {
    const intent = pending;
    if (!intent || blocked() || canonical() !== intent.value) return;
    pending = undefined;
    focus(intent.focus);
    if (intent.complete) {
      emit("complete", intent.value);
      if (root.dataset["lensoAutoSubmit"] === "true" && !blocked()) form?.requestSubmit();
    }
  };
  const propose = (value: string, index: number, canComplete: boolean) => {
    if (blocked() || disposed) return;
    const previous = canonical();
    pending = { value, focus: index, complete: canComplete && [...value].length === length() };
    if (value !== previous) emit("request", value);
    acknowledge();
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(() => {
        if (disposed) return;
        acknowledge();
        pending = undefined;
        paint();
      });
    });
  };
  const commit = (node: HTMLInputElement, raw: string, paste = false) => {
    const index = Number(node.dataset["lensoIndex"]),
      next = otpNormalize(raw, length(), validation());
    if (next === "") {
      if (!paste && raw === "") propose(otpRemove(canonical(), index), index, false);
      else {
        paint();
        node.select();
      }
      return;
    }
    const value = otpReplace(canonical(), index, next, length(), validation());
    const canComplete = [...canonical()].length !== length() || paste;
    propose(value, Math.min(index + [...next].length, length() - 1), canComplete);
  };
  const slot = (event: Event) => {
    const target = event.target;
    return target instanceof HTMLInputElement &&
      target.dataset["slot"] === "input-otp-slot" &&
      target.closest(selector) === root
      ? target
      : undefined;
  };
  const input = (event: Event) => {
    const node = slot(event);
    if (!node) return;
    event.stopImmediatePropagation();
    if (blocked()) {
      paint();
      return;
    }
    if (composing === node || (event as InputEvent).isComposing) {
      draft = node.value;
      return;
    }
    if (duplicate === node.value) {
      duplicate = undefined;
      return;
    }
    commit(node, node.value);
  };
  const change = (event: Event) => {
    if (slot(event)) event.stopImmediatePropagation();
  };
  const paste = (event: ClipboardEvent) => {
    const node = slot(event);
    if (!node) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!blocked()) commit(node, event.clipboardData?.getData("text/plain") ?? "", true);
  };
  const key = (event: KeyboardEvent) => {
    const node = slot(event);
    if (
      !node ||
      event.defaultPrevented ||
      event.isComposing ||
      composing ||
      node.disabled ||
      event.altKey
    )
      return;
    const index = Number(node.dataset["lensoIndex"]),
      last = Math.min([...canonical()].length, length() - 1),
      rtl = root.dataset["lensoDirection"] === "rtl";
    const boundary = event.ctrlKey || event.metaKey;
    let target: number | undefined;
    if (event.key === (rtl ? "ArrowRight" : "ArrowLeft")) target = boundary ? 0 : index - 1;
    else if (event.key === (rtl ? "ArrowLeft" : "ArrowRight")) target = boundary ? last : index + 1;
    else if (["Home", "ArrowUp"].includes(event.key)) target = 0;
    else if (["End", "ArrowDown"].includes(event.key)) target = last;
    if (target !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      focus(target);
      return;
    }
    if (blocked()) return;
    if (event.key === "Backspace" || event.key === "Delete") {
      event.preventDefault();
      event.stopPropagation();
      const previous = Math.max(0, index - 1);
      propose(
        event.key === "Backspace" && boundary
          ? ""
          : otpRemove(canonical(), event.key === "Delete" || node.value !== "" ? index : previous),
        event.key === "Backspace" ? (boundary ? 0 : previous) : index,
        false,
      );
    } else if (
      !boundary &&
      event.key.length === 1 &&
      node.selectionStart === 0 &&
      node.selectionEnd === node.value.length &&
      node.value === event.key
    ) {
      event.preventDefault();
      focus(index + 1);
    }
  };
  const focused = (event: FocusEvent) => {
    const node = slot(event);
    if (node) {
      active = Number(node.dataset["lensoIndex"]);
      paint();
      node.select();
    }
  };
  const blurred = () => queueMicrotask(paint);
  const pointer = (event: PointerEvent) => {
    const node = slot(event);
    if (node && event.pointerType === "mouse" && !node.disabled) {
      event.preventDefault();
      focus(Number(node.dataset["lensoIndex"]));
    }
  };
  const start = (event: CompositionEvent) => {
    const node = slot(event);
    if (node && !blocked()) {
      composing = node;
      draft = node.value;
      beforeComposition = canonical();
      ignoreComposition = false;
    }
  };
  const end = (event: CompositionEvent) => {
    const node = slot(event);
    if (!node) return;
    if (ignoreComposition) {
      ignoreComposition = false;
      composing = undefined;
      paint();
      return;
    }
    if (composing !== node) return;
    composing = undefined;
    if (blocked()) {
      paint();
      return;
    }
    const value = node.value;
    duplicate = value;
    commit(node, value);
    view.clearTimeout(timer);
    timer = view.setTimeout(() => (duplicate = undefined), 0);
  };
  const invalid = (event: Event) => {
    if (event.target === own("validity")[0]) {
      event.preventDefault();
      focus(Math.min([...canonical()].length, length() - 1));
    }
  };
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (disposed || event.defaultPrevented) return;
      view.cancelAnimationFrame(frame);
      pending = undefined;
      composing = undefined;
      ignoreComposition = true;
      emit("reset", "");
      paint();
    });
  root.addEventListener("input", input, true);
  root.addEventListener("change", change, true);
  root.addEventListener("paste", paste, true);
  root.addEventListener("keydown", key, true);
  root.addEventListener("focusin", focused);
  root.addEventListener("focusout", blurred);
  root.addEventListener("pointerdown", pointer, true);
  root.addEventListener("compositionstart", start);
  root.addEventListener("compositionend", end);
  root.addEventListener("invalid", invalid, true);
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-count",
      "data-lenso-mode",
      "data-lenso-disabled",
      "data-lenso-readonly",
      "data-lenso-form",
      "data-lenso-required",
      "data-lenso-label",
      "disabled",
    ],
  });
  const stopFocus = observeFocus(doc);
  paint();
  return {
    sync: paint,
    end() {
      if (disposed) return;
      disposed = true;
      observer.disconnect();
      stopFocus();
      view.cancelAnimationFrame(frame);
      view.clearTimeout(timer);
      form?.removeEventListener("reset", reset);
      root.removeEventListener("input", input, true);
      root.removeEventListener("change", change, true);
      root.removeEventListener("paste", paste, true);
      root.removeEventListener("keydown", key, true);
      root.removeEventListener("focusin", focused);
      root.removeEventListener("focusout", blurred);
      root.removeEventListener("pointerdown", pointer, true);
      root.removeEventListener("compositionstart", start);
      root.removeEventListener("compositionend", end);
      root.removeEventListener("invalid", invalid, true);
      for (const [node, values] of attrs)
        for (const [key, value] of values) {
          if (value === null) node.removeAttribute(key);
          else node.setAttribute(key, value);
        }
      for (const [node, message] of initialValidity) node.setCustomValidity(message);
      controllers.delete(root);
    },
  };
}
export function updateOTP(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (!root) return;
  if (!controllers.has(root)) {
    const owner = createOTP(root);
    if (owner) controllers.set(root, owner);
  }
  controllers.get(root)?.sync();
}
export function endOTP(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches(selector) ? node : node.closest<HTMLElement>(selector);
  if (root && (root === node || node.dataset["lensoKind"] === "input-otp-slot"))
    controllers.get(root)?.end();
}
