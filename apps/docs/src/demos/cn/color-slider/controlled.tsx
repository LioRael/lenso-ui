// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Controlled() {
  const [color, setColor] = useState(parseColor("hsl(200, 100%, 50%)"));
  return (
    <div {...stylex.props(styles.column, styles.xs)}>
      <ColorSlider channel="hue" value={color} onChange={setColor}>
        <ColorSlider.Label>色相</ColorSlider.Label>
        <ColorSlider.Output />
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
      <div {...stylex.props(styles.row2)}>
        <ColorSwatch color={color} size="sm" />
        <p {...stylex.props(styles.muted)}>
          当前颜色：<code {...stylex.props(styles.mono)}>{color.toString("hsl")}</code>
        </p>
      </div>
    </div>
  );
}
