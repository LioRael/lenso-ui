"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { toastStyles as s } from "@lenso/tokens/toast";
import { bindPillMarquee } from "@lenso/glass/motion";
import { ScrollShadow } from "../scroll-shadow/scroll-shadow.js";

/** Native scrolling lets ScrollShadow own the fade at either end of the message. */
export function PillMarquee({ children }: { children: React.ReactNode }) {
  const viewport = React.useRef<HTMLDivElement>(null);
  const text = React.useRef<HTMLSpanElement>(null);
  React.useLayoutEffect(() => {
    const box = viewport.current!;
    const content = text.current!;
    return bindPillMarquee(box, content);
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
