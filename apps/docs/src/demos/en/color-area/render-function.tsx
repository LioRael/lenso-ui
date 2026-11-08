"use client";
// Native RAC render state replaces DOM render interception.
import { ColorArea } from "@lenso/ui";
export function RenderFunction() {
  return (
    <ColorArea aria-label="Color area" defaultValue="rgb(116, 52, 255)" data-custom="slider">
      {({ isDisabled }) => (
        <ColorArea.Thumb data-custom="thumb" data-disabled={isDisabled || undefined} />
      )}
    </ColorArea>
  );
}
