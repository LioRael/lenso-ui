"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ProgressBarStoryProps extends Pick<
  StoryComponentProps<typeof ProgressBar>,
  "size" | "color"
> {}
export const initialArgs: ProgressBarStoryProps = /* story-args:start */ {
  size: "md",
  color: "accent",
}; /* story-args:end */

import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ progress: { width: 256 } });

export function Basic(overrides: ProgressBarStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <ProgressBar aria-label="Loading" xstyle={styles.progress} value={60} {...args}>
      <ProgressBar.Label>Loading</ProgressBar.Label>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
