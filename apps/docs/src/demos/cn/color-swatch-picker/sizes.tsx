// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
import { SourceSwatches } from "../../en/color-swatch-picker/source";
const SIZE_LABELS = {
  lg: "大",
  md: "中",
  sm: "小",
  xl: "特大",
  xs: "特小",
};
export function Sizes() {
  return (
    <div {...stylex.props(styles.column6)}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <div key={size} {...stylex.props(styles.row4)}>
          <span {...stylex.props(styles.width32, styles.muted)}>{SIZE_LABELS[size]}</span>
          <ColorSwatchPicker aria-label={`${size} colors`} size={size}>
            <SourceSwatches />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  );
}
