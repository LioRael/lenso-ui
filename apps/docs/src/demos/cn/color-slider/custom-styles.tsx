// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function CustomStyles() {
  return (
    <ColorSlider channel="hue" xstyle={styles.sm} defaultValue="hsl(220, 70%, 50%)">
      <ColorSlider.Label xstyle={styles.label}>色相</ColorSlider.Label>
      <ColorSlider.Output xstyle={styles.tabular} />
      <ColorSlider.Track xstyle={styles.track}>
        <ColorSlider.Thumb xstyle={styles.thumb} />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
