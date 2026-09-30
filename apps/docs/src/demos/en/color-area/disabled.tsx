"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea } from "@lenso/ui";
export function ColorAreaDisabled() {
  return (
    <ColorArea aria-label="Color area" isDisabled defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}
