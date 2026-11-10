/** Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
 * Touch response adapted from onlymoein/liquidglass 89f8b736.
 * Adapted: presentation variables leave native activation and caller CSS intact.
 */
import { createSpring, prefersReducedMotion } from "./spring.js";
import { pointerPress, touchPress } from "./press-model.js";

interface Feel {
  grow: number;
  press: readonly [number, number];
  release: readonly [number, number];
}
const POINTER: Feel = pointerPress;
const TOUCH: Feel = touchPress;

export interface PressOptions {
  grow?: number;
  release?: readonly [number, number];
  touchRelease?: readonly [number, number];
}

export function press(
  element: HTMLElement,
  shouldStart?: (event: PointerEvent) => boolean,
  propertyPrefix = "--lg-press",
  options: PressOptions = {},
): () => void {
  const value = [1, 1, 0, 0];
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const paint = () => {
    element.style.setProperty(`${propertyPrefix}-scale`, `${value[0]} ${value[1]}`);
    element.style.setProperty(`${propertyPrefix}-translate`, `${value[2]}px ${value[3]}px`);
  };
  const springs = value.map((initial, index) =>
    createSpring(initial, ...POINTER.release, (next) => {
      value[index] = next;
      paint();
    }),
  );
  let pointer: {
    id: number;
    x: number;
    y: number;
    box: DOMRect;
    feel: Feel;
    editing: boolean;
    mouse: boolean;
  } | null = null;
  const target = (next: number[], [stiffness, damping]: readonly [number, number]) => {
    const reduced = prefersReducedMotion();
    springs.forEach((spring, index) => {
      spring.tune(stiffness, damping);
      spring.set(reduced ? (index < 2 ? 1 : 0) : (next[index] ?? 0), reduced);
    });
  };
  const track = (event: PointerEvent) => {
    if (!pointer) return;
    const { box, feel } = pointer;
    element.style.setProperty("--lg-x", `${((event.clientX - box.left) / box.width) * 100}%`);
    element.style.setProperty("--lg-y", `${((event.clientY - box.top) / box.height) * 100}%`);
    const base = 1 + (options.grow ?? feel.grow) / Math.max(box.width, box.height);
    const aspect = box.width / box.height;
    const dx = (event.clientX - pointer.x) / aspect;
    const dy = event.clientY - pointer.y;
    const length = Math.hypot(dx, dy);
    if (!length) return target([base, base, 0, 0], feel.press);
    const nx = dx / length;
    const ny = dy / length;
    const rubber = 1 - 1 / (1 + length / box.height / (5 * aspect));
    const stretch = 1 + (6 / box.height) * rubber * Math.abs(Math.abs(nx) - Math.abs(ny));
    const horizontal = Math.abs(nx) > Math.abs(ny);
    target(
      [
        base * (horizontal ? stretch : 1 / stretch),
        base * (horizontal ? 1 / stretch : stretch),
        nx * 8 * rubber,
        ny * 8 * rubber,
      ],
      feel.press,
    );
  };
  const move = (event: PointerEvent) => {
    // Native editing owns dragging for selection, scrolling and resize handles.
    // Keep press/release feedback without pulling the text under the pointer.
    if (event.pointerId !== pointer?.id) return;
    if (pointer.mouse && event.buttons === 0) return end(event);
    if (!pointer.editing) track(event);
  };
  const end = (event?: PointerEvent) => {
    if (event && event.pointerId !== pointer?.id) return;
    const feel = pointer?.feel ?? POINTER;
    pointer = null;
    element.removeAttribute("data-lenso-pressed");
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    target(
      [1, 1, 0, 0],
      (feel === TOUCH ? options.touchRelease : undefined) ?? options.release ?? feel.release,
    );
  };
  const down = (event: PointerEvent) => {
    if (
      (shouldStart && !shouldStart(event)) ||
      !event.isPrimary ||
      event.button !== 0 ||
      pointer ||
      element.matches(
        ':disabled, [data-disabled], [aria-disabled="true"], [data-pending], :has(input:disabled, textarea:disabled)',
      )
    )
      return;
    // Re-pressing during return must use the resting bounds, not compound the
    // enlargement and translation already presented by these springs.
    const box = element.getBoundingClientRect();
    const width = box.width / value[0]!;
    const height = box.height / value[1]!;
    const unitX = element.offsetWidth ? width / element.offsetWidth : 1;
    const unitY = element.offsetHeight ? height / element.offsetHeight : 1;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      box: new DOMRect(
        box.left + (box.width - width) / 2 - value[2]! * unitX,
        box.top + (box.height - height) / 2 - value[3]! * unitY,
        width,
        height,
      ),
      feel: event.pointerType === "mouse" ? POINTER : TOUCH,
      mouse: event.pointerType === "mouse",
      editing:
        event.target instanceof HTMLElement &&
        (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement ||
          event.target.isContentEditable),
    };
    element.setAttribute("data-lenso-pressed", "");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    track(event);
  };
  const reset = () => end();
  const visibility = () => {
    if (document.hidden) reset();
  };
  const motionChanged = () => {
    if (motion.matches) target([1, 1, 0, 0], POINTER.release);
  };
  element.addEventListener("pointerdown", down);
  element.addEventListener("lostpointercapture", end);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", reset);
  motion.addEventListener("change", motionChanged);
  return () => {
    end();
    springs.forEach((spring) => spring.stop());
    element.style.removeProperty(`${propertyPrefix}-scale`);
    element.style.removeProperty(`${propertyPrefix}-translate`);
    element.removeEventListener("pointerdown", down);
    element.removeEventListener("lostpointercapture", end);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("blur", reset);
    motion.removeEventListener("change", motionChanged);
    for (const name of [
      `${propertyPrefix}-scale`,
      `${propertyPrefix}-translate`,
      "--lg-x",
      "--lg-y",
    ])
      element.style.removeProperty(name);
  };
}
