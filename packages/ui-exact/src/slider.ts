const owners = new WeakMap<HTMLElement, () => void>();
const keys = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

function connect(root: HTMLElement) {
  const inputs = () =>
    Array.from(root.querySelectorAll<HTMLInputElement>('[data-lenso-kind="slider-input"]'));
  const values = () => (root.dataset["lensoValues"] ?? "").split(",").map(Number);
  const number = (key: string) => Number(root.dataset[key]);
  const blocked = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const vertical = () => root.getAttribute("data-orientation") === "vertical";
  const rtl = () => root.dataset["lensoDirection"] === "rtl";
  const control = () => root.querySelector<HTMLElement>('[data-slot="slider-control"]');
  const signature = () => root.dataset["lensoValues"];
  let lastUsed: HTMLInputElement | undefined;
  const mark = (input: HTMLInputElement) => {
    lastUsed = input;
    for (const node of inputs())
      node
        .closest('[data-slot="slider-thumb"]')
        ?.toggleAttribute("data-lenso-last-thumb", node === input);
  };
  const focus = (event: FocusEvent) => {
    if (event.target instanceof HTMLInputElement && root.contains(event.target)) mark(event.target);
  };
  let active = true;
  let frame = 0;
  let gesture:
    | { id: number; input: HTMLInputElement; owner: HTMLElement; before: string | undefined }
    | undefined;
  let keyboard: { input: HTMLInputElement; before: string | undefined } | undefined;
  const reconcile = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (!active) return;
      for (const input of inputs()) input.value = input.dataset["lensoValue"] ?? "0";
    });
  };
  const propose = (input: HTMLInputElement, value: number) => {
    if (blocked()) return;
    const current = values();
    const index = Number(input.dataset["lensoIndex"]);
    const gap = number("lensoGap");
    const push = root.dataset["lensoCollision"] === "push";
    const min = push
      ? number("lensoMin") + index * gap
      : index > 0
        ? current[index - 1]! + gap
        : number("lensoMin");
    const max = push
      ? number("lensoMax") - (current.length - 1 - index) * gap
      : index < current.length - 1
        ? current[index + 1]! - gap
        : number("lensoMax");
    input.value = String(Math.min(max, Math.max(min, value)));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    reconcile();
  };
  const commit = (input: HTMLInputElement, before: string | undefined) => {
    if (!blocked() && before !== signature())
      input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const point = (event: PointerEvent) => {
    const box = control()!.getBoundingClientRect();
    const inset = root.dataset["lensoAlignment"] === "edge" ? 22 : 0;
    const length = (vertical() ? box.height : box.width) - inset * 2;
    const position = vertical()
      ? box.bottom - event.clientY - inset
      : (rtl() ? box.right - event.clientX : event.clientX - box.left) - inset;
    const ratio = length > 0 ? Math.min(1, Math.max(0, position / length)) : 0;
    return number("lensoMin") + ratio * (number("lensoMax") - number("lensoMin"));
  };
  const release = (completed: boolean) => {
    const old = gesture;
    gesture = undefined;
    if (!old) return;
    old.input.closest('[data-slot="slider-thumb"]')?.removeAttribute("data-lenso-active-thumb");
    if (old.owner.hasPointerCapture(old.id)) old.owner.releasePointerCapture(old.id);
    if (completed) commit(old.input, old.before);
    reconcile();
  };
  const down = (event: PointerEvent) => {
    const owner = control();
    if (
      !owner ||
      !(event.target instanceof Element) ||
      !owner.contains(event.target) ||
      !event.isPrimary ||
      event.button !== 0 ||
      event.defaultPrevented
    )
      return;
    event.preventDefault();
    if (blocked() || gesture) return;
    const value = point(event);
    const input = inputs().reduce<HTMLInputElement | undefined>((nearest, item) => {
      const distance = Math.abs(Number(item.dataset["lensoValue"]) - value);
      const previous = nearest ? Math.abs(Number(nearest.dataset["lensoValue"]) - value) : Infinity;
      return distance < previous || (distance === previous && item === lastUsed) ? item : nearest;
    }, undefined);
    if (!input) return;
    input.focus({ preventScroll: true });
    mark(input);
    input.closest('[data-slot="slider-thumb"]')?.setAttribute("data-lenso-active-thumb", "");
    gesture = { id: event.pointerId, input, owner, before: signature() };
    owner.setPointerCapture(event.pointerId);
    propose(input, value);
  };
  const move = (event: PointerEvent) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    if (blocked()) return release(false);
    propose(gesture.input, point(event));
  };
  const up = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) release(true);
  };
  const cancel = () => release(false);
  const keydown = (event: KeyboardEvent) => {
    if (
      !(event.target instanceof HTMLInputElement) ||
      !keys.has(event.key) ||
      !root.contains(event.target) ||
      event.defaultPrevented
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    if (blocked()) return;
    const input = event.target;
    const index = Number(input.dataset["lensoIndex"]);
    const current = values();
    const min = index > 0 ? current[index - 1]! + number("lensoGap") : number("lensoMin");
    const max =
      index < current.length - 1 ? current[index + 1]! - number("lensoGap") : number("lensoMax");
    const amount =
      event.shiftKey || event.key.startsWith("Page")
        ? number("lensoLargeStep")
        : number("lensoStep");
    const direction =
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === (rtl() ? "ArrowRight" : "ArrowLeft")
        ? -1
        : 1;
    const value =
      event.key === "Home" ? min : event.key === "End" ? max : current[index]! + amount * direction;
    keyboard ??= { input, before: signature() };
    propose(input, Math.max(min, Math.min(max, Number(value.toFixed(12)))));
  };
  const keyup = (event: KeyboardEvent) => {
    if (!keys.has(event.key) || !keyboard) return;
    const old = keyboard;
    keyboard = undefined;
    commit(old.input, old.before);
  };
  const reset = (event: Event) => {
    if (inputs().some((input) => input.form === event.target)) queueMicrotask(reconcile);
  };
  const clickLabel = (event: MouseEvent) => {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-slot="slider-label"]') &&
      !blocked()
    )
      inputs()[0]?.focus();
  };
  root.addEventListener("focusin", focus);
  root.addEventListener("pointerdown", down);
  root.addEventListener("keydown", keydown, true);
  root.addEventListener("keyup", keyup);
  root.addEventListener("input", reconcile);
  root.addEventListener("click", clickLabel);
  root.addEventListener("lostpointercapture", cancel);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("blur", cancel);
  root.ownerDocument.addEventListener("reset", reset, true);
  return () => {
    active = false;
    cancel();
    cancelAnimationFrame(frame);
    root.removeEventListener("focusin", focus);
    for (const input of inputs()) {
      input.closest('[data-slot="slider-thumb"]')?.removeAttribute("data-lenso-last-thumb");
      input.closest('[data-slot="slider-thumb"]')?.removeAttribute("data-lenso-active-thumb");
    }
    root.removeEventListener("pointerdown", down);
    root.removeEventListener("keydown", keydown, true);
    root.removeEventListener("keyup", keyup);
    root.removeEventListener("input", reconcile);
    root.removeEventListener("click", clickLabel);
    root.removeEventListener("lostpointercapture", cancel);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("blur", cancel);
    root.ownerDocument.removeEventListener("reset", reset, true);
  };
}
export function updateSlider(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "slider") return;
  const min = Number(data["lensoMin"]),
    max = Number(data["lensoMax"]),
    step = Number(data["lensoStep"]),
    largeStep = Number(data["lensoLargeStep"]),
    gap = Number(data["lensoGap"]);
  const values = (data["lensoValues"] ?? "").split(",").map(Number);
  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    !(max > min) ||
    !Number.isFinite(step) ||
    step <= 0 ||
    !Number.isFinite(largeStep) ||
    largeStep <= 0 ||
    !Number.isFinite(gap) ||
    gap < 0 ||
    !data["lensoValues"] ||
    values.some(
      (value, index) =>
        !Number.isFinite(value) ||
        value < min ||
        value > max ||
        (index > 0 && value < values[index - 1]! + gap),
    )
  )
    throw new RangeError(
      "Slider requires finite ordered values, positive steps and an achievable minimum gap",
    );
  if (
    !["horizontal", "vertical"].includes(data["orientation"] ?? "") ||
    !["ltr", "rtl"].includes(data["lensoDirection"] ?? "") ||
    !["center", "edge"].includes(data["lensoAlignment"] ?? "") ||
    !["push", "none"].includes(data["lensoCollision"] ?? "")
  )
    throw new RangeError("Unknown Slider orientation, direction, alignment or collision mode");
  if (!owners.has(node)) owners.set(node, connect(node));
}
export function endSlider(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  owners.get(node)?.();
  owners.delete(node);
}
