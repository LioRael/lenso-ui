"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import type { ReactNode } from "react";
export const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];
export function SourceSwatches({
  disabled = false,
  indicator,
}: {
  disabled?: boolean;
  indicator?: ReactNode;
}) {
  return colors.map((color) => (
    <ColorSwatchPicker.Item key={color} color={color} isDisabled={disabled}>
      <ColorSwatchPicker.Swatch />
      <ColorSwatchPicker.Indicator>{indicator}</ColorSwatchPicker.Indicator>
    </ColorSwatchPicker.Item>
  ));
}
