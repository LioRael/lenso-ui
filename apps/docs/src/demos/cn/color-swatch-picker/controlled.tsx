// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
import { SourceSwatches } from "../../en/color-swatch-picker/source";
export function Controlled() {
  const [value, setValue] = useState(parseColor("#F43F5E"));
  return (
    <div {...stylex.props(styles.column)}>
      <ColorSwatchPicker aria-label="Color" value={value} onChange={setValue}>
        <SourceSwatches />
      </ColorSwatchPicker>
      <p {...stylex.props(styles.muted)}>
        已选：<span {...stylex.props(styles.medium)}>{value.toString("hex")}</span>
      </p>
    </div>
  );
}
