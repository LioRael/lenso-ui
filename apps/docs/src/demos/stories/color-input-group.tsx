"use client";
import type { ComponentProps } from "react";
import { ColorField, ColorInputGroup } from "@lenso/ui";
export interface ColorInputGroupStoryProps extends Pick<
  ComponentProps<typeof ColorInputGroup>,
  "variant" | "fullWidth"
> {}
export const initialArgs: ColorInputGroupStoryProps = /* story-args:start */ {
  variant: "primary",
  fullWidth: false,
}; /* story-args:end */

export function Preview(overrides: ColorInputGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <ColorField>
      <ColorField.Label>Color</ColorField.Label>
      <ColorField.Group {...args}>
        <ColorField.Input />
      </ColorField.Group>
    </ColorField>
  );
}
