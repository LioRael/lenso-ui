"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface SurfaceStoryProps extends Pick<StoryComponentProps<typeof Surface>, "variant"> {}
export const initialArgs: SurfaceStoryProps = /* story-args:start */ {
  variant: "default",
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Surface } from "@lenso/ui";

import { s } from "../en/card/display.stylex";
import * as stylex from "@stylexjs/stylex";
const surfaceDemoStyles = stylex.create({ panel: { padding: 16, minWidth: 160 } });

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
