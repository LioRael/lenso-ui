"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface MeterStoryProps extends Pick<
  StoryComponentProps<typeof Meter>,
  "value" | "size" | "color"
> {}
export const initialArgs: MeterStoryProps = /* story-args:start */ {
  value: 60,
  size: "md",
  color: "accent",
}; /* story-args:end */

import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ meter: { width: 256 } });

export function Basic(overrides: MeterStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Meter aria-label="Storage" xstyle={styles.meter} {...args}>
      <Meter.Label>Storage</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
