"use client";
import { ColorArea } from "@lenso/ui";
export function RenderFunction() {
  return (
    <ColorArea aria-label="Color area" defaultValue="rgb(116, 52, 255)" data-custom="slider">
      {({ disabled }) => (
        <ColorArea.Thumb data-custom="thumb" data-disabled={disabled || undefined} />
      )}
    </ColorArea>
  );
}
