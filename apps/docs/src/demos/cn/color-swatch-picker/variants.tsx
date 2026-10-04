// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
import { SourceSwatches } from "../../en/color-swatch-picker/source";
export function Variants() {
  return (
    <div {...stylex.props(styles.column6)}>
      {(["circle", "square"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.column2)}>
          <span {...stylex.props(styles.muted)}>
            {variant === "circle" ? "圆形（默认）" : "方形"}
          </span>
          <ColorSwatchPicker aria-label={`${variant} colors`} variant={variant}>
            <SourceSwatches />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  );
}
