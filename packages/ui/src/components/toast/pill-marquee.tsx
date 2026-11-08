"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { toastStyles as s } from "@lenso/tokens/toast";
import { ScrollShadow } from "../scroll-shadow/scroll-shadow.js";

/** Native scrolling lets ScrollShadow own the fade at either end of the message. */
export function PillMarquee({ children }: { children: React.ReactNode }) {
  const viewport = React.useRef<HTMLDivElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    const box = viewport.current!;
    const content = text.current!;
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
  }, []);
  return (
    <ScrollShadow
      ref={viewport}
      render={<span />}
      orientation="horizontal"
      hideScrollBar
      size={12}
      xstyle={s.marquee}
    >
      <span ref={text} {...stylex.props(s.marqueeText)}>
        {children}
      </span>
    </ScrollShadow>
  );
}
