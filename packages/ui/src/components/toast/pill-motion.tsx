"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { toastStyles as s } from "@lenso/tokens/toast";
import { bindPillSize, createPillTransition, prefersReducedMotion } from "@lenso/glass/motion";

export function usePillSize(enabled: boolean) {
  const measure = React.useRef<HTMLDivElement>(null);
  const motion = React.useRef<ReturnType<typeof bindPillSize>>(undefined);
  React.useLayoutEffect(() => {
    if (!enabled || !measure.current) return;
    const binding = bindPillSize(measure.current);
    motion.current = binding;
    return () => {
      binding?.destroy();
      motion.current = undefined;
    };
  }, [enabled]);
  React.useLayoutEffect(() => motion.current?.resize());
  return measure;
}

export function usePillTransition(
  measure: React.RefObject<HTMLDivElement | null>,
  phase: string | undefined,
  revision: number | undefined,
  enabled: boolean,
) {
  const overlay = React.useRef<HTMLDivElement>(null);
  const motion = React.useRef<ReturnType<typeof createPillTransition>>(undefined);
  React.useLayoutEffect(() => {
    if (!enabled || !measure.current || !overlay.current) return;
    const binding = createPillTransition(measure.current, overlay.current);
    motion.current = binding;
    return () => {
      binding.destroy();
      motion.current = undefined;
    };
  }, [enabled, measure]);
  React.useLayoutEffect(() => motion.current?.update(phase), [enabled, measure, phase, revision]);
  return overlay;
}

/** Only presentation content is duplicated; the native title/button stays mounted. */
export function PillSwap({
  children,
  identity = children,
  clip = false,
}: {
  children: React.ReactNode;
  identity?: unknown;
  clip?: boolean;
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
    <span {...stylex.props(s.swap, clip && s.pillTitleText)}>
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
