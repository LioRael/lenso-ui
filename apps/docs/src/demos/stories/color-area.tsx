"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorAreaStoryProps extends Pick<
  StoryComponentProps<typeof ColorArea>,
  "disabled" | "orientation"
> {
  initialColor: string;
}
export const initialArgs: ColorAreaStoryProps = /* story-args:start */ {
  initialColor: "#7434ff",
  disabled: false,
  orientation: "horizontal",
}; /* story-args:end */

import { ColorArea } from "@lenso/ui";

export function ColorAreaBasic(overrides: ColorAreaStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { initialColor, ...props } = args;
  return (
    <ColorArea aria-label="Color area" defaultValue={initialColor} {...props}>
      <ColorArea.Thumb />
    </ColorArea>
  );
}
