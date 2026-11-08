"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface PopoverStoryProps extends Pick<
  StoryComponentProps<typeof Popover>,
  "defaultOpen"
> {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  arrow?: boolean;
}
export const initialArgs: PopoverStoryProps = /* story-args:start */ {
  defaultOpen: false,
  side: "bottom",
  align: "center",
  arrow: true,
}; /* story-args:end */

import * as stylex from "@stylexjs/stylex";
import { Button, Popover } from "@lenso/ui";
import { styles } from "../en/popover/styles";

export function PopoverBasic(overrides: PopoverStoryProps) {
  const { side, align, arrow, ...args } = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.row)}>
      <Popover {...args}>
        <Popover.Trigger render={<Button />}>Click me</Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side={side} align={align}>
            <Popover.Popup xstyle={styles.popup}>
              {arrow && <Popover.Arrow />}
              <Popover.Title>Popover Title</Popover.Title>
              <Popover.Description xstyle={styles.description}>
                This is the popover content. You can put any content here.
              </Popover.Description>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover>
    </div>
  );
}
