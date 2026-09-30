"use client";

import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  area: { maxWidth: "100%" },
  slider: { gap: 4, paddingInline: 4 },
  output: { color: "var(--muted)" },
});
export function Basic() {
  return (
    <ColorPicker defaultValue="#0485F7">
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
