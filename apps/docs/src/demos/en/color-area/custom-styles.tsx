"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
export function CustomStyles() {
  return (
    <ColorArea aria-label="Color area" xstyle={styles.areaCustom} defaultValue="rgb(116, 52, 255)">
      <ColorArea.Thumb xstyle={styles.areaThumb} />
    </ColorArea>
  );
}
