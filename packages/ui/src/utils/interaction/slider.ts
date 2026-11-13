// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: native UI SDK owns range values and pointer/keyboard operation.
import { useCallback, useEffect, useState, type Ref } from "react";
import { createSpring, createVelocityDeformation } from "@lenso/glass/motion";
import { assignRef } from "./ref.js";
import { createKnobRefraction } from "../materials/control-lens.js";

function liftThumb(thumb: HTMLElement) {
  const control = thumb.closest<HTMLElement>("[data-lg-slider-control]");
  if (!control) return;
  let stretch = 0;
  let raised = 0;
  const glass = thumb.querySelector<HTMLElement>('[data-lenso-slot="slider-optical"]');
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
  let previousPosition = NaN;
  const sample = () => {
    const progress = parseFloat(thumb.style.getPropertyValue("--slider-thumb-position")) || 0;
    const position = (progress * length) / 100;
    if (position === previousPosition) return;
    previousPosition = position;
    deformation.sample(position);
    refraction?.update(raised);
  };
  const resize = new ResizeObserver(() => {
    length =
      thumb.getAttribute("data-orientation") === "vertical"
        ? control.clientHeight
        : control.clientWidth;
    sample();
  });
  resize.observe(control);
  const values = new MutationObserver(sample);
  values.observe(thumb, { attributes: true, attributeFilter: ["style"] });
  sample();
  const spring = createSpring(0, 2000, 80, (amount) => {
    raised = amount;
    paintShape();
    thumb.style.setProperty(
      "--lg-slider-face",
      String(1 - 0.91 * Math.min(1, Math.max(0, amount))),
    );
  });
  // Lift only the focused native range during a drag.
  const syncDragging = () =>
    spring.set(
      thumb.hasAttribute("data-dragging") && thumb.contains(document.activeElement) ? 1 : 0,
    );
  const dragging = new MutationObserver(syncDragging);
  dragging.observe(thumb, { attributes: true, attributeFilter: ["data-dragging"] });
  control.addEventListener("focusin", syncDragging, true);
  syncDragging();
  return () => {
    spring.stop();
    deformation.stop();
    refraction?.destroy();
    values.disconnect();
    dragging.disconnect();
    control.removeEventListener("focusin", syncDragging, true);
    resize.disconnect();
    thumb.style.removeProperty("--lg-slider-lift-x");
    thumb.style.removeProperty("--lg-slider-lift-y");
    thumb.style.removeProperty("--lg-slider-face");
  };
}
export function useSliderThumbRef(ref: Ref<HTMLDivElement> | undefined) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  useEffect(() => (element ? liftThumb(element) : undefined), [element]);
  return useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
