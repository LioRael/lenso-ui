"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function RGBChannels() {
  const [color, setColor] = useState(parseColor("rgb(255, 100, 50)"));
  return (
    <div {...stylex.props(styles.column, styles.xs)}>
      {(["red", "green", "blue"] as const).map((channel) => (
        <ColorSlider key={channel} channel={channel} value={color} onChange={setColor}>
          <ColorSlider.Label xstyle={styles.capitalize}>{channel}</ColorSlider.Label>
          <ColorSlider.Output />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      ))}
      <div {...stylex.props(styles.row2)}>
        <ColorSwatch color={color} size="sm" />
        <p {...stylex.props(styles.muted)}>
          Current color: <code {...stylex.props(styles.mono)}>{color.toString("rgb")}</code>
        </p>
      </div>
    </div>
  );
}
