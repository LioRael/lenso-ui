"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface SpinnerStoryProps extends Pick<
  StoryComponentProps<typeof Spinner>,
  "color" | "size"
> {}
export const initialArgs: SpinnerStoryProps = /* story-args:start */ {
  color: "secondary",
  size: "md",
}; /* story-args:end */

import { Spinner } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 16 } });

export function SpinnerBasic(overrides: SpinnerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.row)}>
      <Spinner {...args} />
    </div>
  );
}
