"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
import { SourceSwatches } from "./source";
export function Variants() {
  return (
    <div {...stylex.props(styles.column6)}>
      {(["circle", "square"] as const).map((variant) => (
        <div key={variant} {...stylex.props(styles.column2)}>
          <span {...stylex.props(styles.muted)}>
            {variant === "circle" ? "Circle (default)" : "Square"}
          </span>
          <ColorSwatchPicker aria-label={`${variant} colors`} variant={variant}>
            <SourceSwatches />
          </ColorSwatchPicker>
        </div>
      ))}
    </div>
  );
}
