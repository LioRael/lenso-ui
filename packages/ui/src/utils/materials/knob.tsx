"use client";
import * as stylex from "@stylexjs/stylex";
import { knobMaterialStyles as s } from "@lenso/tokens/materials";
import { useGlassRef } from "@lenso/glass/react";

/** Internal pressed-knob paint, separate from geometry and native interaction. */
export function KnobMaterial({
  kind,
  controlEdge = false,
}: {
  kind: "toggle" | "slider";
  controlEdge?: boolean;
}) {
  const ref = useGlassRef<HTMLSpanElement>(undefined, true);
  return (
    <>
      <span
        ref={ref}
        aria-hidden="true"
        data-knob-material={kind}
        {...stylex.props(
          s.layer,
          s[kind],
          controlEdge && s.controlEdge,
          controlEdge && kind === "slider" && s.sliderEdge,
        )}
      />
      <span aria-hidden="true" {...stylex.props(s.face)} />
    </>
  );
}
