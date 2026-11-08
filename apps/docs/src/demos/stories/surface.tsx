"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface SurfaceStoryProps extends Pick<StoryComponentProps<typeof Surface>, "variant"> {}
export const initialArgs: SurfaceStoryProps = /* story-args:start */ {
  variant: "default",
}; /* story-args:end */

import { Surface } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../en/card/display.stylex";
import { surfaceDemoStyles } from "../en/surface/surface-demo.stylex";

export function Basic(overrides: SurfaceStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Surface xstyle={surfaceDemoStyles.panel} {...args}>
      <h3 {...stylex.props(s.textBase, s.semibold, s.foreground)}>Surface Content</h3>
      <p {...stylex.props(s.textSm, s.muted)}>
        The default surface shares its grouped background and corners with form sections and lists.
      </p>
    </Surface>
  );
}
