"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
import { SourceSwatches } from "./source";
export function Controlled() {
  const [value, setValue] = useState(parseColor("#F43F5E"));
  return (
    <div {...stylex.props(styles.column)}>
      <ColorSwatchPicker aria-label="Color" value={value} onChange={setValue}>
        <SourceSwatches />
      </ColorSwatchPicker>
      <p {...stylex.props(styles.muted)}>
        Selected: <span {...stylex.props(styles.medium)}>{value.toString("hex")}</span>
      </p>
    </div>
  );
}
