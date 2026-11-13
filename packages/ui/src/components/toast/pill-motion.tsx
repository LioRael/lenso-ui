"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { toastStyles as s } from "@lenso/tokens/toast";
import { createSpring, prefersReducedMotion } from "@lenso/glass/motion";

/** Resize the surface, leaving its live text and native controls at their natural scale. */
export function usePillSize(enabled: boolean) {
  const measure = React.useRef<HTMLDivElement>(null);
  const update = React.useRef<(() => void) | null>(null);
  React.useLayoutEffect(() => {
    const content = measure.current;
    const root = content?.parentElement?.parentElement;
    if (!enabled || !content || !root) return;
    const viewport =
      root.closest<HTMLElement>('[data-lenso-slot="toast-viewport"]') ?? root.parentElement;
    const constrain = () => {
      if (viewport)
        content.style.setProperty("--toast-pill-available", `${viewport.clientWidth}px`);
    };
    constrain();
    const dimensions = ["width", "height"] as const;
    const size = () => [content.offsetWidth, content.offsetHeight];
    const springs = size().map((value, index) =>
      createSpring(value, 480, 38, (next) => {
        root.style.setProperty(`--toast-pill-${dimensions[index]}`, `${next}px`);
      }),
    );
    springs.forEach((spring) => spring.paint());
    const resize = () => {
      constrain();
      size().forEach((value, index) => springs[index]!.set(value));
    };
    update.current = resize;
    let frame: number | null = null;
    const observer = new ResizeObserver(() => {
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
    return () => {
      update.current = null;
      observer.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      reduced.removeEventListener("change", resize);
      springs.forEach((spring) => spring.stop());
      dimensions.forEach((dimension) => root.style.removeProperty(`--toast-pill-${dimension}`));
    };
  }, [enabled]);
  React.useLayoutEffect(() => {
    update.current?.();
  });
  return measure;
}

/** An inert presentation snapshot lets removed actions fade without retaining live controls. */
export function usePillTransition(
  measure: React.RefObject<HTMLDivElement | null>,
  phase: string | undefined,
  revision: number | undefined,
  enabled: boolean,
) {
  const overlay = React.useRef<HTMLDivElement>(null);
  const previous = React.useRef<HTMLElement | null>(null);
  const previousPhase = React.useRef(phase);
  React.useLayoutEffect(() => {
    const content = measure.current;
    const layer = overlay.current;
    if (!enabled || !content || !layer) {
      previous.current = null;
      return;
    }
    const outgoing = previousPhase.current === phase ? null : previous.current;
    previousPhase.current = phase;
    const snapshot = content.cloneNode(true) as HTMLElement;
    snapshot.querySelectorAll("[inert]").forEach((node) => node.remove());
    snapshot.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    snapshot.style.width = `${content.offsetWidth}px`;
    const paint = getComputedStyle(content);
    for (const variable of ["--toast-title-color", "--toast-indicator-color"])
      snapshot.style.setProperty(variable, paint.getPropertyValue(variable));
    previous.current = snapshot;
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
    const finish = () => {
      outgoing.remove();
      entering.cancel();
      leaving.cancel();
    };
    entering.onfinish = finish;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (reduced.matches) finish();
    };
    reduced.addEventListener("change", settle);
    return () => {
      finish();
      reduced.removeEventListener("change", settle);
    };
  }, [enabled, phase, revision, measure]);
  return overlay;
}

/** Only presentation content is duplicated; the native title/button stays mounted. */
export function PillSwap({
  children,
  identity = children,
}: {
  children: React.ReactNode;
  identity?: unknown;
}) {
  const [snapshot, setSnapshot] = React.useState({
    identity,
    children,
    previous: null as React.ReactNode,
  });
  if (snapshot.identity !== identity) {
    setSnapshot({ identity, children, previous: snapshot.children });
  }
  const current = React.useRef<HTMLSpanElement>(null);
  const previous = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    if (snapshot.previous == null || !current.current) return;
    if (prefersReducedMotion()) {
      if (previous.current) previous.current.hidden = true;
      return;
    }
    if (previous.current) previous.current.hidden = false;
    const distance = "6px";
    const options = {
      duration: 280,
      easing: "cubic-bezier(.2,.8,.2,1)",
      fill: "both" as const,
    };
    const entering = current.current.animate(
      [
        { opacity: 0, transform: `translateY(${distance})`, filter: "blur(3px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
      ],
      options,
    );
    const leaving = previous.current?.animate(
      [
        { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" },
        { opacity: 0, transform: `translateY(-${distance})`, filter: "blur(3px)" },
      ],
      options,
    );
    entering.onfinish = () => setSnapshot((value) => ({ ...value, previous: null }));
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const settle = () => {
      if (reduced.matches) {
        entering.cancel();
        leaving?.cancel();
        setSnapshot((value) => ({ ...value, previous: null }));
      }
    };
    reduced.addEventListener("change", settle);
    return () => {
      reduced.removeEventListener("change", settle);
      entering.cancel();
      leaving?.cancel();
    };
  }, [snapshot.identity, snapshot.previous]);
  return (
    <span {...stylex.props(s.swap)}>
      {snapshot.previous != null && (
        <span ref={previous} aria-hidden="true" inert {...stylex.props(s.swapPrevious)}>
          {snapshot.previous}
        </span>
      )}
      <span ref={current} {...stylex.props(s.swapCurrent)}>
        {children}
      </span>
    </span>
  );
}
