"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider } from "@lenso/ui";
import { styles } from "../color-picker/source.stylex";
export function AlphaChannel() {
  return (
    <ColorSlider channel="alpha" xstyle={styles.xs} defaultValue="hsla(0, 100%, 50%, 0.5)">
      <ColorSlider.Label>Alpha</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
