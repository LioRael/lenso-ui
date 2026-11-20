// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Adapted: UI SDK owns checked state; the source springs paint its visual state.
import type { Ref } from "react";
import { bindIndicator, createSpring } from "@lenso/glass/motion";
import { held } from "./hold.js";
import { useBindRef } from "./ref.js";
import { createKnobRefraction } from "../materials/control-lens.js";

const unit = (value: number) => Math.min(1, Math.max(0, value));

function present(root: HTMLElement) {
  const control = () => root.querySelector<HTMLElement>('[data-lenso-slot="switch-control"]');
  const checked = () => root.getAttribute("aria-checked") === "true";
  const blocked = () => root.matches('[data-disabled], [data-readonly], [aria-disabled="true"]');
  const travel = () => ((control()?.getBoundingClientRect().width ?? 64) / 64) * 22;
  const initial = checked() ? 1 : 0;
  const track = control();
  const thumb = track?.querySelector<HTMLElement>('[data-lenso-slot="switch-thumb"]');
  const refraction = track && thumb ? createKnobRefraction(track, thumb, "switch") : undefined;
  const indicator = bindIndicator(root, {
    property: "--lg-switch",
    stretch: 0.04,
    onPaint: ({ lift }) => refraction?.update(lift),
  });
  const position = createSpring(initial, 1000, 80, (value) => {
    const pixels = value * travel();
    root.style.setProperty("--lg-switch-x", `${pixels}px`);
    indicator.move(pixels);
  });
  const color = createSpring(initial, 1000, 80, (value) =>
    root.style.setProperty("--lg-switch-fill", String(unit(value))),
  );
  [position, color].forEach((spring) => spring.paint());
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
    indicator.lift(false);
    if (old?.owner.hasPointerCapture(old.id)) old.owner.releasePointerCapture(old.id);
    // Commit through UI SDK's activation contract, including cancellation and forms.
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
    indicator.lift(true);
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
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", up, true);
  window.addEventListener("pointercancel", cancel, true);
  window.addEventListener("blur", cancel);
  root.addEventListener("lostpointercapture", cancel);
  root.addEventListener("click", click, true);
  root.addEventListener("touchmove", keep, { passive: false });
  return () => {
    cancel();
    cancelAnimationFrame(rollback);
    observer.disconnect();
    resize.disconnect();
    [position, color].forEach((spring) => spring.stop());
    indicator.destroy();
    refraction?.destroy();
    window.removeEventListener("pointerdown", down);
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", up, true);
    window.removeEventListener("pointercancel", cancel, true);
    window.removeEventListener("blur", cancel);
    root.removeEventListener("lostpointercapture", cancel);
    root.removeEventListener("click", click, true);
    root.removeEventListener("touchmove", keep);
    for (const name of ["--lg-switch-x", "--lg-switch-fill"]) root.style.removeProperty(name);
  };
}

export function useSwitchRef(ref: Ref<HTMLElement> | undefined) {
  return useBindRef(ref, present);
}
