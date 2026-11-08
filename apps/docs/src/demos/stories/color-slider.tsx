"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorSliderStoryProps extends Pick<
  StoryComponentProps<typeof ColorSlider>,
  "disabled" | "orientation"
> {
  initialColor: string;
}
export const initialArgs: ColorSliderStoryProps = /* story-args:start */ {
  initialColor: "#ff0000",
  disabled: false,
  orientation: "horizontal",
}; /* story-args:end */

import { ColorSlider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ slider: { width: "100%", maxWidth: 320 } });
export function Basic(overrides: ColorSliderStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { initialColor, ...props } = args;
  return (
    <ColorSlider
      aria-label="Hue"
      channel="hue"
      colorSpace="hsl"
      xstyle={styles.slider}
      defaultValue={initialColor}
      {...props}
    >
      <span>Hue</span>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
