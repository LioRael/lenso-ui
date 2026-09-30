"use client";

import { ColorSlider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ slider: { width: "100%", maxWidth: 320 } });
export function Basic() {
  return (
    <ColorSlider
      aria-label="Hue"
      channel="hue"
      xstyle={styles.slider}
      defaultValue="hsl(0, 100%, 50%)"
    >
      <span>Hue</span>
      <ColorSlider.Output />
      <ColorSlider.Track>
        <ColorSlider.Thumb />
      </ColorSlider.Track>
    </ColorSlider>
  );
}
