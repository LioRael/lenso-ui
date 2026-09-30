"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function Vertical() {
  return (
    <div {...stylex.props(styles.vertical)}>
      {(["hue", "saturation", "lightness"] as const).map((channel) => (
        <ColorSlider
          key={channel}
          aria-label={channel}
          channel={channel}
          defaultValue="hsl(0, 100%, 50%)"
          orientation="vertical"
        >
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      ))}
    </div>
  );
}
