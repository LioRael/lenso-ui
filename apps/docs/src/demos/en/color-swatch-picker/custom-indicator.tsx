"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { HeartFill } from "@gravity-ui/icons";
import { ColorSwatchPicker } from "@lenso/ui";
import { SourceSwatches } from "./source";
export function CustomIndicator() {
  return (
    <ColorSwatchPicker aria-label="Color">
      <SourceSwatches indicator={<HeartFill />} />
    </ColorSwatchPicker>
  );
}
