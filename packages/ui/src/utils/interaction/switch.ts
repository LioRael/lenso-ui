// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: Base UI owns checked state; the source springs paint its visual state.
import { useCallback, useEffect, useState, type Ref } from "react";
import { createSpring, createVelocityDeformation } from "@lenso/glass/motion";
import { held } from "./hold.js";
import { assignRef } from "./ref.js";
import { createKnobRefraction } from "../materials/control-lens.js";

const unit = (value: number) => Math.min(1, Math.max(0, value));

function present(root: HTMLElement) {
  const control = () => root.querySelector<HTMLElement>('[data-slot="switch-control"]');
  const checked = () => root.getAttribute("aria-checked") === "true";
  const blocked = () => root.matches('[data-disabled], [data-readonly], [aria-disabled="true"]');
  const travel = () => ((control()?.getBoundingClientRect().width ?? 64) / 64) * 22;
  const initial = checked() ? 1 : 0;
  let stretch = 0;
  let raised = 0;
  const track = control();
  const thumb = track?.querySelector<HTMLElement>('[data-slot="switch-thumb"]');
  const refraction = track && thumb ? createKnobRefraction(track, thumb, "switch") : undefined;
  const paintShape = () => {
    root.style.setProperty(
      "--lg-switch-lift-x",
      String((38 / 58 + (20 / 58) * raised) * (1 + stretch)),
    );
    root.style.setProperty(
      "--lg-switch-lift-y",
      String((24 / 38 + (14 / 38) * raised) / (1 + stretch)),
    );
    refraction?.update(raised);
  };
  const deformation = createVelocityDeformation(0.04, (value) => {
    stretch = value;
    paintShape();
  });
  const position = createSpring(initial, 1000, 80, (value) => {
    const pixels = value * travel();
    root.style.setProperty("--lg-switch-x", `${pixels}px`);
    deformation.sample(pixels);
    refraction?.update(raised);
  });
  const color = createSpring(initial, 1000, 80, (value) =>
    root.style.setProperty("--lg-switch-fill", String(unit(value))),
  );
  const lift = createSpring(0, 2000, 80, (value) => {
    raised = value;
    paintShape();
    root.style.setProperty("--lg-switch-face", String(1 - 0.91 * unit(value)));
  });
  [position, color, lift].forEach((spring) => spring.paint());
  let gesture: {
    id: number;
    x: number;
    y: number;
    from: number;
    moved: boolean;
    at: number;
    box: DOMRect;
    owner: HTMLElement;
  } | null = null;
  let ignoreClick = false;
  const sync = () => {
    position.set(checked() ? 1 : 0);
    color.set(checked() ? 1 : 0);
  };
  const observer = new MutationObserver(sync);
  observer.observe(root, {
    attributes: true,
    attributeFilter: ["aria-checked", "data-disabled", "data-readonly"],
  });
  const resize = new ResizeObserver(() => position.paint());
  if (control()) resize.observe(control()!);
  let rollback = 0;
  const settle = (next?: boolean) => {
    const old = gesture;
    gesture = null;
    lift.set(0);
    if (old?.owner.hasPointerCapture(old.id)) old.owner.releasePointerCapture(old.id);
    // Commit through Base UI's activation contract, including cancellation and forms.
    if (next !== undefined && next !== checked() && !blocked()) root.click();
    cancelAnimationFrame(rollback);
    rollback = requestAnimationFrame(sync);
    sync();
  };
  const down = (event: PointerEvent) => {
    const owner = control();
    if (
      !owner ||
      !(event.target instanceof Node) ||
      !owner.contains(event.target) ||
      !event.isPrimary ||
      event.button !== 0 ||
      blocked() ||
      event.defaultPrevented ||
      gesture
    )
      return;
    event.preventDefault();
    ignoreClick = false;
    gesture = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      from: checked() ? 1 : 0,
      moved: false,
      at: performance.now(),
      box: owner.getBoundingClientRect(),
      owner,
    };
    owner.setPointerCapture(event.pointerId);
    lift.set(1);
  };
  const move = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x;
    const dy = Math.abs(event.clientY - gesture.y);
    if (!held(gesture.at, gesture.moved) && dy > 10 && dy > Math.abs(dx) + 4) {
      ignoreClick = true;
      return settle();
    }
    if (!gesture.moved && Math.abs(dx) < 4) return;
    gesture.moved = true;
    const value = gesture.from + dx / travel();
    const overshoot = value < 0 ? value : value > 1 ? value - 1 : 0;
    position.set(unit(value) + overshoot / 22);
    color.set(value > 0.5 ? 1 : 0);
  };
  const up = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    ignoreClick = true;
    const { from, x, moved, box } = gesture;
    const near = event.clientY >= box.top - 24 && event.clientY <= box.bottom + 24;
    settle(moved ? from + (event.clientX - x) / travel() > 0.5 : near ? !checked() : undefined);
  };
  const cancel = () => {
    if (gesture) {
      ignoreClick = true;
      settle();
    }
  };
  const click = (event: MouseEvent) => {
    if (ignoreClick && event.detail > 0) {
      ignoreClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const keep = (event: TouchEvent) => {
    if (gesture && event.cancelable && held(gesture.at, gesture.moved)) event.preventDefault();
  };
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("blur", cancel);
  root.addEventListener("lostpointercapture", cancel);
  root.addEventListener("click", click, true);
  root.addEventListener("touchmove", keep, { passive: false });
  return () => {
    cancel();
    cancelAnimationFrame(rollback);
    observer.disconnect();
    resize.disconnect();
    [position, color, lift].forEach((spring) => spring.stop());
    deformation.stop();
    refraction?.destroy();
    window.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("blur", cancel);
    root.removeEventListener("lostpointercapture", cancel);
    root.removeEventListener("click", click, true);
    root.removeEventListener("touchmove", keep);
    for (const name of [
      "--lg-switch-x",
      "--lg-switch-fill",
      "--lg-switch-lift-x",
      "--lg-switch-lift-y",
      "--lg-switch-face",
    ])
      root.style.removeProperty(name);
  };
}

export function useSwitchRef(ref: Ref<HTMLElement> | undefined) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => (element ? present(element) : undefined), [element]);
  return useCallback(
    (node: HTMLElement | null) => {
      setElement(node);
      return assignRef(ref, node);
    },
    [ref],
  );
}
