// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: Exact owns range values; native inputs expose semantics and form values.
import { createSpring, createVelocityDeformation } from "@lenso/glass/motion";
import { createKnobRefraction } from "./control-lens.js";

function liftThumb(thumb: HTMLElement) {
  const control = thumb.closest<HTMLElement>("[data-lg-slider-control]");
  if (!control) return;
  let stretch = 0;
  let raised = 0;
  const glass = thumb.querySelector<HTMLElement>('[data-slot="slider-optical"]');
  const refraction = glass ? createKnobRefraction(control, glass, "slider") : undefined;
  const paintShape = () => {
    thumb.style.setProperty(
      "--lg-slider-lift-x",
      String((38 / 58 + (20 / 58) * raised) * (1 + stretch)),
    );
    thumb.style.setProperty(
      "--lg-slider-lift-y",
      String((24 / 38 + (14 / 38) * raised) / (1 + stretch)),
    );
    refraction?.update(raised);
  };
  const deformation = createVelocityDeformation(0.05, (value) => {
    stretch = value;
    paintShape();
  });
  let length = 0;
  const resize = new ResizeObserver(() => {
    length =
      thumb.getAttribute("data-orientation") === "vertical"
        ? control.clientHeight
        : control.clientWidth;
  });
  resize.observe(control);
  const sample = () => {
    const input = thumb.querySelector("[aria-valuenow]") ?? thumb;
    const min = Number(input.getAttribute("aria-valuemin") ?? 0);
    const max = Number(input.getAttribute("aria-valuemax") ?? 100);
    const value = Number(input.getAttribute("aria-valuenow") ?? min);
    deformation.sample(((value - min) / (max - min || 1)) * length);
    refraction?.update(raised);
  };
  const values = new MutationObserver(sample);
  values.observe(thumb, { subtree: true, attributes: true, attributeFilter: ["aria-valuenow"] });
  sample();
  const spring = createSpring(0, 2000, 80, (amount) => {
    raised = amount;
    paintShape();
    thumb.style.setProperty(
      "--lg-slider-face",
      String(1 - 0.91 * Math.min(1, Math.max(0, amount))),
    );
  });
  const hold = () => {
    if (!thumb.hasAttribute("data-disabled") && !thumb.closest('[data-lenso-readonly="true"]'))
      spring.set(1);
  };
  const release = () => spring.set(0);
  control.addEventListener("pointerdown", hold);
  for (const event of ["pointerup", "pointercancel", "lostpointercapture", "focusout"])
    control.addEventListener(event, release);
  window.addEventListener("pointerup", release);
  window.addEventListener("pointercancel", release);
  window.addEventListener("blur", release);
  return () => {
    spring.stop();
    deformation.stop();
    refraction?.destroy();
    values.disconnect();
    resize.disconnect();
    control.removeEventListener("pointerdown", hold);
    for (const event of ["pointerup", "pointercancel", "lostpointercapture", "focusout"])
      control.removeEventListener(event, release);
    window.removeEventListener("pointerup", release);
    window.removeEventListener("pointercancel", release);
    window.removeEventListener("blur", release);
    thumb.style.removeProperty("--lg-slider-lift-x");
    thumb.style.removeProperty("--lg-slider-lift-y");
    thumb.style.removeProperty("--lg-slider-face");
  };
}
const lifts = new WeakMap<HTMLElement, () => void>();
export function updateSliderLift(node: HTMLElement | SVGElement, data: DOMStringMap) {
  if (!(node instanceof HTMLElement) || data["lensoKind"] !== "slider-thumb" || lifts.has(node))
    return;
  let active = true;
  let stop: (() => void) | undefined;
  lifts.set(node, () => {
    active = false;
    stop?.();
  });
  queueMicrotask(() => {
    if (active) stop = liftThumb(node);
  });
}
export function endSliderLift(node: HTMLElement | SVGElement) {
  if (!(node instanceof HTMLElement)) return;
  lifts.get(node)?.();
  lifts.delete(node);
}
