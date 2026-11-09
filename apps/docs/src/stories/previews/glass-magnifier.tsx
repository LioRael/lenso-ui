"use client";
import { GlassMagnifier } from "@lenso/ui";
import type { GlassStoryProps } from "./glass";
import { s } from "./materials.stylex";
export interface GlassMagnifierStoryProps extends GlassStoryProps {
  draggable: boolean;
  animated: boolean;
}
export function GlassMagnifierStory({
  width,
  height,
  radius,
  label,
  draggable,
  animated,
}: GlassMagnifierStoryProps) {
  return (
    <GlassMagnifier
      draggable={draggable}
      animated={animated}
      xstyle={s.glass(width, height, radius)}
    >
      {label}
    </GlassMagnifier>
  );
}
