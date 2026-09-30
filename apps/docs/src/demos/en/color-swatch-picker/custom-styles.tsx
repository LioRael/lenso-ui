"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSwatchPicker } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
import { SourceSwatches } from "./source";
export function CustomStyles() {
  return (
    <ColorSwatchPicker
      aria-label="Color"
      xstyle={styles.pickerCustom}
      defaultValue="#8B5CF6"
      variant="square"
    >
      <SourceSwatches />
    </ColorSwatchPicker>
  );
}
