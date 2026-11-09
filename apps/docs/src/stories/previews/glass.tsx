"use client";
import { Glass } from "@lenso/ui";
import { s } from "./materials.stylex";
export interface GlassStoryProps {
  width: number;
  height: number;
  radius: number;
  label: string;
}
export function GlassStory({ width, height, radius, label }: GlassStoryProps) {
  return <Glass xstyle={s.glass(width, height, radius)}>{label}</Glass>;
}
