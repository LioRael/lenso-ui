// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: native UI SDK owns range values and pointer/keyboard operation.
import type { Ref } from "react";
import { bindIndicator } from "@lenso/glass/motion";
import { useBindRef } from "./ref.js";
import { createKnobRefraction } from "../materials/control-lens.js";

function liftThumb(thumb: HTMLElement) {
  const control = thumb.closest<HTMLElement>("[data-lg-slider-control]");
  if (!control) return;
  const glass = thumb.querySelector<HTMLElement>('[data-lenso-slot="slider-optical"]');
  const refraction = glass ? createKnobRefraction(control, glass, "slider") : undefined;
  const indicator = bindIndicator(thumb, {
    property: "--lg-slider",
    stretch: 0.05,
    onPaint: ({ lift }) => refraction?.update(lift),
  });
  let length = 0;
  let previousPosition = NaN;
  const sample = () => {
    const progress = parseFloat(thumb.style.getPropertyValue("--slider-thumb-position")) || 0;
    const position = (progress * length) / 100;
    if (position === previousPosition) return;
    previousPosition = position;
    indicator.move(position);
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
  // Lift only the focused native range during a drag.
  const syncDragging = () =>
    indicator.lift(thumb.hasAttribute("data-dragging") && thumb.contains(document.activeElement));
  const dragging = new MutationObserver(syncDragging);
  dragging.observe(thumb, { attributes: true, attributeFilter: ["data-dragging"] });
  control.addEventListener("focusin", syncDragging, true);
  syncDragging();
  return () => {
    indicator.destroy();
    refraction?.destroy();
    values.disconnect();
    dragging.disconnect();
    control.removeEventListener("focusin", syncDragging, true);
    resize.disconnect();
  };
}

export function useSliderThumbRef(ref: Ref<HTMLDivElement> | undefined) {
  return useBindRef(ref, liftThumb);
}
