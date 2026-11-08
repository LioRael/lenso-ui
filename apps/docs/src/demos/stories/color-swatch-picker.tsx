"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorSwatchPickerStoryProps extends Pick<
  StoryComponentProps<typeof ColorSwatchPicker>,
  "disabled" | "required" | "readOnly" | "size" | "variant"
> {}
export const initialArgs: ColorSwatchPickerStoryProps = /* story-args:start */ {
  disabled: false,
  required: false,
  readOnly: false,
  size: "md",
  variant: "circle",
}; /* story-args:end */

import { ColorSwatchPicker } from "@lenso/ui";

const colors = ["#F43F5E", "#D946EF", "#8B5CF6", "#3B82F6", "#06B6D4", "#10B981", "#84CC16"];
export function Basic(overrides: ColorSwatchPickerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <ColorSwatchPicker aria-label="Choose a color" {...args}>
      {colors.map((color) => (
        <ColorSwatchPicker.Item key={color} color={color}>
          <ColorSwatchPicker.Swatch />
          <ColorSwatchPicker.Indicator />
        </ColorSwatchPicker.Item>
      ))}
    </ColorSwatchPicker>
  );
}
