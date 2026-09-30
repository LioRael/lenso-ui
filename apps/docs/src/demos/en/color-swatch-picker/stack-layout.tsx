"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import { SourceSwatches } from "./source";
export function StackLayout() {
  return (
    <ColorSwatchPicker aria-label="Color" layout="stack">
      <SourceSwatches />
    </ColorSwatchPicker>
  );
}
