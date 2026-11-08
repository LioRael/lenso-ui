"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ColorPickerStoryProps extends Pick<
  StoryComponentProps<typeof ColorPicker>,
  "defaultOpen"
> {
  initialColor: string;
}
export const initialArgs: ColorPickerStoryProps = /* story-args:start */ {
  initialColor: "#0485f7",
  defaultOpen: false,
}; /* story-args:end */

import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  area: { maxWidth: "100%" },
  slider: { gap: 4, paddingInline: 4 },
  output: { color: "var(--lenso-label-secondary)" },
});
export function Basic(overrides: ColorPickerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  const { initialColor, ...props } = args;
  return (
    <ColorPicker defaultValue={initialColor} {...props}>
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>Pick a color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorArea
          aria-label="Color area"
          xstyle={styles.area}
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="Hue" channel="hue" xstyle={styles.slider} colorSpace="hsb">
          <span>Hue</span>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
