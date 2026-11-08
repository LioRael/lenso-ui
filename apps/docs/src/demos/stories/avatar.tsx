"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface AvatarStoryProps extends Pick<
  StoryComponentProps<typeof Avatar>,
  "size" | "color" | "variant"
> {}
export const initialArgs: AvatarStoryProps = /* story-args:start */ {
  size: "md",
  color: "default",
  variant: "default",
}; /* story-args:end */

import { Avatar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function Basic(overrides: AvatarStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(s.row4)}>
      <Avatar {...args}>
        <Avatar.Image alt="John Doe" src="/assets/demo/avatars/purple.svg" />
        <Avatar.Fallback>JD</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Image alt="Blue" src="/assets/demo/avatars/blue.svg" />
        <Avatar.Fallback>B</Avatar.Fallback>
      </Avatar>
      <Avatar>
        <Avatar.Fallback>JR</Avatar.Fallback>
      </Avatar>
    </div>
  );
}
