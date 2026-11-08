"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface KbdStoryProps extends Pick<StoryComponentProps<typeof Kbd>, "variant"> {}
export const initialArgs: KbdStoryProps = /* story-args:start */ {
  variant: "default",
}; /* story-args:end */

import { Kbd } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";

export function Basic(overrides: KbdStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(s.row4)}>
      <Kbd {...args}>
        <Kbd.Abbr keyValue="command" />
        <Kbd.Content>K</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="shift" />
        <Kbd.Content>P</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="ctrl" />
        <Kbd.Content>C</Kbd.Content>
      </Kbd>
      <Kbd>
        <Kbd.Abbr keyValue="option" />
        <Kbd.Content>D</Kbd.Content>
      </Kbd>
    </div>
  );
}
