"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea, ColorSwatch, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ColorAreaControlled() {
  const [color, setColor] = useState(parseColor("#9B80FF"));
  return (
    <div {...stylex.props(styles.column)}>
      <ColorArea
        aria-label="Color area"
        colorSpace="rgb"
        value={color}
        xChannel="red"
        yChannel="green"
        onChange={setColor}
      >
        <ColorArea.Thumb />
      </ColorArea>
      <div {...stylex.props(styles.row, styles.width300)}>
        <ColorSwatch color={color} size="md" />
        <p {...stylex.props(styles.muted)}>
          Current color: <span {...stylex.props(styles.medium)}>{color.toString("hex")}</span>
        </p>
      </div>
    </div>
  );
}
