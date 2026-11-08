"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ToggleButtonGroupStoryProps extends Pick<
  StoryComponentProps<typeof ToggleButtonGroup>,
  "multiple" | "disabled" | "orientation" | "loopFocus" | "size" | "variant" | "fullWidth"
> {
  glass?: boolean;
}
export const initialArgs: ToggleButtonGroupStoryProps = /* story-args:start */ {
  multiple: true,
  disabled: false,
  orientation: "horizontal",
  loopFocus: false,
  size: "md",
  variant: "bordered",
  fullWidth: false,
}; /* story-args:end */

import { Bold, Italic, Strikethrough, Underline } from "@gravity-ui/icons";
import {
  ToggleButton as ContentToggleButton,
  GlassToggleButton,
  ToggleButtonGroup,
} from "@lenso/ui";

export function Basic(overrides: ToggleButtonGroupStoryProps) {
  const { glass = false, ...args } = { ...initialArgs, ...overrides };
  const ToggleButton = glass ? GlassToggleButton : ContentToggleButton;
  return (
    <ToggleButtonGroup aria-label="Text formatting" {...args}>
      <ToggleButton isIconOnly aria-label="Bold" value="bold">
        <ToggleButton.Icon>
          <Bold />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Italic" value="italic">
        <ToggleButton.Icon>
          <Italic />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Underline" value="underline">
        <ToggleButton.Icon>
          <Underline />
        </ToggleButton.Icon>
      </ToggleButton>
      <ToggleButton isIconOnly aria-label="Strikethrough" value="strikethrough">
        <ToggleButton.Icon>
          <Strikethrough />
        </ToggleButton.Icon>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
