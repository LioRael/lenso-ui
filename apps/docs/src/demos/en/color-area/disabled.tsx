"use client";
import { ColorArea } from "@lenso/ui";
export function ColorAreaDisabled() {
  return (
    <ColorArea aria-label="Color area" isDisabled defaultValue="hsl(200, 100%, 50%)">
      <ColorArea.Thumb />
    </ColorArea>
  );
}
