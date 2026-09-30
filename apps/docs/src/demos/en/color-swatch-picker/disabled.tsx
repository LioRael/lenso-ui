"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import { SourceSwatches } from "./source";
export function Disabled() {
  return (
    <ColorSwatchPicker aria-label="Color">
      <SourceSwatches disabled />
    </ColorSwatchPicker>
  );
}
