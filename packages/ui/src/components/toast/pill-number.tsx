"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { toastStyles as s } from "@lenso/tokens/toast";
import { createSpring } from "@lenso/glass/motion";

function Digit({
  digit,
  visible,
  direction,
}: {
  digit: number;
  visible: boolean;
  direction: number;
}) {
  const [frame, setFrame] = React.useState({ digit, target: 0, rows: [{ at: 0, digit }] });
  if (frame.digit !== digit) {
    const target = frame.target + direction;
    setFrame({
      digit,
      target,
      rows: [...frame.rows.filter((row) => row.at !== target), { at: target, digit }],
    });
  }
  const element = React.useRef<HTMLSpanElement>(null);
  const latest = React.useRef(frame);
  const initialPresence = React.useRef(visible ? 1 : 0);
  const motion = React.useRef<ReturnType<typeof createSpring> | null>(null);
  const presence = React.useRef<ReturnType<typeof createSpring> | null>(null);
  React.useLayoutEffect(() => {
    const node = element.current!;
    const paint = (position: number) => {
      for (const row of node.children) {
        const glyph = row as HTMLElement;
        const distance = Number(glyph.dataset["row"]) - position;
        glyph.style.transform = `translateY(${distance * 100}%)`;
        glyph.style.opacity = String(Math.max(0, 1 - Math.abs(distance)));
        glyph.style.filter = `blur(${Math.min(2, Math.abs(distance) * 1.5)}px)`;
      }
      if (Math.abs(position - latest.current.target) < 0.0001) {
        setFrame((state) =>
          state.rows.length > 1
            ? { ...state, rows: state.rows.filter((row) => row.at === state.target) }
            : state,
        );
      }
    };
    motion.current = createSpring(latest.current.target, 900, 48, paint);
    presence.current = createSpring(initialPresence.current, 900, 48, (value) => {
      node.style.setProperty("--toast-digit-presence", String(Math.max(0, Math.min(1, value))));
    });
    motion.current.paint();
    presence.current.paint();
    return () => {
      motion.current?.stop();
      presence.current?.stop();
    };
  }, []);
  React.useLayoutEffect(() => {
    latest.current = frame;
    const settle = () => {
      motion.current?.set(frame.target);
      motion.current?.paint();
      presence.current?.set(visible ? 1 : 0);
    };
    settle();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    reduced.addEventListener("change", settle);
    return () => reduced.removeEventListener("change", settle);
  }, [frame, visible]);
  return (
    <span ref={element} {...stylex.props(s.digit)}>
      {frame.rows.map((row) => (
        <span key={row.at} data-row={row.at} {...stylex.props(s.digitRow)}>
          {row.digit}
        </span>
      ))}
    </span>
  );
}

/** Columns keep their spring position and velocity when another progress value arrives. */
export function PillNumber({ value }: { value: number }) {
  const [trend, setTrend] = React.useState({ value, direction: 1 });
  if (value !== trend.value) setTrend({ value, direction: value > trend.value ? 1 : -1 });
  return (
    <span {...stylex.props(s.number)}>
      {[100, 10, 1].map((place) => (
        <Digit
          key={place}
          digit={Math.floor(value / place) % 10}
          visible={place === 1 || value >= place}
          direction={trend.direction}
        />
      ))}
    </span>
  );
}
