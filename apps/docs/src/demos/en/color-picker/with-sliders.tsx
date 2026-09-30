"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorPicker, ColorSlider, ColorSwatch } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./source.stylex";
import { ColorDemoSelect } from "./source";
type Space = "hsb" | "hsl" | "rgb";
const channelProps = {
  hsb: [
    { colorSpace: "hsb", channel: "hue" },
    { colorSpace: "hsb", channel: "saturation" },
    { colorSpace: "hsb", channel: "brightness" },
    { colorSpace: "hsb", channel: "alpha" },
  ],
  hsl: [
    { colorSpace: "hsl", channel: "hue" },
    { colorSpace: "hsl", channel: "saturation" },
    { colorSpace: "hsl", channel: "lightness" },
    { colorSpace: "hsl", channel: "alpha" },
  ],
  rgb: [
    { colorSpace: "rgb", channel: "red" },
    { colorSpace: "rgb", channel: "green" },
    { colorSpace: "rgb", channel: "blue" },
    { colorSpace: "rgb", channel: "alpha" },
  ],
} as const;
export function WithSliders() {
  const [colorSpace, setColorSpace] = useState<Space>("hsl");
  return (
    <ColorPicker defaultValue="hsl(219, 58%, 93%)">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>Pick a color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover xstyle={styles.slidersPopover}>
        <ColorDemoSelect
          label="Color space"
          value={colorSpace}
          options={["hsb", "hsl", "rgb"]}
          onChange={setColorSpace}
          uppercase
        />
        <div {...stylex.props(styles.column2)}>
          {channelProps[colorSpace].map((props) => (
            <ColorSlider
              key={props.channel}
              {...props}
              aria-label={props.channel}
              xstyle={styles.slider}
            >
              <ColorSlider.Label xstyle={styles.capitalize}>{props.channel}</ColorSlider.Label>
              <ColorSlider.Output xstyle={styles.output} />
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
          ))}
        </div>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
