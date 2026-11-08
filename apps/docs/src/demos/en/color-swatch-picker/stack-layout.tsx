"use client";
import { ColorSwatchPicker } from "@lenso/ui";
import { SourceSwatches } from "./source";
export function StackLayout() {
  return (
    <ColorSwatchPicker aria-label="Color" layout="stack">
      <SourceSwatches />
    </ColorSwatchPicker>
  );
}
