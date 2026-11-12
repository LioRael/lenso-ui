import { colorAreaModel, colorAreaPoint, colorAreaAxis } from "./color-area-value.js";
import { colorAreaGradient } from "./color-area-gradient.js";
import { updateSliderLift, endSliderLift } from "./slider-lift.js";
const controllers = new WeakMap<HTMLElement, { paint(): void; end(): void }>();
export function updateColorArea(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[data-slot="color-area"]')
    ? node
    : node.closest<HTMLElement>('[data-slot="color-area"]');
  if (!root) return;
  const existing = controllers.get(root);
  if (existing) {
    existing.paint();
    return;
  }
  const thumb = root.querySelector<HTMLElement>('[data-slot="color-area-thumb"]');
  const face = root.querySelector<HTMLElement>('[data-slot="color-area-face"]');
  const x = thumb?.querySelector<HTMLInputElement>('input[type="range"]');
  const y = root.querySelector<HTMLInputElement>(
    '[data-slot="color-area-secondary"] input[type="range"]',
  );
  const formX = root.querySelector<HTMLInputElement>('[data-slot="color-area-form-x"]'),
    formY = root.querySelector<HTMLInputElement>('[data-slot="color-area-form-y"]');
  if (!thumb || !face || !x || !y || !formX || !formY) return;
  const view = root.ownerDocument.defaultView!;
  const attributes = new Map<Element, Map<string, string | null>>(),
    styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const set = (node: Element, name: string, value: string | null) => {
    let values = attributes.get(node);
    if (!values) attributes.set(node, (values = new Map()));
    if (!values.has(name)) values.set(name, node.getAttribute(name));
    if (node.getAttribute(name) === value) return;
    if (value === null) node.removeAttribute(name);
    else node.setAttribute(name, value);
  };
  const style = (node: HTMLElement, name: string, value: string) => {
    let values = styles.get(node);
    if (!values) styles.set(node, (values = new Map()));
    if (!values.has(name))
      values.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
    node.style.setProperty(name, value);
  };
  const canonical = () => root.dataset["lensoValue"] ?? "";
  const stopped = () =>
    root.dataset["lensoDisabled"] === "true" || root.dataset["lensoReadonly"] === "true";
  const initial = canonical(),
    originalX = x.value,
    originalY = y.value;
  let previous = initial,
    configuration = "",
    space = "",
    xChannel = "",
    yChannel = "",
    locale = "",
    rtl = false,
    disposed = false,
    pending: string | undefined,
    frame = 0;
  let gesture: { id: number; before: string } | undefined,
    keyboardBefore: string | undefined,
    nativeBefore: string | undefined;
  const value = () => pending ?? canonical();
  const model = (next = value()) => colorAreaModel(next, space, xChannel, yChannel);
  const send = (kind: string, next: string) => {
    if (disposed || (kind !== "rollback" && stopped())) return;
    const bridge = root.querySelector<HTMLInputElement>(`[data-slot="color-area-${kind}"]`);
    if (bridge) {
      bridge.value = next;
      bridge.dispatchEvent(new view.Event("input", { bubbles: true }));
    }
  };
  const propose = (next: string, rollback = false) => {
    if (next === value() || disposed || (!rollback && stopped())) return;
    pending = next;
    send(rollback ? "rollback" : "change", next);
    paint();
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(() => {
        pending = undefined;
        paint();
      });
    });
  };
  const finish = (rollback: boolean) => {
    const old = gesture;
    gesture = undefined;
    if (old && root.hasPointerCapture(old.id)) root.releasePointerCapture(old.id);
    if (old && rollback) propose(old.before, true);
    set(thumb, "data-dragging", null);
  };
  const commit = (before: string) => {
    const token = configuration;
    queueMicrotask(() => {
      if (disposed || stopped() || token !== configuration) return;
      const a = model(before),
        b = model(canonical());
      if (
        a.x !== b.x ||
        a.y !== b.y ||
        a.color.getChannelValue(a.axes.zChannel) !== b.color.getChannelValue(b.axes.zChannel) ||
        a.color.getChannelValue("alpha") !== b.color.getChannelValue("alpha")
      )
        send("commit", canonical());
    });
  };
  const paint = () => {
    if (disposed) return;
    space = root.dataset["lensoColorSpace"] ?? "";
    xChannel = root.dataset["lensoXChannel"] ?? "";
    yChannel = root.dataset["lensoYChannel"] ?? "";
    locale = root.dataset["lensoLocale"] || "en-US";
    rtl = root.dataset["lensoDirection"] === "rtl";
    const nextConfiguration = JSON.stringify([space, xChannel, yChannel, locale, rtl, stopped()]);
    if (configuration && configuration !== nextConfiguration) {
      configuration = nextConfiguration;
      keyboardBefore = undefined;
      finish(true);
    }
    configuration = nextConfiguration;
    if (canonical() !== previous) {
      previous = canonical();
      pending = undefined;
    }
    const current = model(),
      gradient = colorAreaGradient(current.color, current.axes, rtl ? "rtl" : "ltr");
    style(root, "background", gradient.background);
    style(root, "background-blend-mode", gradient.backgroundBlendMode);
    style(root, "forced-color-adjust", "none");
    const px =
        (current.x - current.xRange.minValue) / (current.xRange.maxValue - current.xRange.minValue),
      py =
        1 -
        (current.y - current.yRange.minValue) / (current.yRange.maxValue - current.yRange.minValue);
    style(thumb, "left", `${(rtl ? 1 - px : px) * 100}%`);
    style(thumb, "top", `${py * 100}%`);
    style(thumb, "transform", "translate(-50%, -50%)");
    style(face, "background-color", current.color.withChannelValue("alpha", 1).toString("css"));
    for (const axis of ["x", "y"] as const) {
      const input = axis === "x" ? x : y,
        range = axis === "x" ? current.xRange : current.yRange,
        channel = axis === "x" ? current.axes.xChannel : current.axes.yChannel;
      for (const [name, projected] of Object.entries({
        min: String(range.minValue),
        max: String(range.maxValue),
        step: String(range.step),
        "aria-valuemin": String(range.minValue),
        "aria-valuemax": String(range.maxValue),
        "aria-valuenow": String(current[axis]),
        "aria-orientation": axis === "x" ? "horizontal" : "vertical",
        tabindex: "0",
        "aria-label": `${root.getAttribute("aria-label") ?? "Color"} ${current.color.getChannelName(channel, locale)}`,
      }))
        set(input, name, projected);
      set(input, "disabled", root.dataset["lensoDisabled"] === "true" ? "" : null);
      set(
        input,
        "aria-valuetext",
        axis === "x"
          ? `${current.color.formatChannelValue(current.axes.xChannel, locale)}, ${current.color.formatChannelValue(current.axes.yChannel, locale)}, ${current.color.getColorName(locale)}`
          : current.color.formatChannelValue(channel, locale),
      );
      input.value = String(current[axis]);
      (axis === "x" ? formX : formY).value = String(current[axis]);
    }
    updateSliderLift(thumb, { ...thumb.dataset, lensoKind: "slider-thumb" });
  };
  const edited = (event: Event) => {
    if (event.target !== x && event.target !== y) return;
    event.stopImmediatePropagation();
    if (stopped()) {
      paint();
      return;
    }
    nativeBefore ??= canonical();
    const input = event.target as HTMLInputElement;
    propose(
      colorAreaAxis(
        value(),
        space,
        xChannel,
        yChannel,
        input === x ? "x" : "y",
        Number(input.value),
      ),
    );
  };
  const changed = (event: Event) => {
    if (event.target !== x && event.target !== y) return;
    event.stopImmediatePropagation();
    if (nativeBefore !== undefined) {
      const before = nativeBefore;
      nativeBefore = undefined;
      commit(before);
    }
  };
  const focusout = (event: FocusEvent) => {
    if (!(event.relatedTarget instanceof Node) || !root.contains(event.relatedTarget)) {
      keyboardBefore = undefined;
      nativeBefore = undefined;
    }
  };
  const point = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    propose(
      colorAreaPoint(
        value(),
        space,
        xChannel,
        yChannel,
        (event.clientX - rect.left) / rect.width,
        (event.clientY - rect.top) / rect.height,
        rtl,
      ),
    );
  };
  const down = (event: PointerEvent) => {
    if (
      event.defaultPrevented ||
      !event.isPrimary ||
      event.button !== 0 ||
      stopped() ||
      gesture ||
      !(event.target instanceof Element) ||
      event.target.closest('[data-slot="color-area"]') !== root ||
      event.target.closest(
        'button,a[href],textarea,select,[contenteditable],input:not([type="range"])',
      )
    )
      return;
    event.preventDefault();
    x.focus({ preventScroll: true });
    if (disposed) return;
    gesture = { id: event.pointerId, before: canonical() };
    keyboardBefore = undefined;
    root.setPointerCapture(event.pointerId);
    set(thumb, "data-dragging", "");
    point(event);
  };
  const move = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) {
      if (stopped()) finish(true);
      else point(event);
    }
  };
  const up = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) {
      point(event);
      const before = gesture.before;
      finish(false);
      commit(before);
    }
  };
  const cancel = (event: PointerEvent) => {
    if (gesture?.id === event.pointerId) finish(true);
  };
  const lost = (event: PointerEvent) => {
    if (event.target === root && gesture?.id === event.pointerId) finish(false);
  };
  const key = (event: KeyboardEvent) => {
    if (
      (event.target !== x && event.target !== y) ||
      event.defaultPrevented ||
      event.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
        "Escape",
      ].includes(event.key)
    )
      return;
    if (event.key === "Escape") {
      if (gesture) {
        event.preventDefault();
        finish(true);
      }
      keyboardBefore = undefined;
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (stopped()) return;
    const current = model();
    const axis =
      event.target === y || event.key === "ArrowUp" || event.key === "ArrowDown" ? "y" : "x";
    const range = axis === "x" ? current.xRange : current.yRange;
    const amount = event.shiftKey || event.key.startsWith("Page") ? range.pageSize : range.step;
    const descending =
      event.key === "ArrowDown" ||
      event.key === "PageDown" ||
      event.key === (rtl ? "ArrowRight" : "ArrowLeft");
    const next =
      event.key === "Home"
        ? range.minValue
        : event.key === "End"
          ? range.maxValue
          : current[axis] + (descending ? -amount : amount);
    keyboardBefore ??= canonical();
    propose(colorAreaAxis(value(), space, xChannel, yChannel, axis, next));
  };
  const keyup = (event: KeyboardEvent) => {
    if (
      (event.target === x || event.target === y) &&
      keyboardBefore !== undefined &&
      [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
        "PageUp",
        "PageDown",
      ].includes(event.key)
    ) {
      const before = keyboardBefore;
      keyboardBefore = undefined;
      commit(before);
    }
  };
  const blur = () => {
    finish(true);
    keyboardBefore = undefined;
  };
  const observer = new MutationObserver(paint);
  observer.observe(root, {
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-color-space",
      "data-lenso-x-channel",
      "data-lenso-y-channel",
      "data-lenso-locale",
      "data-lenso-direction",
      "data-lenso-disabled",
      "data-lenso-readonly",
    ],
  });
  const form = x.form;
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!disposed && !event.defaultPrevented) {
        finish(false);
        keyboardBefore = undefined;
        pending = undefined;
        if (!stopped()) propose(initial);
        paint();
      }
    });
  form?.addEventListener("reset", reset);
  root.addEventListener("pointerdown", down);
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerup", up);
  root.addEventListener("pointercancel", cancel);
  root.addEventListener("lostpointercapture", lost);
  root.addEventListener("keydown", key, true);
  root.addEventListener("keyup", keyup);
  x.addEventListener("change", changed, true);
  y.addEventListener("change", changed, true);
  root.addEventListener("focusout", focusout);
  x.addEventListener("input", edited, true);
  y.addEventListener("input", edited, true);
  view.addEventListener("blur", blur);
  controllers.set(root, {
    paint,
    end() {
      disposed = true;
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      finish(false);
      endSliderLift(thumb);
      form?.removeEventListener("reset", reset);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", cancel);
      root.removeEventListener("lostpointercapture", lost);
      root.removeEventListener("keydown", key, true);
      root.removeEventListener("keyup", keyup);
      x.removeEventListener("change", changed, true);
      y.removeEventListener("change", changed, true);
      root.removeEventListener("focusout", focusout);
      x.removeEventListener("input", edited, true);
      y.removeEventListener("input", edited, true);
      view.removeEventListener("blur", blur);
      for (const [node, values] of attributes)
        for (const [name, original] of values) {
          if (original === null) node.removeAttribute(name);
          else node.setAttribute(name, original);
        }
      for (const [node, values] of styles)
        for (const [name, [original, priority]] of values) {
          if (original) node.style.setProperty(name, original, priority);
          else node.style.removeProperty(name);
        }
      x.value = originalX;
      y.value = originalY;
      formX.value = canonical();
      formY.value = canonical();
      controllers.delete(root);
    },
  });
  paint();
}
export function endColorArea(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) controllers.get(node)?.end();
}
