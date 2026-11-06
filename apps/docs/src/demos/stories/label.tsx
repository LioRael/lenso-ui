"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface LabelStoryProps extends Pick<StoryComponentProps<typeof Label>, "required"> {}
export const initialArgs: LabelStoryProps = /* story-args:start */ {
  required: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6, Apache-2.0.
import { Input, Label } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
import { demoStyles } from "../demo.stylex";

export function Basic(overrides: LabelStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const id = useId();
  return (
    <div {...stylex.props(demoStyles.column)}>
      <Label htmlFor={id} {...args}>
        Name
      </Label>
      <Input xstyle={demoStyles.field} id={id} placeholder="Enter your name" type="text" />
    </div>
  );
}
