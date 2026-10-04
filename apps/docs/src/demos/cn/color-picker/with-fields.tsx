// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
import { ColorDemoSelect } from "../../en/color-picker/source";
type Space = "hsb" | "hsl" | "rgb";
const channels = {
  hsb: ["hue", "saturation", "brightness"],
  hsl: ["hue", "saturation", "lightness"],
  rgb: ["red", "green", "blue"],
} as const;
export function WithFields() {
  const [colorSpace, setColorSpace] = useState<Space>("hsl");
  return (
    <ColorPicker defaultValue="hsla(220, 90%, 50%, 0.8)">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>选择颜色</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover xstyle={styles.narrowPopover}>
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
          <ColorSlider.Label>色相</ColorSlider.Label>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <ColorDemoSelect
          label="色彩空间"
          value={colorSpace}
          options={["hsb", "hsl", "rgb"]}
          onChange={setColorSpace}
          uppercase
        />
        <div {...stylex.props(styles.channelGrid)}>
          {channels[colorSpace].map((channel) => (
            <ColorField
              key={channel}
              aria-label={channel}
              channel={channel}
              colorSpace={colorSpace}
            >
              <ColorField.Group variant="secondary">
                <ColorField.Input />
              </ColorField.Group>
            </ColorField>
          ))}
        </div>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
