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

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
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
