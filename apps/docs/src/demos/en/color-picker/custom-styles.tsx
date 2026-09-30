"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
export function CustomStyles() {
  return (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger xstyle={styles.trigger}>
        <ColorSwatch size="lg" />
        <span {...stylex.props(styles.label)}>Theme color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover xstyle={styles.surface}>
        <ColorArea
          aria-label="Color area"
          xstyle={styles.area}
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider channel="hue" xstyle={styles.slider} colorSpace="hsb">
          <ColorSlider.Label>Hue</ColorSlider.Label>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
