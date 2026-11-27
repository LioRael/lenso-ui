import { createSpring, prefersReducedMotion } from "./spring.js";

/** Compensate live controls so they follow the surface while intrinsic content resizes. */
export function bindPillSize(content: HTMLElement) {
  const root = content.parentElement?.parentElement;
  if (!root) return;
  const viewport =
    root.closest<HTMLElement>('[data-lenso-slot="toast-viewport"]') ?? root.parentElement;
  let available = Infinity;
  const constrain = () => {
    available = viewport?.clientWidth ?? Infinity;
    if (viewport) content.style.setProperty("--toast-pill-available", `${available}px`);
  };
  constrain();
  const dimensions = ["width", "height"] as const;
  const size = () => [content.offsetWidth, content.offsetHeight];
  let target = size();
  let inlineSize = target[0]!;
  const anchorControls = () =>
    root.style.setProperty(
      "--toast-pill-inline-offset",
      `${Math.min(inlineSize, available) - target[0]!}px`,
    );
  const springs = target.map((value, index) =>
    createSpring(value, 480, 38, (next) => {
      root.style.setProperty(`--toast-pill-${dimensions[index]}`, `${next}px`);
      if (index === 0) {
        inlineSize = next;
        anchorControls();
      }
    }),
  );
  springs.forEach((spring) => spring.paint());
  const resize = () => {
    constrain();
    target = size();
    target.forEach((value, index) => springs[index]!.set(value));
    springs[0]!.paint();
  };
  let frame: number | null = null;
  const observer = new ResizeObserver(() => {
    // Compensate live controls before paint; the size spring starts next frame.
    available = viewport?.clientWidth ?? Infinity;
    target = size();
    anchorControls();
    // Reduced-motion springs paint synchronously; defer writes outside observer delivery.
    if (frame !== null) return;
    frame = requestAnimationFrame(() => {
      frame = null;
      resize();
    });
  });
  observer.observe(content);
  if (viewport) observer.observe(viewport);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  reduced.addEventListener("change", resize);
  const destroy = () => {
    observer.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    reduced.removeEventListener("change", resize);
    springs.forEach((spring) => spring.stop());
    dimensions.forEach((dimension) => root.style.removeProperty(`--toast-pill-${dimension}`));
    root.style.removeProperty("--toast-pill-inline-offset");
    content.style.removeProperty("--toast-pill-available");
  };
  return { resize, destroy };
}

export function createPillTransition(content: HTMLElement, layer: HTMLElement) {
  let previous: HTMLElement | undefined;
  let phase: string | undefined;
  let cancel: (() => void) | undefined;
  return {
    update(nextPhase: string | undefined) {
      cancel?.();
      cancel = undefined;
      const outgoing = phase === nextPhase ? undefined : previous;
      phase = nextPhase;
      const snapshot = content.cloneNode(true) as HTMLElement;
      snapshot.querySelectorAll("[inert]").forEach((node) => node.remove());
      snapshot.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
      snapshot.style.width = `${content.offsetWidth}px`;
      const paint = getComputedStyle(content);
      for (const variable of ["--toast-title-color", "--toast-indicator-color"])
        snapshot.style.setProperty(variable, paint.getPropertyValue(variable));
      previous = snapshot;

      if (!outgoing || prefersReducedMotion()) return;
      layer.append(outgoing);
      const options = { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" as const };
      const leaving = outgoing.animate(
        [
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
          { opacity: 0, filter: "blur(3px)", transform: "translateY(-5px)" },
        ],
        options,
      );
      const entering = content.animate(
        [
          { opacity: 0, filter: "blur(3px)", transform: "translateY(5px)" },
          { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
        ],
        options,
      );
      const reduced = matchMedia("(prefers-reduced-motion: reduce)");
      const settle = () => {
        if (reduced.matches) finish();
      };
      const finish = () => {
        outgoing.remove();
        entering.cancel();
        leaving.cancel();
        reduced.removeEventListener("change", settle);
      };
      entering.onfinish = finish;
      reduced.addEventListener("change", settle);
      cancel = finish;
    },
    destroy() {
      cancel?.();
      previous = undefined;
    },
  };
}

export function bindPillMarquee(box: HTMLElement, content: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    box.scrollLeft = 0;
    const distance = Math.max(0, box.scrollWidth - box.clientWidth);
    if (!distance || reduced.matches) return;
    const sign = getComputedStyle(box).direction === "rtl" ? -1 : 1;
    const travel = Math.max(600, (distance / 28) * 1000);
    const cycle = 2 * (1200 + travel);
    const started = performance.now();
    const tick = (now: number) => {
      const phase = (now - started) % cycle;
      const forward = Math.min(1, Math.max(0, (phase - 1200) / travel));
      const backward = Math.min(1, Math.max(0, (phase - travel - 2400) / travel));
      box.scrollLeft = sign * distance * (forward - backward);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  };
  const observer = new ResizeObserver(update);
  observer.observe(box);
  observer.observe(content);
  reduced.addEventListener("change", update);
  update();
  return () => {
    observer.disconnect();
    reduced.removeEventListener("change", update);
    cancelAnimationFrame(frame);
  };
}
