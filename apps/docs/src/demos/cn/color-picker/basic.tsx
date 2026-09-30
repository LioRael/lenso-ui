// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ColorArea, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  area: {
    maxWidth: "100%",
  },
  slider: {
    gap: 4,
    paddingInline: 4,
  },
  output: {
    color: "var(--muted)",
  },
});
export function Basic() {
  return (
    <ColorPicker defaultValue="#0485F7">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>选择颜色</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorArea
          aria-label="取色区域"
          xstyle={styles.area}
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="色相" channel="hue" xstyle={styles.slider} colorSpace="hsb">
          <span>色相</span>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
