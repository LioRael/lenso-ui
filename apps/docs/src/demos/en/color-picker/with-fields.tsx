"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea, ColorField, ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
import { ColorDemoSelect } from "./source";
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
        <span>Pick a color</span>
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
          <ColorSlider.Label>Hue</ColorSlider.Label>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <ColorDemoSelect
          label="Color space"
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
