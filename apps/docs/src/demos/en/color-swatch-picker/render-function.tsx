"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Native RAC render state replaces DOM render interception. */
import { ColorSwatchPicker } from "@lenso/ui";
import { colors } from "./source";
export function RenderFunction() {
  return (
    <ColorSwatchPicker aria-label="Color" data-custom="foo">
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          {({ isSelected }) => (
            <>
              <ColorSwatchPicker.Swatch data-selected={isSelected || undefined} />
              <ColorSwatchPicker.Indicator />
            </>
          )}
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}
