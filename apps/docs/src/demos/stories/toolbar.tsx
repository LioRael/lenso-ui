"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ToolbarStoryProps extends Pick<
  StoryComponentProps<typeof Toolbar>,
  "disabled" | "orientation" | "loopFocus" | "elastic"
> {
  navigation?: boolean;
}
export const initialArgs: ToolbarStoryProps = /* story-args:start */ {
  disabled: false,
  elastic: true,
  orientation: "horizontal",
  loopFocus: false,
}; /* story-args:end */

import { Toolbar } from "@lenso/ui";
import { NavigationToolbar } from "@/stories/navigation-toolbar";
import { Basic as ToolbarExample } from "../en/toolbar/source";
export function Basic(overrides: ToolbarStoryProps) {
  const { navigation, ...props } = overrides;
  if (navigation)
    return (
      <NavigationToolbar
        disabled={props.disabled}
        elastic={props.elastic}
        loopFocus={props.loopFocus}
      />
    );
  return <ToolbarExample {...initialArgs} {...props} />;
}
