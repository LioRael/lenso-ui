"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ToggleButtonStoryProps extends Pick<
  StoryComponentProps<typeof ToggleButton>,
  "disabled" | "defaultPressed" | "size" | "variant"
> {}
export const initialArgs: ToggleButtonStoryProps = /* story-args:start */ {
  disabled: false,
  defaultPressed: false,
  size: "md",
  variant: "default",
}; /* story-args:end */

import { Heart } from "@gravity-ui/icons";
import { ToggleButton } from "@lenso/ui";

export function Basic(overrides: ToggleButtonStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <ToggleButton {...args}>
      <ToggleButton.Icon>
        <Heart />
      </ToggleButton.Icon>
      Like
    </ToggleButton>
  );
}
