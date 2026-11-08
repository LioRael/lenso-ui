"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ProgressCircleStoryProps extends Pick<
  StoryComponentProps<typeof ProgressCircle>,
  "size" | "color"
> {}
export const initialArgs: ProgressCircleStoryProps = /* story-args:start */ {
  size: "md",
  color: "accent",
}; /* story-args:end */

import { ProgressCircle } from "@lenso/ui";

export function Basic(overrides: ProgressCircleStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <ProgressCircle aria-label="Loading" value={60} {...args}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}
