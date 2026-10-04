// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function ColorSwatchTransparency() {
  return (
    <div {...stylex.props(styles.row)}>
      {[1, 0.75, 0.5, 0.25, 0].map((alpha) => (
        <ColorSwatch
          key={alpha}
          aria-label={`${alpha * 100}% 不透明度`}
          color={`rgba(4, 133, 247, ${alpha})`}
        />
      ))}
    </div>
  );
}
