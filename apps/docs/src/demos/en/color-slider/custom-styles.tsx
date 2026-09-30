"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
export function CustomStyles() {
  return (
    <ColorSlider channel="hue" xstyle={styles.sm} defaultValue="hsl(220, 70%, 50%)">
      <ColorSlider.Label xstyle={styles.label}>Hue</ColorSlider.Label>
      <ColorSlider.Output xstyle={styles.tabular} />
      <ColorSlider.Track xstyle={styles.track}>
        <ColorSlider.Thumb xstyle={styles.thumb} />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
