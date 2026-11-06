// Magnifier adaptation, copyright Kelvin Zhang; MIT.
// Adapted: opt-in props, arbitrary layout size, cancellation and reduced motion.
import { deformationSpring, velocityDeformation } from "./velocity-deformation.js";

export function glassMotion(element: HTMLElement, draggable: boolean, animated: boolean) {
  const parent = element.parentElement;
  if (!parent || (!draggable && !animated)) return () => {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const position = { x: 0, y: 0 },
    previous = { x: 0, y: 0 },
    velocity = { x: 0, y: 0 };
  const lift = { value: 0, speed: 0 },
    horizontal = { value: 0, speed: 0 },
    vertical = { value: 0, speed: 0 };
  const initial = {
    translate: element.style.translate,
    scale: element.style.scale,
    boxShadow: element.style.boxShadow,
  };
  let gesture: {
    id: number;
    x: number;
    y: number;
    left: number;
    top: number;
    startX: number;
    startY: number;
  } | null = null;
  let frame = 0,
    last = 0;
  const step = (s: typeof lift, target: number, dt: number) => {
    s.speed += (deformationSpring[0] * (target - s.value) - deformationSpring[1] * s.speed) * dt;
    s.value += s.speed * dt;
  };
  const paint = () => {
    element.style.translate = `${position.x}px ${position.y}px`;
    if (!animated || reduced.matches) {
      element.style.scale = initial.scale;
      element.style.boxShadow = initial.boxShadow;
      return;
    }
    const e = lift.value;
    element.style.scale = `${(1 + 0.016 * lift.speed) * (1 + horizontal.value) * (1 - vertical.value)} ${(0.8 + 0.2 * e) * (1 + vertical.value) * (1 - horizontal.value)}`;
    element.style.boxShadow = `${4 * e}px ${4 + 12 * e}px ${9 + 15 * e}px rgb(0 0 0 / ${0.16 + 0.06 * e}), inset ${2 * e}px ${2 + 6 * e}px 24px rgb(0 0 0 / ${0.2 + 0.07 * e}), inset ${-2 * e}px ${-2 - 6 * e}px 24px rgb(255 255 255 / ${0.2 + 0.07 * e})`;
  };
  const tick = (time: number) => {
    const dt = Math.min(1 / 30, (time - last) / 1000) || 1 / 60;
    last = time;
    velocity.x += ((position.x - previous.x) / dt - velocity.x) * Math.min(1, 20 * dt);
    velocity.y += ((position.y - previous.y) / dt - velocity.y) * Math.min(1, 20 * dt);
    Object.assign(previous, position);
    for (let i = 0; i < 4; i++) {
      step(lift, gesture ? 1 : 0, dt / 4);
      step(horizontal, velocityDeformation(velocity.x), dt / 4);
      step(vertical, velocityDeformation(velocity.y), dt / 4);
    }
    paint();
    frame =
      !gesture &&
      [lift, horizontal, vertical].every((s) => Math.abs(s.speed) < 0.001) &&
      Math.abs(lift.value) < 0.001 &&
      Math.abs(horizontal.value) + Math.abs(vertical.value) < 0.001
        ? 0
        : requestAnimationFrame(tick);
  };
  const start = () => {
    if (!animated || reduced.matches) {
      paint();
      return;
    }
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const down = (event: PointerEvent) => {
    if (
      !event.isPrimary ||
      event.button !== 0 ||
      event.defaultPrevented ||
      (event.target as Element).closest('button,a,input,select,textarea,[contenteditable="true"]')
    )
      return;
    const bounds = element.getBoundingClientRect();
    gesture = {
      id: event.pointerId,
      startX: position.x,
      startY: position.y,
      x: event.clientX,
      y: event.clientY,
      left: bounds.left + bounds.width / 2 - position.x,
      top: bounds.top + bounds.height / 2 - position.y,
    };
    element.setPointerCapture(event.pointerId);
    element.setAttribute("data-glass-dragging", "");
    start();
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id || !draggable) return;
    const bounds = parent.getBoundingClientRect();
    position.x = Math.max(
      bounds.left - gesture.left,
      Math.min(bounds.right - gesture.left, gesture.startX + event.clientX - gesture.x),
    );
    position.y = Math.max(
      bounds.top - gesture.top,
      Math.min(bounds.bottom - gesture.top, gesture.startY + event.clientY - gesture.y),
    );
    start();
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId !== gesture?.id) return;
    gesture = null;
    element.removeAttribute("data-glass-dragging");
    if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    start();
  };
  const cancel = () => {
    if (gesture && element.hasPointerCapture(gesture.id)) element.releasePointerCapture(gesture.id);
    gesture = null;
    element.removeAttribute("data-glass-dragging");
    cancelAnimationFrame(frame);
    frame = 0;
    for (const s of [lift, horizontal, vertical]) {
      s.value = 0;
      s.speed = 0;
    }
    paint();
  };
  paint();
  element.addEventListener("pointerdown", down);
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", end);
  element.addEventListener("pointercancel", end);
  element.addEventListener("lostpointercapture", end);
  window.addEventListener("blur", cancel);
  reduced.addEventListener("change", cancel);
  return () => {
    cancel();
    Object.assign(element.style, initial);
    element.removeEventListener("pointerdown", down);
    element.removeEventListener("pointermove", move);
    element.removeEventListener("pointerup", end);
    element.removeEventListener("pointercancel", end);
    element.removeEventListener("lostpointercapture", end);
    window.removeEventListener("blur", cancel);
    reduced.removeEventListener("change", cancel);
  };
}
