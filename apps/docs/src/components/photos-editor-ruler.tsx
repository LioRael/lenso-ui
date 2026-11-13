import { useRef } from "react";
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { editor as s } from "../styles/photos-editor.stylex";

/** Relative pointer scrubbing, with Base UI retaining range and keyboard semantics. */
export function PhotosEditorRuler({
  label,
  value,
  min = -100,
  max = 100,
  onChange,
  onCommit,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  onCommit: () => void;
}) {
  const gesture = useRef<{ x: number; value: number; pointer: number } | null>(null);
  return (
    <div
      {...stylex.props(s.ruler)}
      onPointerDownCapture={(e) => {
        if (e.button !== 0 || !e.isPrimary) return;
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
        gesture.current = { x: e.clientX, value, pointer: e.pointerId };
        e.currentTarget
          .querySelector<HTMLElement>('input[type="range"], [role="slider"]')
          ?.focus({ preventScroll: true });
      }}
      onPointerMove={(e) => {
        const g = gesture.current;
        if (!g || g.pointer !== e.pointerId) return;
        e.preventDefault();
        onChange(Math.round(Math.max(min, Math.min(max, g.value + (g.x - e.clientX) / 2))));
      }}
      onPointerUp={(e) => {
        if (gesture.current?.pointer === e.pointerId) {
          gesture.current = null;
          onCommit();
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={() => {
        gesture.current = null;
        onCommit();
      }}
      onLostPointerCapture={() => {
        if (gesture.current) {
          gesture.current = null;
          onCommit();
        }
      }}
    >
      <div aria-hidden="true" {...stylex.props(s.rulerClip)}>
        <div
          {...stylex.props(s.ticks)}
          style={{ transform: `translateX(calc(-50% - ${(value - (min + max) / 2) * 2}px))` }}
        >
          {Array.from({ length: max - min + 1 }, (_, i) => min + i)
            .filter((v) => v % 5 === 0)
            .map((v) => (
              <span
                key={v}
                data-zero={v === 0 ? "" : undefined}
                {...stylex.props(s.tick, v % 25 === 0 && s.majorTick)}
              />
            ))}
        </div>
        <span {...stylex.props(s.rulerNeedle)} />
      </div>
      <Slider
        value={value}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0]! : v)}
        onValueCommit={onCommit}
        xstyle={s.semanticSlider}
      >
        <Slider.Label xstyle={s.hidden}>{label}</Slider.Label>
        <Slider.Control>
          <Slider.Thumb aria-label={label} xstyle={s.hidden} />
        </Slider.Control>
      </Slider>
    </div>
  );
}
