// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorSlider } from "@lenso/ui";
import { styles } from "../../en/color-picker/source.stylex";
export function AlphaChannel() {
  return (
    <ColorSlider channel="alpha" xstyle={styles.xs} defaultValue="hsla(0, 100%, 50%, 0.5)">
      <ColorSlider.Label>透明度</ColorSlider.Label>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
