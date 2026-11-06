"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorSwatchStoryProps extends Pick<
  StoryComponentProps<typeof ColorSwatch>,
  "size"
> {
  color: string;
}
export const initialArgs: ColorSwatchStoryProps = /* story-args:start */ {
  color: "#0485f7",
  size: "md",
}; /* story-args:end */

import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ row: { display: "flex", alignItems: "center", gap: 12 } });
export function ColorSwatchBasic(overrides: ColorSwatchStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <div {...stylex.props(styles.row)}>
      <ColorSwatch aria-label="Blue" {...args} />
      <ColorSwatch aria-label="Red" />
      <ColorSwatch aria-label="Amber" />
      <ColorSwatch aria-label="Green" />
      <ColorSwatch aria-label="Fuchsia" />
    </div>
  );
}
