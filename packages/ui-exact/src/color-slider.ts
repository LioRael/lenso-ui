import { colorSliderModel, colorSliderPaint, setColorSliderValue } from "./color-slider-value.js";
import { updateSlider, endSlider } from "./slider.js";
import { updateSliderLift, endSliderLift } from "./slider-lift.js";
const controllers = new WeakMap<HTMLElement, { paint(): void; end(): void }>();
export function updateColorSlider(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  const root = node.matches('[data-lenso-kind="color-slider"]')
    ? node
    : node.closest<HTMLElement>('[data-lenso-kind="color-slider"]');
  if (!root) return;
  const existing = controllers.get(root);
  if (existing) {
    existing.paint();
    return;
  }
  const input = root.querySelector<HTMLInputElement>('[data-lenso-kind="slider-input"]');
  const track = root.querySelector<HTMLElement>('[data-lenso-kind="color-slider-track"]');
  const thumb = root.querySelector<HTMLElement>('[data-lenso-kind="color-slider-thumb"]');
  const form = root.querySelector<HTMLInputElement>('[data-slot="color-slider-form"]');
  if (!input || !track || !thumb || !form) return;
  const view = root.ownerDocument.defaultView!;
  const attrs = new Map<Element, Map<string, string | null>>();
  const styles = new Map<HTMLElement, Map<string, [string, string]>>();
  const set = (node: Element, name: string, value: string | null) => {
    let values = attrs.get(node);
    if (!values) attrs.set(node, (values = new Map()));
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
  let disposed = false,
    pending: string | undefined,
    frame = 0,
    configuration = "",
    channel = "",
    space = "",
    locale = "",
    orientation = "",
    direction = "";
  const initial = canonical(),
    originalInputValue = input.value;
  const effective = () => pending ?? canonical();
  const send = (kind: string, value: string) => {
    if (disposed || stopped()) return;
    const bridge = root.querySelector<HTMLInputElement>(`[data-slot="color-slider-${kind}"]`);
    if (bridge) {
      bridge.value = value;
      bridge.dispatchEvent(new view.Event("input", { bubbles: true }));
    }
  };
  const paint = () => {
    if (disposed) return;
    channel = root.dataset["lensoChannel"] ?? "";
    space = root.dataset["lensoColorSpace"] ?? "";
    locale = root.dataset["lensoLocale"] || "en-US";
    orientation = root.dataset["orientation"] ?? "horizontal";
    direction = root.dataset["lensoDirection"] ?? "ltr";
    const nextConfiguration = JSON.stringify([
      channel,
      space,
      locale,
      orientation,
      direction,
      stopped(),
    ]);
    if (configuration && nextConfiguration !== configuration) {
      pending = undefined;
      view.cancelAnimationFrame(frame);
      endSlider(root);
    }
    configuration = nextConfiguration;
    const model = colorSliderModel(effective(), channel, space);
    const value = model.color.getChannelValue(model.key),
      range = model.range;
    for (const [key, projected] of Object.entries({
      "data-lenso-values": String(value),
      "data-lenso-min": String(range.minValue),
      "data-lenso-max": String(range.maxValue),
      "data-lenso-step": String(range.step),
      "data-lenso-large-step": String(range.pageSize),
      "data-lenso-gap": "0",
      "data-lenso-alignment": "center",
      "data-lenso-collision": "none",
    }))
      set(root, key, projected);
    for (const [key, projected] of Object.entries({
      min: String(range.minValue),
      max: String(range.maxValue),
      step: String(range.step),
      "aria-valuemin": String(range.minValue),
      "aria-valuemax": String(range.maxValue),
      "aria-valuenow": String(value),
      "aria-orientation": orientation,
      "data-lenso-value": String(value),
      "data-lenso-readonly": root.dataset["lensoReadonly"] ?? "false",
    }))
      set(input, key, projected);
    set(input, "disabled", root.dataset["lensoDisabled"] === "true" ? "" : null);
    const label = model.color.formatChannelValue(model.key, locale);
    set(
      input,
      "aria-valuetext",
      `${label}, ${channel === "hue" ? model.color.getHueName(locale) : model.color.getColorName(locale)}`,
    );
    input.value = String(value);
    form.value = String(value);
    const ratio = (value - range.minValue) / (range.maxValue - range.minValue);
    style(
      thumb,
      "left",
      orientation === "vertical" ? "50%" : `${(direction === "rtl" ? 1 - ratio : ratio) * 100}%`,
    );
    style(thumb, "top", orientation === "vertical" ? `${(1 - ratio) * 100}%` : "50%");
    style(thumb, "transform", "translate(-50%, -50%)");
    const paint = colorSliderPaint(effective(), channel, space, orientation, direction);
    style(track, "background-image", `${paint.gradient},var(--lenso-color-checkerboard)`);
    style(track, "background-size", "auto,16px 16px");
    style(track, "background-position", "0 0,50%");
    style(track, "forced-color-adjust", "none");
    style(track, "--track-start-color", paint.start);
    style(track, "--track-end-color", paint.end);
    style(thumb, "--lg-color-thumb", paint.thumb);
    for (const output of root.querySelectorAll<HTMLElement>(
      '[data-lenso-kind="color-slider-output"]',
    ))
      if (output.firstChild?.nodeType === 3) output.firstChild.nodeValue = label;
      else output.textContent = label;
    updateSlider(root, { ...root.dataset, lensoKind: "slider" });
    updateSliderLift(thumb, { ...thumb.dataset, lensoKind: "slider-thumb" });
  };
  const propose = (next: string) => {
    if (stopped() || next === effective()) return;
    pending = next;
    send("change", next);
    paint();
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => {
      frame = view.requestAnimationFrame(() => {
        pending = undefined;
        paint();
      });
    });
  };
  const edited = (event: Event) => {
    if (event.target !== input) return;
    event.stopImmediatePropagation();
    if (stopped()) {
      paint();
      return;
    }
    const model = colorSliderModel(effective(), channel, space);
    if (Math.abs(Number(input.value) - model.color.getChannelValue(model.key)) < 1e-12) {
      paint();
      return;
    }
    propose(setColorSliderValue(effective(), channel, space, Number(input.value)));
  };
  const committed = (event: Event) => {
    if (event.target !== input) return;
    event.stopImmediatePropagation();
    const model = colorSliderModel(effective(), channel, space);
    const expected = model.color.getChannelValue(model.key);
    const atConfiguration = configuration;
    queueMicrotask(() => {
      if (disposed || stopped() || configuration !== atConfiguration) return;
      const acceptedModel = colorSliderModel(canonical(), channel, space);
      const accepted = acceptedModel.color.getChannelValue(acceptedModel.key);
      if (Math.abs(accepted - expected) < 1e-8) send("commit", canonical());
    });
  };
  const observer = new MutationObserver(() => {
    if (pending === canonical()) pending = undefined;
    paint();
  });
  observer.observe(root, {
    attributes: true,
    attributeFilter: [
      "data-lenso-value",
      "data-lenso-channel",
      "data-lenso-color-space",
      "data-lenso-locale",
      "data-lenso-disabled",
      "data-lenso-readonly",
      "data-orientation",
      "data-lenso-direction",
    ],
  });
  const nativeForm = input.form;
  const reset = (event: Event) =>
    queueMicrotask(() => {
      if (!disposed && !event.defaultPrevented) {
        pending = undefined;
        if (!stopped()) propose(initial);
        paint();
      }
    });
  nativeForm?.addEventListener("reset", reset);
  input.addEventListener("input", edited, true);
  input.addEventListener("change", committed, true);
  controllers.set(root, {
    paint,
    end() {
      disposed = true;
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      input.removeEventListener("input", edited, true);
      input.removeEventListener("change", committed, true);
      nativeForm?.removeEventListener("reset", reset);
      endSlider(root);
      endSliderLift(thumb);
      for (const [node, values] of attrs)
        for (const [name, value] of values) {
          if (value === null) node.removeAttribute(name);
          else node.setAttribute(name, value);
        }
      for (const [node, values] of styles)
        for (const [name, [value, priority]] of values) {
          if (!value) node.style.removeProperty(name);
          else node.style.setProperty(name, value, priority);
        }
      input.value = originalInputValue;
      form.value = canonical();
      for (const output of root.querySelectorAll<HTMLElement>(
        '[data-lenso-kind="color-slider-output"]',
      )) {
        if (output.firstChild?.nodeType === 3) output.firstChild.nodeValue = canonical();
        else output.textContent = canonical();
      }
      controllers.delete(root);
    },
  });
  paint();
}
export function endColorSlider(node: HTMLElement | SVGElement) {
  if (node instanceof HTMLElement) controllers.get(node)?.end();
}
