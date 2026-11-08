"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ChipStoryProps extends Pick<
  StoryComponentProps<typeof Chip>,
  "color" | "size" | "variant"
> {}
export const initialArgs: ChipStoryProps = /* story-args:start */ {
  color: "default",
  size: "md",
  variant: "secondary",
}; /* story-args:end */

import { Chip } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function ChipBasic(overrides: ChipStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(s.wrap3)}>
      <Chip {...args}>Default</Chip>
      <Chip color="accent">Accent</Chip>
      <Chip color="success">Success</Chip>
      <Chip color="warning">Warning</Chip>
      <Chip color="danger">Danger</Chip>
    </div>
  );
}
