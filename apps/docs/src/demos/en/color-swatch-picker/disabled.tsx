"use client";
import { ColorSwatchPicker } from "@lenso/ui";
import { SourceSwatches } from "./source";
export function Disabled() {
  return (
    <ColorSwatchPicker aria-label="Color">
      <SourceSwatches disabled />
    </ColorSwatchPicker>
  );
}
