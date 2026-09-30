"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
export function ColorSwatchTransparency() {
  return (
    <div {...stylex.props(styles.row)}>
      {[1, 0.75, 0.5, 0.25, 0].map((alpha) => (
        <ColorSwatch
          key={alpha}
          aria-label={`${alpha * 100}% opacity`}
          color={`rgba(4, 133, 247, ${alpha})`}
        />
      ))}
    </div>
  );
}
