"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ToolbarStoryProps extends Pick<
  StoryComponentProps<typeof Toolbar>,
  "disabled" | "orientation" | "loopFocus"
> {
  navigation?: boolean;
}
export const initialArgs: ToolbarStoryProps = /* story-args:start */ {
  disabled: false,

  orientation: "horizontal",
  loopFocus: false,
}; /* story-args:end */

import { NavigationToolbar } from "./toolbar-navigation";
import { Toolbar } from "@lenso/ui";
export function Basic(overrides: ToolbarStoryProps) {
  const { navigation, ...args } = { ...initialArgs, ...overrides };
  if (navigation) return <NavigationToolbar {...args} />;
  return (
    <Toolbar aria-label="Editor tools" {...args}>
      <Toolbar.Button>Undo</Toolbar.Button>
      <Toolbar.Button>Redo</Toolbar.Button>
    </Toolbar>
  );
}
